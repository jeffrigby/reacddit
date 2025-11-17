#!/usr/bin/env node

/**
 * Reacddit Setup Wizard
 *
 * Interactive setup wizard that guides users through creating configuration
 * files (.env) for the Reacddit development environment.
 *
 * Features:
 * - Domain and port configuration
 * - Reddit OAuth app creation guidance
 * - Certificate setup (self-signed or custom)
 * - Atomic file writes with backups
 * - Cross-platform support (macOS, Linux, Windows)
 */

import { confirm, input, select } from '@inquirer/prompts';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import open from 'open';
import {
  isNonInteractive,
  getOS,
  isOpenSSLAvailable,
  validateDomain,
  validatePort,
  validateRedditClientId,
  validateRedditClientSecret,
  checkDomainResolution,
  generateSalt,
  checkFilesExist,
  backupFile,
  writeFileAtomic,
  checkFilePermissions,
  getHostsFilePath,
  getDNSFlushCommand,
  formatEnvFile,
  buildRedirectUri,
  buildClientPath,
  validatePortsUnique,
} from './wizard-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

interface DomainConfig {
  domain: string;
  isCustomDomain: boolean;
}

interface PortConfig {
  proxyPort: number;
  clientPort: number;
  apiPort: number;
}

interface RedditOAuthConfig {
  clientId: string;
  clientSecret: string;
  skipOAuth: boolean;
}

interface CertConfig {
  certPath: string | null;
  keyPath: string | null;
}

interface WizardConfig {
  domain: string;
  proxyPort: number;
  clientPort: number;
  apiPort: number;
  clientId: string;
  clientSecret: string;
  certPath: string | null;
  keyPath: string | null;
  skipOAuth: boolean;
}

interface EnvFileSpec {
  path: string;
  content: string;
  name: string;
}

/**
 * Display welcome message and check environment
 */
async function welcome(): Promise<void> {
  console.log('\n🎉 Welcome to the Reacddit Setup Wizard!\n');
  console.log(
    'This wizard will help you configure your development environment.\n'
  );
  console.log('You will be guided through:');
  console.log('  1. Domain and port configuration');
  console.log('  2. Reddit OAuth app setup');
  console.log('  3. SSL certificate configuration');
  console.log('  4. Environment file generation\n');

  // Check for non-interactive environment
  if (isNonInteractive()) {
    console.error('❌ Non-interactive environment detected.');
    console.error(
      '   This wizard requires an interactive terminal (TTY) to run.\n'
    );
    console.error('   To configure manually:');
    console.error('   1. Copy .env.dist to .env and edit values');
    console.error('   2. Copy api/.env.example to api/.env and edit values');
    console.error(
      '   3. Copy client/.env.example to client/.env and edit values\n'
    );
    console.error('   See README.md for configuration details.\n');
    process.exit(1);
  }

  // Check OpenSSL availability
  const hasOpenSSL = isOpenSSLAvailable();
  const os = getOS();

  if (!hasOpenSSL) {
    if (os === 'windows') {
      console.log(
        '⚠️  OpenSSL not detected. The wizard will use pure JavaScript certificate generation.'
      );
      console.log(
        '   (This is normal on Windows and will work fine for development)\n'
      );
    } else {
      console.warn(
        '⚠️  Warning: OpenSSL not found. Certificate generation may not work.'
      );
      console.warn(
        '   Consider installing OpenSSL or providing your own certificates.\n'
      );
    }
  }

  // Check if .env files already exist
  const envFiles = [
    join(rootDir, '.env'),
    join(rootDir, 'api', '.env'),
    join(rootDir, 'client', '.env'),
  ];

  const existing = envFiles.filter((f) => existsSync(f));

  if (existing.length > 0) {
    console.log('📝 Existing configuration files detected:');
    existing.forEach((f) => {
      const relative = f.replace(rootDir + '/', '');
      console.log(`   - ${relative}`);
    });
    console.log('');

    const shouldContinue = await confirm({
      message:
        'This wizard will back up and replace existing files. Continue?',
      default: true,
    });

    if (!shouldContinue) {
      console.log(
        '\n👋 Setup cancelled. Your existing configuration is unchanged.\n'
      );
      process.exit(0);
    }
    console.log('');
  }
}

/**
 * Configure domain settings
 */
