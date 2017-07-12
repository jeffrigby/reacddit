export function listingsFilter(state = { sort: 'hot' }, action) {
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

export function listingsFocus(state = '', action) {
  switch (action.type) {
    case 'LISTINGS_FOCUS':
      return action.focused;

    default:
      return state;
  }
}

export function listingsVisible(state = [], action) {
  switch (action.type) {
    case 'LISTINGS_VISIBLE':
      return action.visible;

    default:
      return state;
  }
}
