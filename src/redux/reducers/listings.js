import update from 'immutability-helper';

export function listingsFilter(state = { sort: 'hot', t: 'day' }, action) {
  switch (action.type) {
    case 'LISTINGS_FILTER':
      return action.listFilter;

    default:
      return state;
  }
}

export function currentSubreddit(state = {}, action) {
  switch (action.type) {
    case 'CURRENT_SUBREDDIT':
      return action.subreddit;

    default:
      return state;
  }
}

export function listingsRedditEntries(state = {}, action) {
  switch (action.type) {
    case 'LISTINGS_REDDIT_ENTRIES':
      return action.listSubredditEntries;
    case 'LISTINGS_REDDIT_ENTRY_UPDATE': {
      const updateListing = update(state, {
        children: { [action.entry.name]: { data: { $merge: action.entry } } },
      });
      return updateListing;
    }
    default:
      return state;
  }
}

export function listingsRedditStatus(state = 'unloaded', action) {
  switch (action.type) {
    case 'LISTINGS_REDDIT_STATUS':
      return action.status;

    default:
      return state;
  }
}
