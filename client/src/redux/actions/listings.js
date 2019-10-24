import { batch } from 'react-redux';
import produce from 'immer';
import { getLocationKey } from '../../common';
import RedditAPI from '../../reddit/redditAPI';

// @todo there's no reason for any of this to be in Redux. Move to hooks.
const queryString = require('query-string');

export function listingsFilter(listFilter) {
  return {
    type: 'LISTINGS_FILTER',
    listFilter,
  };
}

export function listingsRedditEntries(key, listSubredditEntries) {
  return {
    type: 'LISTINGS_REDDIT_ENTRIES',
    key,
    listSubredditEntries,
  };
}

export function listingsEntryUpdate(entry) {
  return {
    type: 'LISTINGS_REDDIT_ENTRY_UPDATE',
    entry,
  };
}

export function listingsRedditStatus(key, status) {
  return {
    type: 'LISTINGS_REDDIT_STATUS',
    key,
    status,
  };
}

export function currentSubreddit(key, subreddit) {
  return {
    type: 'CURRENT_SUBREDDIT',
    key,
    subreddit,
  };
}

export function listingsState(key, currentListingsState) {
  return {
    type: 'LISTINGS_STATE',
    key,
    currentListingsState,
  };
}

const keyEntryChildren = entries => {
  const arrayToObject = (arr, keyField) =>
    Object.assign({}, ...arr.map(item => ({ [item.data[keyField]]: item })));

  const newChildren = arrayToObject(entries.data.children, 'name');
  return produce(entries, draft => {
    draft.data.children = newChildren;
  });
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
    const locationKey = getLocationKey(currentState);

    try {
      if (
        currentState.listingsRedditEntries[locationKey] !== undefined &&
        currentState.currentSubreddit[locationKey] !== undefined &&
        currentState.listingsRedditStatus[locationKey] !== undefined
      ) {
        // Make sure it's not expired.
        const elapsed =
          Date.now() - currentState.listingsRedditEntries[locationKey].saved;
        if (elapsed <= 3600 * 1000) {
          return;
        }
      }

      batch(() => {
        dispatch(listingsRedditStatus(locationKey, 'loading'));
        dispatch(currentSubreddit(locationKey, {}));
        dispatch(listingsRedditEntries(locationKey, {}));
      });

      // const limit = currentState.siteSettings.view === 'condensed' ? 25 : 10;

      const { search } = currentState.router.location;
      const qs = queryString.parse(search);
      const params = {
        // limit,
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
        dispatch(listingsRedditEntries(locationKey, data));
        dispatch(listingsRedditStatus(locationKey, loaded));
      });
      const about = await subredditAbout(filters);
      dispatch(currentSubreddit(locationKey, about));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      dispatch(listingsRedditStatus(locationKey, 'error'));
    }
  };
}

export function listingsFetchRedditNext() {
  return async (dispatch, getState) => {
    const currentState = getState();
    const locationKey = getLocationKey(currentState);
    const currentData = currentState.listingsRedditEntries[locationKey];

    const { after } = currentData;
    dispatch(listingsRedditStatus(locationKey, 'loadingNext'));

    try {
      const { search } = currentState.router.location;
      const qs = queryString.parse(search);
      const params = {
        ...qs,
        limit: 50,
        after,
      };

      const entries = await getContent(currentState.listingsFilter, params);

      const newListings = produce(currentData, draft => {
        draft.after = entries.data.after;
        draft.children = {
          ...currentData.children,
          ...entries.data.children,
        };
        draft.type = 'more';
      });

      const loaded = newListings.after ? 'loaded' : 'loadedAll';
      batch(() => {
        dispatch(listingsRedditEntries(locationKey, newListings));
        dispatch(listingsRedditStatus(locationKey, loaded));
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      dispatch(listingsRedditStatus(locationKey, 'error'));
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
    const locationKey = getLocationKey(currentState);

    const { children } = currentState.listingsRedditEntries[locationKey];
    const { status } = currentState.listingsRedditStatus[locationKey];

    if (status !== 'loaded' && status !== 'loadedAll') {
      return 0;
    }

    const childKeys = Object.keys(children);

    const before = childKeys[0];
    const newStatus = stream ? 'loadingStream' : 'loadingNew';
    dispatch(listingsRedditStatus(locationKey, newStatus));

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
        dispatch(listingsRedditStatus(locationKey, 'loaded'));
        return 0;
      }

      // if the returned amount is greater than 100, replace the results with
      // the newest results.
      if (newlyFetchCount === 100) {
        batch(() => {
          dispatch(listingsRedditEntries(locationKey, entries.data));
          dispatch(listingsRedditStatus(locationKey, 'loaded'));
        });
        return newlyFetchCount;
      }

      const newChildren = {
        ...entries.data.children,
        ...children,
      };

      // Truncate the posts to 400 to conserve memory.
      const newChildKeys = Object.keys(newChildren);

      if (newChildKeys.length > 500) {
        const sliced = newChildKeys.slice(500);
        sliced.forEach(key => {
          delete newChildren[key];
        });
      }

      const newListings = produce(
        currentState.listingsRedditEntries[locationKey],
        draft => {
          draft.before = entries.data.before;
          draft.children = newChildren;
          draft.type = 'new';
        }
      );

      batch(() => {
        dispatch(listingsRedditEntries(locationKey, newListings));
        dispatch(listingsRedditStatus(locationKey, 'loaded'));
      });

      return newChildKeys.length;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
      dispatch(listingsRedditStatus(locationKey, 'error'));
    }
    return false;
  };
}
