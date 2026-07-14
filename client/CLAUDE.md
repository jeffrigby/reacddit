# Reacddit Client

React 19 + Redux Toolkit + TypeScript client for Reddit with enhanced media embedding. Commands are the standard scripts in `package.json`.

## Code Style

**Linting (ESLint v10):**
- Run `npm run lint` after ALL changes
- Zero warnings/errors required before committing
- Flat config in `eslint.config.mjs`

**Import Order:** npm packages → local modules → CSS/assets

**Naming:** `camelCase` (variables/functions), `PascalCase` (components)

**Path Aliases:** prefer the tsconfig `@/*` aliases over relative imports across feature boundaries

## TypeScript Standards

- ES2023 target with strict mode
- Zero `any` types - always define proper types
- Explicit return types required
- Function declarations (not arrow functions) for components
- No `React.FC` - use explicit props interfaces
- `interface` for objects/props, `type` for unions/primitives
- Event handlers: `MouseEvent<HTMLButtonElement>`
- Redux selectors: `useSelector((state: RootState) => state.something)`
- Types location: `src/types/`

## Architecture

**State Management:**
- Redux Toolkit: `src/redux/slices/` (feature-based)
- RTK Query: `src/redux/api/endpoints/` (all Reddit API data fetching)
- React context for component-specific state

**RTK Query Patterns:**
- Base API: `src/redux/api/redditApi.ts` (custom axios baseQuery)
- Endpoints injected via `injectEndpoints()` (code splitting)
- Import from `@/redux/api` barrel file (not endpoint files directly)
- `builder.query<ReturnType, ArgsType>` for GET
- `builder.mutation<ReturnType, ArgsType>` for POST/PUT/DELETE
- Default: Use `query` option (use `queryFn` only for special cases)
- Conditional fetching: `{ skip: !someCondition }`
- Cache: 60s default, 24h for long-lived data
- Tag-based invalidation with LIST pattern: `{ type: 'Resource', id: 'LIST' }`

**Infrastructure Split:**
- `src/reddit/redditApiTs.ts` - ONLY infrastructure (axios, auth, tokens)
- Endpoint files - Business logic (URLs, params, HTTP methods)

**File Organization:**
- Feature-based: `src/components/[feature]/`
- Presentational/container separation
- Keep related files together

**Performance:**
- `React.memo` for expensive renders
- RTK Query auto request deduplication
- Debounce search inputs
- Lazy-load routes/components

**Embed System:**
- Plugin-based: `src/components/posts/embeds/domains/` (one file per domain — YouTube, Twitter, Reddit, Imgur, Facebook, Instagram, etc.)
- Entry point: `src/components/posts/embeds/index.ts`; handlers load dynamically via `import.meta.glob`
- Reddit cross-posts: `domains/redditcom.ts` resolves linked posts via OAuth API, delegates rendering to the appropriate domain handler
- Share links (`/r/sub/s/code`): batched via `POST /api/resolve-share` with client-side LRU cache
- Adult content handlers live separately in `domains_custom/`
- Add new embeds: Create `domains/[domain].ts` with default export async render function

**Security:**
- HTML sanitization via DOMPurify: `src/utils/sanitize.ts` (`sanitizeHTML`)
- URL validation: `isSafeUrl()` and `sanitizeHref()` in `src/utils/sanitize.ts`
- Always use `sanitizeHTML()` when rendering user-provided HTML (e.g., Reddit selftext_html)
- Always use `sanitizeHref()` for dynamic href attributes

## Gotchas

- **`document.body` is the scroll container** (element scroller, not the window):
  `window.scrollY` is ALWAYS 0. Read/set scroll via `document.body.scrollTop`,
  or better, the utilities in `src/common.ts` (`getScrollContainer`,
  `getScrollViewport`) which also handle the post-detail overlay
- **Post-detail overlay routing** (background-location pattern, `RedditRoutes.tsx`):
  two listing trees can be mounted at once; only the ACTIVE tree owns
  `id="entries"`. Inside listing trees: document-level hotkey listeners MUST go
  through `useDocumentKeydown` (auto-detached when the tree is suspended), and
  links into comments/duplicates pages MUST carry `useDetailNavState()` as Link
  `state` — a plain Link breaks the overlay/back-button chain
- Entry DOM ids are duplicated across trees while the overlay is open — use
  `findEntry`/`getActiveEntriesContainer` from `PostsFunctions.ts`, never a bare
  `document.getElementById`

## Error Handling

- Try/catch for async operations
- Descriptive error messages
- Status properties in state for loading/error states
