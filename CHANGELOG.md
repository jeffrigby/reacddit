# Changelog

All notable changes to Reacddit will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.7.0] - 2026-09-24

### Added

- Sidebar subreddit search: the filter box now searches Reddit's subreddits as well as the subscribed list, with exact and prefix name matches ranked first, and results can be sorted by relevance, subscribers or name (the choice persists in site settings)
- A subscribe control on each sidebar search result; a subscribed result moves into the subscribed list
- The account menu links overview, comments and hidden listings, with `g-v` and `g-c` hotkeys for overview and comments
- A comment in a user listing shows the subreddit and post it answers, and always stays expanded
- Reddit links in comments and self-post text now open in the app for subreddits, users, multireddits and mobile share links, not only post permalinks
- `robots.txt` and a `noindex` meta block crawlers, including AI crawlers that honour only their own token

### Changed

- Sidebar search shows only name matches, and hides private, gold-only and employee-only subreddits the account cannot open
- Keyboard navigation in the sidebar uses a registry of navigable rows instead of querying the DOM, and keeps the selected and current rows scrolled into view
- The follow control on a byline appears only when the account can act on it, and the name bolds as soon as follow is clicked
- Listing comment headers, the follow control and the account links were tidied; the account menu and its hotkeys derive from one table
- Lighthouse fixes: CLS on desktop drops from 0.434 to 0.111, the main chunk from 846kB to 269kB, and colour contrast, gallery alt text and the sort toggle's accessible name are fixed
- Client tests run in Node instead of a real browser (0.8s instead of 2.8s), and the vitest family moves to 5
- Dependency updates, including chalk 6, `@types/node` 26 and typescript-eslint 8.68; CI actions are pinned to commit SHAs and the deploy workflow runs on Node 24

### Fixed

- The service worker no longer reloads the page when it first takes control of it
- Sidebar rows now age out of their "new" state on a shared five-minute clock, including custom-feed and friend rows
- Custom-feed subreddits the account also subscribes to show the same activity state as their subscribed row
- The subreddits heading can be collapsed and reloaded from the keyboard, and the filter box has a real, accessible clear button
- Sidebar search results stay on screen while a new term loads, so the keyboard selection does not jump
- A failed listing shows its error alone instead of over the previous listing
- The header subscribe button no longer carries its state over to another subreddit, and updates when a subscription changes elsewhere
- `where: 'contributor'` listings request the right endpoint
- The api coverage thresholds are enforced again

### Removed

- The Gilded link in the account menu, since Reddit retired awards and the listing no longer loads
- The unused CodeBuild specs (`buildspec.yml`, `buildspec_deploy.yml`)

## [1.6.0] - 2026-08-14

### Added

- E2E coverage for the bounded-media behaviour: off-screen video pausing, the embed-mount band, and iframe release in a listing suspended behind the overlay

### Changed

- Off-screen videos no longer play or buffer: the `autoPlay` attribute is gated on visibility, `preload` is now set (it was absent entirely), and autoplay resumption is scoped to on-screen entries
- Embedded iframes mount within a narrow band around the viewport and are reclaimed once scrolled past, instead of staying mounted for the life of the listing
- A listing tree suspended behind the post-detail overlay no longer runs its scroll sweep, and its social embeds unmount along with its iframes while it is suspended
- Type-checking runs on TypeScript 7 (the Go rewrite) via a side-by-side install, with TypeScript 6 retained for type-aware ESLint
- Minor dependency updates
- Documented the upstream CORS limitation that prevents adding a subreddit to a custom feed

### Fixed

- Broken video sources surface the load-error message again regardless of the autoplay setting, and a failed source candidate no longer reports an error when a later fallback source plays
- Imgur `.gifv`/`.mp4` posts have a poster frame instead of painting black before metadata loads
- The infinite-scroll cache is bounded on the append path (it was capped only when streaming)
- `refreshTrigger` no longer gains a permanent entry per navigation; removed the unused `subredditsByLocation` state
- Stabilized E2E assertions against live content: overlay scroll preservation is measured on an anchor entry rather than raw `body.scrollTop`, hotkey popup navigation is polled, and the comment-count heuristic selects by icon instead of matching digits in an href
- Auth setup reuses a saved Reddit session instead of forcing a full credential login whenever the app token lapses

### Removed

- Unused web-vitals instrumentation

## [1.5.0] - 2026-07-14

### Added

- Post-detail overlay: opening a post's comments now renders above the listing instead of navigating away, preserving scroll position, autoloaded pages, and keyboard-navigation focus; Back closes the overlay in place
- Duplicates/cross-posts pages open in the same overlay
- Playwright E2E coverage for the overlay (desktop and mobile Pixel 7 projects)

