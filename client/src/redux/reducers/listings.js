import produce from 'immer';
import { pruneObject } from '../../common';

const MAX_HISTORY_ITEMS = 7;
const MAX_HISTORY_TIME = 3600;
// No real need to extract this, but just in case I need to modify it more.
const cleanHistory = (history) =>
  pruneObject(history, MAX_HISTORY_ITEMS, MAX_HISTORY_TIME);

// eslint-disable-next-line default-param-last
export function listingsFilter(state = { sort: 'hot', t: 'day' }, action) {
  switch (action.type) {
    case 'LISTINGS_FILTER':
      return action.listFilter;

    default:
      return state;
  }
}

// eslint-disable-next-line default-param-last
export function currentSubreddit(state = {}, action) {
  switch (action.type) {
    case 'CURRENT_SUBREDDIT': {
      const { key, subreddit } = action;
      const newState = produce(state, (draft) => {
        draft[key] = { ...subreddit, saved: Date.now() };
      });
      return cleanHistory(newState);
    }
    default:
      return state;
  }
}

// eslint-disable-next-line default-param-last
export function listingsState(state = {}, action) {
  switch (action.type) {
    case 'LISTINGS_STATE': {
      const { key, currentListingsState } = action;
      const newState = produce(state, (draft) => {
        draft[key] = { ...currentListingsState, saved: Date.now() };
      });
      return cleanHistory(newState);
    }
    default:
      return state;
  }
}

// eslint-disable-next-line default-param-last
export function listingsRedditEntries(state = {}, action) {
  switch (action.type) {
    case 'LISTINGS_REDDIT_ENTRIES': {
      const { key, listSubredditEntries } = action;
      const newState = produce(state, (draft) => {
        draft[key] = { ...listSubredditEntries, saved: Date.now() };
      });
      return cleanHistory(newState);
    }
    case 'LISTINGS_REDDIT_ENTRY_UPDATE': {
      const { entry } = action;
      return produce(state, (draft) => {
        Object.entries(entry).forEach(([locationID, posts]) => {
          Object.entries(posts).forEach(([postID, postUpdates]) => {
            draft[locationID].children[postID].data = {
              ...state[locationID].children[postID].data,
              ...postUpdates,
            };
          });
        });
      });
    }
    default:
      return state;
  }
}

// eslint-disable-next-line default-param-last
export function listingsRedditStatus(state = {}, action) {
  switch (action.type) {
    case 'LISTINGS_REDDIT_STATUS': {
      const { key, status } = action;
      const newState = produce(state, (draft) => {
        draft[key] = { status, saved: Date.now() };
      });

      return cleanHistory(newState);
    }
    default:
      return state;
  }
}
