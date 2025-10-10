import type { ReactNode } from 'react';
import {
  createContext,
  useContext,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import type { LinkData, CommentData } from './types/redditApi';

// Post context data interface
export interface PostContextData {
  post: {
    data: LinkData | CommentData;
    kind: string;
  };
  isLoaded: boolean;
  actionable: boolean;
}

// Posts contexts
export const PostsContextData = createContext<PostContextData | object>({});
export const PostsContextActionable = createContext<boolean | object>({});
export const PostsContextVisible = createContext<boolean | object>({});
export const PostsContextStatus = createContext<string | object>({});
export const PostsContextContent = createContext<PostContextData | object>({});

// Listings contexts
export const ListingsContextLastExpanded = createContext<
  [string, (value: string) => void] | object
>({});

// IntersectionObserver context types
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
  // Create two shared observers
  const loadObserverRef = useRef<IntersectionObserver | null>(null);
  const visibilityObserverRef = useRef<IntersectionObserver | null>(null);

  // Track callbacks for each element
  const loadCallbacksRef = useRef<Map<Element, ObserverCallback>>(new Map());
  const visibilityCallbacksRef = useRef<Map<Element, ObserverCallback>>(
    new Map()
  );

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

  const observeForLoading = useCallback(
    (element: Element, callback: ObserverCallback): (() => void) => {
      loadCallbacksRef.current.set(element, callback);
      loadObserverRef.current?.observe(element);

      return () => {
        loadCallbacksRef.current.delete(element);
        loadObserverRef.current?.unobserve(element);
      };
    },
    []
  );

  const observeForVisibility = useCallback(
    (element: Element, callback: ObserverCallback): (() => void) => {
      visibilityCallbacksRef.current.set(element, callback);
      visibilityObserverRef.current?.observe(element);

      return () => {
        visibilityCallbacksRef.current.delete(element);
        visibilityObserverRef.current?.unobserve(element);
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
