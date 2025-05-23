/**
 * Redux type definitions for the Reacddit client
 */
import type { ThunkDispatch } from '@reduxjs/toolkit';
import type { AnyAction } from 'redux';
import type { ListingsFilter } from './listings';

/**
 * Root state type - this will be expanded as we convert more files to TypeScript
 */
export interface RootState {
  siteSettings: {
    stream: boolean;
    debugMode?: boolean;
    theme?: string;
    autoRefresh?: boolean;
    view?: 'expanded' | 'condensed';
    [key: string]: any;
  };
  listings: {
    [key: string]: any;
  };
  reddit: {
    [key: string]: any;
  };
  redditBearer: {
    bearer?: string;
    status?: string;
    loginURL?: string;
    [key: string]: any;
  };
  redditMe?: {
    me?: any;
    status?: string;
    lastUpdated?: number;
    id?: string;
    error?: string;
  };
  redditMultiReddits?: {
    multis?: any[];
    status?: string;
    lastUpdated?: number;
    error?: string;
  };
  subreddits: {
    [key: string]: any;
  };
  history: {
    [key: string]: any;
  };
  listingsFilter: ListingsFilter;
  [key: string]: any;
}

/**
 * Typed dispatch with thunk support
 */
export type AppDispatch = ThunkDispatch<RootState, unknown, AnyAction>;
