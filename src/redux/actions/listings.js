import update from 'immutability-helper';

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
        return response;
      })
      .then(response => response.json())
      .then((json) => {
        // if (json.entries.length) {
        const entryKeys = Object.keys(json.entries);
        const newJson = update(json, {
          preload: { $set: {
            focus: entryKeys[0],
            visible: entryKeys.slice(0, 5),
          } },
        });
        return newJson;
      })
      .then((json) => {
        // Replace an empty array
        const data = update(json, {
          requestUrl: { $set: url },
          type: { $set: 'init' },
        });
        dispatch(listingsEntries(data));
        return json;
      })
      .then((json) => {
        const loaded = json.after ? 'loaded' : 'loadedAll';
        dispatch(listingsStatus(loaded));
      })
      .catch((e) => {
        // console.log(e);
        dispatch(listingsStatus('error'));
      });
  };
}

export function listingsFetchNext() {
  return (dispatch, getState) => {
    const currentState = getState();
    const url = currentState.listingsEntries.requestUrl.split('?');
    const nextUrl = `${url[0]}?after=${currentState.listingsEntries.after}&limit=50`;
    dispatch(listingsStatus('loadingNext'));
    fetch(nextUrl, { credentials: 'same-origin' })
      .then((response) => {
        if (!response.ok) {
          throw Error(response.statusText);
        }
        return response;
      })
      .then(response => response.json())
      .then((json) => {
        const newListings = update(currentState.listingsEntries, {
          after: { $set: json.after },
          entries: { $merge: json.entries },
          type: { $set: 'more' },
        });
        dispatch(listingsEntries(newListings));
        return json;
      })
      .then((json) => {
        const loaded = json.after ? 'loaded' : 'loadedAll';
        dispatch(listingsStatus(loaded));
        return json;
      })
      .catch((e) => {
        // console.log(e);
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
