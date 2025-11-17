import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration (2025 Best Practices)
 * 
 * Optimized for CI stability and Vercel preview testing:
 * - Fully parallel execution
 * - Retries enabled in CI (2 retries)
 * - Reduced workers in CI (1 worker for stability)
 * - HTML + JSON reporters for CI
 * - Trace on first retry for debugging
 * - Screenshots/videos on failure
 * - Mobile testing support
 */
export default defineConfig({
  testDir: './tests/e2e',
  
  // Fully parallel execution
  fullyParallel: true,
  
  // Forbid only in CI (prevent accidental .only())
  forbidOnly: !!process.env.CI,
  
  // Retry failed tests in CI
  retries: process.env.CI ? 2 : 0,
  
  // Reduced workers in CI for stability (1 worker)
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter configuration: HTML + JSON for CI
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results.json' }],
    ...(process.env.CI ? [] : [['list']]),
  ],
  
  use: {
    // Base URL: Vercel URL or localhost
    baseURL: process.env.VERCEL_URL || process.env.BASE_URL || process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',
    
    // Trace on first retry (for debugging failures)
    trace: 'on-first-retry',
    
    // Screenshots only on failure
    screenshot: 'only-on-failure',
    
    // Video on failure (retain for CI artifacts)
    video: 'retain-on-failure',
    
    // Network idle timeout
    navigationTimeout: 30 * 1000,
    
    // Action timeout
    actionTimeout: 10 * 1000,
  },
  
  // Projects for different browsers and environments
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 12'] },
    },
    {
      name: 'ci',
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: process.env.BASE_URL || process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',
      },
    },
    {
      name: 'vercel-preview',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.VERCEL_PREVIEW_URL || process.env.VERCEL_URL || process.env.BASE_URL || 'http://localhost:5173',
      },
    },
  ],
  
  // Web server configuration (for local testing only)
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
