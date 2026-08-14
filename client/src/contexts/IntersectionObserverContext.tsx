import type { ReactNode } from 'react';
import {
  createContext,
  use,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
// Imported from the module directly, not the `@/contexts` barrel: the barrel
// re-exports this file, so going through it would be a cycle.
import { useListingsActive } from './ListingsActiveContext';

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
  observeForEmbedMount: (
    element: Element,
    callback: ObserverCallback
  ) => () => void;
}

// Lead/trail band for observeForEmbedMount, in px. Deliberately far tighter
// than the load observer's 2000px: that one only resolves embed metadata,
// while this one decides when a full third-party document is in the DOM.
const EMBED_MOUNT_MARGIN_TOP = 200;
const EMBED_MOUNT_MARGIN_BOTTOM = 800;

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
  // This provider is mounted per listing tree (see Posts.tsx). While the
  // post-detail overlay is open TWO trees are mounted, so there are two
  // providers, each with its own registrations.
  const isActive = useListingsActive();

  const loadCallbacksRef = useRef<Map<Element, ObserverCallback>>(new Map());
  const visibilityCallbacksRef = useRef<Map<Element, ObserverCallback>>(
    new Map()
  );
  const mediaControlCallbacksRef = useRef<Map<Element, ObserverCallback>>(
    new Map()
  );
  const embedMountCallbacksRef = useRef<Map<Element, ObserverCallback>>(
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

  // Embed-mount observer - a narrow band around the viewport for mounting and
  // unmounting heavy third-party iframes. The media-control observer has no
  // rootMargin, so keying an iframe's mount off it means the embed only starts
  // navigating once its top edge touches the viewport and the user watches a
  // spinner; this gives it roughly a screen of lead while still reclaiming the
  // iframe shortly after it is scrolled past.
  const embedMountObserverRef = useRef<IntersectionObserver | null>(null);
  const getOrCreateEmbedMountObserver =
    useCallback((): IntersectionObserver => {
      embedMountObserverRef.current ??= new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const callback = embedMountCallbacksRef.current.get(entry.target);
            if (callback) {
              callback(entry.isIntersecting);
            }
          });
        },
        {
          root: null,
          rootMargin: `${EMBED_MOUNT_MARGIN_TOP}px 0px ${EMBED_MOUNT_MARGIN_BOTTOM}px 0px`,
          threshold: 0,
        }
      );
      return embedMountObserverRef.current;
    }, []);

  // Clean up observers on unmount ONLY.
  //
  // This is deliberately a separate effect from the scroll fallback below and
  // deliberately keeps `[]` deps. Consumers register via observeFor* from their
  // own mount effect and never re-register, so disconnecting here on any other
  // trigger (e.g. `isActive` flipping when the post-detail overlay opens) would
  // silently drop every registration with nothing to restore it.
  useEffect(() => {
    return () => {
      loadObserverRef.current?.disconnect();
      visibilityObserverRef.current?.disconnect();
      mediaControlObserverRef.current?.disconnect();
      embedMountObserverRef.current?.disconnect();
    };
  }, []);

  // Fallback sweep: re-checks registered elements that have NOT loaded yet, to
  // catch anything the load IntersectionObserver missed.
  //
  // Gated on `isActive` for two reasons. First, a suspended background tree is
  // not being scrolled and must not do work. Second — and this is the expensive
  // one — scroll events do not bubble, so this listener is capture-phase on
  // `document`; that means scrolling the OVERLAY would otherwise fire the
  // BACKGROUND tree's sweep too, and each sweep's cost scales with that tree's
  // element count (~400 on a fully-read front page).
  //
  // The handler is debounced, not throttled: it runs once ~100ms after scrolling
  // SETTLES, not continuously during the scroll. The cost is therefore a single
  // forced-layout burst per scroll gesture per mounted tree, which is still
  // worth eliminating for a tree the user cannot see.
  useEffect(() => {
    if (!isActive) {
      return;
    }

    let scrollTimeout: ReturnType<typeof setTimeout> | undefined;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const viewportHeight = window.innerHeight;
        const loadMarginBottom = 2000;
        const threshold = viewportHeight + loadMarginBottom;

        // Check all registered elements
        loadCallbacksRef.current.forEach((callback, element) => {
          // Test the 'loaded' class BEFORE measuring: content stays loaded once
          // loaded, so on a deep listing nearly every element is already done
          // and this skips its getBoundingClientRect() (a forced layout).
          if (element.classList.contains('loaded')) {
            return;
          }

          const rect = element.getBoundingClientRect();
          const shouldLoad = rect.top < threshold && rect.bottom > -500;

          if (shouldLoad) {
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
      document.removeEventListener('scroll', handleScroll, { capture: true });
      clearTimeout(scrollTimeout);
    };
  }, [isActive]);

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

  const observeForEmbedMount = useCallback(
    (element: Element, callback: ObserverCallback): (() => void) => {
      embedMountCallbacksRef.current.set(element, callback);
      getOrCreateEmbedMountObserver().observe(element);

      // IntersectionObserver only reports changes, so seed the current state -
      // an element already inside the band would otherwise never mount.
      const rect = element.getBoundingClientRect();
      const isInBand =
        rect.top < window.innerHeight + EMBED_MOUNT_MARGIN_BOTTOM &&
        rect.bottom > -EMBED_MOUNT_MARGIN_TOP;
      callback(isInBand);

      return () => {
        embedMountCallbacksRef.current.delete(element);
        embedMountObserverRef.current?.unobserve(element);
      };
    },
    [getOrCreateEmbedMountObserver]
  );

  const value = useMemo(
    () => ({
      observeForLoading,
      observeForVisibility,
      observeForMediaControl,
      observeForEmbedMount,
    }),
    [
      observeForLoading,
      observeForVisibility,
      observeForMediaControl,
      observeForEmbedMount,
    ]
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
