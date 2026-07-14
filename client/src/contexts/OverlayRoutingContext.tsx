import type { ReactNode, RefObject } from 'react';
import { createContext, use, useMemo, useRef } from 'react';
import { useLocation } from 'react-router';
import type { BackgroundLocation } from '@/types/navigation';
import { getBackgroundLocation, isOverlayPath } from '@/utils/navigationState';
import { useListingsActive } from './ListingsActiveContext';

interface OverlayRouting {
  /** Is the post-detail overlay open for the current location? */
  overlayOpen: boolean;
  /** The validated background (list) location, only when the overlay is open. */
  background: BackgroundLocation | null;
  /** Element to restore focus to when the overlay closes. */
  restoreFocusRef: RefObject<HTMLElement | null>;
}

const OverlayRoutingContext = createContext<OverlayRouting>({
  overlayOpen: false,
  background: null,
  restoreFocusRef: { current: null },
});

interface OverlayRoutingProviderProps {
  children: ReactNode;
}

/**
 * Single source of truth for the background-location overlay state, mounted
 * above the header so singletons (Sort) and the route trees agree on whether
 * the overlay is open.
 */
export function OverlayRoutingProvider({
  children,
}: OverlayRoutingProviderProps): React.JSX.Element {
  const location = useLocation();

  // The history entry the app booted on always renders standalone, even when
  // its state carries a backgroundLocation: history.state survives a reload,
  // but the background listing it points at no longer exists in this session.
  // Later back/forward navigations to OTHER entries honor their state.
  const bootKeyRef = useRef(location.key);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(false);

  const background = getBackgroundLocation(location);
  const overlayOpen =
    background != null &&
    location.key !== bootKeyRef.current &&
    isOverlayPath(location.pathname);

  // Capture the focus-restore target BEFORE the commit applies `inert` to the
  // background tree: inert synchronously blurs the activating element, so an
  // effect would only ever see <body>. Render-time ref write is idempotent
  // under StrictMode's double render.
  if (overlayOpen && !wasOpenRef.current) {
    restoreFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
  }
  wasOpenRef.current = overlayOpen;

  const value = useMemo(
    () => ({
      overlayOpen,
      background: overlayOpen ? background : null,
      restoreFocusRef,
    }),
    [overlayOpen, background]
  );

  return (
    <OverlayRoutingContext value={value}>{children}</OverlayRoutingContext>
  );
}

export function useOverlayRouting(): OverlayRouting {
  return use(OverlayRoutingContext);
}

/**
 * True when rendering inside the post-detail overlay routes tree.
 *
 * Derived rather than provided: while the overlay is open the ONLY active
 * listing tree is the overlay itself (the background renders with
 * ListingsActiveContext=false), so "overlay open AND this tree is active"
 * exactly identifies the overlay tree. On a standalone detail page the
 * overlay is closed, so this is false there.
 */
export function useIsOverlay(): boolean {
  const { overlayOpen } = useOverlayRouting();
  const isActive = useListingsActive();
  return overlayOpen && isActive;
}
