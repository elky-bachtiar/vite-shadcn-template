import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';
import Stripe from 'https://esm.sh/stripe@12.18.0';

// Configure environment variables
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') || '';

// Initialize Supabase Client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Initialize Stripe client
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16', // Use the latest API version
});

/**
 * Main function to seed Stripe products and prices for campaigns
 * @param campaigns Array of campaign objects to create products for (optional)
 * If not provided, will fetch campaigns from the database
 */
export async function seedStripeProducts(providedCampaigns?: any[]) {
  console.log('Starting Stripe product seeding...');

  if (!STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY environment variable is not set');
    return { success: false, message: 'Stripe API key is not set', error: 'Missing Stripe API key' };
  }

  try {
    // Use provided campaigns or fetch from database
    let campaigns;
    if (providedCampaigns && providedCampaigns.length > 0) {
      campaigns = providedCampaigns;
      console.log(`Using ${campaigns.length} provided campaigns`);
    } else {
      // Fetch all active campaigns from the database
      const { data: fetchedCampaigns, error } = await supabase
        .from('campaigns')
        .select('id, title, status')
        .eq('status', 'active');

      if (error) {
        console.error('Error fetching campaigns:', error);
        return { success: false, message: 'Error fetching campaigns', error: error.message };
      }
      
      campaigns = fetchedCampaigns;
    }

    if (!campaigns || campaigns.length === 0) {
      return { 
        success: true, 
        message: 'No active campaigns found to process',
        error: null
      };
    }

    console.log(`Found ${campaigns.length} active campaigns for Stripe product creation`);

    // Set up results tracking
    const results = {
      productsCreated: 0,
      productsSkipped: 0,
      pricesCreated: 0,
      pricesSkipped: 0,
      errors: []
    };

    // Process each campaign
    for (const campaign of campaigns) {
      await processCampaign(campaign, results);
    }

    console.log('✅ Finished seeding Stripe products and prices');
    console.log(`Products created: ${results.productsCreated}`);
    console.log(`Products skipped: ${results.productsSkipped}`);
    console.log(`Prices created: ${results.pricesCreated}`);
    console.log(`Prices skipped: ${results.pricesSkipped}`);
    console.log(`Errors: ${results.errors.length}`);

    return { 
      success: true,
      message: `Successfully created ${results.productsCreated} products and ${results.pricesCreated} prices`,
      error: null
    };
  } catch (error) {
    console.error('Error in seed function:', error);
    return { 
      success: false, 
      message: 'Error creating Stripe products', 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}

/**
 * Process a single campaign by creating a product and prices in Stripe
 */
async function processCampaign(campaign: any, results: any) {
  console.log(`Processing campaign: ${campaign.id} - ${campaign.title}`);
  
  // Check if product already exists for this campaign by searching for the specific campaign_id in metadata
  const existingProductsByCampaignId = await stripe.products.search({
    query: `metadata['campaign_id']:'${campaign.id}'`,
    limit: 100
  });
  
  // Also check by name + active status as a fallback
  const existingProductsByName = await stripe.products.list({
    active: true,
    limit: 100
  });

  // Filter products that might have this campaign_id in metadata
  const matchingProducts = existingProductsByName.data.filter(p => 
    p.metadata && p.metadata.campaign_id === campaign.id
  );
  
  let product;
  
  // If product exists with this campaign_id in metadata, use it; otherwise create a new one
  if ((existingProductsByCampaignId.data && existingProductsByCampaignId.data.length > 0) || matchingProducts.length > 0) {
    product = existingProductsByCampaignId.data?.[0] || matchingProducts[0];
    console.log(`Using existing Stripe product for campaign ${campaign.id}: ${product.id}`);
    results.productsSkipped++;
    
    // Check if the existing product metadata has the correct campaign_id
    if (!product.metadata || product.metadata.campaign_id !== campaign.id) {
      // Update the product to ensure it has the correct campaign_id
      product = await stripe.products.update(product.id, {
        metadata: {
          ...product.metadata,
          campaign_id: campaign.id
        }
      });
      console.log(`Updated metadata for product ${product.id} with campaign_id: ${campaign.id}`);
    }
  } else {
    // Create a new product for the campaign
    product = await stripe.products.create({
      name: 'Donation',
      metadata: {
        campaign_id: campaign.id,
      },
    });
    console.log(`Created new Stripe product for campaign ${campaign.id}: ${product.id}`);
    results.productsCreated++;
  }
  
  // Create price tariffs from 5 to 500, incrementing by 5
  await createPriceTariffs(campaign.id, product.id, results);
}

/**
 * Create price tariffs for a product
 */
async function createPriceTariffs(campaignId: string, productId: string, results: any) {
  // Generate prices from 5 to 500 with step 5
  const pricePoints = [];
  for (let amount = 5; amount <= 500; amount += 5) {
    pricePoints.push(amount);
  }
  
  console.log(`Creating ${pricePoints.length} price tariffs for product ${productId}`);
  
  // Get all existing prices for this product to check for duplicates
  const allExistingPrices = await stripe.prices.list({
    product: productId,
    active: true,
    limit: 100 // Adjust limit if you have more price points
  });
  
  // Create a map of existing prices by amount for quick lookup
  const existingPriceMap = new Map();
  allExistingPrices.data.forEach(price => {
    if (price.metadata && price.metadata.amount_usd) {
      existingPriceMap.set(price.metadata.amount_usd, price);
    }
  });
  
  // For each price point, check if it exists or create it
  for (const pricePoint of pricePoints) {
    try {
      const pricePointString = pricePoint.toString();
      
      // Check if price already exists for this amount and product
      if (existingPriceMap.has(pricePointString)) {
        // Skip if price already exists
        results.pricesSkipped++;
        
        // Ensure price has correct metadata
        const existingPrice = existingPriceMap.get(pricePointString);
        if (!existingPrice.metadata || 
            existingPrice.metadata.campaign_id !== campaignId || 
            existingPrice.metadata.product_id !== productId) {
          
          // Update price metadata if needed
          await stripe.prices.update(existingPrice.id, {
            metadata: {
              ...existingPrice.metadata,
              campaign_id: campaignId,
              product_id: productId,
              amount_usd: pricePointString
            }
          });
          console.log(`Updated metadata for price ${existingPrice.id}, amount: ${pricePoint}`);
        }
      } else {
        // Create new price
        const price = await stripe.prices.create({
          product: productId,
          unit_amount: pricePoint * 100, // Stripe uses cents
          currency: 'usd',
          metadata: {
            campaign_id: campaignId,
            product_id: productId,
            amount_usd: pricePointString
          },
        });
        results.pricesCreated++;
      }
    } catch (error) {
      console.error(`Error creating/updating price ${pricePoint} for product ${productId}:`, error);
      results.errors.push(`Price ${pricePoint} for product ${productId}: ${error.message}`);
    }
  }
  
  console.log(`Finished creating prices for product ${productId}`);
}

/**
 * Entry point for the script when run directly
 */
if (import.meta.main) {
  console.log('Running Stripe product seeder directly...');
  
  try {
    const result = await seedStripeProducts();
    if (result.success) {
      console.log('✓ Stripe product seeding completed successfully');
    } else {
      console.error('✗ Stripe product seeding failed:', result.error);
      Deno.exit(1);
    }
  } catch (error) {
    console.error('Fatal error:', error);
    Deno.exit(1);
  }
}
