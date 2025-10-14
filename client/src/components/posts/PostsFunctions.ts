import isNil from 'lodash/isNil';

/**
 * Check if an element is a top-level entry (not a nested comment).
 * On comments pages, this filters out threaded replies with the comment-child class.
 * This ensures j/k navigation only moves between top-level items.
 */
function isTopLevelEntry(element: Element): boolean {
  return (
    element.classList.contains('entry') &&
    !element.classList.contains('comment-child')
  );
}

/**
 * Get the actual scrolling element
 * After Bootstrap 5 migration, body element has the scroll, not window
 */
function getScrollContainer(): Element {
  // Modern Bootstrap sets overflow on body, making it the scroll container
  const body = document.body;
  const html = document.documentElement;

  // Check if body is scrollable
  if (body.scrollHeight > body.clientHeight) {
    return body;
  }

  return html;
}

/**
 * Scroll to a specific position
 * Use this instead of window.scrollTo() after Bootstrap 5 migration
 */
export function scrollToPosition(x: number, y: number): void {
  const scrollContainer = getScrollContainer();
  scrollContainer.scrollLeft = x;
  scrollContainer.scrollTop = y;
}

/**
 * Scroll by a relative amount
 * Use this instead of window.scrollBy() after Bootstrap 5 migration
 */
export function scrollByAmount(x: number, y: number): void {
  const scrollContainer = getScrollContainer();
  scrollContainer.scrollLeft += x;
  scrollContainer.scrollTop += y;
}

/**
 * Navigate to the next top-level entry (skips nested comments).
 * This ensures j/k only navigate between top-level items, not threaded replies.
 */
export function nextEntry(focused: string | null): void {
  if (isNil(focused)) {
    return;
  }

  const current = document.getElementById(focused);
  if (isNil(current)) {
    return;
  }

  // Find the next top-level entry (skip comment-child elements)
  let next = current.nextElementSibling;
  while (next && !isTopLevelEntry(next)) {
    next = next.nextElementSibling;
  }

  if (next) {
    const scrollBy = next.getBoundingClientRect().top - 50;
    const scrollContainer = getScrollContainer();
    scrollContainer.scrollTop += scrollBy;
  }
  // No more entries - do nothing (removed "jump to bottom" behavior)
}

/**
 * Navigate to next top-level entry in collapsed view mode (skips nested comments).
 */
export function nextEntryCollapsed(
  lastExpanded: string | null,
  setLastExpanded: (id: string) => void
): string | null {
  // Open up the first top-level entry
  if (!lastExpanded) {
    const entries = Array.from(document.getElementsByClassName('entry'));
    const first = entries.find((entry) => isTopLevelEntry(entry));
    if (isNil(first)) {
      return null;
    }
    setLastExpanded(first.id);
    return first.id;
  }

  const current = document.getElementById(lastExpanded);
  if (isNil(current)) {
    return null;
  }

  // Find next top-level entry (skip comment-child elements)
  let next = current.nextElementSibling;
  while (next && !isTopLevelEntry(next)) {
    next = next.nextElementSibling;
  }

  if (next) {
    setLastExpanded(next.id);
    return next.id;
  }

  return null;
}

/**
 * Navigate to the previous top-level entry (skips nested comments).
 * This ensures j/k only navigate between top-level items, not threaded replies.
 */
export function prevEntry(focused: string | null): void {
  if (isNil(focused)) {
    return;
  }

  const current = document.getElementById(focused);
  if (isNil(current)) {
    return;
  }

  // Find the previous top-level entry (skip comment-child elements)
  let prev = current.previousElementSibling;
  while (prev && !isTopLevelEntry(prev)) {
    prev = prev.previousElementSibling;
  }

  if (prev) {
    const scrollBy = prev.getBoundingClientRect().top - 50;
    const scrollContainer = getScrollContainer();
    scrollContainer.scrollTop += scrollBy;
  }
  // No previous entry - do nothing
}

/**
 * Navigate to previous top-level entry in collapsed view mode (skips nested comments).
 */
export function prevEntryCollapsed(
  lastExpanded: string | null,
  setLastExpanded: (id: string) => void
): string | null {
  if (!lastExpanded) {
    return null;
  }

  const current = document.getElementById(lastExpanded);
  if (isNil(current)) {
    return null;
  }

  // Find previous top-level entry (skip comment-child elements)
  let prev = current.previousElementSibling;
  while (prev && !isTopLevelEntry(prev)) {
    prev = prev.previousElementSibling;
  }

  if (prev) {
    setLastExpanded(prev.id);
    return prev.id;
  }
  return null;
}

interface ListingState {
  focused: string;
  actionable: string | null;
}

/**
 * Get the current listing state.
 * Only considers top-level entries (skips nested comments with comment-child class).
 */
export function getCurrentListingState(
  currentState: ListingState | Record<string, never>,
  viewMode: string,
  lastExpanded: string | null
): ListingState | Record<string, never> {
  const postsCollection = document.getElementsByClassName('entry');
  if (postsCollection.length === 0) {
    return {};
  }

  // Filter to only top-level entries (skip nested comments)
  const posts = Array.from(postsCollection).filter((post) =>
    isTopLevelEntry(post)
  );

  let focused = '';
  let actionable: string | null = null;
  let prevPostId: string | null = null;

  if (viewMode === 'condensed' && lastExpanded) {
    actionable = lastExpanded;
    focused = lastExpanded;
  } else {
    posts.forEach((post) => {
      const { top, bottom } = post.getBoundingClientRect();

      // If it's not in the visible range skip it.
      if (bottom >= -250 && top - window.innerHeight <= 500) {
        if (!focused) {
          const focusTop = bottom - 55;
          if (focusTop > 0) {
            focused = post.id;
          }
        }

        if (!actionable) {
          const offset = 22;
          const actionTop = top - offset;
          if (actionTop > 0) {
            const inView = top - window.innerHeight <= -offset;
            actionable = inView ? post.id : prevPostId;
          }
        }
      }
      prevPostId = post.id;
    });
  }

  return {
    focused,
    actionable,
  };
}

export function unfocusIFrame(): void {
  // Check if iframe is focused. If it is, unfocus it so hotkeys work.
  if (document.activeElement?.tagName === 'IFRAME') {
    window.focus();
    (document.activeElement as HTMLElement).blur();
  }
}

export function autoPlayVideos(): void {
  const videoCollection = document.querySelectorAll<HTMLVideoElement>(
    'video:not(.manual-stop)'
  );
  if (videoCollection.length !== 0) {
    const videos = Array.from(videoCollection);
    videos.forEach((video) => {
      if (video.paused) {
        const playPromise = video.play();
        playPromise
          .then(() => {
            // auto play worked
          })
          .catch(() => {
            // Auto-play was prevented. Ignore the error.
          });
      }
    });
  }
}
