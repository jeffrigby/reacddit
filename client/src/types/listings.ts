/**
 * Type definitions for Reddit listings and related functionality
 */
import type { Thing, LinkData } from './redditApi';

export interface ListingsFilter {
  listType: string;
  target: string;
  userType?: string;
  sort?: string;
  multi?: boolean;
  user?: string;
  comment?: string;
  qs?: string;
  postName?: string;
}

/**
 * Represents the listings data stored in Redux state for a specific location
 */
export interface ListingsData {
  before?: string | null;
  after?: string | null;
  children?: Record<string, Thing<LinkData>>;
  dist?: number;
  modhash?: string | null;
  originalPost?: Thing<LinkData>;
  requestUrl?: string;
  saved?: number;
  type?: 'init' | 'more' | 'new';
}

/**
 * Represents the current state of listings (viewport, focus, etc.)
 */
export interface ListingsState {
  focused: string;
  visible: string[];
  minHeights: Record<string, number>;
  actionable: string | number | null;
  hasError: boolean;
  saved?: number;
}
