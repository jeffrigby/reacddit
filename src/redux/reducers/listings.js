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