async function configureDomain(): Promise<DomainConfig> {
  console.log('📍 Domain Configuration\n');

  const domainChoice = await select({
    message: 'What domain should the development server use?',
    choices: [
      {
        name: 'localhost (default - works immediately)',
        value: 'localhost',
        description: 'Use localhost - no additional setup required',
      },
      {
        name: 'Custom domain (requires /etc/hosts configuration)',
        value: 'custom',
        description: 'Use a custom domain like dev.example.com',
      },
    ],
    default: 'localhost',
  });

  if (domainChoice === 'localhost') {
    console.log('\n✅ Using localhost\n');
    return { domain: 'localhost', isCustomDomain: false };
  }

  // Custom domain flow
  let domain = '';
  let isValid = false;

  while (!isValid) {
    domain = await input({
      message: 'Enter your custom domain (e.g., dev.reacdd.it):',
      validate: (value: string) => {
        const result = validateDomain(value);
        return result.valid || result.error || 'Invalid domain';
      },
    });

    domain = domain.trim();
    const validation = validateDomain(domain);

    if (validation.valid) {
      isValid = true;
    } else {
      console.log(`\n❌ ${validation.error}\n`);
    }
  }

  // Display hosts file instructions
  const os = getOS();
  const hostsPath = getHostsFilePath();
  const flushCmd = getDNSFlushCommand();

  console.log(`\n📝 You'll need to add this line to your hosts file:\n`);
  console.log(`   127.0.0.1    ${domain}\n`);

  if (os === 'windows') {
    console.log(`To edit (requires Administrator privileges):`);
    console.log(`   1. Open Notepad as Administrator`);
    console.log(`   2. File → Open → ${hostsPath}`);
    console.log(`   3. Add the line shown above`);
    console.log(`   4. Save the file`);
    console.log(`   5. Flush DNS cache: ${flushCmd}\n`);
  } else {
    console.log(`To edit (requires sudo):`);
    console.log(`   sudo nano ${hostsPath}\n`);
    console.log(`Add the line above, save (Ctrl+O, Enter, Ctrl+X)`);
    console.log(`Then flush DNS cache: ${flushCmd}\n`);
  }

  console.log(
    '💡 Tip: If you need to flush DNS cache, the command is shown above.\n'
  );

  await input({
    message: "Press Enter when you've updated your hosts file...",
  });

  // Verify DNS resolution (non-blocking)
  console.log(`\n🔍 Verifying DNS resolution for ${domain}...`);
  const dnsCheck = await checkDomainResolution(domain);

  if (dnsCheck.resolves) {
    console.log(`✅ Domain resolves to ${dnsCheck.address}\n`);
  } else {
    console.log(`⚠️  Warning: ${dnsCheck.error || 'DNS lookup failed'}`);
    console.log(`   This may cause issues when starting the server.`);
    console.log(
      `   Make sure you've added the hosts entry and flushed DNS cache.\n`
    );
  }

  // Warn about certificate
  console.log(`📜 Certificate Note:`);
  console.log(`   We'll generate a self-signed certificate for "${domain}".`);
  console.log(`   You'll need to trust this certificate in your browser/OS.`);
  console.log(`   Let's Encrypt won't work for local-only domains.\n`);

  return { domain, isCustomDomain: true };
}

/**
 * Configure port settings
 */
async function configurePorts(): Promise<PortConfig> {
  console.log('🔌 Port Configuration\n');

  let portsValid = false;
  let proxyPort = 0;
  let clientPort = 0;
  let apiPort = 0;

  while (!portsValid) {
    // Proxy port
    const proxyPortStr = await input({
      message: 'Proxy port (HTTPS):',
      default: '5173',
      validate: (value: string) => {
        const result = validatePort(value);
        return result.valid || result.error || 'Invalid port';
      },
    });

    const proxyValidation = validatePort(proxyPortStr);
    proxyPort = proxyValidation.port!;

    if (proxyValidation.requiresSudo) {
      console.log(
        `\n⚠️  Port ${proxyPort} requires sudo/administrator privileges\n`
      );
      console.log(
        '   The startup script will prompt for your password when needed.'
      );
      console.log(
        '   Running with elevated privileges is normal for ports < 1024.\n'
      );
      console.log('   💡 Tip: Use port 5173 (default) to avoid needing sudo.\n');

      const shouldContinue = await confirm({
        message: `Continue with privileged port ${proxyPort}?`,
        default: false,
      });

      if (!shouldContinue) {
        continue; // Ask for port again
      }
    }

    // Client port
    const clientPortStr = await input({
      message: 'Client port (Vite dev server):',
      default: '3000',
      validate: (value: string) => {
        const result = validatePort(value);
        return result.valid || result.error || 'Invalid port';
      },
    });

    const clientValidation = validatePort(clientPortStr);
    clientPort = clientValidation.port!;

    // API port
    const apiPortStr = await input({
      message: 'API port (Koa server):',
      default: '3001',
      validate: (value: string) => {
        const result = validatePort(value);
        return result.valid || result.error || 'Invalid port';
      },
    });

    const apiValidation = validatePort(apiPortStr);
    apiPort = apiValidation.port!;

    // Validate ports are unique
    const uniqueCheck = validatePortsUnique(proxyPort, clientPort, apiPort);

    if (!uniqueCheck.valid) {
      console.log(`\n❌ ${uniqueCheck.error}\n`);
      continue;
    }

    portsValid = true;
  }

  console.log(`\n✅ Ports configured:`);
  console.log(`   Proxy: ${proxyPort}`);
  console.log(`   Client: ${clientPort}`);
  console.log(`   API: ${apiPort}\n`);

  return { proxyPort, clientPort, apiPort };
}

