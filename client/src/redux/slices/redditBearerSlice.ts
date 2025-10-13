/**
 * Modern Redux Toolkit slice for Reddit OAuth Bearer Token
 * Following Redux Toolkit 2.0+ best practices
 */
import {
  createSlice,
  createAsyncThunk,
  createSelector,
} from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/types/redux';
import { getToken, getLoginUrl } from '@/reddit/redditApiTs';

/**
 * State shape for redditBearer slice
 */
export interface BearerState {
  bearer: string | null;
  status: 'idle' | 'loading' | 'anon' | 'auth' | 'error';
  loginURL: string | null;
  error: string | null;
}

/**
 * Initial state
 */
const initialState: BearerState = {
  bearer: null,
  status: 'idle',
  loginURL: null,
  error: null,
};

/**
 * Async thunk to fetch bearer token from Reddit OAuth
 * Uses condition to prevent unnecessary fetches when polling
 *
 * PERFORMANCE NOTE: This thunk is called every 1 second for polling.
 * The condition function checks if the token changed by calling getToken(),
 * and if it changed, the payload creator calls getToken() again.
 *
 * This "double fetch" is intentional and acceptable because:
 * 1. createAsyncThunk's condition and payload cannot share data
 * 2. getToken() is fast 99% of the time (reads cookie, no network call)
 * 3. Alternative (no condition) causes re-renders every second (worse)
 * 4. Only makes 2 network calls when token expires (~every 60 min)
 *
 * This is the standard Redux Toolkit pattern for condition functions
 * that need to check external data to prevent unnecessary thunk execution.
 */
export const fetchBearer = createAsyncThunk<
  {
    bearer: string;
    status: 'anon' | 'auth';
    loginURL: string;
  },
  boolean | undefined, // force flag to bypass cache check
  { state: RootState }
>(
  'bearer/fetch',
  async (force = false, { getState, rejectWithValue }) => {
    // Note: force parameter is used by condition function below, not here
    try {
      // This is the second call to getToken() - see note above about double fetch
      const { token, cookieTokenParsed } = await getToken(false);
      const { auth } = cookieTokenParsed;
      const loginURL = getLoginUrl();

      return {
        bearer: token ?? '',
        status: auth ? ('auth' as const) : ('anon' as const),
        loginURL,
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch bearer token'
      );
    }
  },
  {
    // Condition prevents thunk from running if nothing would change
    // This stops the pending action from dispatching unnecessarily during polling
    condition: async (force, { getState }) => {
      if (force) {
        return true;
      } // Allow forced refresh

      const state = getState();
      const currentBearer = state.redditBearer;

      // Don't run if already loading or in error state
      if (
        currentBearer.status === 'loading' ||
        currentBearer.status === 'error'
      ) {
        return false;
      }

      // Check if token would change by fetching it
      // Note: This is the first call to getToken() - payload will call it again
      // See PERFORMANCE NOTE above for why this double fetch is acceptable
      try {
        const { token, cookieTokenParsed } = await getToken(false);
        const { auth } = cookieTokenParsed;
        const loginURL = getLoginUrl();
        const newStatus = auth ? 'auth' : 'anon';

        // Only run if something changed
        return (
          currentBearer.bearer !== token ||
          currentBearer.status !== newStatus ||
          currentBearer.loginURL !== loginURL
        );
      } catch {
        return true; // Run on error to update error state
      }
    },
  }
);

/**
 * Bearer token slice
 */
const bearerSlice = createSlice({
  name: 'bearer',
  initialState,
  reducers: {
    /**
     * Clear bearer token data
     */
    bearerCleared(state) {
      state.bearer = null;
      state.status = 'idle';
      state.loginURL = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBearer.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(
        fetchBearer.fulfilled,
        (
          state,
          action: PayloadAction<{
            bearer: string;
            status: 'anon' | 'auth';
            loginURL: string;
          }>
        ) => {
          state.bearer = action.payload.bearer;
          state.status = action.payload.status;
          state.loginURL = action.payload.loginURL;
          state.error = null;
        }
      )
      .addCase(fetchBearer.rejected, (state, action) => {
        state.status = 'error';
        state.error =
          (action.payload as string) ??
          action.error.message ??
          'Failed to fetch bearer token';
      });
  },
});

// Export actions
export const { bearerCleared } = bearerSlice.actions;

// Export reducer
export default bearerSlice.reducer;

/**
 * Selectors
 */

// Base selector
export const selectBearerState = (state: RootState): BearerState =>
  state.redditBearer;

// Individual property selectors
export const selectBearer = (state: RootState): string | null =>
  state.redditBearer.bearer;

export const selectBearerStatus = (state: RootState): BearerState['status'] =>
  state.redditBearer.status;

export const selectLoginURL = (state: RootState): string | null =>
  state.redditBearer.loginURL;

export const selectBearerError = (state: RootState): string | null =>
  state.redditBearer.error;

/**
 * Memoized selector to check if user is authenticated
 */
export const selectIsAuth = createSelector(
  [selectBearerStatus],
  (status) => status === 'auth'
);

/**
 * Memoized selector to check if bearer is loading
 */
export const selectBearerLoading = createSelector(
  [selectBearerStatus],
  (status) => status === 'loading' || status === 'idle'
);
