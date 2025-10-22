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
        fs.writeFileSync(
          path.resolve(__dirname, 'dist/build.json'),
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
    allowedHosts: env.HOST ? [env.HOST] : [], // Custom domain from .env (e.g., dev.reacdd.it)
  },

  // Build configuration
  build: {
    outDir: 'dist',
    sourcemap: false, // Disabled for production builds
  },

  // Build-time constants
  define: {
    BUILDTIME: JSON.stringify(new Date().toISOString()),
  },
  };
});
