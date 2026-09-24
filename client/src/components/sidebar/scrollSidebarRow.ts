import scrollIntoView from 'scroll-into-view-if-needed';

/**
 * Bring a sidebar row into view by scrolling #aside-content only, and only
 * as far as needed. The boundary keeps the page's own scroll container, the
 * body, from moving.
 */
export function scrollSidebarRowIntoView(row: Element): void {
  const boundary = document.getElementById('aside-content');
  if (!boundary) {
    return;
  }
  scrollIntoView(row, { scrollMode: 'if-needed', block: 'nearest', boundary });
}
