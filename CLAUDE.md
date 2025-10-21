# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Reacddit is a Reddit client built with React that provides enhanced media viewing with support for many more embedded content types than the official Reddit app.

**Monorepo Structure:**
- **`client/`**: React 19 + Redux Toolkit + TypeScript - primary development area
- **`api/`**: Koa.js OAuth2 server (TypeScript) - handles Reddit authentication only
- **Deployment**: AWS Lambda via SAM/CloudFormation

**Tech Stack:** React 19, Redux Toolkit, React Router 7, TypeScript (ES2023), Webpack 5, Koa.js

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
- Local storage persistence for user preferences
- Timestamp-based cache invalidation
- Use typed selectors: `useSelector((state: RootState) => state.something)`

### Component Structure
- Feature-based organization in `client/src/components/`
- Functional components with hooks (no React.FC)
- Separation of presentational/container components
- React.memo for performance optimization

### Embed System
**Key differentiator:** Sophisticated plugin-based architecture for rendering embedded content.

**Architecture:**
- Entry point: `client/src/posts/embeds/index.ts`
- Domain handlers: `domains/` (YouTube, Twitter, Instagram, etc.)
- Adult content: `domains_custom/` (separate directory)
- Dynamic loading via Webpack's `require.context`
- Each domain handler exports a render function that returns `{type, ...content}` or null

**Adding new embeds:** Create `domains/[domain].ts` with a default export render function

### Routing
- React Router 7 with dynamic route generation
- Supports Reddit URL patterns: `/r/subreddit`, `/u/user`, `/m/multi`
- Route validation system

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
- Webpack 5 with custom configuration in `client/webpack/`
- ESBuild loader for TypeScript/JavaScript
- Bundle analyzer available via `npm run profile`

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
- `client/src/posts/embeds/index.ts` - Embed system entry point
- `api/src/app.ts` - Koa.js OAuth server (fully TypeScript)
- `api/src/config.ts` - Centralized environment configuration with validation
- `client/webpack/webpack.common.js` - Build configuration

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