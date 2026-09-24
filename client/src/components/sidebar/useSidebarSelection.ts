import { useAppSelector } from '@/redux/hooks';
import {
  selectFilterEngaged,
  selectFilterText,
  selectSelectedNavTarget,
} from '@/redux/slices/subredditFilterSlice';

export interface SidebarSelection {
  /** Current filter box text */
  filterText: string;
  /** Whether the filter box is focused with a term in it */
  filterActive: boolean;
  /** Destination path of the keyboard-selected item */
  selectedTarget: string | undefined;
}

/**
 * Filter box state the navigable sidebar sections render against.
 *
 * A section marks its own item as the keyboard selection by comparing the
 * item's destination path against selectedTarget.
 */
export function useSidebarSelection(): SidebarSelection {
  const filterText = useAppSelector(selectFilterText);
  const filterActive = useAppSelector(selectFilterEngaged);
  const selectedTarget = useAppSelector(selectSelectedNavTarget);

  return { filterText, filterActive, selectedTarget };
}
