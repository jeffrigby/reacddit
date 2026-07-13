/**
 * Helpers for the background-location overlay routing pattern: building and
 * validating the navigation state carried by post-detail (comments) links.
 */
import { matchPath } from 'react-router';
import type { Location } from 'react-router';
import type { BackgroundLocation, NavState } from '@/types/navigation';

const COMMENTS_PATTERNS = [
  '/r/:target/comments/:postName/:postTitle',
  '/r/:target/comments/:postName/:postTitle/:comment',
];

const DUPLICATES_PATTERN = '/duplicates/:target';

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
    isCommentsPath(pathname) || matchPath(DUPLICATES_PATTERN, pathname) != null
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
