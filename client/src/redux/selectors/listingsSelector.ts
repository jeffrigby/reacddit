import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../types/redux';
import type { ListingsData } from '../../types/listings';

const listingsStatusSelector = (state: RootState) => state.listingsRedditStatus;
const listingsEntriesSelector = (state: RootState) =>
  state.listingsRedditEntries;
const listingsStateSelector = (state: RootState) => state.listingsState;
const locationKeySelector = (_state: RootState, locationKey: string) =>
  locationKey;

export const listingData = createSelector(
  [listingsEntriesSelector, locationKeySelector],
  (entries, locationKey): ListingsData => {
    const key = locationKey || 'front';
    if (!entries[key]) {
      return {};
    }
    return entries[key];
  }
);

export const listingStatus = createSelector(
  [listingsStatusSelector, locationKeySelector],
  (status, locationKey) => {
    const key = locationKey || 'front';
    if (!status[key]) {
      return 'unloaded';
    }
    return status[key].status;
  }
);

export const listingState = createSelector(
  [listingsStateSelector, locationKeySelector],
  (listingCurrentState, locationKey) => {
    const key = locationKey || 'front';
    const defaults = {
      focused: '',
      visible: [],
      minHeights: {},
      actionable: null,
      hasError: false,
    };
    if (!listingCurrentState[key]) {
      return defaults;
    }
    return listingCurrentState[key];
  }
);
