// Stripe Product Operations
// This file contains all the function implementations for Stripe product operations

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import type { ProductRequest, PriceData, ApiResponse, ProductData } from '../../types/api.js';
import { Logger } from '../utils/logger.js';

// Initialize logger
const logger = new Logger('stripe-products');

// Cache table definitions (these match tables that should exist in your Supabase database)
// products table: id, stripe_product_id, name, description, campaign_id, active, metadata, created_at
// prices table: id, stripe_price_id, product_id, unit_amount, currency, recurring_interval, recurring_interval_count, metadata, created_at

// Initialize Supabase client
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
  {
    auth: {
      persistSession: false,
    }
  }
);

// Initialize Stripe
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2022-11-15',
});

// Define types for database objects
interface PriceObject {
  id?: string;
  stripe_price_id?: string;
  product_id?: string;
  unit_amount: number;
  currency: string;
  recurring_interval?: string;
  recurring_interval_count?: number;
  metadata?: Record<string, any>;
  [key: string]: any;
}

/**
 * Get all products (from cache)
 */
export async function getAllProducts(): Promise<ApiResponse> {
  try {
    // First try to get products from Supabase cache
    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select('*, prices(*)');
      
    if (error) {
      throw error;
    }
    
    return {
      success: true,
      data: products
    };
  } catch (error: any) {
    console.error('Error getting all products:', error);
    return {
      success: false,
      error: `Error getting products: ${error.message}`
    };
  }
}

/**
 * Get products for a specific campaign
 */
export async function getProductsByCampaign(campaignId: string): Promise<ApiResponse> {
  try {
    // Get products from Supabase cache filtered by campaign ID
    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select('*, prices(*)')
      .eq('campaign_id', campaignId);
      
    if (error) {
      throw error;
    }
    
    return {
      success: true,
      data: products
    };
  } catch (error: any) {
    console.error(`Error getting products for campaign ${campaignId}:`, error);
    return {
      success: false,
      error: `Error getting products for campaign: ${error.message}`
    };
  }
}

/**
 * Get a product by its ID
 */
export async function getProductById(productId: string): Promise<ApiResponse> {
  try {
    // Check if it's a Stripe ID or Supabase ID
    const isStripeId = productId.startsWith('prod_');
    
    // Query based on ID type
    const { data: product, error } = await supabaseAdmin
      .from('products')
      .select('*, prices(*)')
      .eq(isStripeId ? 'stripe_product_id' : 'id', productId)
      .single();
      
    if (error) {
      throw error;
    }
    
    if (!product) {
      return {
        success: false,
        error: `Product with ID ${productId} not found`
      };
    }
    
    return {
      success: true,
      data: product
    };
  } catch (error: any) { // Explicitly type error as any to access .message
    // If not found in cache, try Stripe directly (if it's a Stripe ID)
    if (error.message.includes('not found') && productId.startsWith('prod_')) {
      try {
        const stripeProduct = await stripe.products.retrieve(productId);
        const stripePrices = await stripe.prices.list({ product: productId });
        
        return {
          success: true,
          data: {
            ...stripeProduct,
            prices: stripePrices.data
          }
        };
      } catch (stripeError: any) { // Explicitly type stripeError as any
        return {
          success: false,
          error: `Product not found in cache or Stripe: ${stripeError.message}`
        };
      }
    }
    
    return {
      success: false,
      error: `Error getting product: ${error.message}`
    };
  }
}

/**
 * Get a product by name
 */
export async function getProductByName(name: string): Promise<ApiResponse> {
  try {
    // Query by name
    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select('*, prices(*)')
      .ilike('name', name);
      
    if (error) {
      throw error;
    }
    
    return {
      success: true,
      data: products
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Error getting product by name: ${error.message}`
    };
  }
}

/**
 * Check if a product with given name and campaign ID exists
 */
export async function productExists(name: string, campaignId: string): Promise<ApiResponse> {
  try {
    // Count products with matching name and campaign ID
    const { count, error } = await supabaseAdmin
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', campaignId)
      .ilike('name', name);
      
    if (error) {
      throw error;
    }
    
    return {
      success: true,
      data: { exists: count ? count > 0 : false }
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Error checking if product exists: ${error.message}`
    };
  }
}

/**
 * Get products by name and campaign ID
 */
