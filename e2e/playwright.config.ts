import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.test file
dotenv.config({ path: path.join(__dirname, '.env.test') });

// Base URL for all navigation actions in tests
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

// Log configuration for debugging
console.log('Playwright config loaded with BASE_URL:', BASE_URL);

/**
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  /* Global setup and teardown */
  globalSetup: './global-setup.ts',
  //globalTeardown: './global-setup.ts',
  testDir: './tests',
  /* Maximum time one test can run for */
  timeout: 30 * 1000,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Reporter to use */
  reporter: 'html',
  
  /* Shared settings for all projects */
  use: {
    /* Base URL to use in actions like page.goto() */
    baseURL: BASE_URL,
    
    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',
    
    /* Take screenshot on test failure */
    screenshot: 'only-on-failure',
    
    /* Enable JavaScript to run in browser */
    actionTimeout: 10000,
  },
  
  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  
  /* Ensure test isolation */
  workers: 1,
  
  /* Run local dev server before starting the tests */
  webServer: {
    command: 'cd .. && npm run dev',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 60000, // Increased timeout for local dev server startup
  },
});
