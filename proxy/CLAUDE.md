# Reacddit Proxy

Node.js HTTPS reverse proxy for local development — required because embedded content (iframes) needs HTTPS.

## Behavior

- HTTP/2 with HTTP/1.1 fallback, Brotli/gzip compression for API responses
- Auto-generates self-signed certs on first run (also supports Let's Encrypt)
- Routes `/api/*` → Koa (3001), everything else → Vite (3000)
- WebSocket support for HMR
- Request hardening: 10MB body limit, path normalization, hop-by-hop header stripping
- Security headers: HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- Config: `proxy/server.ts`, certs: `proxy/certs.ts`
