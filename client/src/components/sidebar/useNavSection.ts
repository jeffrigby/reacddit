import { useEffect } from 'react';
import { useAppDispatch } from '@/redux/hooks';
import {
  navSectionRegistered,
  navSectionUnregistered,
} from '@/redux/slices/subredditFilterSlice';

/**
 * Sidebar sections in the order keyboard navigation walks them.
 */
export const NAV_SECTIONS = ['subscribed', 'search'] as const;

export type NavSectionId = (typeof NAV_SECTIONS)[number];

/**
 * Publish a section's destination paths to the keyboard-navigation registry.
 *
 * Registering the same targets again is a no-op in the slice, so targets need
 * only be referentially stable enough to keep the effect from firing on every
 * render. The section is dropped from the registry when the component
 * unmounts; a section that renders no navigable items registers an empty list.
 *
 * @param id - Section identifier, deciding its place in the navigable order
 * @param targets - Destination paths, in render order
 */
export function useNavSection(id: NavSectionId, targets: string[]): void {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(
      navSectionRegistered({ id, order: NAV_SECTIONS.indexOf(id), targets })
    );
  }, [dispatch, id, targets]);

  useEffect(
    () => () => {
      dispatch(navSectionUnregistered(id));
    },
    [dispatch, id]
  );
}
