/**
 * Modern Redux Toolkit slice for Reddit listings
 * Consolidates: listingsFilter, currentSubreddit, listingsState, listingsRedditEntries, listingsRedditStatus
 */

import type { PayloadAction } from '@reduxjs/toolkit';
import {
  createSlice,
  createAsyncThunk,
  createSelector,
} from '@reduxjs/toolkit';
import queryString from 'query-string';
import type { RootState } from '@/types/redux';
import type {
  Thing,
  LinkData,
  SubredditData,
  Listing,
} from '@/types/redditApi';
import type { ListingsFilter, ListingsState } from '@/types/listings';
import RedditAPI from '@/reddit/redditAPI';
import { keyEntryChildren } from '@/common';

const MAX_HISTORY_LOCATIONS = 7;
const MAX_HISTORY_TIME_SECONDS = 3600;
const MAX_POSTS_IN_MEMORY = 500;
type ListingsStatus =
  | 'unloaded'
  | 'loading'
  | 'loaded'
  | 'loadedAll'
  | 'loadingNext'
  | 'loadingNew'
  | 'loadingStream'
  | 'error';

interface LocationData {
  before: string | null;
  after: string | null;
  children: Record<string, Thing<LinkData>>;
  originalPost?: Thing<LinkData>;
  requestUrl?: string;
  saved: number;
  fetchType: 'init' | 'more' | 'new';
  status: ListingsStatus;
}

interface CachedSubredditData extends SubredditData {
  saved: number;
}

interface CachedListingsState extends ListingsState {
  saved: number;
}

export interface ListingsSliceState {
  currentFilter: ListingsFilter;
  listingsByLocation: Record<string, LocationData>;
  subredditsByLocation: Record<string, CachedSubredditData>;
  uiStateByLocation: Record<string, CachedListingsState>;
}
function pruneLocationData<T extends { saved: number }>(
  data: Record<string, T>,
  maxKeys: number,
  maxAgeSeconds: number
): Record<string, T> {
  const now = Date.now();
  const maxAgeMs = maxAgeSeconds * 1000;
  const newData: Record<string, T> = {};

  const validEntries = Object.entries(data).filter(([_key, value]) => {
    const elapsed = now - value.saved;
    return elapsed <= maxAgeMs;
  });

  const sortedEntries = validEntries
    .sort((a, b) => b[1].saved - a[1].saved)
    .slice(0, maxKeys);

  sortedEntries.forEach(([key, value]) => {
    newData[key] = value;
  });

  return newData;
}

async function getContent(
  filters: ListingsFilter,
  params: Record<string, unknown>
) {
  const target = filters.target !== 'mine' ? filters.target : null;
  const { user, sort, multi, listType, postName, comment } = filters;

  let entries;

  switch (listType) {
    case 'r':
      entries = await RedditAPI.getListingSubreddit(target, sort, params);
      break;
    case 'm':
      entries = await RedditAPI.getListingMulti(user, target, sort, params);
      break;
    case 'u':
      entries = await RedditAPI.getListingUser(
        user,
        target === 'posts' ? 'submitted' : target,
        sort,
        params
      );
      break;
    case 's':
      entries = multi
        ? await RedditAPI.getListingSearchMulti(user, target, params)
        : await RedditAPI.getListingSearch(target, params);
      break;
    case 'duplicates': {
      const dupes = await RedditAPI.getListingDuplicates(target, params);
      entries = {
        ...dupes[1],
        originalPost: dupes[0],
        requestUrl: dupes.requestUrl,
      };
      break;
    }
    case 'comments': {
      const comments = await RedditAPI.getComments(
        target,
        postName,
        comment,
        params
      );
      entries = {
        ...comments[1],
        originalPost: comments[0],
        requestUrl: comments.requestUrl,
      };
      break;
    }
    default:
      throw new Error(`Unknown listType: ${listType}`);
  }

  if (entries) {
    entries = keyEntryChildren(entries);
  }

  return entries;
}

async function getSubredditAbout(
  filter: ListingsFilter
): Promise<SubredditData | Record<string, never>> {
  const { target, listType, multi } = filter;
  const badTarget = !target || target.match(/mine|popular|friends/);

  if ((listType !== 's' && listType !== 'r') || multi || badTarget) {
    return {};
  }

  const about = await RedditAPI.subredditAbout(target);
  return about.data;
}
export const fetchListingsInitial = createAsyncThunk<
  {
    locationKey: string;
    entries: {
      data: {
        before: string | null;
        after: string | null;
        children: Record<string, Thing<LinkData>>;
        [key: string]: unknown;
      };
      requestUrl: string;
      originalPost?: Listing<LinkData>;
    };
    subreddit: SubredditData | Record<string, never>;
  },
  {
    filters: ListingsFilter;
    location: { key?: string; search: string };
    siteSettings: { view: string };
  },
  { state: RootState }
