// For Deno edge functions
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';
import { Campaign, CampaignStatus, CATEGORIES, Category, SEED_TAG, USER_ROLES, type User, type UserProfile } from './types.ts';
import { seedStripeProducts } from './seed-stripe-products.js';  // Use .js extension for ESM imports as per project convention

// Define example users directly in this file to avoid import issues
const exampleUsers: User[] = [
  {
    id: '100',
    email: 'john.doe@example.com',
    role: USER_ROLES.CAMPAIGN_OWNER,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '101',
    email: 'jane.smith@example.com',
    role: USER_ROLES.CAMPAIGN_OWNER,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '102',
    email: 'robert.johnson@example.com',
    role: USER_ROLES.CAMPAIGN_OWNER,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '103',
    email: 'sarah.wilson@example.com',
    role: USER_ROLES.CAMPAIGN_OWNER,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '104',
    email: 'michael.brown@example.com',
    role: USER_ROLES.CAMPAIGN_OWNER,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '105',
    email: 'admin@shop2give.store',
    role: USER_ROLES.ADMIN,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Define matching user profiles
const exampleUserProfiles: UserProfile[] = [
  {
    id: '1',
    user_id: exampleUsers[0].id,
    first_name: 'John',
    last_name: 'Doe',
    avatar_url: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    preferences: {
      language: 'en',
      currency: 'USD',
      notifications: {
        email: true,
        push: true
      }
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    user_id: exampleUsers[1].id,
    first_name: 'Jane',
    last_name: 'Smith',
    avatar_url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    preferences: {
      language: 'en',
      currency: 'USD',
      notifications: {
        email: true,
        push: false
      }
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    user_id: exampleUsers[2].id,
    first_name: 'Robert',
    last_name: 'Johnson',
    avatar_url: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    preferences: {
      language: 'en',
      currency: 'USD',
      notifications: {
        email: false,
        push: true
      }
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    user_id: exampleUsers[3].id,
    first_name: 'Sarah',
    last_name: 'Wilson',
    avatar_url: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    preferences: {
      language: 'en',
      currency: 'USD',
      notifications: {
        email: true,
        push: true
      }
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '5',
    user_id: exampleUsers[4].id,
    first_name: 'Michael',
    last_name: 'Brown',
    avatar_url: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    preferences: {
      language: 'en',
      currency: 'USD',
      notifications: {
        email: true,
        push: false
      }
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '6',
    user_id: exampleUsers[5].id,  // Admin user
    first_name: 'Admin',
    last_name: 'User',
    avatar_url: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    preferences: {
      language: 'en',
      currency: 'USD',
      notifications: {
        email: true,
        push: true
      }
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// TypeScript declaration for Deno namespace to satisfy the linter
// This will be ignored at runtime in the Deno environment where Deno is already available
declare namespace Deno {
  namespace env {
    function toObject(): Record<string, string>;
    function get(key: string): string | undefined;
  }
}

// Setup Supabase client
const denoEnv = Deno.env.toObject();

const supabaseUrl = denoEnv.SUPABASE_URL || Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = denoEnv.SUPABASE_ANON_KEY || Deno.env.get('SUPABASE_ANON_KEY') || '';

// Create a single supabase client for interacting with your database
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Helper function to check if a table exists in the database
 */
async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    // Try a simple query to see if the table exists
    const { error } = await supabase
      .from(tableName)
      .select('count')
      .limit(1);
      
    // If there's no error, the table exists
    return !error;
  } catch (error) {
    console.error(`Error checking if table '${tableName}' exists:`, error);
    return false;
  }
}

// Function to load campaign data from a JSON file
async function loadCampaignData(category: Category): Promise<Campaign[]> {
  try {
    const filePath = `./data/${category}.json`;
    // Use Fetch API which is available in Deno environment
    const response = await fetch(new URL(filePath, import.meta.url).href);
    if (!response.ok) {
      throw new Error(`Failed to load ${category} campaigns: ${response.status}`);
    }
    const jsonText = await response.text();
    return JSON.parse(jsonText) as Campaign[];
  } catch (error) {
    console.error(`Error loading campaign data for ${category}:`, error);
    return [];
  }
}

// Function to seed example users and profiles
async function seedUsers(): Promise<{
  userIds: string[];
  error: Error | null;
}> {
  console.log('Seeding users...');
  
  // Check if user_profiles table exists
  const profilesTableExists = await checkTableExists('user_profiles');
  if (!profilesTableExists) {
    console.warn('User profiles table does not exist. Schema might not be initialized yet.');
    return { userIds: [], error: null };
  }
  
  // Use the example users defined at the top of the file
  const usersToSeed = exampleUsers.map(user => ({
    email: user.email,
    password: 'password123', // Use a simple password for test users
    role: user.role,
    user_metadata: {
      role: user.role,
      full_name: `Example ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}` // Generate a name based on role
    }
  }));
  
  console.log(`Trying to seed ${usersToSeed.length} users in auth.users using admin API`);
  
  // Create admin client using service role key for auth operations
  const adminAuthClient = createClient(
    supabaseUrl,
    // Try to use service role key if available (needed for auth admin operations)
    denoEnv.SUPABASE_SERVICE_ROLE_KEY || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || supabaseKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
  
  // Map of email to user ID for linking profiles
  const emailToUserIdMap = new Map<string, string>();
  // Track existing and newly created user IDs
  const existingUserIds: string[] = [];
  const createdUserIds: string[] = [];
  
  try {
    // First check if users already exist - try to get users by email
    for (const user of usersToSeed) {
      try {
        // Check if the user exists in auth.users by email
        const { data: existingUsers, error } = await adminAuthClient
          .auth
          .admin
          .listUsers({ 
            filters: { 
              email: user.email 
            }
          });

        if (error) {
          console.error(`Error checking if user ${user.email} exists:`, error);
          continue;
        }
        
        // If user exists, add to our map
        if (existingUsers?.users && existingUsers.users.length > 0) {
          const existingUser = existingUsers.users[0];
          console.log(`User with email ${user.email} already exists with ID ${existingUser.id}`);
          existingUserIds.push(existingUser.id);
          emailToUserIdMap.set(user.email, existingUser.id);
          continue;
        }
      } catch (e) {
        console.error(`Error checking if user ${user.email} exists:`, e);
        // Continue to try creating the user anyway
      }
      
      // User doesn't exist, create a new one with service role
      const password = `Password123!${user.email.split('@')[0]}`; // Simple deterministic password for testing
      // Create new user
      try {
        // Create user with the Auth Admin API
        const { data: newUser, error } = await adminAuthClient.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: user.user_metadata,
          app_metadata: {
            role: user.role
          }
        });
        
        if (error || !newUser) {
          console.error(`Error creating user ${user.email}:`, error);
          continue;
        }
        
        console.log(`Created new auth user ${user.email} with ID ${newUser.user.id}`);
        createdUserIds.push(newUser.user.id);
        emailToUserIdMap.set(user.email, newUser.user.id);
      } catch (e) {
        console.error(`Error creating user ${user.email}:`, e);
        // Skip this user
        continue;
      }
    }
    
    // All user IDs (both existing and newly created)
    const allUserIds = [...existingUserIds, ...createdUserIds];
    console.log(`Total users: ${allUserIds.length} (${existingUserIds.length} existing, ${createdUserIds.length} new)`);
    
    // Check if profiles already exist in user_profiles table
    const { data: existingProfiles, error: profileCheckError } = await supabase
      .from('user_profiles')
      .select('id, user_id')
      .in('user_id', allUserIds);
      
    if (profileCheckError) {
      console.error('Error checking existing profiles:', profileCheckError);
      throw profileCheckError;
    }
    
    // Extract profile user IDs that already exist
    const existingProfileUserIds = existingProfiles?.map(p => p.user_id) || [];
    console.log(`Found ${existingProfileUserIds.length} existing profiles`);
    
    // Create profiles for users that don't have one
    const profilesToInsert = [];
    
    for (const user of exampleUsers) {
      const actualUserId = emailToUserIdMap.get(user.email);
      
      if (!actualUserId) {
        console.log(`No user ID found for email ${user.email}, skipping profile creation`);
        continue;
      }
      
      // Skip if profile already exists
      if (existingProfileUserIds.includes(actualUserId)) {
        console.log(`Profile already exists for user ${user.email} (${actualUserId}), skipping`);
        continue;
      }
      
      // Find matching example profile template
      const profileTemplate = exampleUserProfiles.find(p => p.user_id === user.id);
      
      if (profileTemplate) {
        // Create new profile with actual user ID
        const newProfile = {
          ...profileTemplate,
          id: `user_profile_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`, // Generate a unique ID for the profile
          user_id: actualUserId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        profilesToInsert.push(newProfile);
        console.log(`Prepared profile for user ${user.email} with ID ${actualUserId}`);
      }
    }
    
    // Insert new profiles
    if (profilesToInsert.length > 0) {
      console.log(`Inserting ${profilesToInsert.length} new profiles...`);
      
      const { data: insertedProfiles, error: profileInsertError } = await supabase
        .from('user_profiles')
        .insert(profilesToInsert)
        .select('id, user_id');
        
      if (profileInsertError) {
        console.error('Error inserting profiles:', profileInsertError);
        throw profileInsertError;
      }
      
      console.log(`Successfully inserted ${insertedProfiles?.length || 0} profiles`);
    } else {
      console.log('No new profiles to insert');
    }
    
    // Return all user IDs (both existing and newly created)
    return {
      userIds: allUserIds,
      error: null
    };
  } catch (error) {
    console.error('Error seeding users:', error);
    return {
      userIds: [],
      error: error as Error
    };
  }
}

// Function to seed example campaigns
async function seedCampaigns(userIds: string[]): Promise<{
  insertedCampaigns: Campaign[];
  error: Error | null;
}> {
  console.log('Seeding campaigns...');
  
  // Check if campaigns table exists
  const campaignsTableExists = await checkTableExists('campaigns');
  if (!campaignsTableExists) {
    console.warn('Campaigns table does not exist. Schema might not be initialized yet.');
    return { insertedCampaigns: [], error: null };
  }
  
  try {
    // Load campaign data for each category
    const allCampaigns: Campaign[] = [];
    
    for (const category of CATEGORIES) {
      const categoryData = await loadCampaignData(category);
      console.log(`Loaded ${categoryData.length} campaigns for category ${category}`);
      allCampaigns.push(...categoryData);
    }
    
    console.log(`Total campaign data loaded: ${allCampaigns.length} campaigns`);
    
    // Check for existing campaigns with the seed tag to avoid duplicates
    const { data: existingCampaigns, error: fetchError } = await supabase
      .from('campaigns')
      .select('id')
      .contains('tags', [SEED_TAG]);
      
    if (fetchError) {
      console.error('Error fetching existing campaigns:', fetchError);
      return { insertedCampaigns: [], error: fetchError };
    }
    
    // Extract existing campaign IDs
    const existingIds = (existingCampaigns || []).map(c => c.id);
    console.log(`Found ${existingIds.length} existing seeded campaigns`);
    
    // Map user emails to user IDs for campaign ownership
    const emailToIdMap = new Map<string, string>();
    for (const id of userIds) {
      const { data: user, error } = await supabase
        .from('user_profiles')
        .select('email')
        .eq('user_id', id)
        .single();
        
      if (user && !error) {
        emailToIdMap.set(user.email, id);
      }
    }
    
    // Assign owners to campaigns
    const campaignsWithOwners = allCampaigns.map(campaign => {
      // If the campaign has a valid email and we have a matching user, assign the user ID
      // Otherwise, assign a random user from our seeded users
      let ownerId = userIds[Math.floor(Math.random() * userIds.length)];
      
      // owner_email may be added as a custom property during data loading
      const ownerEmail = (campaign as any).owner_email;
      if (ownerEmail && emailToIdMap.has(ownerEmail)) {
        ownerId = emailToIdMap.get(ownerEmail)!;
      }
      
      return {
        ...campaign,
        owner_id: ownerId
      };
    });
    
    // Filter out campaigns that already exist
    const campaignsToInsert = campaignsWithOwners.filter(campaign => {
      return !existingIds.includes(campaign.id);
    }).map(campaign => {
      const tags = Array.isArray(campaign.tags) ? [...campaign.tags] : [];
      if (!tags.includes(SEED_TAG)) {
        tags.push(SEED_TAG);
      }
      // Remove any temporary properties not in the Campaign type
      const { tag, owner_email, ...campaignWithoutExtraProps } = campaign as any;
      return {
        ...campaignWithoutExtraProps,
        tags,
        status: 'draft' as CampaignStatus
      };
    });
    
    if (campaignsToInsert.length === 0) {
      console.log('No new campaigns to insert');
      return { insertedCampaigns: [], error: null };
    }
    
    console.log(`Inserting ${campaignsToInsert.length} new campaigns`);
    
    // Insert campaigns in batches
    const batchSize = 20;
    const insertedCampaigns: Campaign[] = [];
    
    for (let i = 0; i < campaignsToInsert.length; i += batchSize) {
      const batch = campaignsToInsert.slice(i, i + batchSize);
      const { data, error } = await supabase
        .from('campaigns')
        .insert(batch)
        .select();
        
      if (error) {
        console.error('Error inserting campaigns batch:', error);
        return { insertedCampaigns, error };
      }
      
      if (data) {
        insertedCampaigns.push(...data as Campaign[]);
      }
    }
    
    console.log(`Successfully inserted ${insertedCampaigns.length} campaigns`);
    return { insertedCampaigns, error: null };
  } catch (error) {
    console.error('Error in seedCampaigns:', error);
    return { insertedCampaigns: [], error: error as Error };
  }  
}

// Main HTTP handler function for Deno edge function
async function handleRequest(req: Request): Promise<Response> {
  // Define CORS headers for all responses
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    // Initialize response structure
    const response = {
      success: true,
      campaigns: { seeded: 0, message: "" },
      users: { seeded: 0, message: "" },
      profiles: { seeded: 0, message: "" },
      stripeProducts: { success: false, message: "", error: null as string | null }
    };
    
    // Check if the database schema is initialized
    const authClient = createClient(
      supabaseUrl,
      denoEnv.SUPABASE_SERVICE_ROLE_KEY || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || supabaseKey
    );
    
    // Try to access auth users through admin API
    let authUsersAccessible = false;
    try {
      const { data, error } = await authClient.auth.admin.listUsers({ perPage: 1 });
      authUsersAccessible = !error;
    } catch (e) {
      console.warn('Cannot access auth users API, may need service role key:', e);
      authUsersAccessible = false;
    }
    
    // Check regular tables
    const profilesTableExists = await checkTableExists('user_profiles');
    const campaignsTableExists = await checkTableExists('campaigns');
    
    if (!authUsersAccessible || !profilesTableExists || !campaignsTableExists) {
      console.warn(`Database schema not fully initialized or accessible: auth users=${authUsersAccessible}, profiles=${profilesTableExists}, campaigns=${campaignsTableExists}`);
      response.success = false;
      response.campaigns.message = "Database schema not initialized or service role key missing. Run migrations first.";
      return new Response(
        JSON.stringify(response),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 200 }
      );
    }

    // Step 1: Seed users and profiles
    const { userIds, error: userError } = await seedUsers();
    if (userError) {
      response.success = false;
      response.users.message = `Failed to seed users: ${userError.message}`;
      return new Response(
        JSON.stringify(response),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
    }

    console.log(`Seeded ${userIds.length} users. User IDs:`, userIds);
    response.users.seeded = userIds.length;
    response.users.message = `Successfully seeded ${userIds.length} users`;

    // Step 2: Seed campaigns
    const { insertedCampaigns, error: campaignError } = await seedCampaigns(userIds);
    if (campaignError) {
      response.success = false;
      response.campaigns.message = `Failed to seed campaigns: ${campaignError.message}`;
      return new Response(
        JSON.stringify(response),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
    }
    
    response.campaigns.seeded = insertedCampaigns.length;
    response.campaigns.message = `Successfully seeded ${insertedCampaigns.length} campaigns`;
    
    // Step 3: Seed Stripe products for each campaign
    const stripeResult = await seedStripeProducts(insertedCampaigns);
    response.stripeProducts = stripeResult;
    
    // Return the final success response
    return new Response(
      JSON.stringify(response),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 200 }
    );
  } catch (error) {
    console.error('Error in seed function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Error seeding data: ' + (error as Error).message,
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
    );
  }
}

// Start the HTTP server with the main handler
serve(handleRequest);
