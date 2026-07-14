import { createContext, use } from 'react';

/**
 * Whether the enclosing listing tree is the ACTIVE (visible) one.
 *
 * While the post-detail overlay is open, the background listing tree stays
 * mounted but suspended: it must not attach document-level listeners, run
 * scroll monitoring, poll, load more, render a <title>, or play media.
 * Defaults to true so a single mounted tree behaves exactly as before.
 */
export const ListingsActiveContext = createContext<boolean>(true);

export function useListingsActive(): boolean {
  return use(ListingsActiveContext);
}