/**
 * Configure Reddit OAuth
 */
async function configureRedditOAuth(
  redirectUri: string
): Promise<RedditOAuthConfig> {
  console.log('🔑 Reddit OAuth Configuration\n');

  const choice = await select({
    message: 'Do you have Reddit OAuth credentials?',
    choices: [
      {
        name: 'Yes, I have client ID & secret',
        value: 'have',
        description: 'Enter existing Reddit app credentials',
      },
      {
        name: 'No, help me create them',
        value: 'create',
        description: 'Guide me through creating a Reddit app',
      },
      {
        name: 'Skip for now',
        value: 'skip',
        description: "Use placeholder values (OAuth won't work)",
      },
    ],
    default: 'create',
  });

  if (choice === 'skip') {
    console.log('\n⚠️  Skipping Reddit OAuth setup.');
    console.log('   Placeholder values will be used.');
    console.log('   You can update api/.env later with real credentials.\n');
    return {
      clientId: 'YOUR_REDDIT_CLIENT_ID_HERE',
      clientSecret: 'YOUR_REDDIT_CLIENT_SECRET_HERE',
      skipOAuth: true,
    };
  }

  if (choice === 'create') {
    // Guide through Reddit app creation
    console.log('\n📱 Creating a Reddit OAuth Application\n');

    console.log(
      'Opening https://www.reddit.com/prefs/apps in your browser...\n'
    );

    try {
      await open('https://www.reddit.com/prefs/apps');
    } catch {
      console.log(
        '⚠️  Could not open browser automatically. Please visit manually:'
      );
      console.log('   https://www.reddit.com/prefs/apps\n');
    }

    console.log('Follow these steps:\n');
    console.log('1. Click "create another app" or "create app" button\n');
    console.log('2. Fill in these fields:');
    console.log('   • Name: Reacddit Local Dev (or your preferred name)');
    console.log('   • Type: Select "web app" ⚠️  IMPORTANT');
    console.log(
      '     (We need "web app" so Reddit allows custom redirect URLs)'
    );
    console.log('   • Description: (optional - leave blank)');
    console.log('   • About URL: (optional - leave blank)');
    console.log(`   • Redirect URI: ${redirectUri}`);
    console.log(
      '     ⚠️  Must match exactly - this is based on your domain/port choice\n'
    );
    console.log('3. Click "create app"\n');
    console.log('4. Find your credentials:');
    console.log('   • Client ID: Short string under the app name (~14 chars)');
    console.log('   • Client Secret: Click "edit", copy the secret (~27 chars)\n');
    console.log(
      'Note: These are app credentials, not your Reddit password.\n'
    );

    await input({
      message: "Press Enter when you're ready to continue...",
    });

    console.log('');
  }

  // Collect credentials
  let clientId = '';
  let clientSecret = '';
  let credsValid = false;

  while (!credsValid) {
    clientId = await input({
      message: 'Reddit Client ID:',
      validate: (value: string) => {
        const result = validateRedditClientId(value);
        return result.valid || result.error || 'Invalid client ID';
      },
    });

    clientSecret = await input({
      message: 'Reddit Client Secret:',
      validate: (value: string) => {
        const result = validateRedditClientSecret(value);
        return result.valid || result.error || 'Invalid client secret';
      },
    });

    const idCheck = validateRedditClientId(clientId);
    const secretCheck = validateRedditClientSecret(clientSecret);

    if (idCheck.valid && secretCheck.valid) {
      credsValid = true;
    } else {
      console.log(`\n❌ ${idCheck.error || secretCheck.error}\n`);
    }
  }

  console.log('\n✅ Reddit OAuth credentials configured\n');

  return {
    clientId: clientId.trim(),
    clientSecret: clientSecret.trim(),
    skipOAuth: false,
  };
}

