/**
 * Modern Redux Toolkit slice for Reddit Subreddits
 * Following Redux Toolkit 2.0+ best practices
 *
 * This slice manages:
 * - User's subscribed subreddits (or default subreddits for anon users)
 * - Subreddit filtering for sidebar navigation
 * - Last updated timestamps for each subreddit (for "new post" indicators)
 * - Cache management with 24-hour expiration
 *
 * Migration from legacy code:
 * - Consolidated 4 separate reducers into 1 slice
 * - Replaced module-level state with Redux state
 * - Added EntityAdapter for normalized state and O(1) lookups
 * - Used condition functions for smart cache management
 * - Preserved rate limiting for Reddit API compliance
 */
import {
  createSlice,
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  type PayloadAction,
  type EntityState,
} from '@reduxjs/toolkit';
import pLimit from 'p-limit';
import type { RootState } from '@/types/redux';
import type { SubredditData, Thing } from '@/types/redditApi';
import RedditAPI from '@/reddit/redditAPI';
import {
  getLastUpdatedWithDelay,
  shouldUpdate,
} from '../actions/helpers/lastFetched';

/**
 * Cache expiration time in milliseconds (24 hours)
 */
const CACHE_EXPIRATION = 3600 * 24 * 1000;

/**
 * Filter state for sidebar subreddit navigation
 */
export interface SubredditFilterState {
  filterText: string;
  active: boolean;
  activeIndex: number;
}

/**
 * Last updated tracking for subreddit post timestamps
 */
export interface LastUpdatedEntry {
  lastPost: number;
  expires: number;
}

export type LastUpdatedTracking = Record<string, LastUpdatedEntry>;

/**
 * State shape for subreddits slice
 * Uses EntityAdapter for normalized state with O(1) lookups
 */
export interface SubredditsState extends EntityState<SubredditData, string> {
  // EntityAdapter provides: ids: string[], entities: Record<string, SubredditData>

  // Status tracking
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  lastUpdated: number;

  // Filter state for sidebar navigation
  filter: SubredditFilterState;

  // Last updated tracking for "new post" indicators
  lastUpdatedTracking: LastUpdatedTracking;
  lastUpdatedTime: number;
  lastUpdatedRunning: boolean;
}

/**
 * EntityAdapter for managing normalized subreddit data
 * Sorts subreddits alphabetically by display_name
 */
const subredditsAdapter = createEntityAdapter<SubredditData, string>({
  selectId: (subreddit) => subreddit.display_name.toLowerCase(),
  sortComparer: (a, b) =>
    a.display_name.toLowerCase().localeCompare(b.display_name.toLowerCase()),
});

/**
 * Initial state
 */
const initialState: SubredditsState = subredditsAdapter.getInitialState({
  status: 'idle',
  error: null,
  lastUpdated: 0,
  filter: {
    filterText: '',
    active: false,
    activeIndex: 0,
  },
  lastUpdatedTracking: {},
  lastUpdatedTime: 0,
  lastUpdatedRunning: false,
});

/**
 * Helper: Map Reddit API response children to normalized record
 */
const mapSubreddits = (
  children: Thing<SubredditData>[]
): Record<string, SubredditData> =>
  children
    .map((thing) => thing.data)
    .reduce(
      (acc, sub) => ({ ...acc, [sub.display_name.toLowerCase()]: sub }),
      {}
    );

/**
 * Helper: Fetch all subreddits with pagination (handles Reddit's 100 sub limit)
 */
const subredditsAll = async (
  where: string,
  options?: Record<string, unknown>
): Promise<Record<string, SubredditData>> => {
  let init = true;
  let qsAfter: string | null = null;
  let subreddits: Record<string, SubredditData> = {};

  const newOptions = options ?? {};

  while (init || qsAfter) {
    init = false;
    newOptions.after = qsAfter;
    const srs = await RedditAPI.subreddits(where, newOptions);
    const mapped = mapSubreddits(srs.data.children);
    subreddits = { ...mapped, ...subreddits };
    qsAfter = srs.data.after ?? null;
  }

  return subreddits;
};

/**
 * Async thunk to fetch subreddits from Reddit API
 * Supports both authenticated (subscriber) and anonymous (default) modes
 *
 * @param where - Type of subreddits to fetch:
 *   - 'subscriber': User's subscribed subreddits (authenticated)
 *   - 'default': Default subreddits (anonymous)
 *   - 'contributor': Subreddits user is approved submitter in
 *   - 'moderator': Subreddits user moderates
 */
