import axios from 'axios';
import update from 'immutability-helper';

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
  return async (dispatch) => {
    dispatch(listingsStatus('loading'));
    try {
      const results = await axios.get(url);
      const json = results.data;
      const entryKeys = Object.keys(json.entries);
      const data = update(json, {
        requestUrl: { $set: url },
        type: { $set: 'init' },
        preload: {
          $set: {
            focus: entryKeys[0],
            visible: entryKeys.slice(0, 5),
          },
        },
      });
      await dispatch(listingsEntries(data));
      const loaded = data.after ? 'loaded' : 'loadedAll';
      dispatch(listingsStatus(loaded));
    } catch (e) {
      dispatch(listingsStatus('error'));
    }
  };
}

export function listingsFetchNext() {
  return async (dispatch, getState) => {
    const currentState = getState();
    const url = currentState.listingsEntries.requestUrl.split('?');
    const nextUrl = `${url[0]}?after=${currentState.listingsEntries.after}&limit=50`;
    dispatch(listingsStatus('loadingNext'));
    try {
      const results = await axios.get(nextUrl);
      const json = results.data;
      const newListings = update(currentState.listingsEntries, {
        after: { $set: json.after },
        entries: { $merge: json.entries },
        type: { $set: 'more' },
      });
      await dispatch(listingsEntries(newListings));
      const loaded = newListings.after ? 'loaded' : 'loadedAll';
      dispatch(listingsStatus(loaded));
    } catch (e) {
      dispatch(listingsStatus('error'));
    }
  };
}

export function listingsFetch() {
  return (dispatch, getState) => {
    const currentState = getState();
    const { url } = currentState.listingsFilter;
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
