import update from 'immutability-helper';

export function listingsFilter(state = { sort: 'hot', sortTop: 'day' }, action) {
  switch (action.type) {
    case 'LISTINGS_FILTER':
      return action.listFilter;

    default:
      return state;
  }
}

export function listingsEntries(state = {}, action) {
  switch (action.type) {
    case 'LISTINGS_ENTRIES':
      return action.listEntries;
    case 'LISTINGS_ENTRY_UPDATE':
    {
      const updateListing = update(state, {
        entries: { [action.entry.name]: { $merge: action.entry } },
      });

      return updateListing;
    }
    default:
      return state;
  }
}

export function listingsStatus(state = 'unloaded', action) {
  switch (action.type) {
    case 'LISTINGS_STATUS':
      return action.listingStatus;

    default:
      return state;
  }
}
