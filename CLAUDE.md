# CLAUDE.md

Reacddit is a Reddit client with enhanced media viewing and embedded content support.

## Tech Stack

- **Client:** React 19, Redux Toolkit, React Router 7, TypeScript (ES2023), Vite 8
- **API:** Koa.js OAuth2 server (Reddit auth + share link resolver)
- **Proxy:** Node.js HTTPS reverse proxy for local dev SSL
- **Deployment:** AWS Lambda via SAM/CloudFormation
- **Package Management:** npm workspaces (client, api, proxy)

## Quick Start

```bash
npm install              # Install all workspace dependencies
npm run setup            # Interactive setup wizard (first-time)
npm start                # Start proxy + client + API
```

Access: https://localhost:5173 (or custom domain via setup wizard)

## Development Commands

```bash
npm start                   # Start all services (proxy + client + API)
npm run lint-all            # Lint all workspaces (ALWAYS run after changes)
npm run build-client        # Production build
npm outdated --workspaces   # Check outdated packages
npm run <script> -w client  # Run script in specific workspace
```

**Client-specific:**
```bash
cd client
npm run lint              # Prettier + ESLint (CRITICAL: zero warnings/errors required)
npm run build             # Production build
npm test                  # Run tests
```

**API-specific:**
```bash
cd api
npm run type-check        # TypeScript type checking
npm test                  # Run tests with Vitest
```

## Code Quality (CRITICAL)

- **ESLint v9 with flat config** - strict standards enforced
- **Zero warnings/errors required** before committing
- Run `npm run lint-all` after ANY code changes
- Each workspace has tailored ESLint config (React for client, Node for api/proxy)

## TypeScript Standards

- **Strict mode enabled** - Target ES2023
- **Zero `any` types policy** - always define proper types
- **Explicit types required** on all function parameters and return values
- Function declarations preferred over arrow functions for components
- `.tsx` for React components, `.ts` for utilities
- Use `interface` for objects/props, `type` for unions/primitives
- Typed Redux selectors: `useSelector((state: RootState) => state.something)`
- Process env access uses bracket notation: `process.env['KEY']`

## Architecture

**State Management:**
- Redux Toolkit with feature slices in `client/src/redux/slices/`
- RTK Query for API caching in `client/src/redux/api/`
- Tag-based cache invalidation, automatic request deduplication
- Local storage persistence for user preferences

**Component Structure:**
- Feature-based organization in `client/src/components/`
- Functional components with hooks (no React.FC)
- React.memo for performance optimization

**Embed System (Key Differentiator):**
- Plugin-based architecture for embedded content
- Entry: `client/src/components/posts/embeds/index.ts`
- Domain handlers: `domains/` directory (YouTube, Twitter, Reddit, Imgur, Facebook, Instagram, etc.)
- Reddit cross-post handler: `domains/redditcom.ts` fetches linked post data via OAuth API, delegates to appropriate domain handler
- Reddit share link resolution via `POST /api/resolve-share` (batch, with client-side LRU cache in `redditcom.ts`)
- Adult content: `domains_custom/` (separate)
- Dynamic loading via `import.meta.glob`
- Add new embeds: Create `domains/[domain].ts` with default export render function

**Routing:**
- React Router 7 with dynamic route generation
- Supports Reddit patterns: `/r/subreddit`, `/u/user`, `/m/multi`

**HTTPS Proxy (`/proxy/`):**
- Required for embedded content (iframes need HTTPS)
- HTTP/2 with HTTP/1.1 fallback, Brotli/gzip compression for API responses
- Auto-generates self-signed certs on first run (also supports Let's Encrypt)
- Routes `/api/*` → Koa (3001), everything else → Vite (3000)
- WebSocket support for HMR
- Request hardening: 10MB body limit, path normalization, hop-by-hop header stripping
- Security headers: HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- Config: `proxy/server.ts`, certs: `proxy/certs.ts`

## Key Files

**Client:**
- `client/src/components/layout/App.tsx` - Main app & routing
- `client/src/redux/configureStore.ts` - Redux store
- `client/src/redux/api/redditApi.ts` - RTK Query config
- `client/src/components/posts/embeds/index.ts` - Embed system entry
- `client/src/components/posts/embeds/domains/redditcom.ts` - Reddit cross-post embed handler (share link batch resolver)
- `client/src/utils/sanitize.ts` - HTML sanitization (DOMPurify) and URL validation
- `client/src/types/redditApi.ts` - Reddit API types (centralized, may be incomplete)

**API:**
- `api/src/app.ts` - Koa OAuth server, share link resolver, rate limiting
- `api/src/config.ts` - Environment config with validation
- `api/src/util.ts` - AES-256-GCM encryption (HKDF key derivation), token helpers
- `api/src/logger.ts` - Structured logging (@aws-lambda-powertools/logger)

**Proxy:**
- `proxy/server.ts` - HTTPS reverse proxy

**Scripts (TypeScript):**
- `scripts/setup-wizard.ts` - Interactive setup
- `scripts/start-dev.ts` - Dev server launcher

**Config:**
- `.env` - Proxy (domain, ports, certs)
- `api/.env` - Reddit OAuth credentials
- `client/.env` - Vite build config

## Important Notes

- **OAuth setup:** Use `npm run setup` wizard (handles domain/port/credentials automatically)
- **Package docs:** Always fetch latest using context7 MCP
- **Reddit API types:** Centralized in `client/src/types/redditApi.ts` (flag if incomplete)
- **Dev URL:** https://dev.reacdd.it/ (NEVER use localhost URLs)
- **Not implemented:** Creating posts/comments (viewing, voting, saving work)
