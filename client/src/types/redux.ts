/**
 * Redux type definitions for the Reacddit client
 */
import type { ThunkDispatch } from '@reduxjs/toolkit';
import type { AnyAction } from 'redux';
import type { SubredditsState } from '@/redux/slices/subredditsSlice';
import type { MultiRedditsState } from '@/redux/slices/multiRedditsSlice';
import type { BearerState } from '@/redux/slices/redditBearerSlice';
import type { MeState } from '@/redux/slices/redditMeSlice';
import type { ListingsSliceState } from '@/redux/slices/listingsSlice';

/**
 * Subreddit data as stored in Redux state
 * Using the proper SubredditData type from Reddit API
 */
export type SubredditInfo = SubredditData;

/**
 * DEPRECATED: These types are now part of SubredditsState in subredditsSlice
 * Kept for backward compatibility during migration
 * TODO: Remove after all components are updated
 */
export interface LegacySubredditsState {
  status: 'unloaded' | 'loading' | 'loaded' | 'error';
  subreddits: Record<string, SubredditData>;
  lastUpdated?: number;
  message?: string;
}

export interface LegacySubredditsFilterState {
  filterText: string;
  active: boolean;
  activeIndex: number;
}

export interface LegacyLastUpdatedEntry {
  lastPost: number;
  expires: number;
}

export type LegacyLastUpdatedState = Record<string, LegacyLastUpdatedEntry>;

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
  listings: ListingsSliceState;
  reddit: {
    [key: string]: unknown;
  };
  redditBearer: BearerState;
  redditMe: MeState;
  redditMultiReddits: MultiRedditsState;
  subreddits: SubredditsState;
  history: {
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Typed dispatch with thunk support
 */
export type AppDispatch = ThunkDispatch<RootState, unknown, AnyAction>;