export async function getProductsByNameAndCampaignId(name: string, campaignId: string): Promise<ApiResponse> {
  try {
    // Query by name and campaign ID
    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select('*, prices(*)')
      .eq('campaign_id', campaignId)
      .ilike('name', name);
      
    if (error) {
      throw error;
    }
    
    return {
      success: true,
      data: products
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Error getting products by name and campaign ID: ${error.message}`
    };
  }
}

/**
 * Get donation product for a specific campaign
 */
export async function getDonationProductForCampaign(campaignId: string): Promise<ApiResponse> {
  try {
    // Query for donation product with specific campaign ID
    const { data: product, error } = await supabaseAdmin
      .from('products')
      .select('*, prices(*)')
      .eq('campaign_id', campaignId)
      .eq('name', 'Donation')
      .single();
      
    if (error && !error.message.includes('not found')) {
      throw error;
    }
    
    return {
      success: true,
      data: product || null
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Error getting donation product: ${error.message}`
    };
  }
}

/**
 * Create a new product
 */
export async function createProduct(request: ProductRequest): Promise<ApiResponse> {
  try {
    // First check if a product with this name already exists for the campaign
    const { data: existResult } = await productExists(request.name!, request.campaignId!);
    
    if (existResult.exists) {
      return {
        success: false,
        error: `A product with the name "${request.name}" already exists for this campaign`
      };
    }
    
    // Create product in Stripe
    const product = await stripe.products.create({
      name: request.name!,
      description: request.description || undefined,
      images: request.images || undefined,
      metadata: {
        ...request.metadata,
        campaign_id: request.campaignId || ''
      },
      active: request.active ?? true,
    });
    
    // Store in Supabase cache
    const { data: cachedProduct, error: cacheError } = await supabaseAdmin
      .from('products')
      .insert({
        stripe_product_id: product.id,
        name: product.name,
        description: product.description,
        campaign_id: request.campaignId,
        active: product.active,
        metadata: request.metadata || {}
      })
      .select()
      .single();
      
    if (cacheError) {
      // Product was created in Stripe but failed to cache
      console.error('Error caching product:', cacheError);
    }
    
    // Define types for price objects
    interface PriceObject {
      id?: string;
      stripe_price_id?: string;
      product_id?: string;
      unit_amount: number;
      currency: string;
      recurring_interval?: string;
      recurring_interval_count?: number;
      metadata?: Record<string, any>;
      [key: string]: any;
    }
    
    // Create prices if provided
    const prices: PriceObject[] = [];
    if (request.prices && request.prices.length > 0) {
      for (const priceData of request.prices) {
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: priceData.unitAmount,
          currency: priceData.currency,
          recurring: priceData.recurring,
          metadata: priceData.metadata
        });
        
        // Cache price in Supabase
        const { data: cachedPrice, error: priceError } = await supabaseAdmin
          .from('prices')
          .insert({
            stripe_price_id: price.id,
            product_id: cachedProduct.id,
            unit_amount: price.unit_amount,
            currency: price.currency,
            recurring_interval: price.recurring?.interval,
            recurring_interval_count: price.recurring?.interval_count,
            metadata: priceData.metadata || {}
          })
          .select()
          .single();
          
        if (priceError) {
          console.error('Error caching price:', priceError);
        } else {
          prices.push(cachedPrice as PriceObject);
        }
      }
    }
    
    return {
      success: true,
      data: {
        ...cachedProduct,
        prices
      }
    };
  } catch (error: any) {
    console.error('Error creating product:', error);
    return {
      success: false,
      error: `Error creating product: ${error.message}`
    };
  }
}

/**
 * Add a price to an existing product
 */
export async function addPriceToProduct(productId: string, priceData: PriceData): Promise<ApiResponse> {
  try {
    // Get the product to determine if it's a Stripe ID or Supabase ID
    const { data: productResult } = await getProductById(productId);
    
    if (!productResult) {
      return {
        success: false,
        error: `Product with ID ${productId} not found`
      };
    }
    
    const stripeProductId = productResult.stripe_product_id || productId;
    
    // Create price in Stripe
    const price = await stripe.prices.create({
      product: stripeProductId,
      unit_amount: priceData.unitAmount,
      currency: priceData.currency,
      recurring: priceData.recurring,
      metadata: priceData.metadata
    });
    
    // Cache price in Supabase
    const { data: cachedPrice, error: priceError } = await supabaseAdmin
      .from('prices')
      .insert({
        stripe_price_id: price.id,
        product_id: productResult.id,
        unit_amount: price.unit_amount,
        currency: price.currency,
        recurring_interval: price.recurring?.interval,
        recurring_interval_count: price.recurring?.interval_count,
        metadata: priceData.metadata || {}
      })
      .select()
      .single();
      
    if (priceError) {
      console.error('Error caching price:', priceError);
      return {
        success: false,
        error: `Price created in Stripe but failed to cache: ${priceError.message}`
      };
    }
    
    return {
      success: true,
      data: cachedPrice
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Error adding price to product: ${error.message}`
    };
  }
}

/**
 * Update an existing product
 */
export async function updateProduct(request: ProductRequest): Promise<ApiResponse> {
  try {
    // Get the product to determine if it's a Stripe ID or Supabase ID
    const { data: productResult } = await getProductById(request.productId!);
    
    if (!productResult) {
      return {
        success: false,
        error: `Product with ID ${request.productId} not found`
      };
    }
    
    const stripeProductId = productResult.stripe_product_id || request.productId;
    
    // Update product in Stripe
    const updatedProduct = await stripe.products.update(stripeProductId, {
      name: request.name || undefined,
      description: request.description || undefined,
      images: request.images || undefined,
      metadata: request.metadata || undefined,
      active: request.active
    });
    
    // Update cache in Supabase
    const { data: cachedProduct, error: updateError } = await supabaseAdmin
      .from('products')
      .update({
        name: request.name,
        description: request.description,
        active: request.active,
        metadata: request.metadata || {}
      })
      .eq('id', productResult.id)
      .select()
      .single();
      
    if (updateError) {
      console.error('Error updating cached product:', updateError);
    }
    
    return {
      success: true,
      data: cachedProduct || updatedProduct
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Error updating product: ${error.message}`
    };
  }
}