export const fetchSubreddits = createAsyncThunk<
  Record<string, SubredditData>, // Return type
  { reset?: boolean; where?: string }, // Argument type
  { state: RootState } // ThunkAPI config
>(
  'subreddits/fetch',
  async ({ where = 'subscriber' }, { rejectWithValue }) => {
    try {
      const subreddits = await subredditsAll(where, {});
      return subreddits;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch subreddits'
      );
    }
  },
  {
    // Condition prevents thunk from running if cache is still valid
    condition: ({ reset = false }, { getState }) => {
      if (reset) {
        return true;
      } // Allow forced refresh

      const state = getState();
      const currentState = state.subreddits;

      // Don't run if already loading
      if (currentState.status === 'loading') {
        return false;
      }

      // Check if we need to fetch based on cache expiration (24 hours)
      if (currentState.status === 'succeeded') {
        const cacheExpired =
          Date.now() > currentState.lastUpdated + CACHE_EXPIRATION;
        return cacheExpired; // Only run if cache expired
      }

      return true; // Run if status is idle or failed
    },
  }
);

/**
 * Async thunk to fetch last post timestamps for each subreddit
 * Used to show "new post" indicators in the sidebar
 *
 * CRITICAL: This thunk includes rate limiting protection:
 * - p-limit(5): Max 5 concurrent requests
 * - randomDelay(2, 5): 2-5 second delays between requests
 * - Max 100 subreddits per batch
 *
 * These limits prevent Reddit API rate limiting issues.
 * DO NOT REMOVE OR REDUCE THESE LIMITS.
 */
export const fetchSubredditsLastUpdated = createAsyncThunk<
  void,
  void,
  { state: RootState }
