require('es6-promise').polyfill();
require('isomorphic-fetch');

export function listingsFilter(listFilter) {
  return {
    type: 'LISTINGS_FILTER',
    listFilter,
  };
}

export function listingsEntries(listEntries) {
  return {
    type: 'LISTINGS_ENTRIES',
    listEntries,
  };
}

export function listingsStatus(listingStatus) {
  return {
    type: 'LISTINGS_STATUS',
    listingStatus,
  };
}

export function listingsFetchEntries(url) {
  return (dispatch) => {
    dispatch(listingsStatus('loading'));
    fetch(url, { credentials: 'same-origin' })
      .then((response) => {
        if (!response.ok) {
          throw Error(response.statusText);
        }
        dispatch(listingsStatus('loaded'));
        return response;
      })
      .then(response => response.json())
      .then((json) => {
        const data = Object.assign({}, json, { requestUrl: url });
        dispatch(listingsEntries(data));
        return json;
      })
      .catch(() => {
        dispatch(listingsStatus('error'));
      });
  };
}

export function listingsFetch() {
  return (dispatch, getState) => {
    const currentState = getState();
    const url = currentState.listingsFilter.url;
    if (!url) {
      return false;
    } else if (url === currentState.listingsEntries.requestUrl) {
      return false;
    } else if (currentState.listingsStatus === 'loading') {
      return false;
    }
    dispatch(listingsFetchEntries(url));
    return true;
  };
}