/**
 * Delete a product
 */
export async function deleteProduct(productId: string): Promise<ApiResponse> {
  try {
    // Get the product to determine if it's a Stripe ID or Supabase ID
    const { data: productResult } = await getProductById(productId);
    
    if (!productResult) {
      return {
        success: false,
        error: `Product with ID ${productId} not found`
      };
    }
    
    const stripeProductId = productResult.stripe_product_id || productId;
    
    // Delete related prices from Supabase first
    await supabaseAdmin
      .from('prices')
      .delete()
      .eq('product_id', productResult.id);
      
    // Delete product from Supabase cache
    await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', productResult.id);
      
    // Delete product in Stripe (archive it)
    await stripe.products.update(stripeProductId, {
      active: false
    });
    
    return {
      success: true,
      data: { deleted: true }
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Error deleting product: ${error.message}`
    };
  }
}

/**
 * Create a donation product with multiple tariffs for a campaign
 * or update an existing one if it already exists
 */
export async function createDonationProductForCampaign(request: ProductRequest): Promise<ApiResponse> {
  try {
    // Check if donation product already exists for campaign
    const { data: existingProduct } = await getDonationProductForCampaign(request.campaignId!);
    
    if (existingProduct) {
      // Update existing product with new tariffs
      const updateRequest: ProductRequest = {
        action: 'updateDonationProductTariffs',
        productId: existingProduct.id,
        prices: request.prices
      };
      return await updateDonationProductTariffs(updateRequest);
    }
    
    // Create new donation product
    const donationRequest: ProductRequest = {
      ...request,
      name: 'Donation',
      description: 'Campaign donation with selectable amounts',
      metadata: {
        ...request.metadata,
        type: 'donation'
      }
    };
    
    return await createProduct(donationRequest);
  } catch (error: any) {
    return {
      success: false,
      error: `Error creating donation product: ${error.message}`
    };
  }
}

/**
 * Update an existing donation product with new tariffs
 */
export async function updateDonationProductTariffs(request: ProductRequest): Promise<ApiResponse> {
  try {
    const { data: productResult } = await getProductById(request.productId!);
    
    if (!productResult) {
      return {
        success: false,
        error: `Product with ID ${request.productId} not found`
      };
    }
    
    // Define types for price objects
    interface PriceObject {
      id?: string;
      stripe_price_id?: string;
      unit_amount: number;
      currency: string;
      [key: string]: any;
    }
    
    // Type the prices array
    const prices: PriceObject[] = [];
    
    // Make sure prices array exists before iterating
    if (request.prices && request.prices.length > 0) {
      for (const priceData of request.prices) {
        // Check if price with same amount exists
        const existingPriceIndex = productResult.prices.findIndex((p: PriceObject) => 
          p.unit_amount === priceData.unitAmount && p.currency === priceData.currency
        );
        
        if (existingPriceIndex === -1) {
          // Add new price
          const { data: newPrice } = await addPriceToProduct(productResult.id, priceData);
          if (newPrice) {
            prices.push(newPrice as PriceObject);
          }
        } else {
          // Use existing price
          prices.push(productResult.prices[existingPriceIndex] as PriceObject);
        }
      }
    }
    
    return {
      success: true,
      data: {
        ...productResult,
        prices
      }
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Error updating donation product tariffs: ${error.message}`
    };
  }
}
