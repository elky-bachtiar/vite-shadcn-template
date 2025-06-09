#!/usr/bin/env node

/**
 * This script seeds just the example users needed for authentication tests
 * without trying to create campaigns (which might have schema issues)
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory path in ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables from .env.test
const envPath = path.resolve(__dirname, '../.env.test');
dotenv.config({ path: envPath });

// Example users for testing - exactly matching those in seed-example-campaigns function
const EXAMPLE_USERS = [
  {
    email: 'john.doe@example.com',
    password: 'Password123!john.doe@example.com',
    role: 'campaign_owner'
  },
  {
    email: 'jane.smith@example.com',
    password: 'Password123!jane.smith@example.com',
    role: 'campaign_owner'
  },
  {
    email: 'robert.johnson@example.com',
    password: 'Password123!robert.johnson@example.com',
    role: 'campaign_owner'
  },
  {
    email: 'sarah.wilson@example.com',
    password: 'Password123!sarah.wilson@example.com',
    role: 'campaign_owner'
  },
  {
    email: 'michael.brown@example.com',
    password: 'Password123!michael.brown@example.com',
    role: 'campaign_owner'
  }
];

interface UserProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  phone?: string;
  language_preference?: string;
  notification_preferences?: {
    email: boolean;
    push: boolean;
  };
}

async function seedTestUsers() {
  console.log('🌱 Seeding test users for authentication tests...');
  
  // Setup Supabase client with service role key to perform admin operations
  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:54321';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log(`Using Supabase URL: ${supabaseUrl}`);
  
  if (!supabaseUrl) {
    console.error('❌ Missing VITE_SUPABASE_URL in environment variables');
    process.exit(1);
  }
  
  if (!serviceRoleKey) {
    console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY in environment variables');
    process.exit(1);
  }
  
  // Test the Supabase connection
  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/health`, {
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`
      }
    });
    
    if (!response.ok) {
      console.error(`❌ Supabase auth service is not healthy: ${response.status} ${response.statusText}`);
      const body = await response.text();
      console.error('Response body:', body);
      process.exit(1);
    } else {
      console.log('✅ Supabase auth service is healthy');
    }
  } catch (error) {
    console.error('❌ Failed to connect to Supabase auth service:', error);
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  
  const results = {
    users: { created: 0, skipped: 0 },
    profiles: { created: 0, skipped: 0 }
  };
  
  try {
    // Process each example user
    for (const user of EXAMPLE_USERS) {
      console.log(`Processing user: ${user.email}`);
      
      // Check if user already exists by listing users and filtering
      const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
      
      let userId: string | null = null;
      
      if (listError) {
        console.error(`Error listing users to check for ${user.email}:`, listError);
        continue;
      }
      
      // Find user by email in the list
      const existingUser = usersData?.users.find(u => u.email === user.email);
      
      if (existingUser) {
        console.log(`User ${user.email} already exists, skipping creation`);
        userId = existingUser.id;
        results.users.skipped++;
      } else {
        // User doesn't exist, create them
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: {
            role: user.role
          }
        });
        
        if (createError) {
          console.error(`Error creating user ${user.email}:`, createError);
          continue;
        }
        
        console.log(`Created user ${user.email} with ID ${newUser.user.id}`);
        userId = newUser.user.id;
        results.users.created++;
      }
      
      if (!userId) continue;
      
      // Check if profile exists
      const { data: existingProfiles, error: profileCheckError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', userId)
        .limit(1);
      
      if (profileCheckError) {
        console.error(`Error checking for existing profile for ${user.email}:`, profileCheckError);
      } else if (existingProfiles && existingProfiles.length > 0) {
        console.log(`Profile for user ${user.email} already exists, skipping creation`);
        results.profiles.skipped++;
      } else {
        // Create profile for user
        const profile: UserProfile = {
          user_id: userId,
          first_name: user.email.split('@')[0].split('-')[0],
          last_name: user.role,
          notification_preferences: {
            email: true,
            push: true
          },
          language_preference: 'en'
        };
        
        const { error: insertProfileError } = await supabase
          .from('user_profiles')
          .insert([profile]);
        
        if (insertProfileError) {
          console.error(`Error creating profile for ${user.email}:`, insertProfileError);
        } else {
          console.log(`Created profile for ${user.email}`);
          results.profiles.created++;
        }
      }
    }
    
    console.log('✅ Seeding complete!', results);
    return results;
  } catch (error) {
    console.error('❌ Error in seeding process:', error);
    throw error;
  }
}

// Run the function if this file is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedTestUsers().catch(console.error);
}

export { seedTestUsers, EXAMPLE_USERS };
