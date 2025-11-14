# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Reacddit is a Reddit client built with React that provides enhanced media viewing with support for many more embedded content types than the official Reddit app.

**Monorepo Structure:**
- **`client/`**: React 19 + Redux Toolkit + TypeScript - primary development area
- **`api/`**: Koa.js OAuth2 server (TypeScript) - handles Reddit authentication only
- **`proxy/`**: HTTPS reverse proxy (Node.js/TypeScript) - development SSL termination
- **Deployment**: AWS Lambda via SAM/CloudFormation

**Tech Stack:** React 19, Redux Toolkit, React Router 7, TypeScript (ES2023), Vite 6, Koa.js

## Development Commands

**Root level** (run proxy, client, and API):
```bash
npm start                 # Start proxy + client + API concurrently
npm run start-proxy       # HTTPS reverse proxy only (port 5173)
npm run start-client      # Client development server only (port 3000)
npm run start-api         # API server only (port 3001)
npm run build-client      # Production build
```

**Access:** https://localhost:5173 (or https://dev.reacdd.it:5173 with custom domain)

**Client** (`cd client/`):
```bash
npm start                 # Vite dev server with hot module replacement
npm run build             # Production build
npm run preview           # Preview production build locally
npm run lint              # Prettier formatting + ESLint (ALWAYS run after changes)
```

**API** (`cd api/`):
```bash
npm start                 # Development server with nodemon + tsx
npm run type-check        # TypeScript type checking
npm run test              # Run tests with Vitest
npm run build             # SAM build for Lambda deployment
```

## Code Quality Requirements

**CRITICAL**: Always run `npm run lint` in the client directory after making changes. ESLint v9 with flat config enforces strict standards. Zero warnings/errors required before committing.

## Architecture

### State Management
- Redux Toolkit with feature-based slices in `client/src/redux/slices/`
- RTK Query for API data fetching and caching in `client/src/redux/api/`
  - Tag-based cache invalidation
  - Automatic request deduplication
  - Endpoints: listings, comments, votes, subreddits, multireddits, user data, search
- Local storage persistence for user preferences
- Use typed selectors: `useSelector((state: RootState) => state.something)`

### Component Structure
- Feature-based organization in `client/src/components/`
- Functional components with hooks (no React.FC)
- Separation of presentational/container components
- React.memo for performance optimization

### Embed System
**Key differentiator:** Sophisticated plugin-based architecture for rendering embedded content.

**Architecture:**
- Entry point: `client/src/components/posts/embeds/index.ts`
- Domain handlers: `domains/` (YouTube, Twitter, Instagram, etc.)
- Adult content: `domains_custom/` (separate directory)
- Dynamic loading via Vite's `import.meta.glob`
- Each domain handler exports a render function that returns `{type, ...content}` or null

**Adding new embeds:** Create `domains/[domain].ts` with a default export render function

### Routing
- React Router 7 with dynamic route generation
- Supports Reddit URL patterns: `/r/subreddit`, `/u/user`, `/m/multi`
- Route validation system

### HTTPS Reverse Proxy
**Location:** `/proxy/`

**Why it exists:** HTTPS is required for embedded content (iframes, third-party embeds). The proxy provides SSL termination for local development without requiring nginx installation.

**Architecture:**
- Node.js HTTPS server using built-in `https` module
- Auto-generates self-signed certificates for localhost on first run
- Supports custom domains with Let's Encrypt certs (via .env configuration)
- Routes `/api/*` → Koa API (port 3001)
- Routes everything else → Vite dev server (port 3000)
- WebSocket upgrade support for HMR (`/ws`, `/sockjs-node`, `/@vite/`)
- Security headers matching nginx config (HSTS, CSP, X-Frame-Options, etc.)

**Key files:**
- `proxy/server.ts` - Main HTTPS server and routing logic
- `proxy/certs.ts` - Certificate management (generation and loading)
- `.env` - Configuration (domain, ports, cert paths)

