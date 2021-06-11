export function lastUpdatedDiff(lastUpdated) {
  const now = Math.floor(new Date().getTime() / 1000);
  return now - lastUpdated;
}

/**
 * Generate classnames for nav items
 * @param lastUpdated
 * @param trigger
 * @returns {string}
 */
export function getDiffClassName(lastUpdated, trigger) {
  const classes = [];
  if (lastUpdated > 0) {
    const seconds = lastUpdatedDiff(lastUpdated);
    const deadSecs = (365 / 2) * 24 * 3600; // 6 months
    const staleSecs = (365 / 12) * 24 * 3600; // 3 months
    const todaySecs = 24 * 3600; // 1 day
    const newSecs = 3600 / 2; // 30 minutes

    if (seconds >= deadSecs) {
      classes.push('sub-dead');
    } else if (seconds >= staleSecs) {
      classes.push('sub-stale');
    } else if (seconds <= newSecs) {
      classes.push('sub-new');
    } else if (seconds <= todaySecs) {
      classes.push('sub-today');
    }
  }

  if (trigger) {
    classes.push('mark trigger');
  }

  return classes.join(' ');
}
