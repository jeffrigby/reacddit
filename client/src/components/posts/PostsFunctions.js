import isNil from 'lodash/isNil';

/**
 * Load the next entry in expanded view mode.
 * @param focused
 */
export const nextEntry = (focused) => {
  if (isNil(focused)) return;

  const current = document.getElementById(focused);
  if (isNil(current)) return;

  const next = current.nextElementSibling;

  if (next.classList.contains('entry')) {
    const scrollBy = next.getBoundingClientRect().top - 50;
    window.scrollBy({ top: scrollBy, left: 0 });
  } else {
    window.scrollTo(0, document.body.scrollHeight);
  }
};

/**
 * Load the next entry when in collapsed view mode.
 * @param lastExpanded
 * @param setLastExpanded
 * @returns {string|null|*}
 */
export const nextEntryCollapsed = (lastExpanded, setLastExpanded) => {
  // Open up the first one.
  if (!lastExpanded) {
    const first = document.getElementsByClassName('entry')[0];
    // console.log(first);
    if (isNil(first)) return null;
    setLastExpanded(first.id);
    return first.id;
  }

  const current = document.getElementById(lastExpanded);
  if (isNil(current)) return null;

  const next = current.nextElementSibling;
  if (next.classList.contains('entry')) {
    setLastExpanded(next.id);
    return next.id;
  }

  return null;
};

/**
 * Previous entry in expanded view mode.
 * @param focused
 */
export const prevEntry = (focused) => {
  if (isNil(focused)) return;

  const current = document.getElementById(focused);
  if (isNil(current)) return;

  const prev = current.previousElementSibling;
  // Is this the last one?
  if (isNil(prev) || !prev.classList.contains('entry')) return;

  const scrollBy = prev.getBoundingClientRect().top - 50;
  window.scrollBy({ top: scrollBy, left: 0 });
};

/**
 * Load the previous entry in collapsed view mode
 * @param lastExpanded
 * @param setLastExpanded
 * @returns {string|null}
 */
export const prevEntryCollapsed = (lastExpanded, setLastExpanded) => {
  // Open up the first one.
  if (!lastExpanded) {
    return null;
  }

  const current = document.getElementById(lastExpanded);
  if (isNil(current)) return null;

  const prev = current.previousElementSibling;
  if (prev.classList.contains('entry')) {
    setLastExpanded(prev.id);
    return prev.id;
  }
  return null;
};

/**
 * Get the current listing state.
 * @param currentState
 * @param viewMode
 * @param lastExpanded
 * @returns {{actionable: null, focused: string}|{}}
 */
export const getCurrentListingState = (
  currentState,
  viewMode,
  lastExpanded
) => {
  const postsCollection = document.getElementsByClassName('entry');
  if (postsCollection.length === 0) return {};
  const posts = Array.from(postsCollection);
  let focused = '';
  let actionable = null;
  // const minHeights = {};
  // const visible = [];
  let prevPostId = null;

  if (viewMode === 'condensed' && lastExpanded) {
    actionable = lastExpanded;
    focused = lastExpanded;
  } else {
    posts.forEach((post) => {
      // const { top, bottom, height } = post.getBoundingClientRect();
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
        // visible.push(post.id);
      }
      prevPostId = post.id;
    });
  }

  return {
    focused,
    // visible,
    actionable,
  };
};

export const unfocusIFrame = () => {
  // Check if iframe is focused. If it is, unfocus it so hotkeys work.
  if (document.activeElement.tagName === 'IFRAME') {
    // setTimeout(() => {
    window.focus();
    document.activeElement.blur();
    // }, 1000);
  }
};

export const autoPlayVideos = () => {
  const videoCollection = document.querySelectorAll('video:not(.manual-stop)');
  if (videoCollection.length !== 0) {
    const videos = Array.from(videoCollection);
    videos.forEach((video) => {
      if (video.paused) {
        const playPromise = video.play();
        playPromise
          .then((_) => {
            // auto play worked
          })
          .catch((error) => {
            // Auto-play was prevented. Ignore the error.
          });
      }
    });
  }
};
