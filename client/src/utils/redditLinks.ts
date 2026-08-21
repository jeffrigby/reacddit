/**
 * Resolving reddit.com hrefs found in user-authored HTML (comment bodies and
 * self-post text) to paths this app can render itself.
 *
 * Reddit's markdown renderer emits most of these as host-relative hrefs
 * (`/r/pics`, `/u/spez`) but leaves pasted absolute URLs alone, so both forms
 * have to be handled. Anything that does not map onto a route in
 * `navigationState`'s pattern lists stays an external link — rewriting an href
 * the router cannot match would turn a working outbound link into a 404.
 */
import { createPath, matchPath } from 'react-router';
import { ROUTES } from './navigationState';
import type { RouteConfig } from './navigationState';

/**
 * Hosts that serve the same content as www.reddit.com. `sh.reddit.com` is the
 * share host and `amp.` the (retired but still linked) AMP mirror; both keep
 * the standard path layout.
 */
const REDDIT_HOST_RE =
  /^https?:\/\/(?:www\.|old\.|new\.|np\.|sh\.|amp\.|m\.|i\.)?reddit\.com(?:\/|$)/i;

/** Base used to parse host-relative hrefs; the origin itself is discarded. */
const RELATIVE_BASE = 'https://www.reddit.com';

type Validations = RouteConfig['validations'];

// Canonical Reddit share-link pattern. MUST stay in sync with the server's
// SHARE_LINK_REGEX in api/src/app.ts (HTTPS-only, anchored, reddit.com host).
// Links that don't match this exactly are rejected by the resolver server, so
// the client must use the identical pattern to decide what to batch/resolve.
export const SHARE_LINK_PATTERN =
  /^https:\/\/(www\.)?reddit\.com\/r\/[a-zA-Z0-9_]+\/s\/[a-zA-Z0-9]+\/?$/;

/**
 * Every (pattern, param allowlists) pair a reddit link may resolve to, derived
 * from the routes marked `linkable` in the shared route table. Deriving rather
 * than restating means a route that is renamed or removed cannot leave this
 * rewriting links onto a path the router no longer serves.
 */
const LINKABLE_PATTERNS: [pattern: string, validations: Validations][] =
  ROUTES.filter((route) => route.linkable).flatMap((route) =>
    route.paths.map((pattern): [string, Validations] => [
      pattern,
      route.validations,
    ])
  );

/**
 * Does `pathname` match a linkable route, with every constrained param inside
 * its allowlist? A pattern's `validations` may name params the pattern itself
 * does not take (the table shares one set across a route's paths), so only
 * params actually present in the match are checked.
 */
function isLinkablePath(pathname: string): boolean {
  return LINKABLE_PATTERNS.some(([pattern, validations]) => {
    const match = matchPath(pattern, pathname);
    if (!match) {
      return false;
    }
    return Object.entries(validations).every(([param, allowed]) => {
      const value = match.params[param];
      if (value === undefined) {
        return true;
      }
      return typeof allowed === 'string'
        ? value === allowed
        : (allowed?.includes(value) ?? true);
    });
  });
}

/**
 * Rewrite reddit's user-profile spellings onto the single form the router
 * knows: `/u/<name>` is an alias of `/user/<name>`, and a bare profile has no
 * route of its own, so it resolves to the profile's overview listing.
 */
function normalizeUserPath(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments[0] === 'u') {
    segments[0] = 'user';
  }
  if (segments[0] !== 'user') {
    return pathname;
  }
  if (segments.length === 2) {
    segments.push('overview');
  }
  return `/${segments.join('/')}`;
}

/**
 * The app path for a reddit href, or null when the link must stay external.
 *
 * Accepts host-relative hrefs and absolute URLs on any reddit host. Returns
 * null for everything the app has no route for — other domains, `/s/` share
 * links (which need a server round trip to resolve), `/message/compose`,
 * wikis, and so on.
 */
export function getInternalRedditPath(href: string): string | null {
  let url: URL;
  try {
    // Exclude protocol-relative hrefs ('//host/...') — they point at another
    // host, not a reddit-relative path.
    if (href.startsWith('/') && !href.startsWith('//')) {
      url = new URL(href, RELATIVE_BASE);
    } else if (REDDIT_HOST_RE.test(href)) {
      url = new URL(href);
    } else {
      return null;
    }
  } catch {
    return null;
  }

  const pathname = normalizeUserPath(url.pathname);

  if (!isLinkablePath(pathname)) {
    return null;
  }

  return createPath({ pathname, search: url.search, hash: url.hash });
}

/**
 * Is this href a reddit mobile share link (`/r/<sub>/s/<code>`)?
 *
 * These carry no post id of their own — the id only appears in the redirect
 * they point at — so they can only be turned into an in-app path after
 * `resolveSharePermalinks` has resolved them server-side.
 */
export function isShareHref(href: string): boolean {
  return SHARE_LINK_PATTERN.test(href);
}
