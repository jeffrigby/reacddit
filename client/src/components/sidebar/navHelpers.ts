// Time thresholds in seconds
const SECONDS_IN_HOUR = 3600;
const SECONDS_IN_DAY = 24 * SECONDS_IN_HOUR;
const DEAD_THRESHOLD = (365 / 2) * SECONDS_IN_DAY; // 6 months
const STALE_THRESHOLD = (365 / 12) * SECONDS_IN_DAY; // 3 months
const TODAY_THRESHOLD = SECONDS_IN_DAY; // 1 day
const NEW_THRESHOLD = SECONDS_IN_HOUR / 2; // 30 minutes

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

    if (seconds >= DEAD_THRESHOLD) {
      classes.push('sub-dead');
    } else if (seconds >= STALE_THRESHOLD) {
      classes.push('sub-stale');
    } else if (seconds <= NEW_THRESHOLD) {
      classes.push('sub-new');
    } else if (seconds <= TODAY_THRESHOLD) {
      classes.push('sub-today');
    }
  }

  if (trigger) {
    classes.push('mark trigger');
  }

  return classes.join(' ');
}