/**
 * Configure SSL certificates
 */
async function configureCertificates(
  domain: string,
  isCustomDomain: boolean
): Promise<CertConfig> {
  console.log('🔐 SSL Certificate Configuration\n');

  if (!isCustomDomain) {
    console.log(
      '✅ Self-signed certificate will be auto-generated for localhost\n'
    );
    return { certPath: null, keyPath: null };
  }

  const certChoice = await select({
    message: 'How would you like to handle SSL certificates?',
    choices: [
      {
        name: 'Auto-generate self-signed certificate',
        value: 'auto',
        description: `Generate self-signed cert for ${domain}`,
      },
      {
        name: 'I have existing certificates',
        value: 'existing',
        description: 'Provide paths to cert and key files',
      },
    ],
    default: 'auto',
  });

  if (certChoice === 'auto') {
    console.log(
      `\n✅ Self-signed certificate will be generated for ${domain}\n`
    );
    return { certPath: null, keyPath: null };
  }

  // Collect certificate paths
  let certPath = '';
  let keyPath = '';
  let filesValid = false;

  while (!filesValid) {
    certPath = await input({
      message: 'Certificate file path (fullchain.pem):',
      validate: (value: string) => {
        if (!value) return 'Certificate path is required';
        if (!existsSync(value)) return 'Certificate file not found';
        return true;
      },
    });

    keyPath = await input({
      message: 'Private key file path (privkey.pem):',
      validate: (value: string) => {
        if (!value) return 'Key path is required';
        if (!existsSync(value)) return 'Key file not found';
        return true;
      },
    });

    const fileCheck = checkFilesExist([certPath, keyPath]);

    if (fileCheck.allExist) {
      filesValid = true;
    } else {
      console.log(
        `\n❌ Certificate files not found: ${fileCheck.missing.join(', ')}\n`
      );
    }
  }

  console.log('\n✅ Custom certificates configured\n');

  return { certPath, keyPath };
}

/**
 * Generate and write configuration files
 */
async function generateConfigFiles(config: WizardConfig): Promise<void> {
  const {
    domain,
    proxyPort,
    clientPort,
    apiPort,
    clientId,
    clientSecret,
    certPath,
    keyPath,
    skipOAuth,
  } = config;

  console.log('📝 Generating configuration files...\n');

  // Calculate derived values
  const redirectUri = buildRedirectUri(domain, proxyPort);
  const clientPath = buildClientPath(domain, proxyPort);
  const salt = generateSalt();

  // Build configuration objects
  const rootEnv: Record<string, string> = {
    PROXY_DOMAIN: domain,
    PROXY_HOST: '127.0.0.1',
    PROXY_PORT: proxyPort.toString(),
    CLIENT_PORT: clientPort.toString(),
    API_PORT: apiPort.toString(),
  };

  if (certPath && keyPath) {
    rootEnv['PROXY_CERT_PATH'] = certPath;
    rootEnv['PROXY_KEY_PATH'] = keyPath;
  }

  const apiEnv: Record<string, string> = {
    REDDIT_CLIENT_ID: clientId,
    REDDIT_CLIENT_SECRET: clientSecret,
    REDDIT_CALLBACK_URI: redirectUri,
    SALT: salt,
    CLIENT_PATH: clientPath,
    REDDIT_SCOPE: 'identity,mysubreddits,vote,subscribe,read,history,save',
    SESSION_LENGTH_SECS: '1209600',
    TOKEN_EXPIRY_PADDING_SECS: '300',
    PORT: apiPort.toString(),
    DEBUG: '0',
    ENCRYPTION_ALGORITHM: 'aes-256-cbc',
    IV_LENGTH: '16',
  };

  const clientEnv: Record<string, string> = {
    HOST: domain,
    PORT: clientPort.toString(),
    WSPORT: proxyPort.toString(),
    VITE_PUBLIC_URL: clientPath,
    VITE_API_PATH: `${clientPath}/api`,
  };

  // Define files to write
  const files: EnvFileSpec[] = [
    {
      path: join(rootDir, '.env'),
      content: formatEnvFile(rootEnv, 'Reacddit Proxy Configuration'),
      name: '.env',
    },
    {
      path: join(rootDir, 'api', '.env'),
      content: formatEnvFile(
        apiEnv,
        'Reacddit API Configuration (Reddit OAuth)'
      ),
      name: 'api/.env',
    },
    {
      path: join(rootDir, 'client', '.env'),
      content: formatEnvFile(
        clientEnv,
        'Reacddit Client Configuration (Vite)'
      ),
      name: 'client/.env',
    },
  ];

  // Backup and write files
  for (const file of files) {
    // Backup if exists
    if (existsSync(file.path)) {
      const backup = backupFile(file.path);
      if (backup.success && backup.backupPath) {
        const backupName = backup.backupPath.split('/').pop();
        console.log(`✅ Backed up ${file.name} → ${backupName}`);
      } else {
        console.warn(`⚠️  Could not backup ${file.name}: ${backup.error}`);
      }
    }

    // Write file atomically
    const write = writeFileAtomic(file.path, file.content);

    if (write.success) {
      console.log(`✅ Created ${file.name}`);

      // Check permissions
      const permCheck = checkFilePermissions(file.path);
      if (!permCheck.secure && permCheck.warning) {
        console.warn(`   ${permCheck.warning}`);
      }
    } else {
      console.error(`❌ Failed to write ${file.name}: ${write.error}`);
      throw new Error(`Failed to write configuration file: ${file.name}`);
    }
  }

  console.log('');

  if (skipOAuth) {
    console.log(
      '⚠️  Remember to update api/.env with real Reddit credentials later\n'
    );
  }
}

