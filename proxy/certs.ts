import {
  existsSync,
  readFileSync,
  mkdirSync,
  writeFileSync,
  chmodSync,
  unlinkSync,
} from 'fs';
import { execSync, execFileSync } from 'child_process';
import { X509Certificate } from 'crypto';
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
 * Check certificate expiration and log warnings.
 *
 * Returns days-until-expiry (may be <= 0 if the cert is genuinely expired),
 * or `null` if the cert could not be parsed. Callers MUST distinguish
 * "unparseable" from "expired": regenerating an unparseable cert can destroy
 * a user-supplied custom certificate that we simply failed to read.
 */
function checkCertExpiry(certBuffer: Buffer, certPath?: string): number | null {
  try {
    const cert = new X509Certificate(certBuffer);
    const expiryDate = new Date(cert.validTo);
    const daysUntilExpiry = Math.floor(
      (expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiry <= 0) {
      console.log(`⚠️  Certificate has expired!`);
    } else if (daysUntilExpiry <= 30) {
      console.log(
        `⚠️  Certificate expires in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'}`
      );
    }

    return daysUntilExpiry;
  } catch (error) {
    console.error(
      `⚠️  Failed to parse certificate${certPath ? ` at ${certPath}` : ''}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    return null;
  }
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

    const certBuffer = readFileSync(certPath);
    checkCertExpiry(certBuffer, certPath);

    console.log(`✅ Using custom SSL certificates from ${certPath}`);
    return {
      cert: certBuffer,
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
    const certBuffer = readFileSync(generatedCertPath);
    const daysUntilExpiry = checkCertExpiry(certBuffer, generatedCertPath);

    if (daysUntilExpiry === null) {
      // Cert exists but is unparseable. Do NOT regenerate — that would
      // destroy a cert the user may have placed there manually (e.g.,
      // Let's Encrypt). Surface the problem and reuse the existing files;
      // the HTTPS server will fail loudly if they're truly invalid.
      console.error(
        `⚠️  Could not parse self-signed certificate at ${generatedCertPath}. ` +
          `Refusing to regenerate to avoid clobbering a possibly-valid cert. ` +
          `Inspect the file manually or remove it to force regeneration.`
      );
      return {
        cert: certBuffer,
        key: readFileSync(generatedKeyPath),
        isCustom: false,
      };
    }

    if (daysUntilExpiry <= 0) {
      console.log(`🔐 Regenerating expired self-signed certificate...`);
      // Fall through to generation below
    } else {
      console.log(`✅ Using existing self-signed certificates for ${domain}`);
      return {
        cert: certBuffer,
        key: readFileSync(generatedKeyPath),
        isCustom: false,
      };
    }
  }

  // Validate domain to prevent injection into OpenSSL config
  const DOMAIN_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9.-]*[a-zA-Z0-9]$/;
  if (!DOMAIN_REGEX.test(domain)) {
    throw new Error(
      `Invalid domain "${domain}": must contain only alphanumeric characters, dots, and hyphens`
    );
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

    // Clean up OpenSSL config file (no longer needed after generation).
    // Non-critical: config file contains no secrets, but log so persistent
    // cleanup failures (e.g., permissions issues) are discoverable.
    try {
      unlinkSync(configPath);
    } catch (cleanupError) {
      console.error(
        `⚠️  Failed to remove OpenSSL config at ${configPath}: ${
          cleanupError instanceof Error
            ? cleanupError.message
            : String(cleanupError)
        }`
      );
    }

    // If running as root (via sudo), chown files back to the original user
    // This prevents EACCES errors on subsequent non-sudo runs
    if (process.getuid && process.getuid() === 0) {
      const sudoUid = process.env.SUDO_UID;
      const sudoGid = process.env.SUDO_GID;

      if (
        sudoUid &&
        sudoGid &&
        /^\d+$/.test(sudoUid) &&
        /^\d+$/.test(sudoGid)
      ) {
        console.log(
          `🔐 Changing ownership of .ssl directory to original user (${sudoUid}:${sudoGid})...`
        );

        try {
          // Recursively chown the entire .ssl directory and its contents
          execFileSync('chown', ['-R', `${sudoUid}:${sudoGid}`, sslDir], {
            stdio: 'pipe',
          });
        } catch (chownError) {
          console.warn(
            `⚠️  Warning: Failed to change ownership of .ssl directory.`
          );
          console.warn(
            `   You may need to run \`sudo chown -R $USER ${sslDir}\` manually.`
          );
          console.warn(
            `   Error: ${chownError instanceof Error ? chownError.message : String(chownError)}`
          );
        }
      }
    }

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
