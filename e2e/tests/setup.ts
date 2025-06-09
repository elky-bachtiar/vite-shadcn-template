// Playwright setup file
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { seedTestUsers } from '../scripts/seed-test-users.js';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the project root directory (go up from e2e/tests to project root)
const projectRoot = path.resolve(__dirname, '../..');

// Load environment variables from .env.test file in the e2e directory
dotenv.config({ path: path.join(__dirname, '../.env.test') });

// Export environment variables for Playwright
export const testConfig = {
  // First try VITE_ prefixed vars (new standard), then NEXT_PUBLIC_ (possible legacy)
  supabaseUrl: process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
  supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  edgeFunctionsUrl: process.env.VITE_EDGE_FUNCTIONS_URL || process.env.EDGE_FUNCTIONS_URL || 'http://localhost:54321/functions/v1'
};

// Log the configuration for debugging
console.log('Test Configuration:', {
  supabaseUrl: testConfig.supabaseUrl,
  edgeFunctionsUrl: testConfig.edgeFunctionsUrl,
  hasStripeKey: !!testConfig.stripeSecretKey
});

console.log('Supabase URL for testing:', testConfig.supabaseUrl);

// Seed test users before running tests (just for authentication)  
if (process.env.NODE_ENV !== 'test:skip-seed') {
  try {
    // We use top-level await since this is an ESM module
    console.log('🌱 Seeding test users for authentication tests...');
    await seedTestUsers();
  } catch (error) {
    console.warn('⚠️ Error seeding test users:', error);
    console.warn('Authentication tests may fail if users are not seeded');
  }
}

