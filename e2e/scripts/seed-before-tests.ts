#!/usr/bin/env node

/**
 * This script runs the seed-example-campaigns Supabase edge function
 * to ensure that example users, profiles, and campaigns exist in the database
 * before running E2E tests.
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory path in ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables from .env.test
const envPath = path.resolve(__dirname, '../e2e/.env.test');
dotenv.config({ path: envPath });

interface SeedResponse {
  users?: {
    created: number;
    skipped: number;
  };
  profiles?: {
    created: number;
    skipped: number;
  };
  campaigns?: {
    created: number;
    skipped: number;
  };
  products?: {
    created: number;
    skipped: number;
  };
  message?: string;
  error?: string;
}

async function seedExampleData(): Promise<SeedResponse> {
  console.log('🌱 Seeding example data for E2E tests...');
  
  // Get the edge functions URL from environment
  const edgeFunctionsUrl = process.env.SUPABASE_EDGE_FUNCTIONS_URL || 'http://localhost:54321/functions/v1';
  const seedFunctionUrl = `${edgeFunctionsUrl}/seed-example-campaigns`;
  
  console.log(`🔗 Calling seed function at: ${seedFunctionUrl}`);
  
  try {
    const response = await fetch(seedFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || ''}`
      },
      body: JSON.stringify({ force: true }) // Force recreate examples even if they exist
    });
    
    const data = await response.json() as SeedResponse;
    
    if (!response.ok) {
      console.error('❌ Failed to seed example data:', data);
      process.exit(1);
    }
    
    console.log('✅ Successfully seeded example data:', data);
    return data;
  } catch (error) {
    console.error('❌ Error calling seed function:', error);
    process.exit(1);
    // This return is unreachable but needed for TypeScript
    return { error: String(error) };
  }
}

// Run the function if this file is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedExampleData().catch(console.error);
}

export { seedExampleData };
