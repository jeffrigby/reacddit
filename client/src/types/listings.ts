/**
 * Type definitions for Reddit listings and related functionality
 */

export interface ListingsFilter {
  listType: string;
  target: string;
  userType?: string;
  sort?: string;
  multi?: boolean;
  user?: string;
}