>(
  'listings/fetchInitial',
  async ({ filters, location, siteSettings }, { getState }) => {
    const locationKey = location.key ?? 'front';

    // Parse query string params
    const qs = queryString.parse(location.search);
    const params: Record<string, unknown> = { ...qs };

    // Set limit based on view mode
    if (siteSettings.view === 'condensed' && !params.limit) {
      params.limit = '100';
    }

    // Fetch content
    const entries = await getContent(filters, params);

    // Fetch subreddit info in parallel
    const subreddit = await getSubredditAbout(filters);

    return {
      locationKey,
      entries,
      subreddit,
    };
  }
);

/**
 * Fetch next page of listings (pagination)
 */
export const fetchListingsNext = createAsyncThunk<
  {
    locationKey: string;
    entries: {
      data: {
        before: string | null;
        after: string | null;
        children: Record<string, Thing<LinkData>>;
        [key: string]: unknown;
      };
      requestUrl: string;
    };
  },
  {
    location: { key?: string; search: string };
  },
  { state: RootState }
>('listings/fetchNext', async ({ location }, { getState }) => {
  const state = getState();
  const locationKey = location.key ?? 'front';
  const currentData = state.listings.listingsByLocation?.[locationKey];

  if (!currentData) {
    throw new Error(
      `Cannot fetch next: no data found for location key "${locationKey}"`
    );
  }

  const { after } = currentData;

  // Parse query string and add pagination params
  const qs = queryString.parse(location.search);
  const params: Record<string, unknown> = {
    ...qs,
    limit: 50,
    after,
  };

  // Fetch next page
  const entries = await getContent(state.listings.currentFilter, params);

  return {
    locationKey,
    entries,
  };
});

/**
 * Fetch new listings (refresh/reload)
 * Returns count of new posts
 */
export const fetchListingsNew = createAsyncThunk<
  {
    locationKey: string;
    entries: {
      data: {
        before: string | null;
        after: string | null;
        children: Record<string, Thing<LinkData>>;
        [key: string]: unknown;
      };
      requestUrl: string;
    };
    newPostCount: number;
  },
  {
    location: { key?: string; search: string };
    stream?: boolean;
  },
  { state: RootState; rejectValue: string }
>(
  'listings/fetchNew',
  async ({ location, stream = false }, { getState, rejectWithValue }) => {
    const state = getState();
    const locationKey = location.key ?? 'front';
    const currentData = state.listings.listingsByLocation?.[locationKey];

    if (!currentData) {
      return rejectWithValue('No current data to refresh');
    }

    const { children, status } = currentData;

    // Only fetch if currently loaded
    if (status !== 'loaded' && status !== 'loadedAll') {
      return rejectWithValue('Cannot refresh while loading');
    }

    const childKeys = Object.keys(children);
    if (childKeys.length === 0) {
      return rejectWithValue('No posts to use as reference');
    }

    const before = childKeys[0];

    // Parse query string and add params
    const qs = queryString.parse(location.search);
    const params: Record<string, unknown> = {
      ...qs,
      limit: 100,
      before,
    };

    // Fetch new posts
    const entries = await getContent(state.listings.currentFilter, params);
    const newPostCount = Object.keys(entries.data.children).length;

    return {
      locationKey,
      entries,
      newPostCount,
    };
  }
);

// =============================================================================
// Slice
// =============================================================================

const initialState: ListingsSliceState = {
  currentFilter: {
    listType: 'r',
    target: 'mine',
    sort: 'hot',
  },
  listingsByLocation: {},
  subredditsByLocation: {},
  uiStateByLocation: {},
};

