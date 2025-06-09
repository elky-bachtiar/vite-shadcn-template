// This file contains functions for interacting with Stripe products
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Stripe client (will be initialized when needed)
let stripeClient = null;

// Initialize Stripe client
function getStripeClient(providedKey = null) {
  // If we already have a client, return it
  if (stripeClient) {
    return stripeClient;
  }
  
  // Log available environment variables (don't log sensitive values)
  console.log('[Info] Operations.js Environment check:', {
    has_stripe_key: !!Deno.env.get('STRIPE_SECRET_KEY'),
    has_supabase_url: !!Deno.env.get('SUPABASE_URL'),
    has_supabase_key: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
    has_vite_supabase_url: !!Deno.env.get('VITE_SUPABASE_URL'),
    has_provided_key: !!providedKey
  });
  
  // Try all possible sources for the Stripe key
  let stripeKey = providedKey;
  
  if (!stripeKey) {
    // Try standard env var
    stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  }
  
  if (!stripeKey) {
    // Try alternatives
    const alternatives = ['VITE_STRIPE_SECRET_KEY', 'stripe_secret_key'];
    for (const alt of alternatives) {
      const altKey = Deno.env.get(alt);
      if (altKey) {
        console.log(`[Info] Found alternative key: ${alt}`);
        stripeKey = altKey;
        break;
      }
    }
  }
  
  // For debugging, log a masked version of the key if available
  if (stripeKey) {
    const maskedKey = stripeKey.slice(0, 7) + '...' + stripeKey.slice(-4);
    console.log(`[Info] Using Stripe key: ${maskedKey}`);
  } else {
    console.log('[Warning] No Stripe key found from any source');
    throw new Error('Missing Stripe secret key');
  }
  
  // Create and cache the client
  stripeClient = new Stripe(stripeKey);
  return stripeClient;
}