**Configuration:**
- `PROXY_DOMAIN` - Domain to serve (localhost or custom domain)
- `PROXY_PORT` - HTTPS port (default: 5173)
- `PROXY_CERT_PATH` / `PROXY_KEY_PATH` - Optional custom cert paths
- `CLIENT_PORT` - Vite dev server port (default: 3000)
- `API_PORT` - Koa API port (default: 3001)

**Self-signed certificates:**
- Stored in `proxy/.ssl/` (gitignored)
- Generated with OpenSSL on first run
- Include SAN (Subject Alternative Name) for localhost, 127.0.0.1, ::1
- Valid for 365 days
- Browser will show security warning (expected for self-signed certs)

**Production:** CloudFront handles SSL termination, proxy not used.

## TypeScript Standards

**Strict Configuration:**
- Target ES2023 with strict mode enabled
- Zero `any` types policy - always define proper types
- Explicit parameter and return types required on all functions

**Conventions:**
- Function declarations preferred over arrow functions for components
- `.tsx` for React components, `.ts` for utilities and modules
- Proper event handler typing (e.g., `MouseEvent<HTMLButtonElement>`)
- Use `interface` for object shapes/component props, `type` for unions/primitives
- Typed Redux selectors: `useSelector((state: RootState) => state.something)`

**Shared Types:**
- `client/src/types/` - Client types (Reddit API, app state, etc.)
- `api/src/types/` - API types (Reddit OAuth, sessions, config)

## OAuth Setup (API)

The API requires Reddit OAuth2 setup:
1. Create Reddit app at https://www.reddit.com/prefs/apps
2. Copy `api/.env.dist` to `api/.env`
3. Configure CLIENT_PATH, REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_CALLBACK_URI
4. Test at `http://localhost:3001/api/bearer`

## Build System

**Client:**
- Vite 6 with SWC for fast TypeScript/JavaScript compilation
- Configuration in `client/vite.config.ts`
- Hot module replacement (HMR) for instant updates during development
- Vite PWA plugin for Progressive Web App functionality

**Production Deployment:**
- SAM template (`api/template.yaml`) provisions complete AWS infrastructure:
  - Lambda function (OAuth API)
  - S3 bucket (static site hosting)
  - CloudFront distribution (CDN with multi-origin: S3 for client, Lambda for `/api/*`)
  - Origin Access Control, IAM roles, SSL via ACM
- Client build uploaded to S3 at `/dist` path
- Environment variables stored in AWS Systems Manager Parameter Store

## Key Files to Understand

- `client/src/components/layout/App.tsx` - Main app component and routing
- `client/src/redux/configureStore.ts` - Redux store configuration
- `client/src/redux/api/redditApi.ts` - RTK Query API configuration with tag-based caching
- `client/src/redux/api/endpoints/` - RTK Query endpoints for Reddit API operations
- `client/src/components/posts/embeds/index.ts` - Embed system entry point
- `api/src/app.ts` - Koa.js OAuth server (fully TypeScript)
- `api/src/config.ts` - Centralized environment configuration with validation
- `proxy/server.ts` - HTTPS reverse proxy server
- `proxy/certs.ts` - SSL certificate management
- `client/vite.config.ts` - Vite build configuration
- `.env` - Development environment configuration (domain, ports, certs)

## Features Not Yet Implemented

- Creating posts or comments (viewing, voting, and saving are supported)
- Full mobile testing on Android

## Reddit API Types

**Location:** `client/src/types/redditApi.ts`

All Reddit API types are centralized here. Based on https://www.reddit.com/dev/api/ but may be incomplete. Always use these types for Reddit data structures. If you find missing or incorrect types, flag them for review.

## Agent Documentation (`/agentDocs/`)

**Purpose:** AI agent-specific research, analysis, and planning documents (gitignored, not for humans)

**Save here:**
- Migration planning and analysis
- Third-party library research
- Best practices investigations
- Temporary audit/investigation findings

**Do NOT save here:**
- General project docs (use README files)
- User-facing guides
- Anything that should be committed to git

## Important Notes

- **Package docs:** Always fetch latest documentation using context7 MCP
- **Reddit API testing:** See `/reddit-api-tester/CLAUDE.md` for testing utilities
- **Research docs:** Save analysis/research to `/agentDocs/` (gitignored)