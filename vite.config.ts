import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@modules': path.resolve(__dirname, './modules'),
    },
  },
  
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      // Externalize Node.js-only dependencies that can't be bundled for browser
      external: (id) => {
        // Externalize mem0ai and its dependencies (server-side only)
        if (id === 'mem0ai' || id === 'mem0ai/oss' || id.startsWith('mem0ai/')) {
          return true;
        }
        // Externalize qdrant (used by mem0ai)
        if (id === '@qdrant/js-client-rest' || id.startsWith('@qdrant/')) {
          return true;
        }
        // Externalize bcrypt and jsonwebtoken (server-side only, used in Edge Functions)
        if (id === 'bcrypt' || id === 'jsonwebtoken' || id.startsWith('bcrypt/') || id.startsWith('jsonwebtoken/')) {
          return true;
        }
        // Externalize Node.js built-ins
        if (id.startsWith('node:') || ['fs', 'path', 'crypto', 'async_hooks', 'process'].includes(id)) {
          return true;
        }
        return false;
      },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
    // Exclude mem0ai from pre-bundling (it's server-side only)
    commonjsOptions: {
      exclude: ['mem0ai', 'mem0ai/oss', '@qdrant/js-client-rest', 'bcrypt', 'jsonwebtoken'],
    },
  },
  
  // Optimize dependencies - exclude server-side packages
  optimizeDeps: {
    exclude: [
      'mem0ai',
      'mem0ai/oss',
      '@qdrant/js-client-rest',
      'bcrypt',
      'jsonwebtoken',
    ],
  },
  
  server: {
    port: 3001,
    open: true,
  },
})
