/**
 * Minimalist test for Stripe Edge Functions
 */
import { test, expect } from '@playwright/test';
import SupabaseTestUtils from './helpers/supabase-utils.js';

test.describe('Stripe Edge Functions', () => {
  // Create a reusable Supabase test utility instance
  const supabaseUtils = new SupabaseTestUtils();
  
  // Store results between tests
  let edgeFunctionsAvailable = false;
  let productId = null;
  
  test('Verify Edge Functions are available', async ({ request }) => {
    // Check if Edge Functions are available
    const url = supabaseUtils.getFunctionUrl('stripe-products');
    const response = await request.head(url, {
      failOnStatusCode: false
    });
    
    edgeFunctionsAvailable = response.ok();
    expect(edgeFunctionsAvailable).toBeTruthy();
    
    // Log message to help debugging
    console.log(`Edge Functions URL: ${url}`);
    console.log(`Edge Functions available: ${edgeFunctionsAvailable}`);
  });
});
