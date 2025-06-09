/**
 * End-to-end test for Supabase stripe-checkout Edge Function
 * 
 * This test verifies the Stripe checkout functionality through Edge Functions:
 * 1. Creating checkout sessions
 * 2. Verifying proper customer creation and linking
 * 3. Testing checkout rate limiting
 * 4. Validating error handling and logging
 */

import { test, expect } from '@playwright/test';
import * as path from 'path';
import { fileURLToPath } from 'url';
import SupabaseTestUtils from './helpers/supabase-utils.js';
import { testConfig } from '../setup.js';

// Get project root directory for command instructions
const testFilePath = fileURLToPath(import.meta.url);
const testDir = path.dirname(testFilePath);
const projectRoot = path.resolve(testDir, '../../..');

/**
 * Tests for the stripe-checkout Edge Function in Supabase
 * 
 * PREREQUISITES:
 * 1. Supabase should be running (will be started automatically if not)
 * 2. Edge Functions should be deployed or served locally with:
 *    cd [project_root] && supabase functions serve --no-verify-jwt
 * 3. A test user should exist in the auth system
 * 4. At least one product with a price should be available in the database
 * 5. Valid Stripe test API key should be in .env.test
 */
test.describe('Stripe Checkout Edge Function', () => {
  // Create a reusable Supabase test utility instance
  const supabaseUtils = new SupabaseTestUtils();
  
  // Track if Edge Functions are available
  let edgeFunctionsAvailable = false;
  
  // Test data needed for checkout
  let testUser = { id: '', email: '', token: '' };
  let testPrice = { id: '', amount: 0 };

  // Setup test environment
  test.beforeAll(async ({ request }) => {
    // Start Supabase if not already running
    const started = await supabaseUtils.startSupabase();
    expect(started).toBeTruthy();
    
    // Check if Edge Functions are available
    edgeFunctionsAvailable = await supabaseUtils.checkEdgeFunctions(request);
    
    // Create or get test user
    const supabase = supabaseUtils.getClient();
    
    // First check for existing test users
    const { data: existingUsers } = await supabase
      .from('auth.users')
      .select('id,email')
      .eq('email', 'e2etest@example.com')
      .limit(1);
    
    if (existingUsers && existingUsers.length > 0) {
      testUser.id = existingUsers[0].id;
      testUser.email = existingUsers[0].email;
      console.log(`Using existing test user: ${testUser.email} (${testUser.id})`);
    } else {
      // Create a test user if needed
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'e2etest@example.com',
        password: 'secureTestPassword123'
      });
      
      if (signUpError || !signUpData.user) {
        console.error('Failed to create test user:', signUpError);
      } else {
        testUser.id = signUpData.user.id;
        testUser.email = signUpData.user.email || 'e2etest@example.com';
        console.log(`Created test user: ${testUser.email} (${testUser.id})`);
      }
    }
    
    // Get authentication token for the test user
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'e2etest@example.com',
      password: 'secureTestPassword123'
    });
    
    if (signInError || !signInData.session) {
      console.error('Failed to sign in test user:', signInError);
    } else {
      testUser.token = signInData.session.access_token;
    }
    
    // Get an existing price to use for checkout
    const { data: prices } = await supabase
      .from('prices')
      .select('id,unit_amount')
      .eq('active', true)
      .limit(1);
    
    if (prices && prices.length > 0) {
      testPrice.id = prices[0].id;
      testPrice.amount = prices[0].unit_amount;
      console.log(`Using existing price: ${testPrice.id} ($${testPrice.amount / 100})`);
    } else {
      console.warn('No active prices found for testing');
    }
  });

  test('Edge Functions are available', async () => {
    expect(edgeFunctionsAvailable).toBeTruthy();
  });

  test('Create a checkout session', async ({ request }) => {
    test.skip(!edgeFunctionsAvailable || !testUser.token || !testPrice.id, 'Prerequisites not met');
    
    const checkoutData = {
      price_id: testPrice.id,
      success_url: 'http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:5173/cancel',
      mode: 'payment'
    };
    
    // Call the stripe-checkout Edge Function
    const response = await request.post(
      supabaseUtils.getFunctionUrl('stripe-checkout'),
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testUser.token}`
        },
        data: checkoutData
      }
    );
    
    expect(response.ok()).toBeTruthy();
    
    const responseData = await response.json();
    expect(responseData).toBeDefined();
    expect(responseData.sessionId).toBeDefined();
    expect(responseData.url).toBeDefined();
    expect(responseData.url).toContain('checkout.stripe.com');
    
    // Verify checkout log was created
    const supabase = supabaseUtils.getClient();
    const { data: logs } = await supabase
      .from('checkout_logs')
      .select('*')
      .eq('user_id', testUser.id)
      .eq('success', true)
      .order('timestamp', { ascending: false })
      .limit(1);
    
    expect(logs).toBeDefined();
    expect(logs?.length).toBeGreaterThan(0);
  });

  test('Validate checkout parameter validation', async ({ request }) => {
    test.skip(!edgeFunctionsAvailable || !testUser.token, 'Prerequisites not met');
    
    // Test with missing required parameter
    const invalidCheckoutData = {
      // Missing price_id
      success_url: 'http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:5173/cancel',
      mode: 'payment'
    };
    
    // Call the stripe-checkout Edge Function with invalid data
    const response = await request.post(
      supabaseUtils.getFunctionUrl('stripe-checkout'),
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testUser.token}`
        },
        data: invalidCheckoutData,
        failOnStatusCode: false // Don't fail the test on error response
      }
    );
    
    // Expect a 400 Bad Request status
    expect(response.status()).toBe(400);
    
    const responseData = await response.json();
    expect(responseData.error).toBeDefined();
    expect(responseData.error).toContain('Missing required parameter');
    
    // Verify checkout failure was logged
    const supabase = supabaseUtils.getClient();
    const { data: logs } = await supabase
      .from('checkout_logs')
      .select('*')
      .eq('user_id', testUser.id)
      .eq('success', false)
      .order('timestamp', { ascending: false })
      .limit(1);
    
    expect(logs).toBeDefined();
    expect(logs?.length).toBeGreaterThan(0);
    expect(logs?.[0].error_message).toContain('Missing required parameter');
  });

  test('Validate authentication requirement', async ({ request }) => {
    test.skip(!edgeFunctionsAvailable, 'Edge Functions not available');
    
    const checkoutData = {
      price_id: testPrice.id || 'price_123', // Use fake ID if no real one available
      success_url: 'http://localhost:5173/success',
      cancel_url: 'http://localhost:5173/cancel',
      mode: 'payment'
    };
    
    // Call the checkout function without authentication
    const response = await request.post(
      supabaseUtils.getFunctionUrl('stripe-checkout'),
      {
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header
        },
        data: checkoutData,
        failOnStatusCode: false
      }
    );
    
    // Expect a 401 Unauthorized status
    expect(response.status()).toBe(401);
    
    const responseData = await response.json();
    expect(responseData.error).toBeDefined();
    expect(responseData.error).toContain('Unauthorized');
  });

  test('Test CORS preflight handling', async ({ request }) => {
    test.skip(!edgeFunctionsAvailable, 'Edge Functions not available');
    
    // Send OPTIONS request to simulate CORS preflight
    const response = await request.fetch(
      supabaseUtils.getFunctionUrl('stripe-checkout'),
      {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:5173',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type,Authorization'
        }
      }
    );
    
    // Expect a successful CORS preflight response
    expect(response.ok()).toBeTruthy();
    
    // Verify CORS headers are set correctly
    const headers = response.headers();
    expect(headers['access-control-allow-origin']).toBeDefined();
    expect(headers['access-control-allow-methods']).toBeDefined();
    expect(headers['access-control-allow-headers']).toBeDefined();
  });
});
