import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef } from 'react';
import { setActiveOverlayElement } from '@/common';
import { useOverlayRouting } from '@/contexts';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import '@/styles/postOverlay.scss';

interface PostDetailOverlayProps {
  children: ReactNode;
}

/**
 * Fixed, self-scrolling container for the post-detail (comments) routes tree
 * rendered above a suspended background listing. Locks body scroll, registers
 * itself as the active scroll container, and manages dialog focus.
 */
function PostDetailOverlay({
  children,
}: PostDetailOverlayProps): React.JSX.Element {
  const overlayRef = useRef<HTMLDivElement | null>(null);

  // Register via a ref callback (not an effect) so the registry is set before
  // any child effect runs a scroll operation - child passive effects would
  // otherwise scroll the body and destroy the preserved list offset.
  const registerOverlay = useCallback((node: HTMLDivElement | null): void => {
    overlayRef.current = node;
    setActiveOverlayElement(node);
  }, []);

  useBodyScrollLock(true);

  // Focus restore target comes from OverlayRoutingProvider, captured at
  // render time BEFORE the commit applied `inert` to the background tree
  // (inert blurs the activating element, so it cannot be read from here).
  const { restoreFocusRef } = useOverlayRouting();

  useEffect(() => {
    overlayRef.current?.focus();
    return () => {
      const previousFocus = restoreFocusRef.current;
      restoreFocusRef.current = null;
      if (previousFocus?.isConnected) {
        previousFocus.focus();
      }
    };
  }, [restoreFocusRef]);

  return (
    <div
      aria-modal="true"
      id="post-overlay"
      ref={registerOverlay}
      role="dialog"
      tabIndex={-1}
    >
      {children}
    </div>
  );
}

export default PostDetailOverlay;
