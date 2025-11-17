import https from 'https';
import http from 'http';
import http2 from 'http2';
import net from 'net';
import zlib from 'zlib';
import { execSync } from 'child_process';
import { config as loadEnv } from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import boxen from 'boxen';
import chalk from 'chalk';
import { getCertificates } from './certs.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// HTTP connection pooling agent for upstream requests
// Reuses TCP connections to reduce handshake overhead
const httpAgent = new http.Agent({
  keepAlive: true,
  keepAliveMsecs: 30000, // Keep idle connections alive for 30s
  maxSockets: 50, // Max 50 concurrent connections per host
  maxFreeSockets: 10, // Keep 10 idle connections ready
  timeout: 60000, // Socket timeout (60s)
});

// Load environment variables from root .env
// Try multiple paths to handle different execution contexts (sudo, npm scripts, etc.)
const envPaths = [
  join(__dirname, '..', '.env'), // Normal: proxy/../.env
  join(process.cwd(), '.env'), // From root directory
  join(process.cwd(), '..', '.env'), // From proxy directory
];

let envLoaded = false;
for (const envPath of envPaths) {
  const result = loadEnv({ path: envPath });
  if (!result.error) {
    envLoaded = true;
    console.log(`📄 Loaded environment from: ${envPath}\n`);
    break;
  }
}

if (!envLoaded) {
  console.warn(
    '⚠️  Warning: Could not load .env file. Using default values.\n'
  );
}

interface ProxyConfig {
  domain: string;
  host: string;
  port: number;
  certPath?: string;
  keyPath?: string;
  clientPort: number;
  apiPort: number;
}

// Module-level configuration (set during startup)
let proxyConfig: ProxyConfig;

// Parse configuration from environment variables
function getConfig(): ProxyConfig {
  const config = {
    domain: process.env.PROXY_DOMAIN || 'localhost',
    host: process.env.PROXY_HOST || '127.0.0.1', // Bind to localhost only by default for security
    port: parseInt(process.env.PROXY_PORT || '5173', 10),
    certPath: process.env.PROXY_CERT_PATH || undefined,
    keyPath: process.env.PROXY_KEY_PATH || undefined,
    clientPort: parseInt(process.env.CLIENT_PORT || '3000', 10),
    apiPort: parseInt(process.env.API_PORT || '3001', 10),
  };

  // Validate configuration
  if (isNaN(config.port) || config.port < 1 || config.port > 65535) {
    throw new Error(
      `Invalid PROXY_PORT: ${process.env.PROXY_PORT || '(not set)'}`
    );
  }
  if (
    isNaN(config.clientPort) ||
    config.clientPort < 1 ||
    config.clientPort > 65535
  ) {
    throw new Error(
      `Invalid CLIENT_PORT: ${process.env.CLIENT_PORT || '(not set)'}`
    );
  }
  if (isNaN(config.apiPort) || config.apiPort < 1 || config.apiPort > 65535) {
    throw new Error(`Invalid API_PORT: ${process.env.API_PORT || '(not set)'}`);
  }

  return config;
}

// Security headers (matching nginx config)
const securityHeaders = {
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; font-src 'self' data: https://cdnjs.cloudflare.com; img-src 'self' data: https:; connect-src 'self' wss: https:; media-src 'self' https:; frame-src *; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';",
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'X-XSS-Protection': '1; mode=block',
};

/**
 * Format timestamp for logging
 */
function timestamp(): string {
  const now = new Date();
  return now.toISOString().replace('T', ' ').substring(0, 19);
}

/**
 * Get status color for logging
 */
function getStatusColor(status: number): string {
  if (status >= 500) return '\x1b[31m'; // Red
  if (status >= 400) return '\x1b[33m'; // Yellow
  if (status >= 300) return '\x1b[36m'; // Cyan
  if (status >= 200) return '\x1b[32m'; // Green
  return '\x1b[0m'; // Reset
}

/**
 * Redact sensitive query parameters from URLs for logging
 * Protects OAuth codes, tokens, and other sensitive data
 */
