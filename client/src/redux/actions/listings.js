import { batch } from 'react-redux';
import queryString from 'query-string';
import { produce } from 'immer';
import { keyEntryChildren } from '../../common';
import RedditAPI from '../../reddit/redditAPI';

// @todo there's no reason for any of this logic to be in Redux. Move to hooks.

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

/**
 * @TODO move to listings component.
 * @param filters
 * @param params
 * @returns {Promise<{[p: string]: *}>}
 */
const getContent = async (filters, params) => {
  const target = filters.target !== 'mine' ? filters.target : null;
  const { user, sort, multi, listType, postName, comment } = filters;
  // console.log(filters);
  let entries;
  switch (listType) {
    case 'r':
      entries = await RedditAPI.getListingSubreddit(target, sort, params);
      break;
    case 'm':
      entries = await RedditAPI.getListingMulti(user, target, sort, params);
      break;
    case 'u':
      entries = await RedditAPI.getListingUser(
        user,
        target === 'posts' ? 'submitted' : target,
        sort,
        params
      );
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
    case 'comments': {
      const comments = await RedditAPI.getComments(
        target,
        postName,
        comment,
        params
      );
      entries = {
        ...comments[1],
        originalPost: comments[0],
        requestUrl: comments.requestUrl,
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

const subredditAbout = async (filter) => {
  const { target, listType, multi } = filter;
  const badTarget = !target || target.match(/mine|popular|friends/);

  // Check if we are on a subreddit.
  if ((listType !== 's' && listType !== 'r') || multi || badTarget) {
    return {};
  }

  const about = await RedditAPI.subredditAbout(target);
  return about.data;
};

/**
 * Get the entries with the given filter.
 * @param filters - The filter to search
 * @param location - The page key to track/cache the listings.
 * @returns {(function(*, *): Promise<void>)|*}
 */
export function listingsFetchEntriesReddit(filters, location) {
  return async (dispatch, getState) => {
    const currentState = getState();

    const locationKey = location.key || 'front';

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
          // Everything is cool. Return Cache
          // console.log(locationKey, 'cached');
          return;
        }

        // Expired content so reset it, and fetch again.
        batch(() => {
          dispatch(currentSubreddit(locationKey, {}));
          dispatch(listingsRedditEntries(locationKey, {}));
        });
      }
      // End  cache Check

      dispatch(listingsRedditStatus(locationKey, 'loading'));

      const qs = queryString.parse(location.search);
      const params = {
        // limit,
        ...qs,
      };

      if (currentState.siteSettings.view === 'condensed' && !params.limit) {
        params.limit = '100';
      }

      const entries = await getContent(filters, params);

      const { listType } = filters;

      const data = {
        ...entries.data,
        requestUrl: entries.requestUrl,
        type: 'init',
      };

      if (
        entries.originalPost &&
        (listType === 'duplicates' || listType === 'comments')
      ) {
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
      console.error(e);
      dispatch(listingsRedditStatus(locationKey, 'error'));
    }
  };
}

/**
 * Fetch the next set of entries when the user scrolls to the bottom.
 * @param location - The location. This is to track/cache per page.
 * @returns {(function(*, *): Promise<void>)|*}
 */
export function listingsFetchRedditNext(location) {
  return async (dispatch, getState) => {
    const currentState = getState();
    const locationKey = location.key || 'front';
    const currentData = currentState.listingsRedditEntries[locationKey];
    if (!currentData) {
      // This can happen when the listing is loaded, but not rendered yet.

      // console.error(
      //   `listingsFetchRedditNext: Can't find the location key in the current state.`,
      //   locationKey
      // );
      return;
    }

    const { after } = currentData;
    dispatch(listingsRedditStatus(locationKey, 'loadingNext'));

    try {
      const { search } = location;
      const qs = queryString.parse(search);
      const params = {
        ...qs,
        limit: 50,
        after,
      };

      const entries = await getContent(currentState.listingsFilter, params);

      const newListings = produce(currentData, (draft) => {
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
export function listingsFetchRedditNew(location, stream = false) {
  return async (dispatch, getState) => {
    const currentState = getState();

    const locationKey = location.key || 'front';

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
      const qs = queryString.parse(location.search);
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
        sliced.forEach((key) => {
          delete newChildren[key];
        });
      }

      const newListings = produce(
        currentState.listingsRedditEntries[locationKey],
        (draft) => {
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
      console.error(e);
      dispatch(listingsRedditStatus(locationKey, 'error'));
    }
    return false;
  };
}
