# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Reacddit is a Reddit client built with React that provides enhanced media viewing with support for many more embedded content types than the official Reddit app. This is a monorepo containing:

- **Frontend** (`client/`): React 19 + Redux Toolkit client with TypeScript migration in progress - **primary development focus**
- **Backend** (`api/`): Koa.js OAuth2 server for Reddit API authentication - **stable, minimal changes needed**
- **Deployment**: AWS Lambda with SAM/CloudFormation

**Development Focus**: Most work happens in the `client/` directory. The API is stable and primarily needs package updates. Future plans include converting the API to TypeScript.

## Development Commands

**Root level** (run both client and API):
```bash
npm start                 # Start both client and API concurrently
npm run start-client      # Client development server only
npm run start-api         # API server only  
npm run build-client      # Production build
```

**Client** (`cd client/`):
```bash
npm start                 # Webpack dev server with hot reload
npm run build             # Production build
npm run profile           # Build with webpack bundle analyzer
npm run lint              # Prettier formatting + ESLint (ALWAYS run after changes)
```

**API** (`cd api/`):
```bash
npm start                 # Development server with nodemon
```

## Code Quality Requirements

**CRITICAL**: Always run `npm run lint` in the client directory after making any changes. ESLint v9 with flat config enforces strict code quality standards.

## Architecture

### State Management
- Redux Toolkit with feature-based slices in `client/src/redux/slices/`
- Local storage persistence for user preferences
- Timestamp-based cache invalidation
- Use typed selectors: `useSelector((state: RootState) => state.something)`

### Component Structure
- Feature-based organization in `client/src/components/`
- Functional components with hooks (no React.FC)
- Separation of presentational/container components
- React.memo for performance optimization

### Embed System
The project's key differentiator is its sophisticated embed system:
- Plugin-based architecture in `client/src/posts/embeds/`
- Domain-specific handlers in `domains/` (YouTube, Twitter, Instagram, etc.)
- Adult content domains separated in `domains_custom/`
- Webpack's require.context enables dynamic loading

### Routing
- React Router 7 with dynamic route generation
- Supports Reddit URL patterns: `/r/subreddit`, `/u/user`, `/m/multi`
- Route validation system

## TypeScript Migration (Current Phase)

Currently converting JS files to TypeScript:
- Target ES2023 features with strict type checking
- Function declarations preferred over arrow functions for components
- Explicit parameter and return types required
- Shared types in `client/src/types/`
- Proper event handler typing (e.g., `MouseEvent<HTMLButtonElement>`)

## OAuth Setup (API)

The API requires Reddit OAuth2 setup:
1. Create Reddit app at https://www.reddit.com/prefs/apps
2. Copy `api/.env.dist` to `api/.env`
3. Configure CLIENT_PATH, REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_CALLBACK_URI
4. Test at `http://localhost:3001/api/bearer`

## Build System

- Webpack 5 with custom configuration in `client/webpack/`
- ESBuild loader for TypeScript/JavaScript
- Bundle analyzer available via `npm run profile`
- Production deployments use AWS SAM (`api/template.yaml`)

## Key Files to Understand

- `client/src/components/layout/App.js` - Main app component and routing
- `client/src/redux/configureStore.js` - Redux store configuration
- `client/src/posts/embeds/index.js` - Embed system entry point
- `api/src/app.mjs` - Koa.js OAuth server
- `client/webpack/webpack.common.js` - Build configuration

## Features Not Yet Implemented

- Comments viewing/posting (planned for next major release)
- Content creation (posts, comments)
- Full mobile testing on Android

## Types and API References

- All the Reddit types are stored in @client/src/types/redditApi.ts This may not be complete, and was based of the documentation here: https://www.reddit.com/dev/api/ When converting components and the API to TS please use these types. If you see something wrong with the types please let me know, as I may have missed something.

## Claude Memory Notes

- Always reference the latest documentation for packages using the context7 MCP.
- For Reddit API testing and type validation, see `/reddit-api-tester/CLAUDE.md`