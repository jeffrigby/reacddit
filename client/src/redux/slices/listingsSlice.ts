import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/types/redux';
import type { Thing, LinkData, SubredditData } from '@/types/redditApi';
import type { ListingsFilter, ListingsState } from '@/types/listings';

const MAX_HISTORY_LOCATIONS = 7;
const MAX_HISTORY_TIME_SECONDS = 3600;

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
  refreshTrigger: Record<string, number>; // locationKey -> timestamp
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

const initialState: ListingsSliceState = {
  currentFilter: {
    listType: 'r',
    target: 'mine',
    sort: 'hot',
  },
  listingsByLocation: {},
  subredditsByLocation: {},
  uiStateByLocation: {},
  refreshTrigger: {},
};

const listingsSlice = createSlice({
  name: 'listings',
  initialState,
  reducers: {
    filterChanged(state, action: PayloadAction<ListingsFilter>) {
      state.currentFilter = action.payload;
    },

    uiStateUpdated(
      state,
      action: PayloadAction<{ key: string; uiState: ListingsState }>
    ) {
      const { key, uiState } = action.payload;
      state.uiStateByLocation[key] = {
        ...uiState,
        saved: Date.now(),
      };

      state.uiStateByLocation = pruneLocationData(
        state.uiStateByLocation,
        MAX_HISTORY_LOCATIONS,
        MAX_HISTORY_TIME_SECONDS
      );
    },

    statusUpdated(
      state,
      action: PayloadAction<{ locationKey: string; status: ListingsStatus }>
    ) {
      const { locationKey, status } = action.payload;

      if (!state.listingsByLocation[locationKey]) {
        state.listingsByLocation[locationKey] = {
          before: null,
          after: null,
          children: {},
          saved: Date.now(),
          fetchType: 'init',
          status,
        };
      } else {
        state.listingsByLocation[locationKey].status = status;
      }
    },

    refreshRequested(state, action: PayloadAction<{ locationKey: string }>) {
      const { locationKey } = action.payload;
      state.refreshTrigger[locationKey] = Date.now();
    },
  },
});

export const {
  filterChanged,
  uiStateUpdated,
  statusUpdated,
  refreshRequested,
} = listingsSlice.actions;

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

export const selectRefreshTrigger = (state: RootState, locationKey: string) =>
  state.listings?.refreshTrigger?.[locationKey] ?? 0;

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

export const selectPostFocused = createSelector(
  [
    (state: RootState) => state.listings?.uiStateByLocation,
    (_state: RootState, postName: string) => postName,
    (_state: RootState, _postName: string, idx: number) => idx,
    (_state: RootState, _postName: string, _idx: number, locationKey: string) =>
      locationKey,
  ],
  (uiStateByLocation, postName, idx, locationKey) => {
    const key = locationKey ?? 'front';
    const listingState = uiStateByLocation?.[key];
    if (!listingState) {
      return idx === 0;
    }
    const { focused } = listingState;
    return !focused ? idx === 0 : focused === postName;
  }
);

export const selectPostActionable = createSelector(
  [
    (state: RootState) => state.listings?.uiStateByLocation,
    (_state: RootState, postName: string) => postName,
    (_state: RootState, _postName: string, idx: number) => idx,
    (_state: RootState, _postName: string, _idx: number, locationKey: string) =>
      locationKey,
  ],
  (uiStateByLocation, postName, idx, locationKey) => {
    const key = locationKey ?? 'front';
    const listingState = uiStateByLocation?.[key];
    if (!listingState) {
      return idx === 0;
    }
    const { actionable } = listingState;
    return !actionable ? idx === 0 : actionable === postName;
  }
);

export default listingsSlice.reducer;
