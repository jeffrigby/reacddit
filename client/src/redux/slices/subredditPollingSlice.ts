/**
 * Background polling state for subreddit "last updated" timestamps
 *
 * This slice manages the complex background job that checks for new posts
 * in each subreddit to display "new" indicators in the sidebar.
 *
 * CRITICAL RATE LIMITING:
 * - p-limit(5): Max 5 concurrent requests
 * - randomDelay(2-5s): 2-5 second random delays between requests
 * - Smart caching: Only checks subreddits with expired cache
 *
 * These limits prevent Reddit API rate limiting issues.
 * DO NOT MODIFY without understanding rate limiting implications.
 *
 * This remains as an async thunk (not migrated to RTK Query) because:
 * 1. It's a complex batch worker with specific rate limiting requirements
 * 2. RTK Query is designed for request/response, not batch workers
 * 3. It runs independently of the main subreddit query
 * 4. The rate limiting logic is battle-tested and working correctly
 */

import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from '@reduxjs/toolkit';
import pLimit from 'p-limit';
import type { EntityState } from '@reduxjs/toolkit';
import type { RootState } from '@/types/redux';
import type { SubredditData } from '@/types/redditApi';
import {
  getLastUpdatedWithDelay,
  shouldUpdate,
  type LastUpdatedTracking,
} from '../actions/helpers/lastFetched';

/**
 * Polling state
 */
export interface SubredditPollingState {
  /** Map of subreddit fullnames to last post timestamps */
  lastUpdatedTracking: LastUpdatedTracking;
  /** Unix timestamp (ms) of last polling run */
  lastUpdatedTime: number;
  /** Flag to prevent concurrent polling runs */
  lastUpdatedRunning: boolean;
  /** Error message from polling, null if no error */
  lastUpdatedError: string | null;
  /** Progress of current polling run, null if not running */
  lastUpdatedProgress: {
    total: number;
    completed: number;
  } | null;
}

const initialState: SubredditPollingState = {
  lastUpdatedTracking: {},
  lastUpdatedTime: 0,
  lastUpdatedRunning: false,
  lastUpdatedError: null,
  lastUpdatedProgress: null,
};

/**
 * Subreddit polling slice
 */
const subredditPollingSlice = createSlice({
  name: 'subredditPolling',
  initialState,
  reducers: {
    /**
     * Set last updated timestamp for a subreddit
     * Called by fetchSubredditsLastUpdated thunk
     */
    lastUpdatedSet(state, action: PayloadAction<LastUpdatedTracking>) {
      Object.assign(state.lastUpdatedTracking, action.payload);
      state.lastUpdatedTime = Date.now();
    },

    /**
     * Clear all last updated timestamps
     * Called when user manually reloads subreddits
     */
    lastUpdatedCleared(state) {
      state.lastUpdatedTracking = {};
      state.lastUpdatedTime = 0;
      state.lastUpdatedRunning = false;
      state.lastUpdatedProgress = null;
    },

    /**
     * Set the running flag for fetchSubredditsLastUpdated
     * Prevents concurrent executions
     */
    lastUpdatedRunningSet(state, action: PayloadAction<boolean>) {
      state.lastUpdatedRunning = action.payload;
    },

    /**
     * Set error state for fetchSubredditsLastUpdated
     * Allows components to display error messages for failed background polling
     */
    lastUpdatedErrorSet(state, action: PayloadAction<string | null>) {
      state.lastUpdatedError = action.payload;
    },

    /**
     * Set progress for fetchSubredditsLastUpdated
     * Shows real-time progress of background polling
     */
    lastUpdatedProgressSet(
      state,
      action: PayloadAction<{ total: number; completed: number } | null>
    ) {
      state.lastUpdatedProgress = action.payload;
    },
  },
});

// Export actions
export const {
  lastUpdatedSet,
  lastUpdatedCleared,
  lastUpdatedRunningSet,
  lastUpdatedErrorSet,
  lastUpdatedProgressSet,
} = subredditPollingSlice.actions;

// Export reducer
export default subredditPollingSlice.reducer;

/**
 * Async thunk to fetch last post timestamps for each subreddit
 * Used to show "new post" indicators in the sidebar
 *
 * CRITICAL: This thunk includes rate limiting protection:
 * - p-limit(5): Max 5 concurrent requests
 * - randomDelay(2, 5): 2-5 second delays between requests
 * - Smart caching: Only checks subreddits with expired cache
 *
 * These limits prevent Reddit API rate limiting issues.
 * DO NOT REMOVE OR REDUCE THESE LIMITS.
 */
