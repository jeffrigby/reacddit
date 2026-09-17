/**
 * Client-side filter state for subreddit sidebar navigation
 *
 * This slice manages purely client-side state:
 * - Search/filter text for subreddit list
 * - Active state for keyboard navigation
 * - Active index for keyboard selection
 * - The ordered destination paths keyboard navigation walks
 *
 * Extracted from subredditsSlice to maintain clean separation
 * between server data (RTK Query) and client UI state (Redux).
 */

import {
  createSlice,
  createSelector,
  type PayloadAction,
} from '@reduxjs/toolkit';

/**
 * One sidebar section's contribution to the keyboard-navigable order
 */
export interface NavSection {
  /** Sort key deciding where this section sits in the navigable order */
  order: number;
  /** Destination paths, in render order */
  targets: string[];
}

/**
 * Filter state for sidebar subreddit navigation
 */
export interface SubredditFilterState {
  /** Current search/filter text */
  filterText: string;
  /** Whether the filter is currently active/focused */
  active: boolean;
  /** Index of currently selected subreddit in filtered list (for keyboard navigation) */
  activeIndex: number;
  /** Navigable sections keyed by section id */
  navSections: Record<string, NavSection>;
}

/** The fields a filter box interaction can set */
type FilterUpdate = Partial<
  Pick<SubredditFilterState, 'filterText' | 'active' | 'activeIndex'>
>;

const initialState: SubredditFilterState = {
  filterText: '',
  active: false,
  activeIndex: 0,
  navSections: {},
};

/**
 * Sort sections by their order key and concatenate their targets.
 */
function flattenTargets(sections: Record<string, NavSection>): string[] {
  return Object.values(sections)
    .sort((a, b) => a.order - b.order)
    .flatMap((section) => section.targets);
}

/**
 * Total number of navigable targets across every section.
 */
function countTargets(sections: Record<string, NavSection>): number {
  return Object.values(sections).reduce(
    (total, section) => total + section.targets.length,
    0
  );
}

/**
 * Pull activeIndex back inside the navigable range.
 */
function clampActiveIndex(state: SubredditFilterState): void {
  const max = Math.max(countTargets(state.navSections) - 1, 0);
  if (state.activeIndex > max) {
    state.activeIndex = max;
  }
}

/** Every navigable destination path, in sidebar order */
const navTargets = createSelector(
  (state: SubredditFilterState) => state.navSections,
  flattenTargets
);

/**
 * Whether the filter box is focused with a term in it.
 *
 * Keyboard navigation only walks the registry while this holds, so the item
 * Enter opens is always the item the sidebar marks.
 */
function isEngaged(state: SubredditFilterState): boolean {
  return state.active && state.filterText !== '';
}

/** Destination path of the keyboard-selected item */
const selectedNavTarget = createSelector(
  navTargets,
  (state: SubredditFilterState) => state.activeIndex,
  isEngaged,
  (targets, activeIndex, engaged): string | undefined =>
    engaged ? targets[activeIndex] : undefined
);

/**
 * Subreddit filter slice - client-side UI state only
 */
const subredditFilterSlice = createSlice({
  name: 'subredditFilter',
  initialState,
  reducers: {
    /**
     * Update filter state (partial update)
     *
     * @example
     * dispatch(filterUpdated({ filterText: 'reddit' }))
     * dispatch(filterUpdated({ active: true, activeIndex: 0 }))
     */
    filterUpdated(state, action: PayloadAction<FilterUpdate>) {
      Object.assign(state, action.payload);
    },

    /**
     * Reset the filter box. Registered sections are left in place.
     */
    filterCleared(state) {
      state.filterText = initialState.filterText;
      state.active = initialState.active;
      state.activeIndex = initialState.activeIndex;
    },

    /**
     * Publish a section's ordered destination paths.
     *
     * Re-registering an unchanged section is a no-op, so a section may
     * dispatch this from an effect without looping.
     */
    navSectionRegistered(
      state,
      action: PayloadAction<NavSection & { id: string }>
    ) {
      const { id, order, targets } = action.payload;
      const current = state.navSections[id];
      if (
        current?.order === order &&
        current.targets.length === targets.length &&
        current.targets.every((target, idx) => target === targets[idx])
      ) {
        return;
      }
      state.navSections[id] = { order, targets };
      clampActiveIndex(state);
    },

    /**
     * Drop a section that is no longer rendered.
     */
    navSectionUnregistered(state, action: PayloadAction<string>) {
      if (!(action.payload in state.navSections)) {
        return;
      }
      delete state.navSections[action.payload];
      clampActiveIndex(state);
    },
  },
  selectors: {
    selectSubredditFilter: (state): SubredditFilterState => state,
    selectFilterText: (state): string => state.filterText,
    selectFilterActive: (state): boolean => state.active,
    selectFilterIndex: (state): number => state.activeIndex,
    selectNavTargets: navTargets,
    selectSelectedNavTarget: selectedNavTarget,
    /** Whether the filter box is focused with a term in it */
    selectFilterEngaged: (state): boolean => isEngaged(state),
    /** How many items keyboard navigation can walk */
    selectNavTargetCount: (state): number => countTargets(state.navSections),
  },
});

// Export actions
export const {
  filterUpdated,
  filterCleared,
  navSectionRegistered,
  navSectionUnregistered,
} = subredditFilterSlice.actions;

// Export reducer
export default subredditFilterSlice.reducer;

// Selectors
export const {
  selectSubredditFilter,
  selectFilterText,
  selectFilterActive,
  selectFilterIndex,
  selectNavTargets,
  selectNavTargetCount,
  selectSelectedNavTarget,
  selectFilterEngaged,
} = subredditFilterSlice.selectors;
