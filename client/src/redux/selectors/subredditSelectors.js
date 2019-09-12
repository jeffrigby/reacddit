import { createSelector } from 'reselect';

const currentSubredditSelector = state => state.currentSubreddit;
const locationKeySelector = state => state.router.location.key;
const subredditsSelector = state => state.subreddits;
const listingsFilterSelector = state => state.listingsFilter;

export const getCurrentSubreddit = createSelector(
  [currentSubredditSelector, locationKeySelector],
  (currentSubreddit, locationKey) => {
    const key = locationKey || 'front';
    return currentSubreddit[key] || {};
  }
);

export const getCachedSub = createSelector(
  [subredditsSelector, listingsFilterSelector],
  (subs, filter) => {
    if (subs.status !== 'loaded') {
      return {};
    }

    const { subreddits } = subs;
    const { target } = filter;
    return target && subreddits[target.toLowerCase()]
      ? subreddits[target.toLowerCase()]
      : {};
  }
);
