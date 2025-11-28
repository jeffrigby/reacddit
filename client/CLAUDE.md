# Reacddit Client

React 19 + Redux Toolkit + TypeScript client for Reddit with enhanced media embedding.

## Commands

```bash
npm start              # Vite dev server with HMR
npm run build          # Production build
npm run preview        # Preview production build
npm run lint           # Prettier + ESLint (CRITICAL: zero errors required)
```

## Code Style

**Formatting:** `semi: true`, `singleQuote: true`, `trailingComma: es5`

**Linting (ESLint v9):**
- Run `npm run lint` after ALL changes
- Zero warnings/errors required before committing
- Flat config in `eslint.config.mjs`

**Import Order:** npm packages → local modules → CSS/assets

**Naming:** `camelCase` (variables/functions), `PascalCase` (components)

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

## Error Handling

- Try/catch for async operations
- Descriptive error messages
- Status properties in state for loading/error states