function redactSensitiveParams(url: string): string {
  try {
    const urlObj = new URL(url, 'http://localhost'); // Base doesn't matter for parsing
    const pathname = urlObj.pathname;

    // Sensitive endpoints that should have all query params redacted
    const sensitiveEndpoints = [
      '/api/callback',
      '/api/bearer',
      '/api/token',
      '/api/auth',
    ];

    if (sensitiveEndpoints.some((endpoint) => pathname.startsWith(endpoint))) {
      return urlObj.search ? `${pathname}?[REDACTED]` : pathname;
    }

    // Sensitive parameter names to redact regardless of endpoint
    const sensitiveParams = [
      'code',
      'state',
      'access_token',
      'refresh_token',
      'token',
      'password',
      'secret',
    ];

    let hasRedacted = false;
    sensitiveParams.forEach((param) => {
      if (urlObj.searchParams.has(param)) {
        urlObj.searchParams.set(param, '[REDACTED]');
        hasRedacted = true;
      }
    });

    return hasRedacted ? `${pathname}${urlObj.search}` : url;
  } catch {
    // If URL parsing fails, return original (better to log than crash)
    return url;
  }
}

/**
 * Determine if a response should be compressed and which algorithm to use
 * Only compresses API responses with text/JSON content types over 1KB
 * Respects client's Accept-Encoding and skips if already compressed
 */
function shouldCompressResponse(
  requestHeaders: http.IncomingHttpHeaders,
  responseHeaders: http.IncomingHttpHeaders,
  isApi: boolean
): 'br' | 'gzip' | null {
  // Only compress API responses
  if (!isApi) return null;

  // Skip if upstream already compressed the response
  if (responseHeaders['content-encoding']) {
    return null;
  }

  // Check client's Accept-Encoding header for supported encodings
  const acceptEncoding = (requestHeaders['accept-encoding'] || '').toLowerCase();

  // Client must accept compression
  if (!acceptEncoding) return null;

  // Check content type (only compress text/json)
  const contentType = responseHeaders['content-type'] || '';
  const compressible =
    contentType.includes('json') ||
    contentType.includes('text') ||
    contentType.includes('javascript');

  if (!compressible) return null;

  // Check content length (don't compress small responses < 1KB)
  const contentLength = parseInt(responseHeaders['content-length'] || '0', 10);
  if (contentLength > 0 && contentLength < 1024) return null;

  // Prefer brotli if client supports it (better compression ratio)
  if (acceptEncoding.includes('br')) {
    return 'br';
  }

  // Fall back to gzip if client supports it
  if (acceptEncoding.includes('gzip')) {
    return 'gzip';
  }

  // Client doesn't support any compression we can provide
  return null;
}

/**
 * Proxy an HTTP request to the specified target
 */
function proxyRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  targetPort: number,
  isApi: boolean = false
): void {
  const startTime = Date.now();
  const requestUrl = req.url || '/';
  const requestMethod = req.method || 'GET';

  // Filter out HTTP/2 pseudo-headers (they start with ':')
  // These can't be forwarded to HTTP/1.1 upstream servers
  const filteredHeaders: http.OutgoingHttpHeaders = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (!key.startsWith(':')) {
      filteredHeaders[key] = value;
    }
  }

  const options: http.RequestOptions = {
    hostname: 'localhost',
    port: targetPort,
    path: requestUrl,
    method: requestMethod,
    headers: {
      ...filteredHeaders,
      'x-forwarded-proto': 'https',
      'x-forwarded-for': req.socket.remoteAddress || '',
      'x-real-ip': req.socket.remoteAddress || '',
    },
    agent: httpAgent, // Use connection pooling
  };

  const proxy = http.request(options, (proxyRes) => {
    const statusCode = proxyRes.statusCode || 500;
    const duration = Date.now() - startTime;

    // Log access (with sensitive params redacted)
    const color = getStatusColor(statusCode);
    const reset = '\x1b[0m';
    const target = isApi ? 'API' : 'CLIENT';
    const safeUrl = redactSensitiveParams(requestUrl);
    console.log(
      `[${timestamp()}] ${color}${statusCode}${reset} ${requestMethod} ${safeUrl} → ${target} (${duration}ms)`
    );

    // Add security headers to response
    const headers: http.OutgoingHttpHeaders = { ...proxyRes.headers };

    // Remove HTTP/1.1-specific headers that are forbidden in HTTP/2
    // These are connection-specific and incompatible with HTTP/2
    const forbiddenHeaders = [
      'connection',
      'keep-alive',
      'proxy-connection',
      'transfer-encoding',
      'upgrade',
    ];
    forbiddenHeaders.forEach((header) => {
      delete headers[header];
    });

    // Add security headers (but not for API responses with their own headers)
    if (!isApi) {
      Object.assign(headers, securityHeaders);
    }

    // Handle cookie modifications for API responses
    if (isApi && headers['set-cookie']) {
      const cookies = Array.isArray(headers['set-cookie'])
        ? headers['set-cookie']
        : [headers['set-cookie']];

      headers['set-cookie'] = cookies.map((cookie) => {
        // Ensure cookies have Secure and SameSite attributes (case-insensitive check)
        const lowerCookie = cookie.toLowerCase();

        // Add Secure attribute if not present (case-insensitive)
        if (!lowerCookie.includes('secure')) {
          cookie += '; Secure';
        }

        // Add SameSite=None if not present (case-insensitive, spec-compliant capital N)
        if (!lowerCookie.includes('samesite')) {
          cookie += '; SameSite=None';
        }

        return cookie;
      });
    }

    // Check if compression should be applied
    const compressionType = shouldCompressResponse(
      req.headers,
      proxyRes.headers,
      isApi
    );

    if (compressionType) {
      // Add content-encoding header
      headers['content-encoding'] = compressionType;
      delete headers['content-length']; // Length will change after compression

      // Add Vary header to indicate response varies based on Accept-Encoding
      // This is required for proper HTTP caching behavior
      const existingVary = headers['vary'];
      if (existingVary) {
        // Append to existing Vary header if it doesn't already include Accept-Encoding
        const varyValues = existingVary
          .toString()
          .split(',')
          .map((v) => v.trim().toLowerCase());
        if (!varyValues.includes('accept-encoding')) {
          headers['vary'] = `${existingVary}, Accept-Encoding`;
        }
      } else {
        headers['vary'] = 'Accept-Encoding';
      }

      res.writeHead(statusCode, headers);

      // Compress and pipe
      if (compressionType === 'br') {
        proxyRes.pipe(zlib.createBrotliCompress()).pipe(res);
      } else {
        proxyRes.pipe(zlib.createGzip()).pipe(res);
      }
    } else {
      // No compression, direct pipe (existing behavior)
      res.writeHead(statusCode, headers);
      proxyRes.pipe(res);
    }
  });

  proxy.on('error', (err) => {
    console.error(
      `❌ Proxy error for ${req.method} ${req.url} → localhost:${targetPort}:`,
      err.message
    );
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'text/plain' });
      res.end('Bad Gateway: Unable to reach upstream server');
    }
  });

  // Set timeout (5 minutes for regular requests)
  proxy.setTimeout(5 * 60 * 1000);

  // Handle timeout event to prevent hung connections
  proxy.on('timeout', () => {
    console.error(
      `⏱️  Timeout for ${req.method} ${req.url} → localhost:${targetPort} (exceeded 5 minutes)`
    );
    proxy.destroy(); // Destroy the hung connection
    if (!res.headersSent) {
      res.writeHead(504, { 'Content-Type': 'text/plain' });
      res.end('Gateway Timeout: Upstream server took too long to respond');
    }
  });

  req.pipe(proxy);
}

/**
 * Handle WebSocket upgrade for HMR
 */
function handleWebSocketUpgrade(
  req: http.IncomingMessage,
  socket: net.Socket,
  head: Buffer,
  targetPort: number
): void {
  const proxyReq = http.request({
    hostname: 'localhost',
    port: targetPort,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      'x-forwarded-proto': 'https',
    },
  });

  proxyReq.on('upgrade', (proxyRes, proxySocket, proxyHead) => {
    socket.write(
      `HTTP/1.1 ${proxyRes.statusCode} ${proxyRes.statusMessage}\r\n` +
        Object.entries(proxyRes.headers)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\r\n') +
        '\r\n\r\n'
    );

    proxySocket.pipe(socket);
    socket.pipe(proxySocket);

    if (proxyHead.length > 0) {
      socket.write(proxyHead);
    }
  });

  proxyReq.on('error', (err) => {
    console.error(`❌ WebSocket proxy error for ${req.url}:`, err.message);
    socket.destroy();
  });

  // Set timeout (24 hours for WebSocket connections)
  proxyReq.setTimeout(24 * 60 * 60 * 1000);

  proxyReq.end();
}

