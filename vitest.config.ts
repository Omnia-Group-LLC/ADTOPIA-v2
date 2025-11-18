import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    // Exclude Playwright E2E tests from Vitest
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
      '**/tests/e2e/**/*.spec.ts', // Exclude Playwright E2E tests
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/types.ts',
        '**/__mocks__/**'
      ]
    },
    // Use fake timers for deterministic session-timer tests
    fakeTimers: {
      toFake: ['setTimeout', 'setInterval', 'Date']
    },
    // Increase timeout for async operations
    testTimeout: 10000,
    hookTimeout: 10000
  },
  define: {
    // Mock env vars for testing
    'process.env.USE_MCP_MOCK': JSON.stringify(process.env.USE_MCP_MOCK || 'true'),
    'process.env.USE_MOCK_NOTIFICATIONS': JSON.stringify(process.env.USE_MOCK_NOTIFICATIONS || 'true')
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@modules": path.resolve(__dirname, "./modules"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@lib": path.resolve(__dirname, "./src/lib"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@types": path.resolve(__dirname, "./src/types"),
      "@assets": path.resolve(__dirname, "./src/assets"),
    },
  },
});