export const fetchSubredditsLastUpdated = createAsyncThunk<
  void,
  void,
  { state: RootState }
>(
  'subredditPolling/fetchLastUpdated',
  async (_, { dispatch, getState }) => {
    const state = getState();

    // Get subreddit list from RTK Query cache
    // The query key format is 'getSubreddits({"where":"subscriber"})' or similar
    // We need to find the active query in the cache
    const queries = state.redditApi.queries;
    let subreddits: EntityState<SubredditData, string> | undefined;

    // Find the getSubreddits query in the cache
    for (const [key, value] of Object.entries(queries)) {
      if (key.startsWith('getSubreddits(')) {
        subreddits = value?.data as
          | EntityState<SubredditData, string>
          | undefined;
        break;
      }
    }

    if (!subreddits?.entities) {
      console.warn('Subreddit polling: No subreddit data available in cache');
      return;
    }

    const { lastUpdatedTracking } = state.subredditPolling;

    // Set running flag and clear previous errors
    dispatch(lastUpdatedRunningSet(true));
    dispatch(lastUpdatedErrorSet(null));

    try {
      // Create subreddit lookup requests
      const lookups: Array<{
        type: 'friend' | 'subreddit';
        path: string;
        id: string;
      }> = [];

      Object.values(subreddits.entities).forEach((subreddit) => {
        // Type guard: EntityAdapter's entities can have undefined values
        if (!subreddit) {
          return;
        }

        // CRITICAL: Use fullname (name field like 't5_2r0ij') as the key
        // Components expect this format in lastUpdatedTracking lookups
        const subredditFullname = subreddit.name;

        // Check if this subreddit needs updating based on expiration
        if (shouldUpdate(lastUpdatedTracking, subredditFullname)) {
          // Check if it's a subreddit or a user
          if (subreddit.url.match(/^\/user\//)) {
            lookups.push({
              type: 'friend',
              path: subreddit.url.replace(/^\/user\/|\/$/g, ''),
              id: subredditFullname,
            });
            return;
          }

          lookups.push({
            type: 'subreddit',
            path: subreddit.url.replace(/^\/r\/|\/$/g, ''),
            id: subredditFullname,
          });
        }
      });

      // Initialize progress tracking
      let completedCount = 0;
      dispatch(
        lastUpdatedProgressSet({
          total: lookups.length,
          completed: 0,
        })
      );

      // Fetch with delay and rate limiting
      const fetchWithDelay = async (lookup: (typeof lookups)[0]) => {
        const { type, path, id } = lookup;
        // CRITICAL: 2-5 second random delay for rate limiting
        const toUpdate = await getLastUpdatedWithDelay(type, path, id, 2, 5);
        if (toUpdate !== null) {
          // PERFORMANCE NOTE: Dispatching individually (not batched)
          // This creates one action per subreddit.
          // Tradeoff: Progressive UI updates (good UX) vs batching (fewer re-renders).
          // Current approach chosen for better perceived performance.
          dispatch(lastUpdatedSet(toUpdate));
        }

        // Update progress counter
        completedCount += 1;
        dispatch(
          lastUpdatedProgressSet({
            total: lookups.length,
            completed: completedCount,
          })
        );
      };

      // CRITICAL: p-limit(5) for concurrency control
      const limit = pLimit(5);
      const fetchPromises = lookups.map((lookup) =>
        limit(() => fetchWithDelay(lookup))
      );

      await Promise.all(fetchPromises);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error fetching last updated';
      console.error('Error fetching last updated', error);
      dispatch(lastUpdatedErrorSet(errorMessage));
    } finally {
      // Clear running flag and reset progress
      dispatch(lastUpdatedRunningSet(false));
      dispatch(lastUpdatedProgressSet(null));
    }
  },
  {
    // Condition prevents concurrent runs (double-check for race conditions)
    condition: (_, { getState }) => {
      const state = getState();
      return !state.subredditPolling.lastUpdatedRunning;
    },
  }
);

// Selectors
export const selectLastUpdatedTracking = (state: RootState) =>
  state.subredditPolling.lastUpdatedTracking;

export const selectLastUpdatedTime = (state: RootState) =>
  state.subredditPolling.lastUpdatedTime;

export const selectLastUpdatedRunning = (state: RootState) =>
  state.subredditPolling.lastUpdatedRunning;

export const selectLastUpdatedError = (state: RootState) =>
  state.subredditPolling.lastUpdatedError;

export const selectLastUpdatedProgress = (state: RootState) =>
  state.subredditPolling.lastUpdatedProgress;
