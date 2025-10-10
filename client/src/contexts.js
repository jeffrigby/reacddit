import {
  createContext,
  useContext,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';

// Posts
export const PostsContextData = createContext({});
export const PostsContextActionable = createContext({});
export const PostsContextVisible = createContext({});
export const PostsContextStatus = createContext({});
export const PostsContextContent = createContext({});

// Listings
export const ListingsContextLastExpanded = createContext({});

// Shared IntersectionObserver Context
export const IntersectionObserverContext = createContext(null);

/**
 * Provider that creates and manages shared IntersectionObserver instances.
 * Consolidates observers from individual posts into 2 shared observers total.
 */
export function IntersectionObserverProvider({ children }) {
  // Create two shared observers
  const loadObserverRef = useRef(null);
  const visibilityObserverRef = useRef(null);

  // Track callbacks for each element
  const loadCallbacksRef = useRef(new Map());
  const visibilityCallbacksRef = useRef(new Map());

  // Lazy initialization during render - ensures observers exist before children mount
  // This prevents a race condition where child posts try to observe before observers are created
  if (!loadObserverRef.current) {
    loadObserverRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const callback = loadCallbacksRef.current.get(entry.target);
          if (callback) {
            callback(entry.isIntersecting);
          }
        });
      },
      { threshold: 0, rootMargin: '250px 0px 500px 0px' }
    );
  }

  if (!visibilityObserverRef.current) {
    visibilityObserverRef.current = new IntersectionObserver(
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
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      loadObserverRef.current?.disconnect();
      visibilityObserverRef.current?.disconnect();
    };
  }, []);

  const observeForLoading = useCallback((element, callback) => {
    loadCallbacksRef.current.set(element, callback);
    loadObserverRef.current?.observe(element);

    return () => {
      loadCallbacksRef.current.delete(element);
      loadObserverRef.current?.unobserve(element);
    };
  }, []);

  const observeForVisibility = useCallback((element, callback) => {
    visibilityCallbacksRef.current.set(element, callback);
    visibilityObserverRef.current?.observe(element);

    return () => {
      visibilityCallbacksRef.current.delete(element);
      visibilityObserverRef.current?.unobserve(element);
    };
  }, []);

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
export function useIntersectionObservers() {
  const context = useContext(IntersectionObserverContext);
  if (!context) {
    throw new Error(
      'useIntersectionObservers must be used within IntersectionObserverProvider'
    );
  }
  return context;
}
