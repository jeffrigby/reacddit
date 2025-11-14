#!/usr/bin/env node

/**
 * Reacddit Development Startup Script
 *
 * Handles intelligent privilege management for running the development environment:
 * - Detects if proxy port requires root (< 1024)
 * - Validates that privileges match requirements
 * - Provides clear error messages
 * - Starts all services (proxy, client, API) with concurrently
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { config as loadEnv } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file from repository root
const envPath = join(__dirname, '..', '.env');
if (existsSync(envPath)) {
  loadEnv({ path: envPath });
}

/**
 * Get PROXY_PORT from environment (supports runtime overrides like PROXY_PORT=5173 npm start)
 */
function getProxyPort() {
  // Read from process.env first (allows overrides), fallback to default
  const port = parseInt(process.env.PROXY_PORT || '5173', 10);

  if (isNaN(port) || port < 1 || port > 65535) {
    console.warn(
      `⚠️  Warning: Invalid PROXY_PORT="${process.env.PROXY_PORT}"`
    );
    console.warn('   Using default port 5173 (unprivileged).\n');
    return 5173;
  }

  return port;
}

/**
 * Check if running as root
 */
function isRoot() {
  // On Unix-like systems, root has UID 0
  return process.getuid && process.getuid() === 0;
}

/**
 * Check if port requires root privileges
 */
function requiresRoot(port) {
  // Ports < 1024 are privileged on Unix-like systems
  return port < 1024;
}

/**
 * Main startup logic
 */
function main() {
  const port = getProxyPort();
  const needsRoot = requiresRoot(port);
  const runningAsRoot = isRoot();

  console.log('\n🚀 Starting Reacddit development environment...\n');

  // Validation: Port < 1024 requires root
  if (needsRoot && !runningAsRoot) {
    console.error(`❌ Error: Port ${port} requires root privileges.\n`);
    console.error(`   Solution: Run with sudo:`);
    console.error(`   $ sudo npm start\n`);
    console.error(`   Alternative: Use unprivileged port (edit .env):`);
    console.error(`   PROXY_PORT=5173\n`);
    process.exit(1);
  }

  // Warning: Running as root unnecessarily
  if (!needsRoot && runningAsRoot) {
    console.warn(`⚠️  Warning: Running as root but port ${port} doesn't require it.\n`);
    console.warn(`   You can run without sudo for better security.\n`);
  }

  // Log startup configuration
  console.log(`   Proxy Port: ${port} ${needsRoot ? '(privileged - requires root)' : '(unprivileged)'}`);
  console.log(`   Running as: ${runningAsRoot ? 'root' : 'user'}`);

  if (needsRoot && runningAsRoot) {
    console.log(`   🔐 Proxy runs as root, drops to ${process.env.SUDO_USER}. Client/API run as ${process.env.SUDO_USER}.\n`);
  } else {
    console.log('');
  }

  // Build commands for services
  // When running as root (privileged port), run client/API as original user to avoid permission issues
  const sudoUser = process.env.SUDO_USER;
  const dropPrivileges = needsRoot && runningAsRoot && sudoUser;

  const proxyCmd = 'npm run start-proxy';
  const clientCmd = dropPrivileges
    ? `sudo -u ${sudoUser} npm run start-client`
    : 'npm run start-client';
  const apiCmd = dropPrivileges
    ? `sudo -u ${sudoUser} npm run start-api`
    : 'npm run start-api';

  // Start all services using concurrently
  const command = [
    'npx concurrently',
    '--names PROXY,CLIENT,API',
    '--prefix-colors cyan,green,yellow',
    '--prefix "[{name}]"',
    '--kill-others',
    '--kill-others-on-fail',
    `"${proxyCmd}"`,
    `"${clientCmd}"`,
    `"${apiCmd}"`
  ].join(' ');

  const child = spawn(command, {
    stdio: 'inherit',
    shell: true,
    env: process.env
  });

  child.on('error', (err) => {
    console.error(`\n❌ Failed to start services: ${err.message}`);
    process.exit(1);
  });

  child.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`\n❌ Services exited with code ${code}`);
    }
    process.exit(code || 0);
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down all services...');
    child.kill('SIGINT');
  });

  process.on('SIGTERM', () => {
    console.log('\n\n🛑 Shutting down all services...');
    child.kill('SIGTERM');
  });
}

// Run the startup script
main();
