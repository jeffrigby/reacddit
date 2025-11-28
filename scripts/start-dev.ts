#!/usr/bin/env node

/**
 * Reacddit Development Startup Script
 *
 * Handles intelligent privilege management for running the development environment:
 * - Detects if proxy port requires root (< 1024)
 * - Validates that privileges match requirements
 * - Offers to relaunch with sudo if privileged port is requested
 * - Provides clear error messages
 * - Starts all services (proxy, client, API) with concurrently
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { config as loadEnv } from 'dotenv';
import { confirm } from '@inquirer/prompts';

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
function getProxyPort(): number {
  // Read from process.env first (allows overrides), fallback to default
  const port = parseInt(process.env['PROXY_PORT'] || '5173', 10);

  if (isNaN(port) || port < 1 || port > 65535) {
    console.warn(
      `⚠️  Warning: Invalid PROXY_PORT="${process.env['PROXY_PORT']}"`
    );
    console.warn('   Using default port 5173 (unprivileged).\n');
    return 5173;
  }

  return port;
}

/**
 * Check if running as root
 */
function isRoot(): boolean {
  // On Unix-like systems, root has UID 0
  // On Windows, process.getuid doesn't exist
  return process.getuid ? process.getuid() === 0 : false;
}

/**
 * Check if running on Windows
 */
function isWindows(): boolean {
  return process.platform === 'win32';
}

/**
 * Check if port requires root privileges
 */
function requiresRoot(port: number): boolean {
  // Ports < 1024 are privileged on Unix-like systems only
  // Windows handles port binding differently (requires "Run as Administrator")
  // but doesn't have sudo, so we skip the check
  if (isWindows()) {
    return false; // Let Windows handle port binding naturally
  }
  return port < 1024;
}

/**
 * Escape a string for safe use in shell commands
 * Wraps the string in single quotes and escapes any single quotes within
 * This prevents command injection while supporting all valid usernames
 */