const listingsSlice = createSlice({
  name: 'listings',
  initialState,
  reducers: {
    /**
     * Set the current filter
     */
    filterChanged(state, action: PayloadAction<ListingsFilter>) {
      state.currentFilter = action.payload;
    },

    /**
     * Set UI state for a location
     */
    uiStateUpdated(
      state,
      action: PayloadAction<{ key: string; uiState: ListingsState }>
    ) {
      const { key, uiState } = action.payload;
      state.uiStateByLocation[key] = {
        ...uiState,
        saved: Date.now(),
      };

      // Prune old UI states
      state.uiStateByLocation = pruneLocationData(
        state.uiStateByLocation,
        MAX_HISTORY_LOCATIONS,
        MAX_HISTORY_TIME_SECONDS
      );
    },

    /**
     * Update specific post entries across locations
     */
    postEntriesUpdated(
      state,
      action: PayloadAction<{
        [locationID: string]: {
          [postID: string]: Partial<LinkData>;
        };
      }>
    ) {
      const updates = action.payload;

      Object.entries(updates).forEach(([locationID, posts]) => {
        const location = state.listingsByLocation[locationID];
        if (!location) {
          return;
        }

        Object.entries(posts).forEach(([postID, postUpdates]) => {
          const post = location.children[postID];
          if (post) {
            post.data = {
              ...post.data,
              ...postUpdates,
            };
          }
        });
      });
    },

    /**
     * Clear cached data for a specific location
     */
    locationCleared(state, action: PayloadAction<string>) {
      const locationKey = action.payload;
      delete state.listingsByLocation[locationKey];
      delete state.subredditsByLocation[locationKey];
      delete state.uiStateByLocation[locationKey];
    },

    /**
     * Clear all cached listings
     */
    allListingsCleared(state) {
      state.listingsByLocation = {};
      state.subredditsByLocation = {};
      state.uiStateByLocation = {};
    },
  },

  extraReducers: (builder) => {
    // ==========================================================================
    // fetchListingsInitial
    // ==========================================================================
    builder
      .addCase(fetchListingsInitial.pending, (state, action) => {
        const { location } = action.meta.arg;
        const locationKey = location.key ?? 'front';

        // Initialize or update status
        if (!state.listingsByLocation[locationKey]) {
          state.listingsByLocation[locationKey] = {
            before: null,
            after: null,
            children: {},
            saved: Date.now(),
            fetchType: 'init',
            status: 'loading',
          };
        } else {
          state.listingsByLocation[locationKey].status = 'loading';
        }
      })
      .addCase(fetchListingsInitial.fulfilled, (state, action) => {
        const { locationKey, entries, subreddit } = action.payload;
        const { listType } = action.meta.arg.filters;

        // Prepare data
        const data = {
          ...entries.data,
          requestUrl: entries.requestUrl,
        };

        // Add original post for comments/duplicates
        if (
          entries.originalPost &&
          (listType === 'duplicates' || listType === 'comments')
        ) {
          data.originalPost = entries.originalPost.data.children[0];
        }

        const hasMore = !!data.after;
        const status: ListingsStatus = hasMore ? 'loaded' : 'loadedAll';

        // Update listings data
        state.listingsByLocation[locationKey] = {
          before: data.before,
          after: data.after,
          children: data.children,
          originalPost: data.originalPost,
          requestUrl: data.requestUrl,
          saved: Date.now(),
          fetchType: 'init',
          status,
        };

        // Update subreddit info if provided
        if (Object.keys(subreddit).length > 0) {
          state.subredditsByLocation[locationKey] = {
            ...subreddit,
            saved: Date.now(),
          } as CachedSubredditData;
        }

        // Prune old locations
        state.listingsByLocation = pruneLocationData(
          state.listingsByLocation,
          MAX_HISTORY_LOCATIONS,
          MAX_HISTORY_TIME_SECONDS
        );
        state.subredditsByLocation = pruneLocationData(
          state.subredditsByLocation,
          MAX_HISTORY_LOCATIONS,
          MAX_HISTORY_TIME_SECONDS
        );
      })
      .addCase(fetchListingsInitial.rejected, (state, action) => {
        const { location } = action.meta.arg;
        const locationKey = location.key ?? 'front';

        if (state.listingsByLocation[locationKey]) {
          state.listingsByLocation[locationKey].status = 'error';
        }
      });

    // ==========================================================================
    // fetchListingsNext
    // ==========================================================================
    builder
      .addCase(fetchListingsNext.pending, (state, action) => {
        const { location } = action.meta.arg;
        const locationKey = location.key ?? 'front';

        if (state.listingsByLocation[locationKey]) {
          state.listingsByLocation[locationKey].status = 'loadingNext';
        }
      })
      .addCase(fetchListingsNext.fulfilled, (state, action) => {
        const { locationKey, entries } = action.payload;
        const location = state.listingsByLocation[locationKey];

        if (location) {
          // Merge new children with existing
          location.children = {
            ...location.children,
            ...entries.data.children,
          };
          location.after = entries.data.after;
          location.fetchType = 'more';
          location.status = entries.data.after ? 'loaded' : 'loadedAll';
        }
      })
      .addCase(fetchListingsNext.rejected, (state, action) => {
        const { location } = action.meta.arg;
        const locationKey = location.key ?? 'front';

        if (state.listingsByLocation[locationKey]) {
          state.listingsByLocation[locationKey].status = 'error';
        }
      });

    // ==========================================================================
    // fetchListingsNew
    // ==========================================================================
    builder
      .addCase(fetchListingsNew.pending, (state, action) => {
        const { location, stream } = action.meta.arg;
        const locationKey = location.key ?? 'front';

        if (state.listingsByLocation[locationKey]) {
          state.listingsByLocation[locationKey].status = stream
            ? 'loadingStream'
            : 'loadingNew';
        }
      })
      .addCase(fetchListingsNew.fulfilled, (state, action) => {
        const { locationKey, entries, newPostCount } = action.payload;
        const location = state.listingsByLocation[locationKey];

        if (!location) {
          return;
        }

        // If no new posts, just update status
        if (newPostCount === 0) {
          location.status = 'loaded';
          return;
        }

        // If we got 100 posts (limit), replace everything with fresh data
        if (newPostCount === 100) {
          location.children = entries.data.children;
          location.before = entries.data.before;
          location.after = entries.data.after;
          location.status = 'loaded';
          location.fetchType = 'new';
          return;
        }

        // Prepend new posts to existing
        const newChildren = {
          ...entries.data.children,
          ...location.children,
        };

        // Truncate to conserve memory
        const childKeys = Object.keys(newChildren);
        if (childKeys.length > MAX_POSTS_IN_MEMORY) {
          const keysToKeep = childKeys.slice(0, MAX_POSTS_IN_MEMORY);
          const truncatedChildren: Record<string, Thing<LinkData>> = {};

          keysToKeep.forEach((key) => {
            truncatedChildren[key] = newChildren[key];
          });

          location.children = truncatedChildren;
        } else {
          location.children = newChildren;
        }

        location.before = entries.data.before;
        location.status = 'loaded';
        location.fetchType = 'new';
      })
      .addCase(fetchListingsNew.rejected, (state, action) => {
        const { location } = action.meta.arg;
        const locationKey = location.key ?? 'front';

        if (state.listingsByLocation[locationKey]) {
          state.listingsByLocation[locationKey].status = 'error';
        }
      });
  },
});

