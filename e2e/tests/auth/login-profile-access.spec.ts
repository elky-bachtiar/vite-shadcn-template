/**
 * End-to-end test for authentication and profile access
 * 
 * This test verifies:
 * 1. Unauthenticated users are redirected to login when trying to access the profile page
 * 2. Users can successfully log in with valid credentials
 * 3. Authentication errors are properly displayed
 * 4. After login, users can access their profile page
 * 5. Users can log out successfully
 */

import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { testConfig } from '../setup.js';
import { EXAMPLE_USERS } from '../../scripts/seed-test-users.js';

// Log important configuration info for debugging
console.log('Supabase URL for testing:', testConfig.supabaseUrl);
console.log('Using baseURL from Playwright config:', process.env.BASE_URL || 'http://localhost:5173');

// Initialize Supabase client for test data setup
const supabase = createClient(testConfig.supabaseUrl, testConfig.supabaseAnonKey);

// Using the seeded example users imported from seed-test-users.js

// Test authentication flow and protected profile access
test.describe('Authentication and Profile Access', () => {
  // Test user credentials - will use the first example user by default
  let testUser = {
    email: EXAMPLE_USERS[0].email,
    password: EXAMPLE_USERS[0].password,
    userId: ''
  };

  // Check for seeded example users from the database
  test.beforeAll(async () => {
    try {
      // First check if Supabase is accessible
      console.log('Checking Supabase connection...');
      const { data: healthCheck, error: healthError } = await supabase.from('users').select('count').limit(1).maybeSingle();
      
      if (healthError) {
        console.warn('Supabase connection check failed:', healthError.message);
        console.warn('Continuing with example user credentials, but auth may fail if users not seeded');
        return;
      }
      
      console.log('Supabase connection successful, checking for seeded example users');
      
      // Try to find any of our example users in the database
      for (const exampleUser of EXAMPLE_USERS) {
        try {
          // Check if this example user exists in the users table
          const { data: users, error } = await supabase
            .from('users')
            .select('id, email')
            .eq('email', exampleUser.email)
            .limit(1);
            
          if (!error && users && users.length > 0) {
            // Found a matching user, use this one for testing
            testUser.email = exampleUser.email;
            testUser.password = exampleUser.password;
            testUser.userId = users[0].id;
            
            console.log(`Found seeded example user: ${testUser.email} with ID: ${testUser.userId}`);
            return; // Exit the loop once we find a valid user
          }
        } catch (e) {
          console.log(`Error checking for user ${exampleUser.email}:`, e);
        }
      }
      
      // If we reach here, none of the example users were found
      console.warn('None of the expected seeded users were found in the database.');
      console.warn('Make sure to run the seed-example-campaigns function before running tests.');
      console.warn(`Tests will attempt to use ${testUser.email} but login may fail if not seeded.`);
      
    } catch (error) {
      console.error('Error in test setup:', error);
      console.warn('Will continue with default example user, but auth may fail if not seeded');
    }
  });

  test('should redirect unauthenticated users from profile to login page', async ({ page, baseURL }) => {
    // Make sure we have a valid baseURL
    if (!baseURL) {
      baseURL = 'http://localhost:5173'; // Default to localhost if baseURL is not provided
    }
    
    // Try to access profile page without being authenticated
    await page.goto(`${baseURL}/profile`);
    
    // Should be redirected to login page
    await expect(page).toHaveURL(/.*\/login/);
    
    // Login form elements should be visible
    await expect(page.getByPlaceholder('name@example.com')).toBeVisible();
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
  });

  test('should display error for invalid login credentials', async ({ page, baseURL }) => {
    // Make sure we have a valid baseURL
    test.skip(!baseURL, 'No baseURL provided in configuration');
    
    // Start from the login page
    await page.goto('/login', { timeout: 10000 });
    
    // Fill in invalid credentials
    await page.getByPlaceholder('name@example.com').fill('nonexistent@example.com');
    await page.getByLabel('Password', { exact: true }).fill('wrongpassword');
    
    // Submit the form
    await page.getByRole('button', { name: /Sign in/i }).click();
    
    // Should show error message and remain on login page
    await expect(page.locator('.text-destructive')).toBeVisible({ timeout: 5000 });
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('should allow users to log in and access profile page', async ({ page, baseURL }) => {
    // Make sure we have a valid baseURL
    if (!baseURL) {
      baseURL = 'http://localhost:5173'; // Default to localhost if baseURL is not provided
    }
    
    // Go to login page
    await page.goto(`${baseURL}/login`);
    
    // Fill login form
    await page.getByPlaceholder('name@example.com').fill(testUser.email);
    await page.getByLabel('Password', { exact: true }).fill(testUser.password);
    
    // Click login button
    await page.getByRole('button', { name: /Sign in/i }).click();
    
    try {
      // Wait for navigation after successful login
      await page.waitForURL(/.*\/profile/, { timeout: 10000 });
      
      // Should be redirected to profile page
      await expect(page).toHaveURL(/.*\/profile/);
      
      // Verify we're on the profile page by checking for UI elements that should be present
      await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible({ timeout: 10000 });
      await expect(page.getByRole('tab', { name: 'Account' })).toBeVisible();
      
      // Verify that user menu button is visible (sign of being logged in)
      await expect(page.getByTestId('user-menu-button')).toBeVisible();
    } catch (e) {
      // Take screenshot on failure for debugging
      await page.screenshot({ path: 'login-failure.png' });  
      throw e;
    }
  });

  test('should allow users to sign out successfully', async ({ page, baseURL }) => {
    // Make sure we have a valid baseURL
    if (!baseURL) {
      baseURL = 'http://localhost:5173'; // Default to localhost if baseURL is not provided
    }
    
    // Go to login page
    await page.goto(`${baseURL}/login`);
    
    // Fill login form with correct credentials
    await page.getByPlaceholder('name@example.com').fill(testUser.email);
    await page.getByLabel('Password', { exact: true }).fill(testUser.password);
    
    // Click login button
    await page.getByRole('button', { name: /Sign in/i }).click();
    
    try {
      // Wait for navigation after login
      await page.waitForURL(/.*\/profile/, { timeout: 10000 });
      
      // Open the user menu in the navigation bar using the test ID
      const userMenuButton = page.getByTestId('user-menu-button');
      await expect(userMenuButton).toBeVisible({ timeout: 5000 });
      await userMenuButton.click();
      
      // The user menu dropdown should contain the sign out option
      const signOutButton = page.getByTestId('sign-out-button');
      await expect(signOutButton).toBeVisible({ timeout: 5000 });
      
      // Click the sign out button
      await signOutButton.click();
      
      // Verify user is signed out and redirected to login page
      await expect(page).toHaveURL(/.*\/login/, { timeout: 5000 });
      
      // Verify login form is visible again, confirming sign out was successful
      await expect(page.getByPlaceholder('name@example.com')).toBeVisible();
    } catch (e) {
      // Take screenshot on failure for debugging
      await page.screenshot({ path: 'signout-failure.png' });
      throw e;
    }
  });
});
