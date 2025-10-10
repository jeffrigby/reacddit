import isNil from 'lodash/isNil';

/**
 * Load the next entry in expanded view mode.
 */
export function nextEntry(focused: string | null): void {
  if (isNil(focused)) {
    return;
  }

  const current = document.getElementById(focused);
  if (isNil(current)) {
    return;
  }

  const next = current.nextElementSibling;

  if (next?.classList.contains('entry')) {
    const scrollBy = next.getBoundingClientRect().top - 50;
    window.scrollBy({ top: scrollBy, left: 0 });
  } else {
    window.scrollTo(0, document.body.scrollHeight);
  }
}

/**
 * Load the next entry when in collapsed view mode.
 */
export function nextEntryCollapsed(
  lastExpanded: string | null,
  setLastExpanded: (id: string) => void
): string | null {
  // Open up the first one.
  if (!lastExpanded) {
    const first = document.getElementsByClassName('entry')[0];
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

  const next = current.nextElementSibling;
  if (next?.classList.contains('entry')) {
    setLastExpanded(next.id);
    return next.id;
  }

  return null;
}

/**
 * Previous entry in expanded view mode.
 */
export function prevEntry(focused: string | null): void {
  if (isNil(focused)) {
    return;
  }

  const current = document.getElementById(focused);
  if (isNil(current)) {
    return;
  }

  const prev = current.previousElementSibling;
  // Is this the last one?
  if (isNil(prev) || !prev.classList.contains('entry')) {
    return;
  }

  const scrollBy = prev.getBoundingClientRect().top - 50;
  window.scrollBy({ top: scrollBy, left: 0 });
}

/**
 * Load the previous entry in collapsed view mode
 */
export function prevEntryCollapsed(
  lastExpanded: string | null,
  setLastExpanded: (id: string) => void
): string | null {
  // Open up the first one.
  if (!lastExpanded) {
    return null;
  }

  const current = document.getElementById(lastExpanded);
  if (isNil(current)) {
    return null;
  }

  const prev = current.previousElementSibling;
  if (prev?.classList.contains('entry')) {
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
  const posts = Array.from(postsCollection);
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
