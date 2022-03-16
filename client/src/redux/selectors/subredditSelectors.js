import { createSelector } from '@reduxjs/toolkit';
import isEmpty from 'lodash/isEmpty';

const currentSubredditSelector = (state) => state.currentSubreddit;
const subredditsSelector = (state) => state.subreddits;
const listingsFilterSelector = (state) => state.listingsFilter;
const filterTextSelector = (state) => state.subredditsFilter.filterText;
const locationKeySelector = (state, locationKey) => locationKey;

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

export const filterSubs = createSelector(
  [subredditsSelector, filterTextSelector],
  (subredditsStore, filterText) => {
    const { subreddits } = subredditsStore;
    if (isEmpty(subreddits)) {
      return {};
    }

    if (filterText === '') {
      return subreddits;
    }

    return Object.keys(subreddits)
      .filter(
        (subreddit) =>
          subreddits[subreddit].display_name
            .toLowerCase()
            .indexOf(filterText.toLowerCase()) > -1
      )
      .reduce(
        (obj, key) => ({
          ...obj,
          [key]: subreddits[key],
        }),
        {}
      );
  }
);
