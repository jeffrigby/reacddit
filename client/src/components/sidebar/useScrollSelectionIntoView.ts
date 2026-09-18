import { useEffect } from 'react';
import { navTargetDomId } from './navHelpers';
import { scrollSidebarRowIntoView } from './scrollSidebarRow';
import { NAV_SECTIONS } from './useNavSection';

/**
 * Keep the keyboard-selected row on screen as the selection moves.
 *
 * The registry holds paths, not elements; each section renders its anchors
 * with the id navTargetDomId gives that path, so the row is found by id.
 */
export function useScrollSelectionIntoView(
  selectedTarget: string | undefined,
  engaged: boolean
): void {
  useEffect(() => {
    if (!engaged || selectedTarget === undefined) {
      return;
    }
    for (const section of NAV_SECTIONS) {
      const row = document.getElementById(
        navTargetDomId(section, selectedTarget)
      );
      if (row) {
        scrollSidebarRowIntoView(row);
        return;
      }
    }
  }, [selectedTarget, engaged]);
}