### Changed

- Memoized the background route tree so navigation inside the overlay (comment sort, load-more) no longer re-renders the listing behind it
- Consolidated per-component logic into shared hooks (`useDetailNavState`, `useDocumentKeydown`, `useBodyScrollLock`)
- Single-sourced overlay route patterns and Sass layout variables
- Overhauled project documentation across all workspaces

### Fixed

- Live-stream polling stopping permanently after scrolling down the page
- Comment-sort link resolution on post detail pages

## [1.4.0] - 2026-07-05

### Added

- Playwright E2E test suite (anonymous and authenticated projects) with Vitest browser-mode component tests
- Reddit API batching, caching, and share-link optimizations

### Changed

- Upgraded build toolchain: Vite 8 (Rolldown bundler), TypeScript 6, React Router 8.1, ESLint 10 with `@eslint-react`
- Modernized React 19 patterns (Context as provider, title hoisting, error callbacks) and RTK 2.x slice selectors
- Replaced query-string with native URLSearchParams; dropped copy-to-clipboard for a shared `useCopyToClipboard` hook; upgraded react-tooltip to v6
- Removed dead CRA-era static HTML and cleaned up PWA assets

### Fixed

- Reddit cross-post embeds now resolve to i.redd.it media
- useEffect bugs, silent failures, and type-safety issues found across two verified code-review passes
- Flaky E2E tests stabilized with dynamic content discovery

## [1.3.1] - 2026-03-19

> Shipped as git tag `v1.3.0` (tagged 2026-03-19). The `v1.3.1` tag marks an
> intermediate commit inside this release, not its end, so this entry's compare
> link uses commit SHAs rather than tag names.

### Changed

- Replaced classnames with clsx and removed unused browserslist config
- Optimized Vite 7 build configuration
- Updated documentation for Node.js 24, Vite 7, and new API endpoints

### Fixed

- MeResponse type bug
- Error logging, guard clauses, and test gaps from code review

### Security

- Completed an internal security audit remediation across client, API, and proxy: fixed all critical and high-severity findings plus extensive proxy hardening (headers, timeouts, privilege handling)

## [1.3.0] - 2026-03-09

### Added

- Reddit share-link resolver API endpoint
- Sandbox permissions so links inside embedded iframes can open in new tabs

### Changed

- Upgraded Lambda runtime to Node.js 24 and major dependencies
- Optimized subreddit last-updated polling (stable selectors, ref-based effect deps, visibility-aware refresh)
- Simplified client and API code and consolidated shared patterns

### Fixed

- Initial poll timing, sync status labels, and ESM/import issues
- All outstanding TypeScript type errors and ESLint warnings

## [1.2.1] - 2025-12-13

### Changed

- Renamed PWA icons and consolidated loading assets
- Updated npm dependencies

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

[1.7.0]: https://github.com/jeffrigby/reacddit/compare/v1.6.0...v1.7.0
[1.6.0]: https://github.com/jeffrigby/reacddit/compare/v1.5.0...v1.6.0
[1.5.0]: https://github.com/jeffrigby/reacddit/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/jeffrigby/reacddit/compare/v1.3.0...v1.4.0
[1.3.1]: https://github.com/jeffrigby/reacddit/compare/97c778c07deb9c533f8affa9215554f6fac38efe...4e9cf5b16a2c40d3011101d891ec5caa6b24a488
[1.3.0]: https://github.com/jeffrigby/reacddit/compare/1.2.1...1.3.0
[1.2.1]: https://github.com/jeffrigby/reacddit/compare/release/1.2...1.2.1
[1.2.0]: https://github.com/jeffrigby/reacddit/compare/1.1.0...release/1.2
[1.1.0]: https://github.com/jeffrigby/reacddit/compare/1.0.7...1.1.0
[1.0.7]: https://github.com/jeffrigby/reacddit/compare/1.0.6...1.0.7
[1.0.6]: https://github.com/jeffrigby/reacddit/compare/1.0.5...1.0.6
[1.0.5]: https://github.com/jeffrigby/reacddit/compare/1.0.4...1.0.5
[1.0.4]: https://github.com/jeffrigby/reacddit/compare/1.0.2...1.0.4
[1.0.2]: https://github.com/jeffrigby/reacddit/compare/1.0.1...1.0.2
[1.0.1]: https://github.com/jeffrigby/reacddit/compare/1.0...1.0.1
[1.0.0]: https://github.com/jeffrigby/reacddit/releases/tag/1.0
