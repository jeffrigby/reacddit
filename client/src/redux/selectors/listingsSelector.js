import { createSelector } from 'reselect';

const listingsStatusSelector = state => state.listingsRedditStatus;
const listingsEntriesSelector = state => state.listingsRedditEntries;
const locationKeySelector = state => state.router.location.key;

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
