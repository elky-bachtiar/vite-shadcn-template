
// This is a minimal test file to verify Stripe Edge Functions
import { test, expect } from '@playwright/test';

// Test Stripe products edge function
test('Stripe products Edge Function is available', async ({ request }) => {
  const url = 'http://localhost:54321/functions/v1/stripe-products';
  const response = await request.head(url);
  
  expect(response.ok()).toBeTruthy();
});

// Basic test to create a product
test('Can create Stripe product', async ({ request }) => {
  const url = 'http://localhost:54321/functions/v1/stripe-products';
  
  const testProduct = {
    name: 'Minimal Test Product',
    description: 'A test product for Playwright',
    type: 'donation',
    metadata: {
      created_by: 'playwright-test',
      test_run: 'true'
    },
    action: 'create'
  };
  
  const response = await request.post(url, {
    data: testProduct
  });
  
  expect(response.ok()).toBeTruthy();
  
  const data = await response.json();
  expect(data.id).toBeDefined();
  expect(data.name).toBe(testProduct.name);
});
