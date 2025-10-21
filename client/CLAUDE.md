# Reacddit Client - Development Guide

React 19 + Redux Toolkit + TypeScript client for Reddit with enhanced media embedding.

## Build Commands
- `npm start` - Start development server
- `npm run build` - Build production bundle
- `npm run profile` - Build with bundle analyzer
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
- React context for component-specific state
- Immer for immutable updates (built into RTK)
- Timestamp-based cache invalidation

**File Organization:**
- Feature-based structure (`src/components/[feature]/`)
- Presentational/container separation
- Keep related files together

**Performance:**
- `React.memo` for expensive renders
- Debounce search inputs
- Lazy-load routes/components where beneficial