/**
 * Display post-setup summary
 */
function displaySummary(config: Partial<WizardConfig>): void {
  const { domain, proxyPort, apiPort, skipOAuth } = config;

  console.log('✅ Configuration complete!\n');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('Next Steps:\n');

  console.log('1. Start the development server:');
  console.log('   npm start\n');

  console.log('2. Open your browser:');
  console.log(`   https://${domain}:${proxyPort}\n`);

  console.log('3. Accept the self-signed certificate warning');
  console.log('   (This is normal for local development)\n');

  if (!skipOAuth) {
    console.log('4. Test Reddit OAuth:');
    console.log(`   http://localhost:${apiPort}/api/bearer\n`);
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('💡 Tips:\n');
  console.log('• To reconfigure: npm run setup');
  console.log('• To trust self-signed cert on macOS: Keychain Access');
  console.log('• To trust self-signed cert on Windows: Certificate Manager');
  console.log('• Configuration files: .env, api/.env, client/.env\n');
}

/**
 * Main wizard flow
 */
async function main(): Promise<void> {
  try {
    // 1. Welcome
    await welcome();

    // 2. Domain configuration (FIRST - before Reddit OAuth)
    const { domain, isCustomDomain } = await configureDomain();

    // 3. Port configuration
    const { proxyPort, clientPort, apiPort } = await configurePorts();

    // Calculate redirect URI for Reddit OAuth
    const redirectUri = buildRedirectUri(domain, proxyPort);

    // 4. Reddit OAuth (AFTER domain/port, so we can show correct redirect URI)
    const { clientId, clientSecret, skipOAuth } =
      await configureRedditOAuth(redirectUri);

    // 5. Certificate configuration
    const { certPath, keyPath } = await configureCertificates(
      domain,
      isCustomDomain
    );

    // 6. Generate and write configuration files
    await generateConfigFiles({
      domain,
      proxyPort,
      clientPort,
      apiPort,
      clientId,
      clientSecret,
      certPath,
      keyPath,
      skipOAuth,
    });

    // 7. Display summary
    displaySummary({ domain, proxyPort, apiPort, skipOAuth });

    // 8. Offer to start dev server (unless wizard was invoked from start-dev.ts)
    const invokedFromStart = process.env['WIZARD_INVOKED_FROM_START'] === 'true';

    if (invokedFromStart) {
      // Wizard was called from npm start - don't start again to avoid nested loop
      console.log('👋 Setup complete! The development server will now start...\n');
      process.exit(0);
    }

    const shouldStart = await confirm({
      message: 'Start development server now?',
      default: true,
    });

    if (shouldStart) {
      console.log('\n🚀 Starting development server...\n');

      // Delegate to start-dev.ts
      const child = spawn('npm', ['start'], {
        stdio: 'inherit',
        cwd: rootDir,
      });

      child.on('exit', (code) => {
        process.exit(code || 0);
      });
    } else {
      console.log('\n👋 Setup complete! Run "npm start" when ready.\n');
      process.exit(0);
    }
  } catch (err) {
    if (err instanceof Error && err.name === 'ExitPromptError') {
      // User cancelled (Ctrl+C)
      console.log('\n\n👋 Setup cancelled.\n');
      process.exit(0);
    }

    console.error(
      '\n❌ Setup failed:',
      err instanceof Error ? err.message : 'Unknown error'
    );
    console.error('\nPlease check the error above and try again.');
    console.error('For manual configuration, see README.md\n');
    process.exit(1);
  }
}

// Run wizard
main();
