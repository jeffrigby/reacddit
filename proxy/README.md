# Reacddit HTTPS Reverse Proxy

A self-contained Node.js HTTPS reverse proxy for local development. Replaces the need for nginx or other external reverse proxies.

## Why?

HTTPS is required for reacddit to properly load embedded content (iframes, third-party embeds). This proxy provides SSL termination for local development without requiring nginx installation, making the project more self-contained and easier for contributors to get started.

## Features

- **Auto-generated self-signed certificates** for localhost
- **Custom domain support** with your own SSL certificates (e.g., Let's Encrypt)
- **WebSocket support** for Vite HMR
- **Security headers** (HSTS, CSP, X-Frame-Options, etc.)
- **Production-grade routing** for API and client requests
- Automatic configuration on first run

## How It Works

The proxy creates an HTTPS server that routes requests to the appropriate upstream servers:

```
Browser (https://localhost:5173)
    ↓
HTTPS Proxy Server
    ├── /api/* → Koa API (port 3001)
    ├── /ws → WebSocket → Vite HMR (port 3000)
    └── /* → Vite dev server (port 3000)
```

## Configuration

Configure via `.env` in the repository root:

```bash
# Domain to serve on
PROXY_DOMAIN=localhost

# HTTPS port (5173 is default, 443 requires root)
PROXY_PORT=5173

# Optional: Custom SSL certificate paths
# Leave empty to auto-generate self-signed certs
PROXY_CERT_PATH=/path/to/fullchain.pem
PROXY_KEY_PATH=/path/to/privkey.pem

# Upstream server ports
CLIENT_PORT=3000  # Vite dev server
API_PORT=3001     # Koa API server
```

## SSL Certificates

### Auto-generated (default)

On first run, the proxy automatically generates self-signed certificates for localhost:

- Stored in `proxy/.ssl/` (gitignored)
- Valid for 365 days
- Includes SAN (Subject Alternative Name) for localhost, 127.0.0.1, ::1

**Browser warning:** Your browser will show a security warning. Click "Advanced" → "Proceed to localhost" to continue.

### Custom Certificates

For custom domains (like `dev.yourdomain.com`), set the cert paths in `.env`:

```bash
PROXY_DOMAIN=dev.yourdomain.com
PROXY_CERT_PATH=/usr/local/etc/letsencrypt/config/live/dev.yourdomain.com/fullchain.pem
PROXY_KEY_PATH=/usr/local/etc/letsencrypt/config/live/dev.yourdomain.com/privkey.pem
```

## Usage

```bash
# From repository root
npm start              # Starts proxy + client + API

# Or run proxy separately
npm run start-proxy    # Proxy only
```

## Security Headers

The proxy adds the following production-grade security headers:

- **HSTS** (HTTP Strict Transport Security)
- **CSP** (Content Security Policy) - permissive for embeds
- **X-Frame-Options** - SAMEORIGIN
- **X-Content-Type-Options** - nosniff
- **Referrer-Policy** - strict-origin-when-cross-origin
- **Permissions-Policy** - restricts geolocation, microphone, camera
- **X-XSS-Protection** - legacy XSS protection

## WebSocket Support

The proxy fully supports WebSocket upgrades for:

- `/ws` - Vite HMR
- `/sockjs-node` - Legacy HMR
- `/@vite/*` - Vite internal WebSocket
- `/api/*` - API WebSocket connections (if needed)

## Development

```bash
cd proxy
npm install
npm start              # Run with tsx (TypeScript execution)
npm run dev            # Run with tsx in watch mode
```

## File Structure

```
proxy/
├── server.ts          # Main HTTPS server and routing logic
├── certs.ts           # SSL certificate management
├── package.json       # Dependencies and scripts
├── tsconfig.json      # TypeScript configuration
├── .ssl/              # Auto-generated certificates (gitignored)
│   ├── cert.pem
│   ├── key.pem
│   └── openssl.cnf
└── README.md          # This file
```

## Troubleshooting

### Port already in use

```
❌ Port 5173 is already in use!
```

**Solution:** Change `PROXY_PORT` in `.env` or stop the process using port 5173.

### Permission denied (port 443)

```
❌ Permission denied to bind to port 443!
```

**Why this happens:**

Ports below 1024 are called "privileged ports" and require root access on Unix-like systems (macOS, Linux). This is a security feature to prevent regular users from running services that could impersonate critical system services like HTTPS (443) or HTTP (80).

**Solution:** Either:
- **Recommended:** Use port 5173 instead (default unprivileged port)
  - No sudo required
  - More secure for development
  - Edit `.env`: `PROXY_PORT=5173`
- **Alternative:** Run with sudo if you need port 443
  - `sudo npm start`
  - Only necessary for testing with external devices or specific OAuth callbacks
  - The proxy drops to your user account after binding; client and API always run as your user (never as root)

### Certificate generation failed

```
❌ Failed to generate self-signed certificates
```

**Solution:** Ensure OpenSSL is installed:
- macOS: `brew install openssl`
- Linux: `apt-get install openssl` or `yum install openssl`

### Browser rejects self-signed certificate

**Solution:** Trust the certificate in your system:

**macOS:**
1. Open Keychain Access
2. File → Import Items → `proxy/.ssl/cert.pem`
3. Double-click the certificate
4. Expand "Trust" section
5. Set "When using this certificate" to "Always Trust"

**Linux:**
```bash
sudo cp proxy/.ssl/cert.pem /usr/local/share/ca-certificates/reacddit-dev.crt
sudo update-ca-certificates
```

**Windows:**
1. Double-click `proxy\.ssl\cert.pem`
2. Install Certificate → Local Machine
3. Place in "Trusted Root Certification Authorities"

## Production

In production, this proxy is **not used**. CloudFront handles SSL termination and routing:

- CloudFront → S3 (client static files)
- CloudFront → Lambda (API endpoints)

See [DEPLOYMENT.md](../DEPLOYMENT.md) for production deployment instructions.
