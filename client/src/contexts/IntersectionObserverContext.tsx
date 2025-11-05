import type { ReactNode } from 'react';
import {
  createContext,
  useContext,
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

  // Create observers synchronously before first render to avoid race conditions
  const loadObserverRef = useRef<IntersectionObserver>(
    new IntersectionObserver(
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
    )
  );

  const visibilityObserverRef = useRef<IntersectionObserver>(
    new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const callback = visibilityCallbacksRef.current.get(entry.target);
          if (callback) {
            callback(entry.isIntersecting);
          }
        });
      },
      { threshold: 0, rootMargin: '-50px 0px 0px 0px' }
    )
  );

  // Clean up observers on unmount
  useEffect(() => {
    const loadObserver = loadObserverRef.current;
    const visibilityObserver = visibilityObserverRef.current;

    // Add scroll listener to manually check elements that should load
    let scrollTimeout: NodeJS.Timeout;
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

    // Listen to scroll on body element (where scroll actually happens)
    document.body.addEventListener('scroll', handleScroll, { passive: true });
    // Also listen to window scroll as fallback for other scroll containers
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      loadObserver.disconnect();
      visibilityObserver.disconnect();
      document.body.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  const observeForLoading = useCallback(
    (element: Element, callback: ObserverCallback): (() => void) => {
      loadCallbacksRef.current.set(element, callback);
      loadObserverRef.current.observe(element);

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
        loadObserverRef.current.unobserve(element);
      };
    },
    []
  );

  const observeForVisibility = useCallback(
    (element: Element, callback: ObserverCallback): (() => void) => {
      visibilityCallbacksRef.current.set(element, callback);
      visibilityObserverRef.current.observe(element);

      return () => {
        visibilityCallbacksRef.current.delete(element);
        visibilityObserverRef.current.unobserve(element);
      };
    },
    []
  );

  const value = useMemo(
    () => ({
      observeForLoading,
      observeForVisibility,
    }),
    [observeForLoading, observeForVisibility]
  );

  return (
    <IntersectionObserverContext.Provider value={value}>
      {children}
    </IntersectionObserverContext.Provider>
  );
}

/**
 * Hook to access shared IntersectionObservers.
 * Must be used within IntersectionObserverProvider.
 */
export function useIntersectionObservers(): IntersectionObserverContextValue {
  const context = useContext(IntersectionObserverContext);
  if (!context) {
    throw new Error(
      'useIntersectionObservers must be used within IntersectionObserverProvider'
    );
  }
  return context;
}
