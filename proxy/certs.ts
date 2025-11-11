import {
  existsSync,
  readFileSync,
  mkdirSync,
  writeFileSync,
  chmodSync,
} from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface CertificateOptions {
  certPath?: string;
  keyPath?: string;
  domain?: string;
}

interface Certificates {
  cert: Buffer;
  key: Buffer;
  isCustom: boolean;
}

/**
 * Get SSL certificates for HTTPS server
 * - If custom cert paths provided, use those
 * - Otherwise, generate self-signed certs for localhost
 */
export function getCertificates(
  options: CertificateOptions = {}
): Certificates {
  const { certPath, keyPath, domain = 'localhost' } = options;

  // If custom cert paths provided, use those
  if (certPath && keyPath) {
    if (!existsSync(certPath)) {
      throw new Error(`Certificate not found at: ${certPath}`);
    }
    if (!existsSync(keyPath)) {
      throw new Error(`Private key not found at: ${keyPath}`);
    }

    console.log(`✅ Using custom SSL certificates from ${certPath}`);
    return {
      cert: readFileSync(certPath),
      key: readFileSync(keyPath),
      isCustom: true,
    };
  }

  // Otherwise, use or generate self-signed certs
  const sslDir = join(__dirname, '.ssl');
  const generatedCertPath = join(sslDir, 'cert.pem');
  const generatedKeyPath = join(sslDir, 'key.pem');

  // Check if self-signed certs already exist
  if (existsSync(generatedCertPath) && existsSync(generatedKeyPath)) {
    console.log(`✅ Using existing self-signed certificates for ${domain}`);
    return {
      cert: readFileSync(generatedCertPath),
      key: readFileSync(generatedKeyPath),
      isCustom: false,
    };
  }

  // Generate self-signed certificates
  console.log(`🔐 Generating self-signed certificates for ${domain}...`);

  // Ensure .ssl directory exists with restrictive permissions (owner only)
  if (!existsSync(sslDir)) {
    mkdirSync(sslDir, { recursive: true, mode: 0o700 });
  }

  // Generate certificates with proper SAN (Subject Alternative Name)
  // This is required for modern browsers to accept self-signed certs
  const configPath = join(sslDir, 'openssl.cnf');
  const opensslConfig = `
[req]
default_bits = 4096
prompt = no
default_md = sha256
distinguished_name = dn
req_extensions = v3_req

[dn]
C = US
ST = Development
L = Local
O = Reacddit
CN = ${domain}

[v3_req]
subjectAltName = @alt_names

[alt_names]
DNS.1 = ${domain}
DNS.2 = localhost
DNS.3 = *.${domain}
IP.1 = 127.0.0.1
IP.2 = ::1
`;

  writeFileSync(configPath, opensslConfig);

  try {
    // Generate self-signed certificate
    execSync(
      `openssl req -x509 -newkey rsa:4096 -nodes ` +
        `-keyout "${generatedKeyPath}" ` +
        `-out "${generatedCertPath}" ` +
        `-days 365 ` +
        `-config "${configPath}"`,
      { stdio: 'pipe' }
    );

    // Set restrictive permissions on private key (owner read/write only)
    chmodSync(generatedKeyPath, 0o600);
    // Certificate can be world-readable (it's public)
    chmodSync(generatedCertPath, 0o644);

    console.log(`✅ Self-signed certificates generated successfully`);
    console.log(`   Certificate: ${generatedCertPath}`);
    console.log(`   Private key: ${generatedKeyPath}`);
    console.log(``);
    console.log(
      `⚠️  IMPORTANT: You need to trust these certificates in your browser:`
    );
    console.log(
      `   - macOS: Open Keychain Access → File → Import Items → ${generatedCertPath}`
    );
    console.log(
      `            Then double-click the certificate and set "Always Trust"`
    );
    console.log(
      `   - Linux: Copy to /usr/local/share/ca-certificates/ and run update-ca-certificates`
    );
    console.log(
      `   - Windows: Double-click ${generatedCertPath} and install to "Trusted Root"`
    );
    console.log(``);

    return {
      cert: readFileSync(generatedCertPath),
      key: readFileSync(generatedKeyPath),
      isCustom: false,
    };
  } catch (error) {
    throw new Error(
      `Failed to generate self-signed certificates: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
