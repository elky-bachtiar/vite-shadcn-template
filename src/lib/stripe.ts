import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

export { stripePromise };

// Stripe configuration
export const STRIPE_CONFIG = {
  currency: 'usd',
  country: 'US',
  locale: 'en-US',
} as const;

// Product types for Stripe metadata
export const PRODUCT_TYPES = {
  DONATION: 'donation',
  PHYSICAL: 'physical',
  DIGITAL: 'digital',
} as const;

// Helper function to format currency for display
export function formatCurrency(amount: number, currency = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100); // Convert from cents
}

// Helper function to create checkout session
export async function createCheckoutSession(params: {
  priceId: string;
  campaignId?: string;
  successUrl: string;
  cancelUrl: string;
  mode?: 'payment' | 'subscription';
  metadata?: Record<string, string>;
}) {
  const response = await fetch('/api/stripe/checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('Failed to create checkout session');
  }

  return response.json();
}