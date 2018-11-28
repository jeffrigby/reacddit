import update from 'immutability-helper';
import RedditAPI from '../../reddit/redditAPI';
import RedditHelper from '../../reddit/redditHelpers';

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
  let entries;
  if (filters.listType === 'r') {
    entries = await RedditAPI.getSubredditListing(target, filters.sort, params);
  } else if (filters.listType === 'm') {
    entries = await RedditAPI.getMultiListing(
      target,
      filters.userType,
      filters.sort,
      params
    );
  } else if (filters.listType === 'u') {
    entries = await RedditAPI.getUserListing(
      target,
      filters.userType,
      filters.sort,
      params
    );
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
      const params = {
        limit: filters.limit,
        after: filters.after,
        before: filters.before,
        t: filters.t,
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
    const { t } = currentState.listingsFilter;
    dispatch(listingsRedditStatus('loadingNext'));
    try {
      const params = {
        limit: 50,
        after,
        t,
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