// =============================================================================
// Actions Export
// =============================================================================

export const {
  filterChanged,
  uiStateUpdated,
  postEntriesUpdated,
  locationCleared,
  allListingsCleared,
} = listingsSlice.actions;

// =============================================================================
// Selectors
// =============================================================================

// Base selectors
const selectListingsByLocation = (state: RootState) =>
  state.listings?.listingsByLocation ?? {};
const selectSubredditsByLocation = (state: RootState) =>
  state.listings?.subredditsByLocation ?? {};
const selectUiStateByLocation = (state: RootState) =>
  state.listings?.uiStateByLocation ?? {};
const selectCurrentFilter = (state: RootState) =>
  state.listings?.currentFilter ?? {
    listType: 'r',
    target: 'mine',
    sort: 'hot',
  };

// Memoized selectors with location key parameter
export const selectListingData = createSelector(
  [
    selectListingsByLocation,
    (_state: RootState, locationKey: string) => locationKey,
  ],
  (listingsByLocation, locationKey) => {
    const key = locationKey ?? 'front';
    return (
      listingsByLocation[key] ?? {
        before: null,
        after: null,
        children: {},
        status: 'unloaded' as ListingsStatus,
        saved: 0,
        fetchType: 'init' as const,
      }
    );
  }
);

export const selectListingStatus = createSelector(
  [
    selectListingsByLocation,
    (_state: RootState, locationKey: string) => locationKey,
  ],
  (listingsByLocation, locationKey) => {
    const key = locationKey ?? 'front';
    const location = listingsByLocation[key];
    return location?.status ?? ('unloaded' as ListingsStatus);
  }
);

export const selectListingChildren = createSelector(
  [selectListingData],
  (listingData) => listingData.children ?? {}
);

export const selectListingChildrenArray = createSelector(
  [selectListingChildren],
  (children) => Object.values(children)
);

export const selectSubredditData = createSelector(
  [
    selectSubredditsByLocation,
    (_state: RootState, locationKey: string) => locationKey,
  ],
  (subredditsByLocation, locationKey) => {
    const key = locationKey ?? 'front';
    return subredditsByLocation[key] ?? {};
  }
);

export const selectUiState = createSelector(
  [
    selectUiStateByLocation,
    (_state: RootState, locationKey: string) => locationKey,
  ],
  (uiStateByLocation, locationKey) => {
    const key = locationKey ?? 'front';
    return (
      uiStateByLocation[key] ?? {
        focused: '',
        visible: [],
        minHeights: {},
        actionable: null,
        hasError: false,
      }
    );
  }
);

export const selectFilter = createSelector(
  [selectCurrentFilter],
  (filter) => filter
);

// =============================================================================
// Reducer Export
// =============================================================================

export default listingsSlice.reducer;