>('subreddits/fetchLastUpdated', async (_, { dispatch, getState }) => {
  const state = getState();
  const { entities, lastUpdatedTracking, lastUpdatedRunning } =
    state.subreddits;

  // Prevent concurrent runs
  if (lastUpdatedRunning) {
    return;
  }

  // Set running flag via action creator type (slice defined below)
  dispatch({ type: 'subreddits/lastUpdatedRunningSet', payload: true });

  try {
    // Create subreddit lookup requests
    const lookups: Array<{
      type: 'friend' | 'subreddit';
      path: string;
      id: string;
    }> = [];

    Object.values(entities).forEach((subreddit) => {
      if (!subreddit) {
        return;
      }

      const subredditName = subreddit.display_name.toLowerCase();

      // Check if this subreddit needs updating based on expiration
      if (shouldUpdate(lastUpdatedTracking, subredditName)) {
        // Check if it's a subreddit or a user
        if (subreddit.url.match(/^\/user\//)) {
          lookups.push({
            type: 'friend',
            path: subreddit.url.replace(/^\/user\/|\/$/g, ''),
            id: subredditName,
          });
          return;
        }

        lookups.push({
          type: 'subreddit',
          path: subreddit.url.replace(/^\/r\/|\/$/g, ''),
          id: subredditName,
        });
      }
    });

    // Fetch with delay and rate limiting
    const fetchWithDelay = async (lookup: (typeof lookups)[0]) => {
      const { type, path, id } = lookup;
      // CRITICAL: 2-5 second random delay for rate limiting
      const toUpdate = await getLastUpdatedWithDelay(type, path, id, 2, 5);
      if (toUpdate !== null) {
        dispatch({ type: 'subreddits/lastUpdatedSet', payload: toUpdate });
      }
    };

    // CRITICAL: p-limit(5) for concurrency control
    const limit = pLimit(5);
    // CRITICAL: Max 100 subreddits to prevent API overload
    const max = 100;
    const maxLookups = lookups.slice(0, max);
    const fetchPromises = maxLookups.map((lookup) =>
      limit(() => fetchWithDelay(lookup))
    );

    await Promise.all(fetchPromises);
  } catch (error) {
    console.error('Error fetching last updated', error);
  } finally {
    // Clear running flag
    dispatch({ type: 'subreddits/lastUpdatedRunningSet', payload: false });
  }
});

/**
 * Subreddits slice
 */
const subredditsSlice = createSlice({
  name: 'subreddits',
  initialState,
  reducers: {
    /**
     * Update filter state for sidebar navigation
     */
    filterUpdated(state, action: PayloadAction<Partial<SubredditFilterState>>) {
      state.filter = { ...state.filter, ...action.payload };
    },

    /**
     * Set last updated timestamp for a subreddit
     */
    lastUpdatedSet(state, action: PayloadAction<LastUpdatedTracking>) {
      state.lastUpdatedTracking = {
        ...state.lastUpdatedTracking,
        ...action.payload,
      };
      state.lastUpdatedTime = Date.now();
    },

    /**
     * Clear all last updated timestamps
     */
    lastUpdatedCleared(state) {
      state.lastUpdatedTracking = {};
      state.lastUpdatedTime = 0;
    },

    /**
     * Set the running flag for fetchSubredditsLastUpdated
     * Prevents concurrent executions
     */
    lastUpdatedRunningSet(state, action: PayloadAction<boolean>) {
      state.lastUpdatedRunning = action.payload;
    },

    /**
     * Clear all subreddits data
     */
    subredditsCleared(state) {
      subredditsAdapter.removeAll(state);
      state.status = 'idle';
      state.error = null;
      state.lastUpdated = 0;
      state.filter = initialState.filter;
      state.lastUpdatedTracking = {};
      state.lastUpdatedTime = 0;
      state.lastUpdatedRunning = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchSubreddits
      .addCase(fetchSubreddits.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(
        fetchSubreddits.fulfilled,
        (state, action: PayloadAction<Record<string, SubredditData>>) => {
          state.status = 'succeeded';
          // Set all subreddits in normalized state (EntityAdapter handles sorting)
          subredditsAdapter.setAll(state, action.payload);
          state.error = null;
          state.lastUpdated = Date.now();
        }
      )
      .addCase(fetchSubreddits.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          (action.payload as string) ??
          action.error.message ??
          'Failed to fetch subreddits';
      });

    // fetchSubredditsLastUpdated doesn't need extra reducers
    // It dispatches lastUpdatedSet actions during execution
  },
});

// Export actions
export const {
  filterUpdated,
  lastUpdatedSet,
  lastUpdatedCleared,
  lastUpdatedRunningSet,
  subredditsCleared,
} = subredditsSlice.actions;

// Export reducer
export default subredditsSlice.reducer;

/**
 * Base Selectors
 */

// Entity adapter selectors
export const {
  selectAll: selectAllSubreddits,
  selectById: selectSubredditById,
  selectIds: selectSubredditIds,
  selectEntities: selectSubredditEntities,
} = subredditsAdapter.getSelectors((state: RootState) => state.subreddits);

// Individual property selectors
export const selectSubredditsStatus = (state: RootState) =>
  state.subreddits.status;

export const selectSubredditsError = (state: RootState) =>
  state.subreddits.error;

export const selectSubredditsLastUpdated = (state: RootState) =>
  state.subreddits.lastUpdated;

export const selectSubredditsFilter = (state: RootState) =>
  state.subreddits.filter;

export const selectLastUpdatedTracking = (state: RootState) =>
  state.subreddits.lastUpdatedTracking;

export const selectLastUpdatedTime = (state: RootState) =>
  state.subreddits.lastUpdatedTime;

/**
 * Memoized Selectors
 */

/**
 * Check if subreddits are loaded
 */
export const selectSubredditsLoaded = createSelector(
  [selectSubredditsStatus],
  (status) => status === 'succeeded'
);

/**
 * Check if subreddits are loading
 */
export const selectSubredditsLoading = createSelector(
  [selectSubredditsStatus],
  (status) => status === 'loading'
);

/**
 * Check if cache is expired
 */
export const selectSubredditsCacheExpired = createSelector(
  [selectSubredditsLastUpdated],
  (lastUpdated) => Date.now() > lastUpdated + CACHE_EXPIRATION
);

/**
 * Get filtered subreddits based on filter text
 * Returns all subreddits if filter is empty
 */
export const selectFilteredSubreddits = createSelector(
  [selectAllSubreddits, selectSubredditsFilter],
  (subreddits, filter) => {
    if (!filter.filterText) {
      return subreddits;
    }

    const filterLower = filter.filterText.toLowerCase();
    return subreddits.filter((sub) =>
      sub.display_name.toLowerCase().includes(filterLower)
    );
  }
);

/**
 * Get subreddit keys (display names) as array
 */
export const selectSubredditKeys = createSelector(
  [selectSubredditIds],
  (ids) => ids
);

/**
 * Get cached subreddit by target name from listingsFilter
 * Used for getting subreddit info when viewing a subreddit page
 */
export const selectCachedSubreddit = (target: string) =>
  createSelector([selectSubredditEntities], (entities) => {
    if (!target) {
      return null;
    }
    return entities[target.toLowerCase()] ?? null;
  });
