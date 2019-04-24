import update from 'immutability-helper';
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

export function currentSubreddit(subreddit) {
  return {
    type: 'CURRENT_SUBREDDIT',
    subreddit,
  };
}

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
    dispatch(listingsRedditStatus('loading'));
    dispatch(currentSubreddit({}));

    await dispatch(listingsRedditEntries({}));
    try {
      const currentState = getState();
      const { search } = currentState.router.location;
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

      await dispatch(listingsRedditEntries(data));
      const loaded = data.after ? 'loaded' : 'loadedAll';
      dispatch(listingsRedditStatus(loaded));
      const about = await subredditAbout(filters);
      dispatch(currentSubreddit(about));
    } catch (e) {
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

      await dispatch(listingsRedditEntries(newListings));

      const loaded = newListings.after ? 'loaded' : 'loadedAll';
      dispatch(listingsRedditStatus(loaded));
    } catch (e) {
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
        await dispatch(listingsRedditEntries(entries.data));
        dispatch(listingsRedditStatus('loaded'));
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

      await dispatch(listingsRedditEntries(newListings));

      dispatch(listingsRedditStatus('loaded'));
      return newChildKeys.length;
    } catch (e) {
      dispatch(listingsRedditStatus('error'));
    }
    return false;
  };
}
