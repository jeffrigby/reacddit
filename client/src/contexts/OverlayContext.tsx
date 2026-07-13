import { createContext, use } from 'react';

/**
 * True when rendering inside the post-detail overlay routes tree.
 *
 * Used by comments-permalink links to decide whether an existing
 * backgroundLocation may be carried forward (only when the overlay is
 * actually open for the current render).
 */
export const OverlayContext = createContext<boolean>(false);

export function useIsOverlay(): boolean {
  return use(OverlayContext);
}
