/**
 * Modern Redux Toolkit slice for Reddit MultiReddits (Custom Feeds)
 * Following Redux Toolkit 2.0+ best practices
 */
import {
  createSlice,
  createAsyncThunk,
  createSelector,
} from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/types/redux';
import type { Thing, LabeledMultiData } from '@/types/redditApi';
import RedditAPI from '@/reddit/redditAPI';

/**
 * State shape for multiReddits slice
 */
export interface MultiRedditsState {
  multis: Thing<LabeledMultiData>[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  lastUpdated: number;
}

/**
 * Initial state
 */
const initialState: MultiRedditsState = {
  multis: [],
  status: 'idle',
  error: null,
  lastUpdated: 0,
};

/**
 * Cache expiration time in milliseconds (24 hours)
 */
const CACHE_EXPIRATION = 3600 * 24 * 1000;

/**
 * Async thunk to fetch multiReddits from Reddit API
 * Includes cache invalidation logic
 */
export const fetchMultiReddits = createAsyncThunk<
  Thing<LabeledMultiData>[], // Return type
  boolean | undefined, // Argument type (reset flag)
  { state: RootState } // ThunkAPI config
>(
  'multiReddits/fetch',
  async (reset = false, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const currentState = state.redditMultiReddits;

      // Check if we need to fetch based on cache expiration
      if (!reset && currentState) {
        const cacheExpired =
          Date.now() > currentState.lastUpdated + CACHE_EXPIRATION;
        if (currentState.status === 'succeeded' && !cacheExpired) {
          // Return cached data
          return currentState.multis;
        }
      }

      // Fetch fresh data from Reddit API
      const multis = await RedditAPI.multiMine({ expand_srs: true });
      return multis;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch multiReddits'
      );
    }
  }
);

/**
 * MultiReddits slice
 */
const multiRedditsSlice = createSlice({
  name: 'multiReddits',
  initialState,
  reducers: {
    /**
     * Clear all multiReddits data
     */
    multiRedditsCleared(state) {
      state.multis = [];
      state.status = 'idle';
      state.error = null;
      state.lastUpdated = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMultiReddits.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(
        fetchMultiReddits.fulfilled,
        (state, action: PayloadAction<Thing<LabeledMultiData>[]>) => {
          state.status = 'succeeded';
          state.multis = action.payload;
          state.error = null;
          state.lastUpdated = Date.now();
        }
      )
      .addCase(fetchMultiReddits.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          (action.payload as string) ??
          action.error.message ??
          'Failed to fetch multiReddits';
      });
  },
});

// Export actions
export const { multiRedditsCleared } = multiRedditsSlice.actions;

// Export reducer
export default multiRedditsSlice.reducer;

/**
 * Selectors
 */

// Base selector
export const selectMultiRedditsState = (state: RootState): MultiRedditsState =>
  state.redditMultiReddits;

// Individual property selectors
export const selectMultis = (state: RootState): Thing<LabeledMultiData>[] =>
  state.redditMultiReddits.multis;

export const selectMultiRedditsStatus = (
  state: RootState
): MultiRedditsState['status'] => state.redditMultiReddits.status;

export const selectMultiRedditsError = (state: RootState): string | null =>
  state.redditMultiReddits.error;

export const selectMultiRedditsLastUpdated = (state: RootState): number =>
  state.redditMultiReddits.lastUpdated;

/**
 * Memoized selector to check if multiReddits are loaded
 */
export const selectMultiRedditsLoaded = createSelector(
  [selectMultiRedditsStatus],
  (status) => status === 'succeeded'
);

/**
 * Memoized selector to check if multiReddits are loading
 */
export const selectMultiRedditsLoading = createSelector(
  [selectMultiRedditsStatus],
  (status) => status === 'loading'
);

/**
 * Memoized selector to check if cache is expired
 */
export const selectMultiRedditsCacheExpired = createSelector(
  [selectMultiRedditsLastUpdated],
  (lastUpdated) => Date.now() > lastUpdated + CACHE_EXPIRATION
);
