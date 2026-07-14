import { useMemo } from 'react';
import { useLocation } from 'react-router';
import { useIsOverlay } from '@/contexts';
import { buildDetailNavState } from '@/utils/navigationState';
import type { NavState } from '@/types/navigation';

/**
 * The navigation state every link INTO a post-detail (comments/duplicates)
 * page must carry so the overlay routing works: a snapshot of the location
 * the overlay will cover, or — when already inside the overlay — the original
 * background carried forward so post -> post chains keep the same list
 * behind them.
 *
 * Pass the result as the `state` prop of the Link/NavLink (or to
 * `navigate(to, { state })`).
 */
export function useDetailNavState(): NavState {
  const location = useLocation();
  const inOverlay = useIsOverlay();
  return useMemo(
    () => buildDetailNavState(location, inOverlay),
    [location, inOverlay]
  );
}
