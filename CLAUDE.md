# CLAUDE.md

Reacddit is a Reddit client with enhanced media viewing and embedded content support. npm workspaces monorepo (client, api, proxy, tests) — see the workspace manifests for the stack; each workspace has its own CLAUDE.md with details.

## Quick Start

Access via the domain configured in `.env` (`PROXY_DOMAIN` + `PROXY_PORT`). Default `.env.dist` uses `localhost:5173`; this project's dev URL is `https://dev.reacdd.it/` (see Important Notes).

## Code Quality (CRITICAL)

- **ESLint v10 with flat config** - strict standards enforced
- **Zero warnings/errors required** before committing
- Run `npm run lint-all` after ANY code changes
- Each workspace has tailored ESLint config (React for client, Node for api/proxy)

## TypeScript Standards

- **Zero `any` types policy** - always define proper types
- **Explicit types required** on all function parameters and return values
- Function declarations preferred over arrow functions for components
- `.tsx` for React components, `.ts` for utilities
- Use `interface` for objects/props, `type` for unions/primitives
- Typed Redux selectors: `useSelector((state: RootState) => state.something)`
- Process env access uses bracket notation: `process.env['KEY']`

## Architecture

**Embed System (Key Differentiator):**
- Plugin-based rendering of embedded content in `client/src/components/posts/embeds/` — full details in `client/CLAUDE.md`

**HTTPS Proxy (`/proxy/`):**
- Local-dev HTTPS reverse proxy, required because embedded iframes need HTTPS — details in `proxy/CLAUDE.md`

## Config

- `.env` - Proxy (domain, ports, certs)
- `api/.env` - Reddit OAuth credentials
- `client/.env` - Vite build config

## TypeScript (dual install — do not "fix" this)

Root `package.json` deliberately uses npm aliases:

```json
"@typescript/native": "npm:typescript@^7.0.2",
"typescript": "npm:@typescript/typescript6@^6.0.2"
```

TypeScript 7 (the Go rewrite) ships **no programmatic compiler API** — its `.` export is
just a version string. typescript-eslint peers on `typescript >=4.8.4 <6.1.0` and imports
the API directly, so a plain `typescript@^7` bump silently kills all type-aware linting.

The aliases give both: `tsc` → TS 7 (used by every `type-check` script, ~7x faster), `tsc6`
→ TS 6, and `import 'typescript'` → the TS 6 API that typescript-eslint needs. This is
Microsoft's documented side-by-side recipe.

- The alias *keys* matter. `@typescript/typescript6` pulls real TS 6 in as `@typescript/old`,
  which also declares `bin.tsc`. `@typescript/native` sorts before `@typescript/old`, so npm
  links `.bin/tsc` to TS 7. Renaming that key can silently flip `tsc` back to TS 6 —
  verify with `npx tsc --version` after any dependency change.
- Changing these aliases requires a clean `rm -rf node_modules package-lock.json && npm install`;
  npm will not re-resolve an alias on an incremental install.
- Vite/esbuild does the production build and never invokes `tsc`, so this is type-check +
  editor tooling only.
- Revisit when typescript-eslint supports TS 7 (blocked on the TS 7.1 API; not on their
  9.0.0 milestone as of July 2026). Then drop the aliases and set `"typescript": "^7"`.

## Important Notes

- **OAuth setup:** Use `npm run setup` wizard (handles domain/port/credentials automatically)
- **Package docs:** Always fetch latest using context7 MCP
- **Reddit API types:** Centralized in `client/src/types/redditApi.ts` (flag if incomplete)
- **Dev URL:** https://dev.reacdd.it/ (NEVER use localhost URLs)
- **Not implemented:** Creating posts/comments (viewing, voting, saving work)
- **Broken upstream — adding a subreddit to a custom feed:** the client talks to
  `https://oauth.reddit.com` directly from the browser (`client/src/reddit/redditApiTs.ts`),
  and Reddit's response to `PUT /api/multi/<path>/r/<sub>` carries no CORS headers, so the
  mutation never persists. Creating, listing and deleting feeds are unaffected — it is only
  the add-subreddit call. Nothing in this repo can fix it; routing that one call through the
  `api/` workspace would be the workaround if it ever becomes worth doing. The e2e test is
  `test.fixme`'d as a canary (see `tests/CLAUDE.md`), so do not "fix" it by rewriting the
  assertions.
- **Standalone tool:** `reddit-api-tester/` is NOT an npm workspace — install/run it separately (see its CLAUDE.md)
- **Branching:** feature branches PR into `develop` (long-lived integration branch — never delete it); `develop` merges to `main` for releases
- **Dev server:** started by the user (requires sudo — binds port 443). Never start/stop/restart it from a session; if it's needed, ask
