import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
// This ensures the Deno types are available
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  serve(handler: (req: Request) => Promise<Response> | Response): void;
};
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Import utilities
import { Logger, LogLevel } from '../utils/logger.js';
import { RateLimiter } from '../utils/rate-limiter.js';
import { DEFAULT_CORS_HEADERS, handleCorsPreflightRequest, addCorsHeaders } from '../utils/cors.js';

// Initialize Supabase Client
const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', {
  auth: {
    persistSession: false,
  }
});

// Initialize Logger
const logger = new Logger('stripe-checkout');

// Initialize Stripe client
const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripe = new Stripe(stripeSecret, {
  apiVersion: '2022-11-15', // Use the version compatible with our Stripe SDK
  appInfo: {
    name: 'Shop2Give',
    version: '1.0.0',
  },
});

// Initialize rate limiter
const rateLimiter = new RateLimiter(supabase, 'checkout_rate_limits', logger);

/**
 * Log checkout attempt for analytics and debugging
 * @param userId User ID attempting checkout
 * @param success Whether checkout was successful
 * @param errorMessage Optional error message if checkout failed
 */
async function logCheckoutAttempt(userId: string, success: boolean, errorMessage?: string) {
  try {
    await supabase.from('checkout_logs').insert({
      user_id: userId,
      success,
      error_message: errorMessage || null,
      timestamp: new Date().toISOString(),
    });
    
    if (!success) {
      logger.warn(`Failed checkout attempt for user ${userId}`, { error: errorMessage });
    } else {
      logger.info(`Successful checkout for user ${userId}`);
    }
  } catch (logError: any) {
    // Don't let logging errors affect the main flow
    logger.error('Failed to log checkout attempt', { error: logError.message });
  }
}

// Function to create a response with CORS headers
function corsResponse(body: string | object | null, status = 200): Response {
  if (status === 204) {
    return new Response(null, { status, headers: DEFAULT_CORS_HEADERS });
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: { ...DEFAULT_CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

// Configure rate limiter with default settings
rateLimiter.setConfig({
  name: 'stripe-checkout',
  identifier: 'default', // Will be overridden in the handler
  maxRequests: 100,
  windowSeconds: 60,
});

// Explicitly type the handler to always return Promise<Response>
Deno.serve(async (req): Promise<Response> => {
  try {
    if (req.method === 'OPTIONS') {
      return handleCorsPreflightRequest(req);
    }

    if (req.method !== 'POST') {
      logger.warn('Method not allowed: ' + req.method);
      return corsResponse({ error: 'Method not allowed' }, 405);
    }

    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      logger.warn('Missing authorization header');
      return corsResponse({ error: 'Unauthorized' }, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: getUserError } = await supabase.auth.getUser(token);

    if (getUserError || !user) {
      logger.warn('Invalid authentication token');
      return corsResponse({ error: 'Invalid authentication token' }, 401);
    }
    
    // Check rate limit with user ID
    rateLimiter.setConfig({
      name: 'stripe-checkout',
      identifier: user.id,
      maxRequests: 100,
      windowSeconds: 60,
    });
    
    const isLimited = await rateLimiter.isRateLimited();
    if (isLimited) {
      logger.warn(`Rate limit exceeded for user ${user.id}`);
      return corsResponse({ error: 'Too many requests' }, 429);
    }

    const { price_id, success_url, cancel_url, mode } = await req.json();

    const validationError = validateParameters(
      { price_id, success_url, cancel_url, mode },
      {
        cancel_url: 'string',
        price_id: 'string',
        success_url: 'string',
        mode: { values: ['payment', 'subscription'] },
      },
    );

    if (validationError !== "") {
      await logCheckoutAttempt(user.id, false, validationError);
      return corsResponse({ error: validationError }, 400);
    }

    // Get or create Stripe customer
    const { data: customer, error: getCustomerError } = await supabase
      .from('stripe_customers')
      .select('customer_id')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .maybeSingle();

    if (getCustomerError) {
      await logCheckoutAttempt(user.id, false, 'Failed to fetch customer information');
      return corsResponse({ error: 'Failed to fetch customer information' }, 500);
    }

    let customerId;

    if (!customer || !customer.customer_id) {
      const newCustomer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
        },
      });

      const { error: createCustomerError } = await supabase.from('stripe_customers').insert({
        user_id: user.id,
        customer_id: newCustomer.id,
      });

      if (createCustomerError) {
        await logCheckoutAttempt(user.id, false, 'Failed to create customer mapping');
        try {
          await stripe.customers.del(newCustomer.id);
        } catch (deleteError) {
          console.error('Failed to clean up after customer mapping error:', deleteError);
        }
        return corsResponse({ error: 'Failed to create customer mapping' }, 500);
      }

      if (mode === 'subscription') {
        const { error: createSubscriptionError } = await supabase.from('stripe_subscriptions').insert({
          customer_id: newCustomer.id,
          status: 'not_started',
        });

        if (createSubscriptionError) {
          await logCheckoutAttempt(user.id, false, 'Failed to create subscription record');
          try {
            await stripe.customers.del(newCustomer.id);
          } catch (deleteError) {
            console.error('Failed to clean up after subscription creation error:', deleteError);
          }
          return corsResponse({ error: 'Failed to create subscription record' }, 500);
        }
      }

      customerId = newCustomer.id;
    } else {
      customerId = customer.customer_id;

      if (mode === 'subscription') {
        const { data: subscription, error: getSubscriptionError } = await supabase
          .from('stripe_subscriptions')
          .select('status')
          .eq('customer_id', customerId)
          .maybeSingle();

        if (getSubscriptionError) {
          await logCheckoutAttempt(user.id, false, 'Failed to fetch subscription information');
          return corsResponse({ error: 'Failed to fetch subscription information' }, 500);
        }

        if (!subscription) {
          const { error: createSubscriptionError } = await supabase.from('stripe_subscriptions').insert({
            customer_id: customerId,
            status: 'not_started',
          });

          if (createSubscriptionError) {
            await logCheckoutAttempt(user.id, false, 'Failed to create subscription record');
            return corsResponse({ error: 'Failed to create subscription record' }, 500);
          }
        }
      }
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: price_id,
          quantity: 1,
        },
      ],
      mode,
      success_url,
      cancel_url,
      metadata: {
        userId: user.id,
      },
    });

    await logCheckoutAttempt(user.id, true);
    return corsResponse({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    logger.error(`Checkout error: ${error.message}`);
    return corsResponse({ error: error.message }, 500);
  }
});

type ExpectedType = 'string' | { values: string[] };
type Expectations<T> = { [K in keyof T]: ExpectedType };

function validateParameters<T extends Record<string, any>>(values: T, expected: Expectations<T>): string {
  // Default to empty string if no validation errors
  let validationError = ""; 
  for (const parameter in values) {
    const expectation = expected[parameter];
    const value = values[parameter];

    if (expectation === 'string') {
      if (value == null) {
        validationError = `Missing required parameter ${parameter}`;
        break;
      }
      if (typeof value !== 'string') {
        validationError = `Expected parameter ${parameter} to be a string got ${JSON.stringify(value)}`;
        break;
      }
    } else {
      if (!expectation.values.includes(value)) {
        validationError = `Expected parameter ${parameter} to be one of ${expectation.values.join(', ')}`;
        break;
      }
    }
  }

  return validationError;
}