/**
 * Global setup for Playwright tests that runs once before all tests
 * This starts Supabase and checks that Edge Functions are available
 */

import { FullConfig } from '@playwright/test';
import SupabaseTestUtils from './tests/supabase/helpers/supabase-utils.js';

// Create singleton instance of SupabaseTestUtils for global usage
export const supabaseUtils = new SupabaseTestUtils();

// Global state accessible across all test files
export const globalTestState = {
  edgeFunctionsAvailable: false,
  initialCounts: {},
  stripeClient: null as any // Allow any type to avoid strict typing issues
};

// Global setup function
async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup...');
  
  // Start Supabase if not running
  const supabaseRunning = await supabaseUtils.startSupabase();
  console.log(`Supabase running: ${supabaseRunning}`);
  
  // Get Stripe client if available
  const stripeClient = supabaseUtils.getStripeClient();
  if (stripeClient) {
    globalTestState.stripeClient = stripeClient;
    console.log('Stripe client initialized successfully');
  }
  
  // Get initial record counts for comparison in tests
  globalTestState.initialCounts = await supabaseUtils.logDatabaseCounts();
  
  console.log('✅ Global setup complete');
}

// Global teardown function - can be used to clean up resources
async function globalTeardown() {
  console.log('🧹 Running global teardown...');
  // Any cleanup could go here
}

export default globalSetup;
export { globalTeardown };
