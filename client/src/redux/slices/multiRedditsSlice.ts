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
import { multiMine } from '@/reddit/redditApiTs';

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
  async (reset = false, { rejectWithValue }) => {
    // Note: reset parameter is used by condition function below, not here
    try {
      // Fetch fresh data from Reddit API
      const multis = await multiMine({ expand_srs: true });
      return multis;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch multiReddits'
      );
    }
  },
  {
    // Condition prevents thunk from running if cache is still valid
    condition: (reset = false, { getState }) => {
      if (reset) {
        return true;
      }

      const state = getState();
      const currentState = state.redditMultiReddits;

      // Don't run if already loading or failed
      if (
        currentState.status === 'loading' ||
        currentState.status === 'failed'
      ) {
        return false;
      }

      // Check if we need to fetch based on cache expiration
      if (currentState.status === 'succeeded') {
        const cacheExpired =
          Date.now() > currentState.lastUpdated + CACHE_EXPIRATION;
        return cacheExpired;
      }

      return true;
    },
  }
);

/**
 * MultiReddits slice
 */
const multiRedditsSlice = createSlice({
  name: 'multiReddits',
  initialState,
  reducers: {
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

export const { multiRedditsCleared } = multiRedditsSlice.actions;

export default multiRedditsSlice.reducer;

export const selectMultiRedditsState = (state: RootState): MultiRedditsState =>
  state.redditMultiReddits;

export const selectMultis = (state: RootState): Thing<LabeledMultiData>[] =>
  state.redditMultiReddits.multis;

export const selectMultiRedditsStatus = (
  state: RootState
): MultiRedditsState['status'] => state.redditMultiReddits.status;

export const selectMultiRedditsError = (state: RootState): string | null =>
  state.redditMultiReddits.error;

export const selectMultiRedditsLastUpdated = (state: RootState): number =>
  state.redditMultiReddits.lastUpdated;

export const selectMultiRedditsLoaded = createSelector(
  [selectMultiRedditsStatus],
  (status) => status === 'succeeded'
);

export const selectMultiRedditsLoading = createSelector(
  [selectMultiRedditsStatus],
  (status) => status === 'loading'
);

export const selectMultiRedditsCacheExpired = createSelector(
  [selectMultiRedditsLastUpdated],
  (lastUpdated) => Date.now() > lastUpdated + CACHE_EXPIRATION
);
