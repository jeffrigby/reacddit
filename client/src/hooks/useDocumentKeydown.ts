import { useEffect } from 'react';
import { useListingsActive } from '@/contexts';

/**
 * Attach a document-level keydown listener that is structurally gated on the
 * enclosing listing tree being ACTIVE (ListingsActiveContext): a background
 * tree suspended behind the post-detail overlay must never answer hotkeys or
 * write into its preserved uiState. Use this for every hotkey listener
 * mounted inside a listing tree.
 *
 * `enabled` adds the caller's own condition (e.g. only the actionable post
 * listens); the listener is detached while either gate is false.
 */
export function useDocumentKeydown(
  handler: (event: KeyboardEvent) => void,
  enabled = true
): void {
  const isActive = useListingsActive();

  useEffect(() => {
    if (!enabled || !isActive) {
      return;
    }
    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('keydown', handler);
    };
  }, [handler, enabled, isActive]);
}
