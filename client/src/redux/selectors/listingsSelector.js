import { createSelector } from 'reselect';

const listingsStatusSelector = (state) => state.listingsRedditStatus;
const listingsEntriesSelector = (state) => state.listingsRedditEntries;
const listingsStateSelector = (state) => state.listingsState;
const locationKeySelector = (state, locationKey) => locationKey;

export const listingData = createSelector(
  [listingsEntriesSelector, locationKeySelector],
  (entries, locationKey) => {
    const key = locationKey || 'front';
    return entries[key] || {};
  }
);

export const listingStatus = createSelector(
  [listingsStatusSelector, locationKeySelector],
  (status, locationKey) => {
    const key = locationKey || 'front';
    return status[key] ? status[key].status : 'unloaded';
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
    return listingCurrentState[key] || defaults;
  }
);