// Export function to set Stripe key directly
export function setStripeKey(key) {
  if (key) {
    stripeClient = new Stripe(key);
    return true;
  }
  return false;
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

/**
 * Get all products
 */
export async function getAllProducts() {
  const stripe = getStripeClient();
  return await stripe.products.list({
    active: true,
    limit: 100,
    expand: ['data.default_price'],
  });
}

/**
 * Get products by campaign ID
 */
export async function getProductsByCampaign(campaignId) {
  if (!campaignId) {
    throw new Error('Campaign ID is required');
  }
  
  const stripe = getStripeClient();
  return await stripe.products.search({
    query: `metadata['campaign_id']:'${campaignId}'`,
    expand: ['data.default_price'],
  });
}

/**
 * Get a product by ID
 */
export async function getProductById(productId) {
  if (!productId) {
    throw new Error('Product ID is required');
  }
  
  const stripe = getStripeClient();
  return await stripe.products.retrieve(productId, {
    expand: ['default_price'],
  });
}

/**
 * Get a product by name
 */
export async function getProductByName(name) {
  if (!name) {
    throw new Error('Product name is required');
  }
  
  const stripe = getStripeClient();
  const products = await stripe.products.list({
    active: true,
    limit: 100,
  });
  
  return products.data.find(product => product.name === name);
}

/**
 * Check if a product exists
 */
export async function productExists(productId) {
  try {
    const stripe = getStripeClient();
    await stripe.products.retrieve(productId);
    return true;
  } catch (error) {
    if (error.statusCode === 404) {
      return false;
    }
    throw error;
  }
}

/**
 * Create a new product
 */
export async function createProduct(productData) {
  const stripe = getStripeClient();
  
  // Convert product data to Stripe format
  const stripeProductData = {
    name: productData.name,
    description: productData.description,
    active: true,
    metadata: {
      ...productData.metadata,
    },
  };
  
  if (productData.campaignId) {
    stripeProductData.metadata.campaign_id = productData.campaignId;
  }
  
  if (productData.images && productData.images.length > 0) {
    stripeProductData.images = productData.images;
  }
  
  return await stripe.products.create(stripeProductData);
}

/**
 * Add a price to a product
 */
export async function addPriceToProduct(productId, priceData) {
  const stripe = getStripeClient();
  
  // Ensure product exists
  await getProductById(productId);
  
  // Convert price data to Stripe format
  const stripePriceData = {
    unit_amount: priceData.unit_amount,
    currency: priceData.currency,
    product: productId,
    metadata: priceData.metadata || {},
  };
  
  if (priceData.recurring) {
    stripePriceData.recurring = priceData.recurring;
  }
  
  return await stripe.prices.create(stripePriceData);
}

/**
 * Update a product
 */
export async function updateProduct(productId, updateData) {
  const stripe = getStripeClient();
  
  // Ensure product exists
  await getProductById(productId);
  
  // Convert update data to Stripe format
  const stripeUpdateData = {};
  
  if (updateData.name) {
    stripeUpdateData.name = updateData.name;
  }
  
  if (updateData.description) {
    stripeUpdateData.description = updateData.description;
  }
  
  if (updateData.active !== undefined) {
    stripeUpdateData.active = updateData.active;
  }
  
  if (updateData.metadata) {
    stripeUpdateData.metadata = updateData.metadata;
  }
  
  if (updateData.images) {
    stripeUpdateData.images = updateData.images;
  }
  
  return await stripe.products.update(productId, stripeUpdateData);
}

/**
 * Get all prices for a product
 */
export async function getPricesForProduct(productId) {
  const stripe = getStripeClient();
  
  return await stripe.prices.list({
    product: productId,
    active: true,
    limit: 100,
  });
}

/**
 * Archive a product (soft delete)
 */
export async function archiveProduct(productId) {
  const stripe = getStripeClient();
  return await stripe.products.update(productId, { active: false });
}

/**
 * Delete a product (alias for archive)
 */
export async function deleteProduct(productId) {
  return await archiveProduct(productId);
}

/**
 * Get donation product for campaign
 */
export async function getDonationProductForCampaign(campaignId) {
  if (!campaignId) {
    throw new Error('Campaign ID is required');
  }
  
  const stripe = getStripeClient();
  const products = await stripe.products.list({
    active: true,
    limit: 100,
    expand: ['data.default_price']
  });
  
  const donationProduct = products.data.find(product => 
    product.metadata?.campaign_id === campaignId && 
    product.metadata?.type === 'donation'
  );
  
  return donationProduct;
}

/**
 * Get products by name and campaign ID
 */
export async function getProductsByNameAndCampaignId(name, campaignId) {
  if (!name || !campaignId) {
    throw new Error('Name and campaign ID are required');
  }
  
  const stripe = getStripeClient();
  const products = await stripe.products.list({
    active: true,
    limit: 100,
    expand: ['data.default_price']
  });
  
  return products.data.filter(product => 
    product.metadata?.campaign_id === campaignId && 
    product.name.toLowerCase().includes(name.toLowerCase())
  );
}

/**
 * Create donation product for campaign
 */
export async function createDonationProductForCampaign(campaignId, name, description, metadata = {}) {
  if (!campaignId) {
    throw new Error('Campaign ID is required');
  }
  
  // Create a new donation product
  const productData = {
    name: name || 'Donation',
    description: description || 'Make a donation to this campaign',
    type: 'donation',
    metadata: {
      ...metadata,
      campaign_id: campaignId,
      type: 'donation'
    }
  };
  
  return await createProduct(productData);
}

/**
 * Update donation product tariffs
 */
export async function updateDonationProductTariffs(productId, tariffs) {
  if (!productId) {
    throw new Error('Product ID is required');
  }
  
  if (!Array.isArray(tariffs) || tariffs.length === 0) {
    throw new Error('Tariffs must be a non-empty array');
  }
  
  const stripe = getStripeClient();
  const product = await stripe.products.retrieve(productId);
  
  if (!product) {
    throw new Error(`Product ${productId} not found`);
  }
  
  // Update the product metadata with the tariffs
  return await stripe.products.update(productId, {
    metadata: {
      ...product.metadata,
      tariffs: JSON.stringify(tariffs)
    }
  });
}
