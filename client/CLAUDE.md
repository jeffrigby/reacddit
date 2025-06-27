# Reacddit Client - Development Guide

**Note**: This is a monorepo. Most development work happens in this `client/` directory. The `api/` directory contains a stable Koa.js OAuth server that rarely needs changes beyond package updates.

## Project Roadmap
This project is undergoing a multi-step modernization:
1. **Current Phase**: Converting JavaScript files to TypeScript for better type safety
2. **Next Phase**: Migrating from Webpack to Vite for improved build performance  
3. **Future Phases**: Convert API to TypeScript, additional modernization as needed

## Build Commands
- `npm start` - Start development server
- `npm run build` - Build production bundle
- `npm run profile` - Build with bundle analyzer
- `npm run lint` - Run Prettier formatting and ESLint checks with auto-fixing

## Code Style
- **Formatting**: Uses Prettier with semi:true, singleQuote:true, trailingComma:es5
- **Linting**: ESLint v9 with flat config (eslint.config.mjs)
- **ESLint Plugins**: react, react-hooks, jsx-a11y, prettier, import
- **Linting Process**: Always run Prettier first, then ESLint
- **Imports**: Group imports by: npm packages, local modules, CSS/assets
- **Component Structure**: Functional components with hooks preferred
- **Naming**: camelCase for variables/functions, PascalCase for components
- **Types**: TypeScript for all components and functions

## Code Quality
- **IMPORTANT**: After making code changes, always run `npm run lint` to ensure consistent formatting
- ESLint is configured to warn on Prettier formatting issues
- Pull requests should have no ESLint warnings or errors

## Testing
- **Framework**: Vitest with React Testing Library (Jest-free setup)
- **Commands**: 
  - `npm test` - Run tests in watch mode
  - `npm run test:run` - Run tests once
  - `npm run test:ui` - Run tests with UI dashboard
  - `npm run test:coverage` - Run tests with coverage report
- **Test Structure**: Co-located tests preferred (place `.test.tsx` files next to components)
- **Mocking**: Use Vitest's built-in `vi` mocking utilities, avoid Jest dependencies
- **React Testing**: Use `@testing-library/react` for component testing with custom render utilities in `src/test/utils.tsx`
- **Redux Testing**: Integration testing approach - use `renderWithProviders()` with real Redux stores and preloaded state
- **Router Testing**: Mock React Router hooks and use partial mocking with `importOriginal` for router components
- **Best Practices**: Test user behavior and component integration rather than implementation details
- **Testing Guide**: See `docs/VITEST_TESTING_GUIDE.md` for comprehensive testing patterns, best practices, and examples
- **Test Documentation**: Additional testing strategies and patterns documented in `docs/TEST_STRATEGY.md`

## TypeScript Guidelines
- Target ES2023 features
- Use strict type checking
- Prefer function declarations over arrow functions for components
- Avoid React.FC in favor of explicit props interfaces
- Use type for literal types, unions, and primitive types
- Use interfaces for object shapes and component props
- Add explicit parameter and return types to functions
- Properly type event handlers (e.g., MouseEvent<HTMLButtonElement>)
- Place shared types in src/types directory
- Use useSelector((state: RootState) => state.something) pattern

## Error Handling
- Use try/catch for async operations
- Include descriptive error messages
- Use status properties in state objects for loading/error states

## State Management
- Redux for global state (using Redux Toolkit)
- React context for component-specific state
- Immer for immutable state updates
- Cache invalidation uses timestamp-based expiration

## File Organization
- Component-first structure
- Feature-based folder organization
- Keep related files close together
- Presentational/container component separation

## Performance
- Use React.memo for expensive renders
- Implement debouncing for search inputs
- Lazy-load components when possible