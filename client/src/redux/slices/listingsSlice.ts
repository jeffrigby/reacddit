import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/types/redux';
import type { Thing, LinkData } from '@/types/redditApi';
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

interface CachedListingsState extends ListingsState {
  saved: number;
}

export interface ListingsSliceState {
  currentFilter: ListingsFilter;
  listingsByLocation: Record<string, LocationData>;
  uiStateByLocation: Record<string, CachedListingsState>;
  refreshTrigger: Record<string, number>; // locationKey -> timestamp
}

/**
 * Drop all but the `maxKeys` most recently touched entries, and anything older
 * than `maxAgeSeconds`. Every map in this slice is keyed by history location
 * key, so without this they gain one permanent entry per navigation.
 *
 * `getSaved` exists because the timestamp lives in a different place per map:
 * the object maps carry a `saved` field, `refreshTrigger` IS the timestamp.
 */
function pruneByRecency<T>(
  data: Record<string, T>,
  getSaved: (value: T) => number,
  maxKeys: number,
  maxAgeSeconds: number
): Record<string, T> {
  const now = Date.now();
  const maxAgeMs = maxAgeSeconds * 1000;
  const newData: Record<string, T> = {};

  const validEntries = Object.entries(data).filter(([_key, value]) => {
    const elapsed = now - getSaved(value);
    return elapsed <= maxAgeMs;
  });

  const sortedEntries = validEntries
    .sort((a, b) => getSaved(b[1]) - getSaved(a[1]))
    .slice(0, maxKeys);

  sortedEntries.forEach(([key, value]) => {
    newData[key] = value;
  });

  return newData;
}

/** `pruneByRecency` for the maps whose values carry their own `saved` stamp. */
function pruneLocationData<T extends { saved: number }>(
  data: Record<string, T>,
  maxKeys: number,
  maxAgeSeconds: number
): Record<string, T> {
  return pruneByRecency(data, (value) => value.saved, maxKeys, maxAgeSeconds);
}

const initialState: ListingsSliceState = {
  currentFilter: {
    listType: 'r',
    target: 'mine',
    sort: 'hot',
  },
  listingsByLocation: {},
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

      // Deliberately NOT pruned, unlike every other map in this slice. This is
      // the only writer, and it only fires when a listing's locationKey or
      // status string actually changes - a mounted-but-idle tree never
      // re-stamps its key. While the post-detail overlay is open the background
      // tree is exactly that: frozen at 'loaded' while each in-overlay
      // navigation writes a fresh key. Any recency/age prune therefore evicts
      // the key of a tree that is still mounted and about to be shown again,
      // and consumers read a missing key as 'unloaded': Reload renders the
      // refresh button disabled and Post drops every post hotkey (x/o/l/d).
      // The entries are a handful of scalars, so this map is not worth the
      // risk of bounding.
    },

    refreshRequested(state, action: PayloadAction<{ locationKey: string }>) {
      const { locationKey } = action.payload;
      state.refreshTrigger[locationKey] = Date.now();

      // The value here IS the timestamp, so prune on the value itself. Losing
      // a key is harmless: `selectRefreshTrigger` falls back to 0 and the
      // consumer only reacts to a trigger that both changed and is > 0.
      state.refreshTrigger = pruneByRecency(
        state.refreshTrigger,
        (timestamp) => timestamp,
        MAX_HISTORY_LOCATIONS,
        MAX_HISTORY_TIME_SECONDS
      );
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
const selectUiStateByLocation = (state: RootState) =>
  state.listings?.uiStateByLocation ?? {};
export const selectCurrentFilter = (state: RootState): ListingsFilter =>
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
        status: 'unloaded',
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
    return location?.status ?? 'unloaded';
  }
);

export const selectRefreshTrigger = (state: RootState, locationKey: string) =>
  state.listings?.refreshTrigger?.[locationKey] ?? 0;

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
        actionable: null,
        hasError: false,
      }
    );
  }
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
