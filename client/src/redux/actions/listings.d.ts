/**
 * Type definitions for listings actions
 * This file provides TypeScript types for the JavaScript action creators in listings.js
 */
import type { Location } from 'react-router';
import type { AppDispatch, RootState } from '@/types/redux';
import type { ListingsFilter } from '@/types/listings';

/**
 * Thunk action type that can be dispatched
 */
type ThunkResult<R = void> = (
  dispatch: AppDispatch,
  getState: () => RootState
) => R;

export function listingsFilter(listFilter: ListingsFilter): {
  type: 'LISTINGS_FILTER';
  listFilter: ListingsFilter;
};

export function listingsRedditEntries(
  key: string,
  listSubredditEntries: unknown
): {
  type: 'LISTINGS_REDDIT_ENTRIES';
  key: string;
  listSubredditEntries: unknown;
};

export function listingsEntryUpdate(entry: unknown): {
  type: 'LISTINGS_REDDIT_ENTRY_UPDATE';
  entry: unknown;
};

export function listingsRedditStatus(
  key: string,
  status: string
): {
  type: 'LISTINGS_REDDIT_STATUS';
  key: string;
  status: string;
};

export function currentSubreddit(
  key: string,
  subreddit: unknown
): {
  type: 'CURRENT_SUBREDDIT';
  key: string;
  subreddit: unknown;
};

export function listingsState(
  key: string,
  currentListingsState: unknown
): {
  type: 'LISTINGS_STATE';
  key: string;
  currentListingsState: unknown;
};

/**
 * Fetch listings for a given filter and location
 */
export function listingsFetchEntriesReddit(
  filters: ListingsFilter,
  location: Location
): ThunkResult<Promise<void>>;

/**
 * Fetch the next page of listings
 */
export function listingsFetchRedditNext(
  location: Location
): ThunkResult<Promise<void>>;

/**
 * Fetch new listings (for refresh/reload)
 * Returns the number of new posts fetched
 */
export function listingsFetchRedditNew(
  location: Location,
  stream?: boolean
): ThunkResult<Promise<number | false | 0>>;
