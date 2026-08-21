/**
 * Helpers for the background-location overlay routing pattern: building and
 * validating the navigation state carried by post-detail (comments) links.
 *
 * Also the single source of truth for the app's route patterns and their
 * parameter allowlists: RedditRoutes builds its <Route> tree from these, and
 * redditLinks resolves reddit.com hrefs against the same values, so a link can
 * never be rewritten to a path the router would 404 on.
 */
import { matchPath } from 'react-router';
import type { Location } from 'react-router';
import type { BackgroundLocation, NavState } from '@/types/navigation';

/**
 * Route patterns for the post-detail pages. These are the single source of
 * truth: RedditRoutes builds its comments/duplicates route configs from them,
 * so the overlay <Routes> can always render every path isOverlayPath accepts.
 */
export const COMMENTS_PATTERNS = [
  '/r/:target/comments/:postName/:postTitle',
  '/r/:target/comments/:postName/:postTitle/:comment',
];

export const DUPLICATES_PATTERNS = ['/duplicates/:target'];

/** Sorts accepted by the subreddit and multireddit listing routes. */
export const REDDIT_SORTS = [
  'hot',
  'new',
  'top',
  'controversial',
  'rising',
  'best',
];

/** Sorts accepted by the user listing routes. */
export const USER_SORTS = ['hot', 'new', 'top', 'controversial'];

/** The `:target` values the user listing routes accept. */
export const USER_TARGETS = [
  'upvoted',
  'downvoted',
  'posts',
  'comments',
  'overview',
  'submitted',
  'saved',
  'hidden',
  'gilded',
];

/**
 * One listing route: the path patterns that render it, the props the listing
 * gets, and the allowlists its params must satisfy.
 */
export interface RouteConfig {
  paths: string[];
  overrides: {
    listType: string;
    multi?: boolean;
    user?: string;
  };
  validations: {
    sort?: string[];
    target?: string[];
    user?: string;
  };
  /**
   * May a reddit link inside user-authored text resolve to this route?
   *
   * False for routes that only make sense from inside the app (`/me/...`,
   * search, the bare `/` feed): reddit never links to them, and rewriting an
   * href onto one would replace a working outbound link with a 404.
   */
  linkable?: boolean;
}

/**
 * Every listing route in the app. RedditRoutes builds its <Route> tree from
 * this, and getInternalRedditPath matches in-body reddit links against the
 * `linkable` subset — so a link can never be rewritten onto a path the router
 * would 404 on.
 */
export const ROUTES: RouteConfig[] = [
  // Reddit Paths
  {
    paths: ['/', '/:sort'],
    overrides: {
      listType: 'r',
    },
    validations: {
      sort: REDDIT_SORTS,
    },
  },
  {
    paths: ['/r/:target', '/r/:target/:sort'],
    overrides: {
      listType: 'r',
    },
    validations: {
      sort: REDDIT_SORTS,
    },
    linkable: true,
  },
  // Search Paths
  {
    paths: ['/search', '/r/:target/search'],
    overrides: {
      listType: 'search',
    },
    validations: {},
  },
  {
    paths: ['/user/:target/m/:userType/search', '/:user/m/:target/search'],
    overrides: {
      multi: true,
      listType: 's',
    },
    validations: {
      user: 'me',
    },
  },
  // Multis
  {
    paths: [`/user/:user/m/:target`, `/user/:user/m/:target/:sort`],
    overrides: {
      listType: 'm',
    },
    validations: {
      sort: REDDIT_SORTS,
    },
    linkable: true,
  },
  {
    paths: [`/me/m/:target`, `/me/m/:target/:sort`],
    overrides: {
      listType: 'm',
      user: 'me',
    },
    validations: {
      sort: REDDIT_SORTS,
    },
  },
  {
    paths: [`/user/:user/:target`, `/user/:user/:target/:sort`],
    overrides: {
      listType: 'user',
    },
    validations: {
      sort: USER_SORTS,
      target: USER_TARGETS,
    },
    linkable: true,
  },
  // Duplicates (paths shared with isOverlayPath via navigationState)
  {
    paths: DUPLICATES_PATTERNS,
    overrides: {
      listType: 'duplicates',
    },
    validations: {},
    linkable: true,
  },
  // Comments (paths shared with isCommentsPath/isOverlayPath via navigationState)
  {
    paths: COMMENTS_PATTERNS,
    overrides: {
      listType: 'comments',
    },
    validations: {},
    linkable: true,
  },
];

/**
 * Does the pathname match one of the post-detail (comments) route patterns?
 */
export function isCommentsPath(pathname: string): boolean {
  return COMMENTS_PATTERNS.some(
    (pattern) => matchPath(pattern, pathname) != null
  );
}

/**
 * Does the pathname match any route rendered inside the post-detail overlay
 * (comments or duplicates/cross-posts)?
 */
export function isOverlayPath(pathname: string): boolean {
  return (
    isCommentsPath(pathname) ||
    DUPLICATES_PATTERNS.some((pattern) => matchPath(pattern, pathname) != null)
  );
}

/**
 * Extract a validated BackgroundLocation from a location's navigation state.
 * Returns null when the state is absent or malformed (history.state can
 * contain anything).
 */
export function getBackgroundLocation(
  location: Location
): BackgroundLocation | null {
  const state: unknown = location.state;
  if (state == null || typeof state !== 'object') {
    return null;
  }

  const background = (state as NavState).backgroundLocation;
  if (background == null || typeof background !== 'object') {
    return null;
  }

  if (
    typeof background.pathname !== 'string' ||
    typeof background.search !== 'string' ||
    typeof background.hash !== 'string' ||
    typeof background.key !== 'string'
  ) {
    return null;
  }

  return background;
}

function snapshotLocation(location: Location): BackgroundLocation {
  return {
    pathname: location.pathname,
    search: location.search,
    hash: location.hash,
    key: location.key,
    state: location.state as unknown,
  };
}

/**
 * Build the navigation state for a post-detail (comments) link.
 *
 * When the overlay is already open for the current render, the ORIGINAL
 * background is carried forward so a post -> post chain keeps the same list
 * behind it and Back walks the chain one step at a time. Otherwise the
 * current location is snapshotted (on a standalone comments page the comments
 * page itself becomes the background).
 */
export function buildDetailNavState(
  location: Location,
  overlayOpen: boolean
): NavState {
  const existing = overlayOpen ? getBackgroundLocation(location) : null;
  return {
    showBack: true,
    backgroundLocation: existing ?? snapshotLocation(location),
  };
}
