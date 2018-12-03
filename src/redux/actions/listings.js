import update from 'immutability-helper';
import RedditAPI from '../../reddit/redditAPI';
import RedditHelper from '../../reddit/redditHelpers';

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
    type: 'LISTINGS_ENTRY_UPDATE',
    entry,
  };
}

export function listingsRedditStatus(status) {
  return {
    type: 'LISTINGS_REDDIT_STATUS',
    status,
  };
}

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
    default:
      break;
  }

  if (entries) {
    entries = RedditHelper.keyEntryChildren(entries);
  }

  return entries;
};

export function listingsFetchEntriesReddit(filters) {
  return async (dispatch, getState) => {
    dispatch(listingsRedditStatus('loading'));
    await dispatch(listingsRedditEntries({}));
    try {
      const currentState = getState();
      const { search } = currentState.router.location;
      const qs = queryString.parse(search);
      const params = {
        ...qs,
      };

      const entries = await getContent(filters, params);

      const data = {
        ...entries.data,
        requestUrl: entries.requestUrl,
        type: 'init',
      };

      await dispatch(listingsRedditEntries(data));
      const loaded = data.after ? 'loaded' : 'loadedAll';
      dispatch(listingsRedditStatus(loaded));
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
