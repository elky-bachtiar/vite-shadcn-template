import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Import utilities
import { Logger } from '../utils/logger.js';
import { DEFAULT_CORS_HEADERS, handleCorsPreflightRequest } from '../utils/cors.js';
import { ApiResponse } from '../types/api.js';

// Import shared product operations
import { 
  createProduct,
  productExists,
  getProductsByNameAndCampaignId,
  addPriceToProduct
} from '../stripe-products/stripe-product-operations.js';

// Configure environment variables
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') || '';

// Initialize Supabase Client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
  }
});

// Initialize Logger
const logger = new Logger('stripe-seed-example-products');

// Initialize Stripe client
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15', // Use the version compatible with our Stripe SDK
});

/**
 * Main function to seed Stripe products and prices for campaigns
 */
export async function seedStripeProducts(): Promise<ApiResponse> {
  logger.info('Starting Stripe product seeding...');

  if (!STRIPE_SECRET_KEY) {
    logger.error('STRIPE_SECRET_KEY environment variable is not set');
    return { success: false, error: 'Missing Stripe API key' };
  }

  try {
    // Fetch all active campaigns from the database
    const { data: campaigns, error } = await supabase
      .from('donation_campaigns')
      .select('id, title, status')
      .eq('status', 'active');

    if (error) {
      logger.error('Error fetching campaigns:', { error });
      return { success: false, error: 'Failed to fetch campaigns' };
    }

    if (!campaigns || campaigns.length === 0) {
      logger.warn('No active campaigns found to seed');
      return { success: false, error: 'No campaigns found' };
    }

    logger.info(`Found ${campaigns.length} active campaigns for Stripe product creation`);
    
    const results = {
      productsCreated: 0,
      productsSkipped: 0,
      pricesCreated: 0,
      pricesSkipped: 0,
      errors: [] as string[],
    };

    // Process each campaign
    for (const campaign of campaigns) {
      try {
        await processCampaign(campaign, results);
      } catch (err) {
        console.error(`Error processing campaign ${campaign.id}:`, err);
        results.errors.push(`Campaign ${campaign.id}: ${err.message}`);
      }
    }

    logger.info('Finished Stripe product seeding!');
    logger.info(`Created ${results.productsCreated} products and ${results.pricesCreated} prices`);
    logger.info(`Skipped ${results.productsSkipped} existing products and ${results.pricesSkipped} existing prices`);
    
    if (results.errors.length > 0) {
      logger.warn(`Encountered ${results.errors.length} errors:`);
      results.errors.forEach(err => logger.error(`- ${err}`));
    }
    
    return { success: true, results };
  } catch (error: any) {
    logger.error('Error in seed function:', { error: error.message });
    return { success: false, error: error.message };
  }
}

/**
 * Process a single campaign by creating a product and prices in Stripe
 */
interface Campaign {
  id: string;
  title: string;
  status: string;
}

interface SeedResults {
  productsCreated: number;
  productsSkipped: number;
  pricesCreated: number;
  pricesSkipped: number;
  errors: string[];
}

async function processCampaign(campaign: Campaign, results: SeedResults) {
  logger.info(`Processing campaign: ${campaign.id} - ${campaign.title}`);
  
  // Check if donation product already exists for this campaign
  const { data: existResult } = await productExists('Donation', campaign.id);
  
  let productData;
  let stripeProductId;
  
  if (existResult && existResult.exists) {
    // Get the existing product
    const { data: products } = await getProductsByNameAndCampaignId('Donation', campaign.id);
    if (products && products.length > 0) {
      console.log(`Using existing product for campaign ${campaign.id}: ${products[0].stripe_product_id}`);
      stripeProductId = products[0].stripe_product_id;
      productData = products[0];
      results.productsSkipped++;
    }
  }
  
  if (!stripeProductId) {
    // Create a new product for the campaign using the shared function
    const { success, data, error } = await createProduct({
      action: 'create',
      name: 'Donation',
      campaignId: campaign.id,
      active: true,
      description: `Donation product for campaign: ${campaign.title}`,
      metadata: {
        campaign_id: campaign.id,
        campaign_title: campaign.title
      }
    });
    
    if (!success || !data) {
      logger.error(`Failed to create product for campaign ${campaign.id}:`, { error });
      results.errors.push(`Campaign ${campaign.id}: ${error}`);
      return;
    }
    
    logger.info(`Created new product for campaign ${campaign.id}: ${data.stripe_product_id}`);
    stripeProductId = data.stripe_product_id;
    productData = data;
    results.productsCreated++;
  }
  
  // Create price tariffs from 5 to 500, incrementing by 5
  await createPriceTariffs(campaign.id, productData.id, results);
}

/**
 * Create price tariffs for a product using shared operations
 */
async function createPriceTariffs(campaignId: string, productId: string, results: SeedResults) {
  // Generate prices from 5 to 500 with step 5
  const pricePoints: number[] = [];
  for (let amount = 5; amount <= 500; amount += 5) {
    pricePoints.push(amount);
  }
  
  logger.info(`Creating ${pricePoints.length} price tariffs for product ${productId}`);
  
  // For each price point, check if it exists or create it
  for (const pricePoint of pricePoints) {
    try {
      // Format the price point for use as metadata
      const pricePointString = pricePoint.toString();
      
      // Use the shared function to add a price to the product
      const { success, data, error } = await addPriceToProduct(productId, {
        unitAmount: pricePoint * 100, // Stripe uses cents
        currency: 'usd',
        metadata: {
          campaign_id: campaignId,
          product_id: productId,
          amount_usd: pricePointString
        }
      });
      
      if (success && data) {
        results.pricesCreated++;
      } else {
        logger.error(`Error creating price ${pricePoint} for product ${productId}:`, { error });
        results.errors.push(`Price ${pricePoint} for product ${productId}: ${error}`);
      }
    } catch (error: any) {
      logger.error(`Error creating price ${pricePoint} for product ${productId}:`, { error: error.message });
      results.errors.push(`Price ${pricePoint} for product ${productId}: ${error.message}`);
    }
  }
  
  logger.info(`Finished creating prices for product ${productId}`);
}

/**
 * Deno edge function handler
 */
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest(req);
  }
  
  try {
    logger.info('Running Stripe product seeder...');
    
    if (req.method === 'GET') {
      const result = await seedStripeProducts();
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { ...DEFAULT_CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({
        success: false,
        error: 'Method not allowed. Use GET to seed products.'
      }), {
        status: 405,
        headers: { ...DEFAULT_CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
  } catch (e: any) {
    logger.error('Error seeding products', { error: e.message });
    return new Response(JSON.stringify({
      success: false,
      error: `Server error: ${e.message}`
    }), {
      status: 500,
      headers: { ...DEFAULT_CORS_HEADERS, 'Content-Type': 'application/json' }
    });
  }
});
