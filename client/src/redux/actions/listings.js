import update from 'immutability-helper';
import { batch } from 'react-redux';
import RedditAPI from '../../reddit/redditAPI';

// @todo there's no reason for any of this to be in Redux. Move to hooks.
const queryString = require('query-string');

export function listingsFilter(listFilter) {
  return {
    type: 'LISTINGS_FILTER',
    listFilter,
  };
}

export function listingsRedditEntries(listSubredditEntries) {
  return {
    type: 'LISTINGS_REDDIT_ENTRIES',
    listSubredditEntries,
  };
}

export function listingsEntryUpdate(entry) {
  return {
    type: 'LISTINGS_REDDIT_ENTRY_UPDATE',
    entry,
  };
}

export function listingsRedditStatus(status) {
  return {
    type: 'LISTINGS_REDDIT_STATUS',
    status,
  };
}

export function listingsRedditHistory(history) {
  return {
    type: 'LISTINGS_REDDIT_HISTORY',
    history,
  };
}

export function currentSubreddit(subreddit) {
  return {
    type: 'CURRENT_SUBREDDIT',
    subreddit,
  };
}

const setListingsHistory = (dispatch, currentState, data, about, status) => {
  const { router, listingsRedditHistory: history } = currentState;
  const { key } = router.location;

  const mainKey = key || 'front';

  const newHistory = { ...history };
  const now = Date.now();

  newHistory[mainKey] = {
    data,
    about,
    status,
    saved: now,
  };

  // Only keep five keys
  const historyKeys = Object.keys(newHistory);
  const slice = historyKeys.length - 5;
  if (slice > 0) {
    const deleteKeys = historyKeys.slice(0, slice);
    deleteKeys.forEach(deleteKey => {
      delete newHistory[deleteKey];
    });
  }

  // Remove the keys older than an hour
  Object.keys(newHistory).forEach(newHistoryKey => {
    const { saved } = newHistory[newHistoryKey];
    const elapsed = now - saved;
    if (elapsed > 3600 * 1000) delete newHistory[newHistoryKey];
  });

  dispatch(listingsRedditHistory(newHistory));
};

const getListingsHistory = (dispatch, currentState) => {
  const { key } = currentState.router.location;
  const { listingsRedditHistory: history } = currentState;
  const lookupKey = key || 'front';

  if (history[lookupKey]) {
    const { data, about, status } = history[lookupKey];
    const currentHistory = { ...history };
    // place the reloaded history at the end of the object.
    delete currentHistory[lookupKey];
    const currentKey = {};
    currentKey[lookupKey] = { ...history[lookupKey] };
    const newHistory = { ...currentHistory, ...currentKey };
    batch(() => {
      dispatch(listingsRedditEntries(data));
      dispatch(currentSubreddit(about));
      dispatch(listingsRedditStatus(status));
    });

    // No need to batch history
    dispatch(listingsRedditHistory(newHistory));

    return true;
  }

  return false;
};

const keyEntryChildren = entries => {
  const arrayToObject = (arr, keyField) =>
    Object.assign({}, ...arr.map(item => ({ [item.data[keyField]]: item })));

  const newChildren = arrayToObject(entries.data.children, 'name');
  const newEntries = update(entries, {
    data: { children: { $set: newChildren } },
  });

  return newEntries;
};

const getContent = async (filters, params) => {
  const target = filters.target !== 'mine' ? filters.target : null;
  const { user, sort, multi, listType } = filters;
  let entries;
  switch (listType) {
    case 'r':
      entries = await RedditAPI.getListingSubreddit(target, sort, params);
      break;
    case 'm':
      entries = await RedditAPI.getListingMulti(user, target, sort, params);
      break;
    case 'u':
      entries = await RedditAPI.getListingUser(user, target, sort, params);
      break;
    case 's':
      entries = multi
        ? await RedditAPI.getListingSearchMulti(user, target, params)
        : await RedditAPI.getListingSearch(target, params);
      break;
    case 'duplicates': {
      const dupes = await RedditAPI.getListingDuplicates(target, params);
      entries = {
        ...dupes[1],
        originalPost: dupes[0],
        requestUrl: dupes.requestUrl,
      };
      break;
    }
    default:
      break;
  }

  if (entries) {
    entries = keyEntryChildren(entries);
  }
  return entries;
};

const subredditAbout = async filter => {
  const { target, listType, multi } = filter;
  const badTarget = !target || target.match(/mine|popular|friends/);

  // Check if we are on a subreddit.
  if ((listType !== 's' && listType !== 'r') || multi || badTarget) {
    return {};
  }

  const about = await RedditAPI.subredditAbout(target);
  return about.data;
};

