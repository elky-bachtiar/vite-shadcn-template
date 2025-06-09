/**
 * Migration Tests for Supabase
 * 
 * This test suite verifies that all expected tables, schemas, roles and functions
 * exist after running migrations. It helps identify issues with migration ordering
 * or permissions that might prevent tables from being created properly.
 */

import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { testConfig } from '../setup.js';
import SupabaseTestUtils from './helpers/supabase-utils.js';

test.describe('Supabase Migration Tests', () => {
  // Create a reusable Supabase test utility instance
  const supabaseUtils = new SupabaseTestUtils();
  let supabase: any;
  
  test.beforeAll(async () => {
    // Initialize Supabase client
    supabase = createClient(testConfig.supabaseUrl, testConfig.supabaseAnonKey);
    console.log('Test Configuration:', {
      supabaseUrl: testConfig.supabaseUrl,
      hasAnonKey: !!testConfig.supabaseAnonKey
    });
  });
  
  test('should have access to Supabase', async () => {
    // Simple connectivity test
    const result = await supabaseUtils.checkSupabaseRunning();
    expect(result).toBeTruthy();
  });

  test('verify public schema tables exist', async () => {
    // List of tables we expect to exist in the public schema
    const expectedTables = [
      'campaigns',
      'campaign_comments',
      'campaign_images',
      'campaign_products',
      'campaign_updates',
      'categories',
      'checkout_logs',
      'conversion_events',
      'coupon_usage',
      'coupons',
      'donations',
      'edge_function_logs',
      'notifications',
      'order_items',
      'orders',
      'page_views',
      'product_reviews',
      'products',
      'store_managers',
      'stores',
      'stripe_customers',
      'stripe_orders',
      'stripe_subscriptions',
      'user_profiles',
      'user_roles',
      'webhook_logs',
      'wishlist_items',
      'wishlists'
    ];
    
    // Check each table exists
    for (const table of expectedTables) {
      const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
      console.log(`Table ${table}: ${error ? 'ERROR: ' + error.message : 'exists'}`);
      expect(error).toBeNull();
    }
  });
  
  test('verify get_auth_users_count function works', async () => {
    const { data, error } = await supabase.rpc('get_auth_users_count');
    console.log('Auth users count function:', error ? `ERROR: ${error.message}` : `Found ${data} users`);
    expect(error).toBeNull();
    expect(typeof data).toBe('number');
  });

  test('verify roles exist', async () => {
    // This test needs service_role to check roles
    const adminClient = createClient(
      testConfig.supabaseUrl,
      testConfig.serviceRoleKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
    );
    
    // Check via SQL query if we can access the auth schema
    const { data, error } = await adminClient.rpc('check_roles_exist');
    console.log('Roles check:', data);
    expect(error).toBeNull();
    expect(data).toBeTruthy();
  });
});
