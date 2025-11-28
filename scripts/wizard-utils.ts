#!/usr/bin/env node

/**
 * Wizard Utilities
 *
 * Helper functions for the setup wizard including:
 * - Validation (domain, ports, credentials)
 * - File operations (atomic writes, backups, permissions)
 * - System checks (OpenSSL, DNS)
 * - Platform-specific helpers
 */

import {
  existsSync,
  readFileSync,
  writeFileSync,
  renameSync,
  chmodSync,
  statSync,
  rmSync,
} from 'fs';
import { execSync } from 'child_process';
import { lookup } from 'dns/promises';
import { randomBytes } from 'crypto';
import { platform } from 'os';

type OS = 'macos' | 'linux' | 'windows' | 'unknown';

interface ValidationResult {
  valid: boolean;
  error?: string;
}

interface PortValidationResult extends ValidationResult {
  port?: number;
  requiresSudo?: boolean;
}

interface DomainResolutionResult {
  resolves: boolean;
  address?: string;
  error?: string;
}

interface FilesExistResult {
  allExist: boolean;
  missing: string[];
}

interface BackupResult {
  success: boolean;
  backupPath?: string;
  error?: string;
}

interface WriteFileResult {
  success: boolean;
  error?: string;
}

interface FilePermissionsResult {
  secure: boolean;
  mode?: string;
  warning?: string;
}

interface WriteFileOptions {
  setPermissions?: boolean;
}

/**
 * Check if running in a non-interactive environment
 */
export function isNonInteractive(): boolean {
  return !process.stdin.isTTY || process.env['CI'] === 'true';
}

/**
 * Get the current operating system
 */
export function getOS(): OS {
  const p = platform();
  if (p === 'darwin') return 'macos';
  if (p === 'win32') return 'windows';
  if (p === 'linux') return 'linux';
  return 'unknown';
}

/**
 * Check if OpenSSL is available
 */
