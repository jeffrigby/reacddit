# Reacddit Client - Development Guide

React 19 + Redux Toolkit + TypeScript client for Reddit with enhanced media embedding.

## Build Commands
- `npm start` - Start Vite development server with HMR
- `npm run build` - Build production bundle with Vite
- `npm run preview` - Preview production build locally
- `npm run lint` - Run Prettier formatting and ESLint checks with auto-fixing

## Code Style & Quality

**Formatting (Prettier):**
- `semi: true`, `singleQuote: true`, `trailingComma: es5`

**Linting (ESLint v9):**
- **CRITICAL**: Run `npm run lint` after changes - zero warnings/errors required
- Flat config in `eslint.config.mjs`
- Plugins: react, react-hooks, jsx-a11y, prettier, import

**Import Order:**
1. npm packages
2. Local modules
3. CSS/assets

**Naming:**
- `camelCase` - variables, functions
- `PascalCase` - components

## TypeScript Standards

**Configuration:**
- ES2023 target with strict mode
- Zero `any` types - always define proper types
- Explicit return types required

**Conventions:**
- Function declarations (not arrow functions) for components
- No `React.FC` - use explicit props interfaces
- `interface` for object shapes/props, `type` for unions/primitives
- `.tsx` for components, `.ts` for utilities
- Event handlers: `MouseEvent<HTMLButtonElement>`, etc.
- Redux selectors: `useSelector((state: RootState) => state.something)`

**Shared Types:** `src/types/` directory

## Error Handling
- Use try/catch for async operations
- Include descriptive error messages
- Use status properties in state objects for loading/error states

## Architecture

**State Management:**
- Redux Toolkit for global state (`src/redux/slices/`)
- **RTK Query for data fetching** (`src/redux/api/endpoints/`)
- React context for component-specific state
- Immer for immutable updates (built into RTK)

**RTK Query Patterns:**
- All Reddit API data fetching uses RTK Query hooks
- Base API: `src/redux/api/redditApi.ts` with custom axios baseQuery
- Endpoints injected via `injectEndpoints()` pattern (code splitting)
- Import from `@/redux/api` barrel file (not endpoint files directly)
- **Query patterns:**
  - `builder.query<ReturnType, ArgsType>` for GET operations
  - `builder.mutation<ReturnType, ArgsType>` for POST/PUT/DELETE
  - **Default: Use `query` option** with baseQuery for HTTP requests
  - Use `queryFn` only for special cases (third-party SDKs, custom async logic)
  - Use `skip` option for conditional fetching: `{ skip: !someCondition }`
- **Cache management:**
  - Default: 60 seconds (frequent updates)
  - Long-lived: 24 hours (multis, user profile, subreddit lists)
  - Tag-based invalidation for related data
  - LIST pattern: `{ type: 'Resource', id: 'LIST' }` for collections
- **Infrastructure vs Endpoints:**
  - `src/reddit/redditApiTs.ts` contains ONLY infrastructure: axios instance, auth interceptors, token management, utilities (setParams)
  - Endpoint files contain business logic: URL construction, parameter handling, HTTP methods
  - Share utilities across endpoints (e.g., `setParams` for parameter cleaning)

**File Organization:**
- Feature-based structure (`src/components/[feature]/`)
- Presentational/container separation
- Keep related files together
- Endpoint files organized by domain (`multiReddits`, `search`, `comments`, etc.)

**Performance:**
- `React.memo` for expensive renders
- RTK Query automatic request deduplication
- Debounce search inputs
- Lazy-load routes/components where beneficial