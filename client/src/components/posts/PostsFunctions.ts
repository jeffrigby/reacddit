import { getScrollViewport } from '@/common';

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
 * The listing container of the ACTIVE tree. Only the active tree renders
 * id="entries", so DOM queries never resolve into a suspended background
 * tree while the post-detail overlay is open.
 */
export function getActiveEntriesContainer(): Element {
  return document.getElementById('entries') ?? document.body;
}

/**
 * Find an entry element by its reddit fullname, scoped to the active tree.
 * Entry ids are duplicated across trees while the overlay is open, so a
 * global document.getElementById can resolve to the background copy. Try the
 * O(1) id lookup first (called from j/k keydown hot paths) and only fall back
 * to scanning the active container when the id resolved outside it.
 */
export function findEntry(name: string): HTMLElement | null {
  const container = getActiveEntriesContainer();
  const byId = document.getElementById(name);
  if (byId != null && container.contains(byId)) {
    return byId;
  }
  return container.querySelector<HTMLElement>(`[id="${CSS.escape(name)}"]`);
}

/**
 * Navigate to the next top-level entry (skips nested comments).
 * This ensures j/k only navigate between top-level items, not threaded replies.
 * Optimized to avoid forced reflows by batching layout reads.
 */
export function nextEntry(focused: string | null): void {
  if (focused == null) {
    return;
  }

  const current = findEntry(focused);
  if (current == null) {
    return;
  }

  // Find the next top-level entry (skip comment-child elements)
  let next = current.nextElementSibling;
  while (next && !isTopLevelEntry(next)) {
    next = next.nextElementSibling;
  }

  if (next) {
    // Batch layout read in requestAnimationFrame to avoid forced reflow
    requestAnimationFrame(() => {
      const { container, top } = getScrollViewport();
      const scrollBy = next.getBoundingClientRect().top - top - 50;
      container.scrollTop += scrollBy;
    });
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
    const entries = Array.from(
      getActiveEntriesContainer().getElementsByClassName('entry')
    );
    const first = entries.find((entry) => isTopLevelEntry(entry));
    if (first == null) {
      return null;
    }
    setLastExpanded(first.id);
    return first.id;
  }

  const current = findEntry(lastExpanded);
  if (current == null) {
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
 * Optimized to avoid forced reflows by batching layout reads.
 */
export function prevEntry(focused: string | null): void {
  if (focused == null) {
    return;
  }

  const current = findEntry(focused);
  if (current == null) {
    return;
  }

  // Find the previous top-level entry (skip comment-child elements)
  let prev = current.previousElementSibling;
  while (prev && !isTopLevelEntry(prev)) {
    prev = prev.previousElementSibling;
  }

  if (prev) {
    // Batch layout read in requestAnimationFrame to avoid forced reflow
    requestAnimationFrame(() => {
      const { container, top } = getScrollViewport();
      const scrollBy = prev.getBoundingClientRect().top - top - 50;
      container.scrollTop += scrollBy;
    });
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

  const current = findEntry(lastExpanded);
  if (current == null) {
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
 * All geometry is relative to the active scroll container's visible area so
 * the math works both for the body scroller and the post-detail overlay.
 */
export function getCurrentListingState(
  currentState: ListingState | Record<string, never>,
  viewMode: string,
  lastExpanded: string | null
): ListingState | Record<string, never> {
  const postsCollection =
    getActiveEntriesContainer().getElementsByClassName('entry');
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
    const { top: viewTop, height: viewHeight } = getScrollViewport();
    posts.forEach((post) => {
      const rect = post.getBoundingClientRect();
      const top = rect.top - viewTop;
      const bottom = rect.bottom - viewTop;

      // If it's not in the visible range skip it.
      if (bottom >= -250 && top - viewHeight <= 500) {
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
            const inView = top - viewHeight <= -offset;
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
  const videoCollection =
    getActiveEntriesContainer().querySelectorAll<HTMLVideoElement>(
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
