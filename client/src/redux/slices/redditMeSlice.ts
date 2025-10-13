/**
 * Modern Redux Toolkit slice for Reddit User Account (Me)
 * Following Redux Toolkit 2.0+ best practices
 */
import {
  createSlice,
  createAsyncThunk,
  createSelector,
} from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/types/redux';
import type { AccountData } from '@/types/redditApi';
import { me as fetchMeAPI } from '@/reddit/redditApiTs';

/**
 * State shape for redditMe slice
 */
export interface MeState {
  me: AccountData | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  lastUpdated: number;
  id: string | null; // Bearer token ID for cache validation
}

/**
 * Initial state
 */
const initialState: MeState = {
  me: null,
  status: 'idle',
  error: null,
  lastUpdated: 0,
  id: null,
};

/**
 * Cache expiration time in milliseconds (24 hours for anonymous users)
 */
const CACHE_EXPIRATION_ANON = 3600 * 24 * 1000;

/**
 * Async thunk to fetch user account info from Reddit API
 * Includes complex cache logic for authenticated vs anonymous users
 */
export const fetchMe = createAsyncThunk<
  { me: AccountData; id: string | null },
  boolean | undefined, // reset flag
  { state: RootState }
>(
  'me/fetch',
  async (reset = false, { getState, rejectWithValue }) => {
    // Note: reset parameter is used by condition function below, not here
    try {
      const state = getState();
      const currentBearer = state.redditBearer;

      // Fetch fresh data from Reddit API
      const meResp = await fetchMeAPI();
      return {
        me: meResp,
        id: currentBearer.bearer,
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch user account'
      );
    }
  },
  {
    // Condition prevents thunk from running if cache is still valid
    condition: (reset = false, { getState }) => {
      if (reset) {
        return true;
      } // Allow forced refresh

      const state = getState();
      const currentMe = state.redditMe;
      const currentBearer = state.redditBearer;
      const isAuth = currentBearer.status === 'auth';

      // Don't run if already loading or failed
      if (currentMe.status === 'loading' || currentMe.status === 'failed') {
        return false;
      }

      // Check cache validity
      if (currentMe.status === 'succeeded') {
        // If we don't have actual user data, fetch it
        if (!currentMe.me) {
          return true;
        }

        // For anonymous users, cache for 24 hours
        if (!isAuth) {
          const anonExpired =
            Date.now() > currentMe.lastUpdated + CACHE_EXPIRATION_ANON;
          return anonExpired; // Only run if cache expired
        }

        // For authenticated users, cache as long as bearer matches
        // Note: We can only reach here if isAuth is true (due to above check)
        return currentMe.id !== currentBearer.bearer; // Only run if bearer changed
      }

      return true; // Run if status is idle or other cases
    },
  }
);

/**
 * Me (user account) slice
 */
const meSlice = createSlice({
  name: 'me',
  initialState,
  reducers: {
    /**
     * Clear user account data
     */
    meCleared(state) {
      state.me = null;
      state.status = 'idle';
      state.error = null;
      state.lastUpdated = 0;
      state.id = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMe.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(
        fetchMe.fulfilled,
        (
          state,
          action: PayloadAction<{ me: AccountData; id: string | null }>
        ) => {
          state.status = 'succeeded';
          state.me = action.payload.me;
          state.error = null;
          state.lastUpdated = Date.now();
          state.id = action.payload.id;
        }
      )
      .addCase(fetchMe.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          (action.payload as string) ??
          action.error.message ??
          'Failed to fetch user account';
      });
  },
});

// Export actions
export const { meCleared } = meSlice.actions;

// Export reducer
export default meSlice.reducer;

/**
 * Selectors
 */

// Base selector
export const selectMeState = (state: RootState): MeState => state.redditMe;

// Individual property selectors
export const selectMe = (state: RootState): AccountData | null =>
  state.redditMe.me;

export const selectMeStatus = (state: RootState): MeState['status'] =>
  state.redditMe.status;

export const selectMeError = (state: RootState): string | null =>
  state.redditMe.error;

export const selectMeLastUpdated = (state: RootState): number =>
  state.redditMe.lastUpdated;

/**
 * Memoized selector to check if user data is loaded
 */
export const selectMeLoaded = createSelector(
  [selectMeStatus],
  (status) => status === 'succeeded'
);

/**
 * Memoized selector to check if user data is loading
 */
export const selectMeLoading = createSelector(
  [selectMeStatus],
  (status) => status === 'loading'
);

/**
 * Memoized selector to get username
 */
export const selectUsername = createSelector(
  [selectMe],
  (me) => me?.name ?? null
);
