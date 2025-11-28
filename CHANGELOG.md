# Changelog

All notable changes to Reacddit will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2025-11-28

### Added
- HTTPS reverse proxy for local development with HTTP/2, compression, and connection pooling
- Interactive setup wizard with TypeScript migration for easy first-time configuration
- Automatic dependency installation in setup wizard
- User-friendly message for Reddit domain search limitation
- Interactive sudo prompt with security hardening

### Changed
- Replaced react-social-media-embed with official platform SDKs (Twitter, Facebook, Instagram)
- Migrated to npm workspaces for better monorepo management
- Converted all relative imports to TypeScript path aliases
- Updated documentation: removed nginx references, improved clarity
- Removed unused lodash functions

### Fixed
- Subscribe and multi buttons not showing for unsubscribed subreddits
- j/k navigation hotkeys and improved accessibility
- Multi search functionality
- Search not updating correctly
- Mobile vertical scrolling on gallery posts
- RTK Query stuck loading state in custom feeds
- Clipboard fallback and iPadOS detection issues
- TypeScript errors and interaction bugs
- Pinned and sticky post icon visibility
- iOS filter subreddits clear button interaction
- iOS Safari animated GIF loading (now served as images)
- Network error handling improvements

### Security
- Fixed incomplete URL substring sanitization in service worker (strict origin matching)
- Removed clear-text logging of usernames in reddit-api-tester
- Improved proxy security with privilege separation and HTTP compliance

## [1.1.0] - 2025-11-08

### Added
- RTK Query for API caching with tag-based invalidation
- Selective RTK Query cache persistence
- PWA update dialog UI improvements
- Deployment verification checks with Cloudflare bypass
- GitHub Actions deployment workflow with OIDC authentication
- Theme toggle component with dark mode improvements
- Vitest testing framework
- Reddit API testing tool for type validation
- CloudFront domain alias for Cloudflare proxy support

### Changed
- Complete TypeScript migration for client and API
- Migrated from Webpack to Vite 6
- React 19 upgrade
- React Router 7 upgrade (from v5 to v6 to v7)
- Redux Toolkit modernization with hooks
- ESLint 8 to 9 migration with flat config
- Bootstrap 5 upgrade with React components
- FontAwesome migration to React components
- Node.js 22 for Lambda runtime
- Converted API to ES Modules
- Service worker optimization with Workbox

### Fixed
- Subreddit header info loading for non-subscribed subreddits
- Pointer events on scroll for touch devices
- Search on mobile layout
- Mute offscreen videos
- Flickering on text posts
- Lazy loading content issues
- Stale content remaining after logout
- Gallery rendering issues
- Various TypeScript errors and linting issues

### Removed
- jQuery dependencies (replaced with React)
- Babel (replaced with esbuild)
- Yarn (replaced with npm)
- PropTypes (replaced with TypeScript)
- simple-oauth2 dependency
- connected-react-router/history packages

## [1.0.7] - 2021-06-11

### Added
- Back button support
- Pinned posts condensed view option
- User sort functionality
- Overview/comments support
- Video toggle controls
- Last updated indicator for friends

### Changed
- Huge improvement to collapsed/minimized view
- Major updates to devserver config (CRA-like)
- Refactored webpack config
- Changed limit to 100 when subreddits are collapsed
- Updated "Multi" to "Custom Feeds" to match reddit.com
- Improved video player with progress bar and controls

### Fixed
- Autoplay from triggering on manually stopped videos
- Focused & actionable in condensed mode
- Inline content rendering
- Back button improvements
- Service worker improvements
- Various package updates and bug fixes

## [1.0.6] - 2020-01-20

### Added
- Favorite subreddit functionality
- Click-to-copy for post IDs
- Duplicate post filtering
- Pin menu setting
- YouTube embed for inline links
- Hotkeys menu item
- Debug option in settings menu
- Multi reddits API calls and management
- History storage for better back button support
- Mobile authorization compact mode

### Changed
- Huge refactor to make listings more manageable
- Improved content rendering and loading
- Better strict mode support
- Split up listing components
- Improved headers and navigation

### Fixed
- Voting and saving functionality
- Streaming issues
- Back button support
- Non-ssl imgur links
- Crosspost rendering
- gfycat 404s (switched to fetch API)
- Sticky posts not rendering content when expanded
- Various CSS and style improvements

## [1.0.5] - 2019-07-11

### Added
- 404 not found page
- Min-height to posts to prevent scrolling jumps on iOS

### Changed
- Package updates
- Documentation updates
- Removed jQuery commented out code

## [1.0.4] - 2019-06-12

### Fixed
- React tooltip z-index issue (moved to app level)

## [1.0.2] - 2019-06-12

### Added
- Video progress bar
- Ability to add and remove subreddits to/from multi
- React.memo for performance optimization
- Menu collapse functionality
- Subreddit menu toggle

### Changed
- Converted tooltips from jQuery to react-tooltip
- Moved logout button & added karma tooltip
- Changed "Multi" to "Custom Feeds" to match reddit.com
- Improved filter functionality
- Default front sort changed to "Best"
- Organized listings to separate directory

### Fixed
- Search functionality improvements
- Placeholder when there's no preview
- Menu position memory
- Various package updates and bug fixes
- Service worker URL issues

## [1.0.1] - 2019-05-29

### Added
- CORS support
- Configurable API path
- Build time to settings menu for debugging
- Scripts to start/stop API

### Fixed
- Client/server URL configuration
- Login/logout URLs
- dotenv path issues

## [1.0.0] - 2019-05-27

### Added
- Initial release of Reacddit
- Reddit OAuth authentication
- Subreddit browsing and navigation
- Post viewing with media embeds
- Comment viewing
- Voting and saving posts
- Multi-reddit (Custom Feeds) support
- User profile viewing
- Search functionality
- Dark/light theme support
- Keyboard navigation (hotkeys)
- PWA support with service worker
- Responsive design for mobile/desktop

[1.2.0]: https://github.com/jeffrigby/reacddit/compare/1.1.0...release/1.2
[1.1.0]: https://github.com/jeffrigby/reacddit/compare/1.0.7...1.1.0
[1.0.7]: https://github.com/jeffrigby/reacddit/compare/1.0.6...1.0.7
[1.0.6]: https://github.com/jeffrigby/reacddit/compare/1.0.5...1.0.6
[1.0.5]: https://github.com/jeffrigby/reacddit/compare/1.0.4...1.0.5
[1.0.4]: https://github.com/jeffrigby/reacddit/compare/1.0.2...1.0.4
[1.0.2]: https://github.com/jeffrigby/reacddit/compare/1.0.1...1.0.2
[1.0.1]: https://github.com/jeffrigby/reacddit/compare/1.0...1.0.1
[1.0.0]: https://github.com/jeffrigby/reacddit/releases/tag/1.0
