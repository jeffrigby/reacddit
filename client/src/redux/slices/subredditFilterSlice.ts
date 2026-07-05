/**
 * Client-side filter state for subreddit sidebar navigation
 *
 * This slice manages purely client-side state:
 * - Search/filter text for subreddit list
 * - Active state for keyboard navigation
 * - Active index for keyboard selection
 *
 * Extracted from subredditsSlice to maintain clean separation
 * between server data (RTK Query) and client UI state (Redux).
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

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
}

const initialState: SubredditFilterState = {
  filterText: '',
  active: false,
  activeIndex: 0,
};

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
    filterUpdated(state, action: PayloadAction<Partial<SubredditFilterState>>) {
      Object.assign(state, action.payload);
    },

    /**
     * Reset filter to initial state
     */
    filterCleared(state) {
      Object.assign(state, initialState);
    },
  },
  selectors: {
    selectSubredditFilter: (state): SubredditFilterState => state,
    selectFilterText: (state): string => state.filterText,
    selectFilterActive: (state): boolean => state.active,
    selectFilterIndex: (state): number => state.activeIndex,
  },
});

// Export actions
export const { filterUpdated, filterCleared } = subredditFilterSlice.actions;

// Export reducer
export default subredditFilterSlice.reducer;

// Selectors
export const {
  selectSubredditFilter,
  selectFilterText,
  selectFilterActive,
  selectFilterIndex,
} = subredditFilterSlice.selectors;
