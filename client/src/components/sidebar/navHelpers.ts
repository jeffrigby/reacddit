/**
 * Navigation helper utilities for sidebar components
 * Includes time-based CSS class generation and URL building utilities
 */

// Time thresholds in seconds
const SECONDS_IN_HOUR = 3600;
const SECONDS_IN_DAY = 24 * SECONDS_IN_HOUR;
const DEAD_THRESHOLD = (365 / 2) * SECONDS_IN_DAY; // 6 months
const STALE_THRESHOLD = (365 / 12) * SECONDS_IN_DAY; // 3 months
const TODAY_THRESHOLD = SECONDS_IN_DAY; // 1 day
const NEW_THRESHOLD = SECONDS_IN_HOUR / 2; // 30 minutes

/**
 * Calculate the difference between current time and last updated time
 * @param lastUpdated - Timestamp of last update in seconds
 * @returns Difference in seconds
 */
export function lastUpdatedDiff(lastUpdated: number): number {
  const now = Math.floor(Date.now() / 1000);
  return now - lastUpdated;
}

/**
 * Generate classnames for nav items based on last update time
 * @param lastUpdated - Timestamp of last update in seconds
 * @param trigger - Whether to add trigger class
 * @returns CSS class string
 */
export function getDiffClassName(
  lastUpdated: number,
  trigger: boolean
): string {
  const classes: string[] = [];

  if (lastUpdated > 0) {
    const seconds = lastUpdatedDiff(lastUpdated);

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
    classes.push('mark trigger');
  }

  return classes.join(' ');
}

/**
 * Builds a URL query string for sorts that support time filters
 * @param sort - The current sort value
 * @param timeFilter - The time filter (t parameter)
 * @returns Query string with time filter if applicable, empty string otherwise
 */
export function buildSortQueryString(
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
export function normalizeSortForUrl(sort: string | null | undefined): string {
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
