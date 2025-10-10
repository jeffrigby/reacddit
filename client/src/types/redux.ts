/**
 * Redux type definitions for the Reacddit client
 */
import type { ThunkDispatch } from '@reduxjs/toolkit';
import type { AnyAction } from 'redux';
import type { ListingsFilter } from './listings';
import type { SubredditData, AccountData, LabeledMultiData } from './redditApi';

/**
 * Subreddit data as stored in Redux state
 * Using the proper SubredditData type from Reddit API
 */
export type SubredditInfo = SubredditData;

/**
 * Subreddits state in Redux
 */
export interface SubredditsState {
  status: 'unloaded' | 'loading' | 'loaded' | 'error';
  subreddits: Record<string, SubredditData>;
  lastUpdated?: number;
  message?: string;
}

/**
 * Subreddits filter state
 */
export interface SubredditsFilterState {
  filterText: string;
  active: boolean;
  activeIndex: number;
}

/**
 * Last updated timestamps for subreddits
 */
export type LastUpdatedState = Record<string, number>;

/**
 * Root state type - this will be expanded as we convert more files to TypeScript
 */
export interface RootState {
  siteSettings: {
    stream: boolean;
    debug: boolean;
    debugMode?: boolean;
    theme?: string;
    autoRefresh?: boolean;
    view?: 'expanded' | 'condensed';
    condenseSticky?: boolean;
    condensePinned?: boolean;
    condenseDuplicate?: boolean;
    [key: string]: unknown;
  };
  listings: {
    [key: string]: unknown;
  };
  reddit: {
    [key: string]: unknown;
  };
  redditBearer: {
    bearer?: string;
    status?: string;
    loginURL?: string;
    [key: string]: unknown;
  };
  redditMe?: {
    me?: AccountData;
    status?: string;
    lastUpdated?: number;
    id?: string;
    error?: string;
  };
  redditMultiReddits?: {
    multis?: LabeledMultiData[];
    status?: string;
    lastUpdated?: number;
    error?: string;
  };
  subreddits: SubredditsState;
  subredditsFilter: SubredditsFilterState;
  lastUpdated: LastUpdatedState;
  lastUpdatedTime: number;
  history: {
    [key: string]: unknown;
  };
  listingsFilter: ListingsFilter;
  listingsRedditStatus: Record<
    string,
    {
      status: 'unloaded' | 'loading' | 'loaded' | 'loadedAll' | 'error';
      [key: string]: unknown;
    }
  >;
  listingsRedditEntries: Record<string, unknown>;
  listingsState: Record<
    string,
    {
      focused: string;
      visible: string[];
      minHeights: Record<string, number>;
      actionable: string | number | null;
      hasError: boolean;
    }
  >;
  [key: string]: unknown;
}

/**
 * Typed dispatch with thunk support
 */
export type AppDispatch = ThunkDispatch<RootState, unknown, AnyAction>;
