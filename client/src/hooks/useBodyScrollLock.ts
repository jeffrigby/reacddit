import { useLayoutEffect } from 'react';

/**
 * Lock body scrolling for the lifetime of the calling component.
 *
 * This app's scroll container is document.body itself (an element scroller;
 * window.scrollY is always 0), so a plain overflow:hidden reliably blocks
 * wheel AND touch scrolling on every platform - no position:fixed technique
 * is needed and body.scrollTop is preserved through the lock. The scrollbar
 * gap is measured on the BODY (window.innerWidth math computes 0 here) and
 * compensated with padding to avoid a layout shift on classic-scrollbar
 * platforms.
 */
export function useBodyScrollLock(): void {
  useLayoutEffect(() => {
    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const previousScrollTop = body.scrollTop;
    const scrollBarGap = body.offsetWidth - body.clientWidth;

    body.style.overflow = 'hidden';
    if (scrollBarGap > 0) {
      body.style.paddingRight = `${scrollBarGap}px`;
    }

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
      if (body.scrollTop !== previousScrollTop) {
        body.scrollTop = previousScrollTop;
      }
    };
  }, []);
}
