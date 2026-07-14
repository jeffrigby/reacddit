# Reacddit E2E Tests

Playwright tests that run against LIVE Reddit through the local dev server.

## Hard constraints

- **Headed Chrome only** — Reddit blocks headless browsers on oauth.reddit.com;
  all projects pin `channel: 'chrome'` (branded Chrome, for proprietary codecs)
- **workers=1** — live-API tests must not hammer Reddit
- **`test-results/` is wiped on every invocation** — collect failure artifacts
  BEFORE re-running; run multiple projects in ONE invocation
- The dev server must already be running (the user starts it; see root CLAUDE.md)

## Writing tests

- Shared helpers live in `e2e/helpers.ts` (waitForPosts, loadMorePosts,
  openOverlay, expectEntriesPrefix, ...) — extend there, don't duplicate in specs
- **Infinite lists grow via autoload mid-test**: never assert exact entry counts
  or full-array equality — assert entry-ID PREFIX equality (`expectEntriesPrefix`)
- The app's scroll container is `document.body` (an element scroller):
  read/scroll via `document.body.scrollTop`, never `window.scrollY` (always 0)
- Live content varies: posts may have 0 comments (pick entries via the
  comment-count heuristic in `openOverlay`), and missing content should soft-pass
  with a `test.info().annotations` reason, not fail
- Mobile specs: name them `*.mobile.spec.ts` (run under the `mobile` project,
  Pixel 7 emulation); the `anonymous` project ignores them
