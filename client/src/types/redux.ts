/**
 * Redux type definitions for the Reacddit client
 */
import type { ThunkDispatch } from '@reduxjs/toolkit';
import type { AnyAction } from 'redux';
import type { MultiRedditsState } from '@/redux/slices/multiRedditsSlice';
import type { BearerState } from '@/redux/slices/redditBearerSlice';
import type { MeState } from '@/redux/slices/redditMeSlice';
import type {
  ListingsFilter,
  ListingsData,
  ListingsState as ListingsStateEntry,
} from './listings';
import type { SubredditData } from './redditApi';

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
export interface LastUpdatedEntry {
  lastPost: number;
  expires: number;
}

export type LastUpdatedState = Record<string, LastUpdatedEntry>;

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
  redditBearer: BearerState;
  redditMe: MeState;
  redditMultiReddits: MultiRedditsState;
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
      saved?: number;
      [key: string]: unknown;
    }
  >;
  listingsRedditEntries: Record<string, ListingsData>;
  listingsState: Record<string, ListingsStateEntry>;
  currentSubreddit: Record<string, SubredditData & { saved?: number }>;
  [key: string]: unknown;
}

/**
 * Typed dispatch with thunk support
 */
export type AppDispatch = ThunkDispatch<RootState, unknown, AnyAction>;
