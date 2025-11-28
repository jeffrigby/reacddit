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
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch user account';
      return rejectWithValue(errorMessage);
    }
  },
  {
    // Condition prevents thunk from running if cache is still valid
    condition: (reset = false, { getState }) => {
      if (reset) {
        return true;
      }

      const state = getState() as RootState;
      const currentMe = state.redditMe;
      const currentBearer = state.redditBearer;
      const isAuth = currentBearer.status === 'auth';

      // Don't run if already loading
      if (currentMe.status === 'loading') {
        return false;
      }

      // Retry failed fetches after 30 seconds
      if (currentMe.status === 'failed') {
        const RETRY_AFTER_MS = 30000; // 30 seconds
        const shouldRetry = Date.now() > currentMe.lastUpdated + RETRY_AFTER_MS;
        return shouldRetry;
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
          return anonExpired;
        }

        // For authenticated users, cache as long as bearer matches
        return currentMe.id !== currentBearer.bearer;
      }

      return true;
    },
  }
);

const meSlice = createSlice({
  name: 'me',
  initialState,
  reducers: {
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
        state.lastUpdated = Date.now(); // Record failure timestamp for retry throttling
      });
  },
});

export const { meCleared } = meSlice.actions;

export default meSlice.reducer;

export const selectMeState = (state: RootState): MeState => state.redditMe;

export const selectMe = (state: RootState): AccountData | null =>
  state.redditMe.me;

export const selectMeStatus = (state: RootState): MeState['status'] =>
  state.redditMe.status;

export const selectMeError = (state: RootState): string | null =>
  state.redditMe.error;

export const selectMeLastUpdated = (state: RootState): number =>
  state.redditMe.lastUpdated;

export const selectMeLoaded = createSelector(
  [selectMeStatus],
  (status) => status === 'succeeded'
);

export const selectMeLoading = createSelector(
  [selectMeStatus],
  (status) => status === 'loading'
);

export const selectUsername = createSelector(
  [selectMe],
  (me) => me?.name ?? null
);
