import update from 'immutability-helper';
import produce from 'immer';

const MAX_HISTORY_ITEMS = 7;
const MAX_HISTORY_TIME = 3600;
const cleanHistory = history => {
  return produce(history, draft => {
    const historyKeys = Object.keys(draft);

    // Remove the keys older than an hour
    historyKeys.forEach(newHistoryKey => {
      const { saved } = draft[newHistoryKey];
      const elapsed = Date.now() - saved;
      if (elapsed > MAX_HISTORY_TIME * 1000) delete draft[newHistoryKey];
    });

    const slice = historyKeys.length - MAX_HISTORY_ITEMS;
    if (slice > 0) {
      const deleteKeys = historyKeys.slice(0, slice);
      deleteKeys.forEach(deleteKey => {
        delete draft[deleteKey];
      });
    }
  });
};

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
    case 'CURRENT_SUBREDDIT': {
      const { key, subreddit } = action;
      const newState = produce(state, draft => {
        draft[key] = { ...subreddit, saved: Date.now() };
      });
      return cleanHistory(newState);
    }
    default:
      return state;
  }
}

export function listingsRedditEntries(state = {}, action) {
  switch (action.type) {
    case 'LISTINGS_REDDIT_ENTRIES': {
      const { key, listSubredditEntries } = action;
      const newState = produce(state, draft => {
        draft[key] = { ...listSubredditEntries, saved: Date.now() };
      });
      return cleanHistory(newState);
    }
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

export function listingsRedditStatus(state = {}, action) {
  switch (action.type) {
    case 'LISTINGS_REDDIT_STATUS': {
      const { key, status } = action;
      const newState = produce(state, draft => {
        draft[key] = { status, saved: Date.now() };
      });

      return cleanHistory(newState);
    }
    default:
      return state;
  }
}
