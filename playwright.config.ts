import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration
 * 
 * Optimized for CI stability:
 * - Retries enabled in CI (2 retries)
 * - Reduced workers in CI (2 workers)
 * - Screenshots/videos on failure
 * - Network idle waits where appropriate
 */
export default defineConfig({
  testDir: './tests/e2e',
  
  // Retry failed tests in CI
  retries: process.env.CI ? 2 : 0,
  
  // Reduced workers in CI for stability
  workers: process.env.CI ? 2 : undefined,
  
  // Timeout settings
  timeout: 30 * 1000,
  expect: {
    timeout: 5 * 1000,
  },
  
  // Reporter configuration
  reporter: process.env.CI ? 'html' : 'list',
  
  use: {
    // Base URL for tests
    baseURL: process.env.BASE_URL || process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',
    
    // Screenshots on failure
    screenshot: 'only-on-failure',
    
    // Video on failure
    video: 'retain-on-failure',
    
    // Trace for debugging
    trace: 'retain-on-failure',
    
    // Network idle timeout
    navigationTimeout: 30 * 1000,
    
    // Action timeout
    actionTimeout: 10 * 1000,
  },
  
  // Projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Add other browsers as needed
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
  
  // Web server configuration (for local testing)
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