export function listingsFetchEntriesReddit(filters) {
  return async (dispatch, getState) => {
    const currentState = getState();

    try {
      const cached = getListingsHistory(dispatch, currentState);
      if (cached) return;

      const { search } = currentState.router.location;
      batch(() => {
        dispatch(listingsRedditStatus('loading'));
        dispatch(currentSubreddit({}));
        dispatch(listingsRedditEntries({}));
      });

      const qs = queryString.parse(search);
      const params = {
        ...qs,
      };

      const entries = await getContent(filters, params);
      const { listType } = filters;

      const data = {
        ...entries.data,
        requestUrl: entries.requestUrl,
        type: 'init',
      };

      if (entries.originalPost && listType === 'duplicates') {
        // eslint-disable-next-line
        data.originalPost = entries.originalPost.data.children[0];
      }

      const loaded = data.after ? 'loaded' : 'loadedAll';
      batch(() => {
        dispatch(listingsRedditEntries(data));
        dispatch(listingsRedditStatus(loaded));
      });
      const about = await subredditAbout(filters);
      dispatch(currentSubreddit(about));
      setListingsHistory(dispatch, currentState, data, about, loaded);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      dispatch(listingsRedditStatus('error'));
    }
  };
}

export function listingsFetchRedditNext() {
  return async (dispatch, getState) => {
    const currentState = getState();
    const { after } = currentState.listingsRedditEntries;
    dispatch(listingsRedditStatus('loadingNext'));
    try {
      const { search } = currentState.router.location;
      const qs = queryString.parse(search);
      const params = {
        ...qs,
        limit: 50,
        after,
      };

      const entries = await getContent(currentState.listingsFilter, params);

      const newListings = update(currentState.listingsRedditEntries, {
        after: { $set: entries.data.after },
        children: { $merge: entries.data.children },
        type: { $set: 'more' },
      });

      const loaded = newListings.after ? 'loaded' : 'loadedAll';
      batch(() => {
        dispatch(listingsRedditEntries(newListings));
        dispatch(listingsRedditStatus(loaded));
      });

      setListingsHistory(
        dispatch,
        currentState,
        newListings,
        currentState.currentSubreddit,
        loaded
      );
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      dispatch(listingsRedditStatus('error'));
    }
  };
}

/**
 * Get new results and prepend it to the top of the current results.
 * This is for live streaming.
 * @returns {Function}
 */
export function listingsFetchRedditNew(stream = false) {
  return async (dispatch, getState) => {
    const currentState = getState();

    if (
      currentState.listingsRedditStatus !== 'loaded' &&
      currentState.listingsRedditStatus !== 'loadedAll'
    ) {
      return 0;
    }

    const childKeys = Object.keys(currentState.listingsRedditEntries.children);
    const before = childKeys[0];
    const status = stream ? 'loadingStream' : 'loadingNew';
    dispatch(listingsRedditStatus(status));
    try {
      const { search } = currentState.router.location;
      const qs = queryString.parse(search);
      const params = {
        ...qs,
        limit: 100,
        before,
      };

      const entries = await getContent(currentState.listingsFilter, params);
      const newlyFetchCount = Object.keys(entries.data.children).length;

      if (newlyFetchCount === 0) {
        dispatch(listingsRedditStatus('loaded'));
        return 0;
      }

      // if the returned amount is greater than 100, replace the results with
      // the newest results.
      if (newlyFetchCount === 100) {
        batch(() => {
          dispatch(listingsRedditEntries(entries.data));
          dispatch(listingsRedditStatus('loaded'));
        });
        return newlyFetchCount;
      }

      const newChildren = {
        ...entries.data.children,
        ...currentState.listingsRedditEntries.children,
      };

      // Truncate the posts to 400 to conserve memory.
      const newChildKeys = Object.keys(newChildren);

      if (newChildKeys.length > 500) {
        const sliced = newChildKeys.slice(500);
        sliced.forEach(key => {
          delete newChildren[key];
        });
      }

      const newListings = update(currentState.listingsRedditEntries, {
        before: { $set: entries.data.before },
        children: { $set: newChildren },
        type: { $set: 'new' },
      });

      batch(() => {
        dispatch(listingsRedditEntries(newListings));
        dispatch(listingsRedditStatus('loaded'));
      });

      setListingsHistory(
        dispatch,
        currentState,
        newListings,
        currentState.currentSubreddit,
        'loaded'
      );
      return newChildKeys.length;
    } catch (e) {
      dispatch(listingsRedditStatus('error'));
    }
    return false;
  };
}
