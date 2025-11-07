import { useEffect, useState, useRef } from 'react';

/**
 * Hook to detect active scrolling and prevent accidental clicks on touch devices.
 *
 * Returns `isScrolling` boolean that's true during active scrolling and for a short
 * period after scrolling stops (debounce delay).
 *
 * Best practice for:
 * - Preventing accidental clicks/taps during scroll gestures on mobile
 * - Improving scroll performance by disabling pointer events during scroll
 *
 * @see https://ryanseddon.com/css/pointer-events-60fps/
 */
export function useScrollClickPrevention(): boolean {
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    let rafId: number | null = null;
    let isScheduled = false;

    const handleScrollStart = (): void => {
      // Use RAF to batch updates and avoid layout thrashing
      if (!isScheduled) {
        isScheduled = true;
        rafId = requestAnimationFrame(() => {
          setIsScrolling(true);
          isScheduled = false;
        });
      }

      // Clear any existing timeout
      if (scrollTimeoutRef.current !== null) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Set new timeout to detect scroll end
      scrollTimeoutRef.current = window.setTimeout(() => {
        setIsScrolling(false);
        scrollTimeoutRef.current = null;
      }, 150); // 150ms after scroll stops
    };

    // Throttle scroll events to improve performance
    let throttleTimeout: number | null = null;
    const throttledScroll = (): void => {
      if (throttleTimeout === null) {
        handleScrollStart();
        throttleTimeout = window.setTimeout(() => {
          throttleTimeout = null;
        }, 50); // Check every 50ms during scroll
      }
    };

    // Listen to scroll events (passive for better performance)
    window.addEventListener('scroll', throttledScroll, { passive: true });
    document.body.addEventListener('scroll', throttledScroll, {
      passive: true,
    });

    // Cleanup
    return () => {
      window.removeEventListener('scroll', throttledScroll);
      document.body.removeEventListener('scroll', throttledScroll);

      if (scrollTimeoutRef.current !== null) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (throttleTimeout !== null) {
        clearTimeout(throttleTimeout);
      }
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return isScrolling;
}