function shellEscape(str: string): string {
  if (!str || typeof str !== 'string') {
    return "''";
  }
  // Replace each single quote with '\'' (end quote, escaped quote, start quote)
  return "'" + str.replace(/'/g, "'\\''") + "'";
}

/**
 * Prompt user for yes/no confirmation using @inquirer/prompts
 */
async function promptRelaunch(): Promise<boolean> {
  return await confirm({
    message: 'Would you like to relaunch with sudo?',
    default: true,
  });
}

/**
 * Relaunch the script with sudo, preserving environment overrides
 */
function relaunchWithSudo(): void {
  console.log('\n🔐 Relaunching with sudo...\n');

  // Build env vars to preserve (runtime overrides like PROXY_PORT=443 npm start)
  const envVars: string[] = [];
  const varsToPreserve = [
    'PROXY_PORT',
    'PROXY_DOMAIN',
    'PROXY_HOST',
    'CLIENT_PORT',
    'API_PORT',
  ];

  for (const varName of varsToPreserve) {
    if (process.env[varName]) {
      envVars.push(`${varName}=${process.env[varName]}`);
    }
  }

  // Build sudo command: sudo env VAR1=val1 VAR2=val2 npm start
  const args =
    envVars.length > 0
      ? ['env', ...envVars, 'npm', 'start']
      : ['npm', 'start'];

  // Spawn sudo with preserved environment
  const child = spawn('sudo', args, {
    stdio: 'inherit',
    cwd: join(__dirname, '..'),
  });

  child.on('error', (err) => {
    console.error(`\n❌ Failed to relaunch with sudo: ${err.message}`);
    process.exit(1);
  });

  child.on('exit', (code) => {
    process.exit(code || 0);
  });
}

/**
 * Check if setup wizard needs to run
 */
async function checkAndRunWizard(): Promise<boolean> {
  // Skip wizard if explicitly disabled
  if (process.env['SKIP_WIZARD'] === 'true') {
    return false;
  }

  // Check if .env exists
  const envPath = join(__dirname, '..', '.env');

  if (existsSync(envPath)) {
    return false; // Configuration exists, no wizard needed
  }

  // Configuration missing
  console.log('\n⚠️  No configuration found (.env file missing)\n');

  // Check if interactive
  if (!process.stdin.isTTY || process.env['CI'] === 'true') {
    console.error(
      '❌ Cannot run setup wizard in non-interactive environment.\n'
    );
    console.error('   Options:');
    console.error('   1. Run setup wizard manually: npm run setup');
    console.error('   2. Copy .env.dist to .env and configure manually');
    console.error('   3. Set SKIP_WIZARD=true to bypass this check\n');
    console.error('   See README.md for configuration details.\n');
    process.exit(1);
  }

  // Offer to run wizard
  console.log('💡 Would you like to run the setup wizard?');
  console.log('   This will guide you through configuration.\n');

  const shouldRunWizard = await confirm({
    message: 'Run setup wizard now?',
    default: true,
  });

  if (!shouldRunWizard) {
    console.log('\n👋 Setup wizard skipped.');
    console.log(
      '   Run "npm run setup" to configure later, or create .env manually.\n'
    );
    process.exit(0);
  }

  // Run wizard
  console.log('');
  const wizardPath = join(__dirname, 'setup-wizard.ts');
  const child = spawn('tsx', [wizardPath], {
    stdio: 'inherit',
    cwd: join(__dirname, '..'),
    env: {
      ...process.env,
      // Tell wizard it was invoked from start-dev so it shouldn't offer to start server
      WIZARD_INVOKED_FROM_START: 'true',
    },
  });

  return new Promise<boolean>((resolve, reject) => {
    child.on('error', (err) => {
      console.error(`\n❌ Failed to run setup wizard: ${err.message}`);
      reject(err);
    });

    child.on('exit', (code) => {
      // Wizard exited, but we need to verify config was actually created
      // User might have cancelled (Ctrl+C returns code 0) or wizard failed
      const configExists = existsSync(envPath);

      if (!configExists) {
        console.error('\n❌ Setup wizard exited but configuration was not created.');
        console.error('   Options:');
        console.error('   1. Run setup wizard manually: npm run setup');
        console.error('   2. Copy .env.dist to .env and configure manually\n');
        process.exit(1);
      }

      if (code !== 0) {
        console.error('\n❌ Setup wizard exited with errors.');
        process.exit(code || 1);
      }

      resolve(true); // Wizard completed successfully and config exists
    });
  });
}

/**
 * Main startup logic
 */
async function main(): Promise<void> {
  // Check if setup wizard needs to run (before anything else)
  const wizardRan = await checkAndRunWizard();

  if (wizardRan) {
    // Wizard ran and completed - configuration should now exist
    // Reload .env since wizard just created it
    const envPath = join(__dirname, '..', '.env');
    if (existsSync(envPath)) {
      loadEnv({ path: envPath });
    }
  }

  const port = getProxyPort();
  const needsRoot = requiresRoot(port);
  const runningAsRoot = isRoot();

  console.log('\n🚀 Starting Reacddit development environment...\n');

  // Validation: Port < 1024 requires root
  if (needsRoot && !runningAsRoot) {
    console.log(`❌ Port ${port} requires root privileges.\n`);
    console.log(`   Options:`);
    console.log(`   • Run with sudo: sudo npm start`);
    console.log(`   • Use unprivileged port: Edit .env and set PROXY_PORT=5173\n`);

    // Check if running in interactive terminal (TTY)
    // Non-interactive environments (CI, devcontainers, stdin redirected) can't use prompts
    if (process.stdin.isTTY) {
      // Prompt user to relaunch with sudo
      const shouldRelaunch = await promptRelaunch();

      if (shouldRelaunch) {
        relaunchWithSudo();
        return; // relaunchWithSudo will handle the exit
      } else {
        console.log('\n👋 Exiting...\n');
        process.exit(1);
      }
    } else {
      // Non-interactive: exit immediately with clear instructions
      console.log(`   Non-interactive terminal detected. Exiting.\n`);
      process.exit(1);
    }
  }

  // Warning: Running as root unnecessarily
  if (!needsRoot && runningAsRoot) {
    console.warn(
      `⚠️  Warning: Running as root but port ${port} doesn't require it.\n`
    );
    console.warn(`   You can run without sudo for better security.\n`);
  }

  // Log startup configuration
  console.log(
    `   Proxy Port: ${port} ${needsRoot ? '(privileged - requires root)' : '(unprivileged)'}`
  );
  console.log(`   Running as: ${runningAsRoot ? 'root' : 'user'}`);

  if (needsRoot && runningAsRoot) {
    console.log(
      `   🔐 Proxy runs as root, drops to ${process.env['SUDO_USER']}. Client/API run as ${process.env['SUDO_USER']}.\n`
    );
  } else {
    console.log('');
  }

  // Build commands for services
  // When running as root (privileged port), run client/API as original user to avoid permission issues
  const sudoUser = process.env['SUDO_USER'];
  const dropPrivileges = needsRoot && runningAsRoot && sudoUser;

  const proxyCmd = 'npm run start-proxy';
  const clientCmd = dropPrivileges
    ? `sudo -u ${shellEscape(sudoUser)} npm run start-client`
    : 'npm run start-client';
  const apiCmd = dropPrivileges
    ? `sudo -u ${shellEscape(sudoUser)} npm run start-api`
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
    `"${apiCmd}"`,
  ].join(' ');

  const child = spawn(command, {
    stdio: 'inherit',
    shell: true,
    env: process.env as NodeJS.ProcessEnv,
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
main().catch((err) => {
  console.error(
    `\n❌ Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`
  );
  process.exit(1);
});
