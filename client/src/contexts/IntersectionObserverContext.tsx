import type { ReactNode } from 'react';
import {
  createContext,
  use,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';

type ObserverCallback = (isIntersecting: boolean) => void;

interface IntersectionObserverContextValue {
  observeForLoading: (
    element: Element,
    callback: ObserverCallback
  ) => () => void;
  observeForVisibility: (
    element: Element,
    callback: ObserverCallback
  ) => () => void;
  observeForMediaControl: (
    element: Element,
    callback: ObserverCallback
  ) => () => void;
}

export const IntersectionObserverContext =
  createContext<IntersectionObserverContextValue | null>(null);

interface IntersectionObserverProviderProps {
  children: ReactNode;
}

/**
 * Provider that creates and manages shared IntersectionObserver instances.
 * Consolidates observers from individual posts into 2 shared observers total.
 */
export function IntersectionObserverProvider({
  children,
}: IntersectionObserverProviderProps) {
  const loadCallbacksRef = useRef<Map<Element, ObserverCallback>>(new Map());
  const visibilityCallbacksRef = useRef<Map<Element, ObserverCallback>>(
    new Map()
  );
  const mediaControlCallbacksRef = useRef<Map<Element, ObserverCallback>>(
    new Map()
  );

  // Observers are created lazily on first observe (from a consumer's committed
  // effect), never during render. This keeps render pure and prevents a
  // discarded render (concurrent/Suspense/StrictMode) from leaving an orphan
  // observer the unmount cleanup never disconnects.
  const loadObserverRef = useRef<IntersectionObserver | null>(null);
  const getOrCreateLoadObserver = useCallback((): IntersectionObserver => {
    loadObserverRef.current ??= new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const callback = loadCallbacksRef.current.get(entry.target);
          if (callback) {
            callback(entry.isIntersecting);
          }
        });
      },
      {
        root: null,
        rootMargin: '500px 0px 2000px 0px',
        threshold: 0,
      }
    );
    return loadObserverRef.current;
  }, []);

  const visibilityObserverRef = useRef<IntersectionObserver | null>(null);
  const getOrCreateVisibilityObserver =
    useCallback((): IntersectionObserver => {
      visibilityObserverRef.current ??= new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const callback = visibilityCallbacksRef.current.get(entry.target);
            if (callback) {
              callback(entry.isIntersecting);
            }
          });
        },
        { threshold: 0, rootMargin: '-50px 0px 0px 0px' }
      );
      return visibilityObserverRef.current;
    }, []);

  // Media control observer - checks if element is FULLY off-screen (both top and bottom edges)
  const mediaControlObserverRef = useRef<IntersectionObserver | null>(null);
  const getOrCreateMediaControlObserver =
    useCallback((): IntersectionObserver => {
      mediaControlObserverRef.current ??= new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const callback = mediaControlCallbacksRef.current.get(entry.target);
            if (callback) {
              const rect = entry.boundingClientRect;
              const viewportHeight = window.innerHeight;

              // Element is fully off-screen if:
              // - Bottom edge is above viewport (scrolled past)
              // - Top edge is below viewport (not yet scrolled to)
              const isFullyOffScreen =
                rect.bottom < 0 || rect.top > viewportHeight;

              // Callback receives true when FULLY off-screen, false when any part is visible
              callback(isFullyOffScreen);
            }
          });
        },
        { threshold: 0 }
      );
      return mediaControlObserverRef.current;
    }, []);

  // Clean up observers on unmount
  useEffect(() => {
    // Add scroll listener to manually check elements that should load
    let scrollTimeout: ReturnType<typeof setTimeout>;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const viewportHeight = window.innerHeight;
        const loadMarginBottom = 2000;
        const threshold = viewportHeight + loadMarginBottom;

        // Check all registered elements
        loadCallbacksRef.current.forEach((callback, element) => {
          const rect = element.getBoundingClientRect();
          const shouldLoad = rect.top < threshold && rect.bottom > -500;

          // Only call if not already loaded (check for 'loaded' class)
          if (shouldLoad && !element.classList.contains('loaded')) {
            callback(true);
          }
        });
      }, 100);
    };

    // One capture-phase document listener sees scrolls from ANY container
    // (body scroller, post-detail overlay) since scroll events don't bubble
    document.addEventListener('scroll', handleScroll, {
      passive: true,
      capture: true,
    });

    return () => {
      loadObserverRef.current?.disconnect();
      visibilityObserverRef.current?.disconnect();
      mediaControlObserverRef.current?.disconnect();
      document.removeEventListener('scroll', handleScroll, { capture: true });
      clearTimeout(scrollTimeout);
    };
  }, []);

  const observeForLoading = useCallback(
    (element: Element, callback: ObserverCallback): (() => void) => {
      loadCallbacksRef.current.set(element, callback);
      getOrCreateLoadObserver().observe(element);

      // Check if element is already intersecting and call callback immediately
      // IntersectionObserver only fires on state changes, so we need to manually
      // trigger for elements already in the intersection zone
      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const loadMarginTop = 500;
      const loadMarginBottom = 2000;

      const isAlreadyIntersecting =
        rect.top < viewportHeight + loadMarginBottom &&
        rect.bottom > -loadMarginTop;

      if (isAlreadyIntersecting) {
        callback(true);
      }

      return () => {
        loadCallbacksRef.current.delete(element);
        loadObserverRef.current?.unobserve(element);
      };
    },
    [getOrCreateLoadObserver]
  );

  const observeForVisibility = useCallback(
    (element: Element, callback: ObserverCallback): (() => void) => {
      visibilityCallbacksRef.current.set(element, callback);
      getOrCreateVisibilityObserver().observe(element);

      return () => {
        visibilityCallbacksRef.current.delete(element);
        visibilityObserverRef.current?.unobserve(element);
      };
    },
    [getOrCreateVisibilityObserver]
  );

  const observeForMediaControl = useCallback(
    (element: Element, callback: ObserverCallback): (() => void) => {
      mediaControlCallbacksRef.current.set(element, callback);
      getOrCreateMediaControlObserver().observe(element);

      // Check initial state - if element is already fully off-screen, call callback immediately
      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const isFullyOffScreen = rect.bottom < 0 || rect.top > viewportHeight;

      if (isFullyOffScreen) {
        callback(true);
      }

      return () => {
        mediaControlCallbacksRef.current.delete(element);
        mediaControlObserverRef.current?.unobserve(element);
      };
    },
    [getOrCreateMediaControlObserver]
  );

  const value = useMemo(
    () => ({
      observeForLoading,
      observeForVisibility,
      observeForMediaControl,
    }),
    [observeForLoading, observeForVisibility, observeForMediaControl]
  );

  return (
    <IntersectionObserverContext value={value}>
      {children}
    </IntersectionObserverContext>
  );
}

/**
 * Hook to access shared IntersectionObservers.
 * Must be used within IntersectionObserverProvider.
 */
export function useIntersectionObservers(): IntersectionObserverContextValue {
  const context = use(IntersectionObserverContext);
  if (!context) {
    throw new Error(
      'useIntersectionObservers must be used within IntersectionObserverProvider'
    );
  }
  return context;
}
