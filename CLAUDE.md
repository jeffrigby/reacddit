# CLAUDE.md

Reacddit is a Reddit client with enhanced media viewing and embedded content support. npm workspaces monorepo (client, api, proxy, tests) — see the workspace manifests for the stack; each workspace has its own CLAUDE.md with details.

## Quick Start

```bash
npm install              # Install all workspace dependencies
npm run setup            # Interactive setup wizard (first-time)
npm start                # Start proxy + client + API
```

Access via the domain configured in `.env` (`PROXY_DOMAIN` + `PROXY_PORT`). Default `.env.dist` uses `localhost:5173`; this project's dev URL is `https://dev.reacdd.it/` (see Important Notes).

## Development Commands

```bash
npm start                   # Start all services (proxy + client + API)
npm run lint-all            # Lint all workspaces (ALWAYS run after changes)
npm run build-client        # Production build
npm run test:e2e            # Playwright E2E tests (tests/ workspace)
npm run test:e2e:ui         # Playwright E2E with UI runner
npm run test:component      # Component tests (vitest browser mode in client/)
npm outdated --workspaces   # Check outdated packages
npm run <script> -w client  # Run script in specific workspace
```

Per-workspace commands are documented in `client/CLAUDE.md` and `api/CLAUDE.md`.

## Code Quality (CRITICAL)

- **ESLint v10 with flat config** - strict standards enforced
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
- Plugin-based rendering of embedded content in `client/src/components/posts/embeds/` — full details in `client/CLAUDE.md`

**Routing:**
- React Router 8 with dynamic route generation
- Supports Reddit patterns: `/r/subreddit`, `/u/user`, `/m/multi`

**HTTPS Proxy (`/proxy/`):**
- Local-dev HTTPS reverse proxy, required because embedded iframes need HTTPS — details in `proxy/CLAUDE.md`

## Config

- `.env` - Proxy (domain, ports, certs)
- `api/.env` - Reddit OAuth credentials
- `client/.env` - Vite build config

## Important Notes

- **OAuth setup:** Use `npm run setup` wizard (handles domain/port/credentials automatically)
- **Package docs:** Always fetch latest using context7 MCP
- **Reddit API types:** Centralized in `client/src/types/redditApi.ts` (flag if incomplete)
- **Dev URL:** https://dev.reacdd.it/ (NEVER use localhost URLs)
- **Not implemented:** Creating posts/comments (viewing, voting, saving work)
- **Standalone tool:** `reddit-api-tester/` is NOT an npm workspace — install/run it separately (see its CLAUDE.md)
- **Branching:** feature branches PR into `develop` (long-lived integration branch — never delete it); `develop` merges to `main` for releases
- **Dev server:** started by the user (requires sudo — binds port 443). Never start/stop/restart it from a session; if it's needed, ask