/**
 * Main server request handler
 */
function handleRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse
): void {
  const url = req.url || '/';

  // Route to API server
  if (url.startsWith('/api')) {
    proxyRequest(req, res, proxyConfig.apiPort, true);
    return;
  }

  // Route to client dev server (including WebSocket paths)
  proxyRequest(req, res, proxyConfig.clientPort, false);
}

/**
 * Start the HTTPS reverse proxy server
 */
function startServer(): void {
  // Set module-level config
  proxyConfig = getConfig();

  console.log('🚀 Starting Reacddit HTTPS Reverse Proxy...\n');

  // Get SSL certificates
  const { cert, key, isCustom } = getCertificates({
    certPath: proxyConfig.certPath,
    keyPath: proxyConfig.keyPath,
    domain: proxyConfig.domain,
  });

  // Create HTTP/2 server with HTTP/1.1 fallback
  // HTTP/2 provides better performance for parallel requests (Vite HMR)
  // allowHTTP1 enables fallback for WebSocket upgrades and older clients
  const server = http2.createSecureServer(
    {
      cert,
      key,
      allowHTTP1: true, // Required for WebSocket upgrades
    },
    (req, res) => {
      // Type assertion needed because http2 streams are compatible with http messages
      // when allowHTTP1 is true
      handleRequest(
        req as unknown as http.IncomingMessage,
        res as unknown as http.ServerResponse
      );
    }
  );

  // Handle WebSocket upgrade
  server.on('upgrade', (req, socket, head) => {
    const url = req.url || '/';

    // API WebSocket support
    if (url.startsWith('/api')) {
      handleWebSocketUpgrade(req, socket, head, proxyConfig.apiPort);
    }
    // Vite HMR WebSocket paths (everything else goes to Vite)
    else {
      handleWebSocketUpgrade(req, socket, head, proxyConfig.clientPort);
    }
  });

  // Start listening (bind to specific host for security)
  server.listen(proxyConfig.port, proxyConfig.host, () => {
    // Drop root privileges if running as root (after binding to privileged port)
    if (process.getuid && process.getuid() === 0) {
      const originalUser = process.env.SUDO_USER;

      if (!originalUser) {
        console.warn('⚠️  Warning: Running as root but SUDO_USER not set.');
        console.warn('   Cannot drop privileges safely.');
        console.warn(
          '   This is a security risk. Consider using an unprivileged port.\n'
        );
      } else {
        try {
          // Get UID and GID of original user
          const uid = parseInt(
            execSync(`id -u ${originalUser}`).toString().trim(),
            10
          );
          const gid = parseInt(
            execSync(`id -g ${originalUser}`).toString().trim(),
            10
          );

          console.log(
            `🔐 Dropping privileges from root (0) to ${originalUser} (${uid}:${gid})`
          );

          // IMPORTANT: Must call setgid() before setuid()
          // Once UID is changed, we lose permission to change GID
          if (process.setgid && process.setuid) {
            process.setgid(gid);
            process.setuid(uid);

            console.log(
              `✅ Now running as user ${originalUser} (UID: ${process.getuid?.() || 'unknown'})\n`
            );
          } else {
            console.error('❌ setuid/setgid not available on this platform');
            console.error('   Refusing to continue as root for security reasons.\n');
            process.exit(1);
          }
        } catch (err) {
          console.error(
            `❌ Failed to drop privileges: ${err instanceof Error ? err.message : String(err)}`
          );
          console.error(
            '   Refusing to continue as root for security reasons.'
          );
          console.error('   Please report this issue if it persists.\n');
          process.exit(1);
        }
      }
    }

    console.log(
      `✅ HTTPS Reverse Proxy running on https://${proxyConfig.domain}:${proxyConfig.port}\n`
    );
    console.log(`📋 Configuration:`);
    console.log(`   Domain:     ${proxyConfig.domain}`);
    console.log(`   Bind Host:  ${proxyConfig.host}`);
    console.log(`   HTTPS Port: ${proxyConfig.port}`);
    console.log(`   Protocol:   HTTP/2 (with HTTP/1.1 fallback)`);
    console.log(`   Client:     localhost:${proxyConfig.clientPort}`);
    console.log(`   API:        localhost:${proxyConfig.apiPort}`);
    console.log(
      `   SSL Certs:  ${isCustom ? "Custom (Let's Encrypt)" : 'Self-signed'}\n`
    );
    console.log(`📡 Routing:`);
    console.log(`   /api/*      → localhost:${proxyConfig.apiPort} (Koa API)`);
    console.log(
      `   /*          → localhost:${proxyConfig.clientPort} (Vite dev server)`
    );
    console.log(
      `   WebSocket   → localhost:${proxyConfig.clientPort} (Vite HMR)\n`
    );

    if (!isCustom) {
      console.log(`⚠️  Using self-signed certificates!`);
      console.log(
        `   Your browser will show a security warning on first visit.`
      );
      console.log(
        `   Click "Advanced" → "Proceed to ${proxyConfig.domain}" to continue.\n`
      );
    }

    // Delay final message to ensure it prints AFTER Vite startup
    // Vite takes a moment to start and prints its URLs
    setTimeout(() => {
      const visitUrl = `https://${proxyConfig.domain}:${proxyConfig.port}`;

      const message = [
        chalk.bold.green('Reacddit is ready!'),
        '',
        chalk.bold.cyan(`Visit: ${visitUrl}`),
        '',
        chalk.bold.yellow('DO NOT use the Vite URLs shown above - they won\'t work!'),
        chalk.gray('(Embeds require HTTPS and the proxy routes API requests)'),
      ].join('\n');

      console.log('\n' + boxen(message, {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'cyan',
        textAlignment: 'center',
      }));
    }, 2000); // 2 second delay to ensure Vite has printed its messages
  });

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${proxyConfig.port} is already in use!`);
      console.error(
        `   Try stopping other processes or changing PROXY_PORT in .env\n`
      );
    } else if (err.code === 'EACCES') {
      console.error(
        `❌ Permission denied to bind to port ${proxyConfig.port}!`
      );
      console.error(
        `   Port 443 requires root privileges. Use port 5173 instead or run with sudo.\n`
      );
    } else {
      console.error(`❌ Server error:`, err.message);
    }
    process.exit(1);
  });

  // Track active connections for forceful shutdown
  const connections = new Set<net.Socket>();
  let isShuttingDown = false;
  let shutdownStartTime = 0;

  server.on('connection', (conn) => {
    connections.add(conn);
    conn.on('close', () => {
      connections.delete(conn);
    });
  });

  // Graceful shutdown with forced exit fallback
  const shutdown = () => {
    const now = Date.now();

    // If already shutting down and user presses Ctrl+C again within grace period, force exit
    if (isShuttingDown && now - shutdownStartTime > 200) {
      console.log('🔴 Force stopping...');
      process.exit(0);
    }

    // Ignore duplicate signals within 200ms (debounce)
    if (isShuttingDown && now - shutdownStartTime <= 200) {
      return;
    }

    isShuttingDown = true;
    shutdownStartTime = now;
    console.log('\n\n🛑 Shutting down proxy server...');

    // Destroy agent connections
    httpAgent.destroy();

    // Try graceful shutdown first
    server.close(() => {
      console.log('✅ Server stopped');
      process.exit(0);
    });

    // Force exit after 2 seconds if graceful shutdown doesn't work
    setTimeout(() => {
      console.log('⏱️  Graceful shutdown timeout, destroying connections...');
      connections.forEach((conn) => conn.destroy());
      setTimeout(() => {
        console.log('✅ Server stopped (forced)');
        process.exit(0);
      }, 100);
    }, 2000);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

// Start the server
startServer();
