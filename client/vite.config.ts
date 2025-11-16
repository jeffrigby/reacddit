import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';
import fs from 'fs';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  return {
  plugins: [
    // React plugin with automatic JSX runtime
    react(),

    // PWA Service Worker with vite-plugin-pwa
    // Uses injectManifest strategy for custom service worker (src/serviceWorker/worker.ts)
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      srcDir: 'src/serviceWorker',
      filename: 'worker.ts',
      injectManifest: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB for large media files
        globPatterns: ['**/*.{js,css,html,svg,png,ico,txt}'],
        rollupFormat: 'iife', // Wraps SW in IIFE for production (prevents module export issues)
      },
      manifest: false, // Use existing public/pwa/manifest.json instead of generating
      devOptions: {
        enabled: true, // Enable service worker in development mode
        type: 'module', // Required: Vite serves dev SW with ES module imports
      },
    }),

    // Bundle analyzer (only when PROFILE env var is set)
    process.env.PROFILE &&
      visualizer({
        filename: 'dist/stats.html',
        open: true,
        gzipSize: true,
      }),

    // Custom plugin to create build metadata file
    {
      name: 'create-build-json',
      closeBundle() {
        const distPath = path.resolve(__dirname, 'dist');
        const buildJsonPath = path.join(distPath, 'build.json');

        // Ensure dist directory exists
        if (!fs.existsSync(distPath)) {
          fs.mkdirSync(distPath, { recursive: true });
        }

        fs.writeFileSync(
          buildJsonPath,
          JSON.stringify(new Date().toISOString())
        );
      },
    },
  ].filter(Boolean),

  // Path aliases matching webpack configuration
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/redux': path.resolve(__dirname, './src/redux'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/styles': path.resolve(__dirname, './src/styles'),
      '@/common': path.resolve(__dirname, './src/common.js'),
      '@/test': path.resolve(__dirname, './src/test'),
    },
  },

  // CSS preprocessor options
  css: {
    preprocessorOptions: {
      scss: {
        // Silence deprecation warnings from Bootstrap 5.x
        // Bootstrap still uses legacy Sass syntax (@import, global functions)
        // These will be fixed in Bootstrap 6, but are harmless for now
        silenceDeprecations: ['import', 'global-builtin', 'color-functions'],
      },
    },
  },

  // Dev server configuration
  server: {
    port: env.PORT ? Number(env.PORT) : 3000,
    host: '0.0.0.0', // Allow external connections
    allowedHosts: env.HOST ? [env.HOST] : [], // Custom domain from .env (e.g., dev.yourdomain.com)

    // HMR configuration for reverse proxy
    // When behind HTTPS proxy, HMR client needs to connect via the proxy
    // instead of directly to Vite dev server
    hmr: env.HOST ? {
      protocol: 'wss', // Use secure WebSocket when behind HTTPS proxy
      host: env.HOST, // Connect to proxy domain (e.g., dev.yourdomain.com)
      // Default to 5173 (standard proxy port) or read from WSPORT/PROXY_PORT
      clientPort: env.WSPORT ? Number(env.WSPORT) : (env.PROXY_PORT ? Number(env.PROXY_PORT) : 5173),
    } : true, // Use default HMR settings for localhost
  },

  // Build configuration
  build: {
    outDir: 'dist',
    sourcemap: false, // Disabled for production builds

    // Target modern browsers to reduce polyfill overhead
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],

    // Optimize chunking for better caching and tree-shaking
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          'react-vendor': ['react', 'react-dom', 'react-router', 'react-router-dom'],
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux'],
          'ui-vendor': ['react-bootstrap', 'bootstrap'],
        },
      },
    },
  },

  // Build-time constants
  define: {
    BUILDTIME: JSON.stringify(new Date().toISOString()),
  },
  };
});
