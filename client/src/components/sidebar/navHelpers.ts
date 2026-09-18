/**
 * Navigation helper utilities for sidebar components
 * Includes time-based CSS class generation and URL building utilities
 */

import { trimSlashes } from '@/common';

// Time thresholds in seconds
const SECONDS_IN_HOUR = 3600;
const SECONDS_IN_DAY = 24 * SECONDS_IN_HOUR;
const DEAD_THRESHOLD = (365 / 2) * SECONDS_IN_DAY; // 6 months
const STALE_THRESHOLD = (365 / 12) * SECONDS_IN_DAY; // 3 months
const TODAY_THRESHOLD = SECONDS_IN_DAY; // 1 day
const NEW_THRESHOLD = SECONDS_IN_HOUR / 2; // 30 minutes

/**
 * Calculate the difference between a reference time and last updated time
 * @param lastUpdated - Timestamp of last update in seconds
 * @param nowMs - Reference time in milliseconds
 * @returns Difference in seconds
 */
function lastUpdatedDiff(lastUpdated: number, nowMs: number): number {
  const now = Math.floor(nowMs / 1000);
  return now - lastUpdated;
}

/** Classes marking the nav item the filter box opens on Enter */
export const TRIGGER_CLASS = 'mark trigger';

/**
 * Generate classnames for nav items based on last update time
 *
 * The thresholds are measured against `nowMs`, so a caller that re-renders on a
 * shared clock passes that reading in and every row ages against the same value.
 *
 * @param lastUpdated - Timestamp of last update in seconds
 * @param trigger - Whether to add trigger class
 * @param nowMs - Reference time in milliseconds, defaulting to the current time
 * @returns CSS class string
 */
export function getDiffClassName(
  lastUpdated: number,
  trigger: boolean,
  nowMs: number = Date.now()
): string {
  const classes: string[] = [];

  if (lastUpdated > 0) {
    const seconds = lastUpdatedDiff(lastUpdated, nowMs);

    // Check in order from most recent to oldest
    if (seconds <= NEW_THRESHOLD) {
      classes.push('sub-new');
    } else if (seconds <= TODAY_THRESHOLD) {
      classes.push('sub-today');
    } else if (seconds >= DEAD_THRESHOLD) {
      classes.push('sub-dead');
    } else if (seconds >= STALE_THRESHOLD) {
      classes.push('sub-stale');
    }
  }

  if (trigger) {
    classes.push(TRIGGER_CLASS);
  }

  return classes.join(' ');
}

/**
 * Builds a URL query string for sorts that support time filters
 * @param sort - The current sort value
 * @param timeFilter - The time filter (t parameter)
 * @returns Query string with time filter if applicable, empty string otherwise
 */
function buildSortQueryString(
  sort: string | null | undefined,
  timeFilter: string | string[] | undefined
): string {
  if (!sort) {
    return '';
  }

  const isTimeSensitiveSort = sort === 'top' || sort === 'controversial';

  if (isTimeSensitiveSort && timeFilter && typeof timeFilter === 'string') {
    return `?t=${timeFilter}`;
  }

  return '';
}

/**
 * Normalizes sort parameter for URL construction
 * Removes certain sort types that shouldn't appear in URLs
 * @param sort - The sort parameter to normalize
 * @returns Normalized sort string, or empty string if sort should be omitted
 */
function normalizeSortForUrl(sort: string | null | undefined): string {
  if (!sort) {
    return '';
  }

  // These sorts should not appear in the URL
  const excludedSorts = ['relevance', 'best', 'comments'];
  if (excludedSorts.includes(sort)) {
    return '';
  }

  return sort;
}

/**
 * Builds the complete sort path segment for a URL
 * @param sort - The sort parameter
 * @param timeFilter - The time filter (t parameter)
 * @returns Complete sort path with query string if applicable
 */
export function buildSortPath(
  sort: string | null | undefined,
  timeFilter: string | string[] | undefined
): string {
  const normalizedSort = normalizeSortForUrl(sort);

  if (!normalizedSort) {
    return '';
  }

  const queryString = buildSortQueryString(sort, timeFilter);
  return normalizedSort + queryString;
}

/**
 * Builds the path a sidebar subreddit link points at.
 *
 * The returned string carries any query string from the sort path and never
 * ends in a slash, matching the href the anchor renders.
 *
 * @param path - Subreddit path, with or without surrounding slashes (`/r/pics/`)
 * @param sortPath - Sort segment from buildSortPath
 * @param isUserProfile - Whether the destination is a user profile's post list
 * @returns Absolute path for the link
 */
export function buildSubredditHref(
  path: string,
  sortPath: string,
  isUserProfile = false
): string {
  const base = trimSlashes(path.trim());
  const prefix = isUserProfile ? `${base}/posts` : base;
  const sort = trimSlashes(sortPath.trim());
  return sort ? `/${prefix}/${sort}` : `/${prefix}`;
}