export function isOpenSSLAvailable(): boolean {
  try {
    execSync('openssl version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate domain format
 */
export function validateDomain(domain: string): ValidationResult {
  if (!domain || typeof domain !== 'string') {
    return { valid: false, error: 'Domain is required' };
  }

  // Trim whitespace
  domain = domain.trim();

  // Reject if includes protocol
  if (domain.match(/^https?:\/\//i)) {
    return {
      valid: false,
      error: 'Domain should not include protocol (https://)',
    };
  }

  // Reject if includes path
  if (domain.includes('/')) {
    return {
      valid: false,
      error: 'Domain should not include path (just the hostname)',
    };
  }

  // Basic domain format check (allows localhost, subdomains, IP addresses)
  const domainRegex =
    /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const localhostRegex = /^localhost$/i;

  if (
    !domainRegex.test(domain) &&
    !ipRegex.test(domain) &&
    !localhostRegex.test(domain)
  ) {
    return {
      valid: false,
      error:
        'Invalid domain format (use hostname like "dev.example.com" or "localhost")',
    };
  }

  return { valid: true };
}

/**
 * Validate port number
 */
export function validatePort(port: string | number): PortValidationResult {
  const portNum = parseInt(port.toString(), 10);

  if (isNaN(portNum)) {
    return { valid: false, error: 'Port must be a number' };
  }

  if (portNum < 1 || portNum > 65535) {
    return { valid: false, error: 'Port must be between 1 and 65535' };
  }

  return {
    valid: true,
    port: portNum,
    requiresSudo: portNum < 1024 && getOS() !== 'windows',
  };
}

/**
 * Validate Reddit client ID format
 */
export function validateRedditClientId(clientId: string): ValidationResult {
  if (!clientId || typeof clientId !== 'string') {
    return { valid: false, error: 'Client ID is required' };
  }

  const trimmed = clientId.trim();

  // Reddit client IDs are typically 14-22 characters, alphanumeric and underscore
  if (trimmed.length < 10 || trimmed.length > 30) {
    return {
      valid: false,
      error:
        "This doesn't look like a Reddit client ID (should be ~14-22 characters)",
    };
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return {
      valid: false,
      error:
        'Client ID should only contain letters, numbers, underscores, and hyphens',
    };
  }

  return { valid: true };
}

/**
 * Validate Reddit client secret format
 */
export function validateRedditClientSecret(
  clientSecret: string
): ValidationResult {
  if (!clientSecret || typeof clientSecret !== 'string') {
    return { valid: false, error: 'Client secret is required' };
  }

  const trimmed = clientSecret.trim();

  // Reddit client secrets are typically 27 characters, alphanumeric and hyphen
  if (trimmed.length < 20 || trimmed.length > 35) {
    return {
      valid: false,
      error:
        "This doesn't look like a Reddit client secret (should be ~27 characters)",
    };
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return {
      valid: false,
      error:
        'Client secret should only contain letters, numbers, underscores, and hyphens',
    };
  }

  return { valid: true };
}

/**
 * Check if domain resolves to localhost (127.0.0.1)
 */
export async function checkDomainResolution(
  domain: string
): Promise<DomainResolutionResult> {
  try {
    const addresses = await lookup(domain);
    const address =
      typeof addresses === 'string' ? addresses : addresses.address;

    if (address === '127.0.0.1' || address === '::1') {
      return { resolves: true, address };
    }

    return {
      resolves: false,
      address,
      error: `Domain resolves to ${address}, not 127.0.0.1`,
    };
  } catch (err) {
    return {
      resolves: false,
      error: err instanceof Error ? err.message : 'DNS lookup failed',
    };
  }
}

/**
 * Generate secure random SALT (32 characters, 128-bit entropy)
 */
export function generateSalt(): string {
  return randomBytes(16).toString('hex');
}

/**
 * Check if file paths exist
 */
export function checkFilesExist(paths: string[]): FilesExistResult {
  const missing = paths.filter((p) => !existsSync(p));
  return {
    allExist: missing.length === 0,
    missing,
  };
}

/**
 * Create backup of file with timestamp
 */
export function backupFile(filePath: string): BackupResult {
  if (!existsSync(filePath)) {
    return { success: false, error: 'File does not exist' };
  }

  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `${filePath}.backup.${timestamp}`;

    // Read and write to create backup
    const content = readFileSync(filePath);
    writeFileSync(backupPath, content);

    return { success: true, backupPath };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create backup',
    };
  }
}

/**
 * Write file atomically with optional permissions
 */
export function writeFileAtomic(
  filePath: string,
  content: string,
  options: WriteFileOptions = {}
): WriteFileResult {
  const { setPermissions = true } = options;

  try {
    // Write to temporary file
    const tempPath = `${filePath}.tmp-${process.pid}`;
    writeFileSync(tempPath, content, 'utf8');

    // On Windows, fs.renameSync cannot overwrite existing files
    // Remove destination file first to ensure atomic rename works cross-platform
    if (existsSync(filePath)) {
      rmSync(filePath, { force: true });
    }

    // Atomically rename to final location
    renameSync(tempPath, filePath);

    // Set restrictive permissions on Unix-like systems
    if (setPermissions && getOS() !== 'windows') {
      try {
        chmodSync(filePath, 0o600);
      } catch (err) {
        console.warn(
          `⚠️  Warning: Could not set permissions on ${filePath}: ${err instanceof Error ? err.message : 'Unknown error'}`
        );
      }
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to write file',
    };
  }
}

/**
 * Check if file has secure permissions (Unix only)
 */
export function checkFilePermissions(filePath: string): FilePermissionsResult {
  if (!existsSync(filePath)) {
    return { secure: false, warning: 'File does not exist' };
  }

  if (getOS() === 'windows') {
    return { secure: true }; // Windows uses different permission system
  }

  try {
    const stats = statSync(filePath);
    const mode = stats.mode & 0o777; // Get last 9 bits (rwxrwxrwx)

    // Check if file is readable/writable by group or others
    const groupOrOthersCanRead = (mode & 0o077) !== 0;

    if (groupOrOthersCanRead) {
      return {
        secure: false,
        mode: mode.toString(8),
        warning: `File has loose permissions (${mode.toString(8)}). Run: chmod 600 ${filePath}`,
      };
    }

    return { secure: true, mode: mode.toString(8) };
  } catch (err) {
    return {
      secure: false,
      warning: `Could not check permissions: ${err instanceof Error ? err.message : 'Unknown error'}`,
    };
  }
}

/**
 * Get OS-specific hosts file path
 */
export function getHostsFilePath(): string {
  const os = getOS();
  if (os === 'windows') {
    return 'C:\\Windows\\System32\\drivers\\etc\\hosts';
  }
  return '/etc/hosts';
}

/**
 * Get OS-specific DNS cache flush command
 */
export function getDNSFlushCommand(): string {
  const os = getOS();
  switch (os) {
    case 'macos':
      return 'sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder';
    case 'windows':
      return 'ipconfig /flushdns';
    case 'linux':
      return 'sudo systemd-resolve --flush-caches (or check your distro)';
    default:
      return 'Check your OS documentation';
  }
}

/**
 * Format .env file content from key-value object
 */
export function formatEnvFile(
  config: Record<string, string>,
  header = ''
): string {
  let content = '';

  if (header) {
    content += `# ${header}\n`;
    content += `# Generated by setup wizard on ${new Date().toISOString()}\n`;
    content += '\n';
  }

  for (const [key, value] of Object.entries(config)) {
    content += `${key}=${value}\n`;
  }

  return content;
}

/**
 * Build Reddit redirect URI from domain and port
 */
export function buildRedirectUri(domain: string, port: number): string {
  return `https://${domain}:${port}/api/callback`;
}

/**
 * Build client path from domain and port
 */
export function buildClientPath(domain: string, port: number): string {
  return `https://${domain}:${port}`;
}

/**
 * Validate that three ports don't conflict
 */
export function validatePortsUnique(
  proxyPort: number,
  clientPort: number,
  apiPort: number
): ValidationResult {
  const ports = [proxyPort, clientPort, apiPort];
  const unique = new Set(ports);

  if (unique.size !== ports.length) {
    return {
      valid: false,
      error: 'Ports must all be different (proxy, client, and API)',
    };
  }

  return { valid: true };
}

/**
 * Check if dependencies are installed in subdirectories
 */
export function checkDependenciesInstalled(
  rootPath: string
): { allInstalled: boolean; missing: string[] } {
  // With workspaces, dependencies are hoisted to root node_modules
  const nodeModulesPath = `${rootPath}/node_modules`;
  const missing: string[] = [];

  if (!existsSync(nodeModulesPath)) {
    missing.push('root');
  }

  return {
    allInstalled: missing.length === 0,
    missing,
  };
}
