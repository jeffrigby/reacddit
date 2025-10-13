import { createSelector } from '@reduxjs/toolkit';
import isEmpty from 'lodash/isEmpty';
import type { RootState } from '@/types/redux';
import type { SubredditData } from '@/types/redditApi';

const currentSubredditSelector = (state: RootState) => state.currentSubreddit;
const subredditsSelector = (state: RootState) => state.subreddits;
const listingsFilterSelector = (state: RootState) => state.listingsFilter;
const filterTextSelector = (state: RootState) =>
  state.subredditsFilter.filterText;
const locationKeySelector = (_state: RootState, locationKey: string) =>
  locationKey;

export const getCurrentSubreddit = createSelector(
  [currentSubredditSelector, locationKeySelector],
  (currentSubreddit, locationKey): Partial<SubredditData> => {
    const key = locationKey ?? 'front';
    return currentSubreddit[key] ?? {};
  }
);

export const getCachedSub = createSelector(
  [subredditsSelector, listingsFilterSelector],
  (subs, filter): Partial<SubredditData> => {
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
  (
    subredditsStore,
    filterText
  ): Record<string, SubredditData> | Record<string, never> => {
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
      .reduce<Record<string, SubredditData>>(
        (obj, key) => ({
          ...obj,
          [key]: subreddits[key],
        }),
        {}
      );
  }
);

export const getSubredditKeys = createSelector(
  [subredditsSelector],
  (subredditsStore) => {
    const { subreddits } = subredditsStore;
    if (!subreddits || isEmpty(subreddits)) {
      return [];
    }
    return Object.keys(subreddits);
  }
);
