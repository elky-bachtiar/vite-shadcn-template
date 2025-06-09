#!/usr/bin/env node

// Script to run Edge Functions with environment variables from .env.local
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
const envFile = path.join(__dirname, '..', '.env.local');
console.log(`Loading environment variables from ${envFile}`);

if (!fs.existsSync(envFile)) {
  console.error(`Environment file not found: ${envFile}`);
  process.exit(1);
}

const envContent = fs.readFileSync(envFile, 'utf-8');
const envVars = {};

// Parse environment variables
envContent.split('\n').forEach(line => {
  // Skip empty lines and comments
  if (!line || line.startsWith('#')) return;
  
  // Parse KEY=VALUE format
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    
    // Remove quotes if present
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    
    envVars[key] = value;
  }
});

// Print keys found (but not values for security)
console.log(`Found ${Object.keys(envVars).length} environment variables`);
console.log('Keys found:', Object.keys(envVars).join(', '));

// Check for Stripe keys specifically (don't print the actual values)
if (envVars.STRIPE_SECRET_KEY) {
  console.log('✅ STRIPE_SECRET_KEY found');
} else {
  console.log('❌ STRIPE_SECRET_KEY not found - tests will fail');
}

if (envVars.SUPABASE_URL) {
  console.log('✅ SUPABASE_URL found');
} else if (envVars.VITE_SUPABASE_URL) {
  console.log('✅ Using VITE_SUPABASE_URL instead of SUPABASE_URL');
  envVars.SUPABASE_URL = envVars.VITE_SUPABASE_URL;
} else {
  console.log('❌ SUPABASE_URL not found - tests will fail');
}

if (envVars.SUPABASE_SERVICE_ROLE_KEY) {
  console.log('✅ SUPABASE_SERVICE_ROLE_KEY found');
} else {
  console.log('❌ SUPABASE_SERVICE_ROLE_KEY not found - tests will fail');
}

// Create a temporary .env file for Supabase to use
const tempEnvPath = path.join(__dirname, '..', 'supabase', 'functions', '.env.local');
let tempEnvContent = '';

// Only include essential variables
const essentialVars = [
  'STRIPE_SECRET_KEY',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'STRIPE_WEBHOOK_SECRET'
];

for (const key of essentialVars) {
  if (envVars[key]) {
    tempEnvContent += `${key}=${envVars[key]}\n`;
  }
}

// Write the temporary .env file
console.log(`Creating temporary environment file at ${tempEnvPath}`);
fs.writeFileSync(tempEnvPath, tempEnvContent);

// Create the command with the --env-file option
const command = `supabase functions serve --env-file=${tempEnvPath} --no-verify-jwt`;

console.log('\nStarting Supabase Edge Functions with environment variables...');
console.log('Environment variables will be passed directly to the command');

// Start Supabase Functions server
const supabase = spawn(command, {
  stdio: 'inherit',
  shell: true,
});

// Handle server process
supabase.on('error', (error) => {
  console.error('Failed to start Supabase Functions server:', error);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\nStopping Supabase Functions server...');
  
  // Clean up temporary .env file
  try {
    fs.unlinkSync(tempEnvPath);
    console.log(`Removed temporary .env file: ${tempEnvPath}`);
  } catch (err) {
    console.error(`Failed to remove temporary .env file: ${err.message}`);
  }
  
  supabase.kill();
  process.exit(0);
});

console.log('Press Ctrl+C to stop the server');
