import { createContext, use } from 'react';
import type { Context } from 'react';
import type { UseListingsQueryResult } from '@/hooks/useListingsQuery';
import type { ListingsData } from '@/redux/api/endpoints/listings';
import type { ListingsFilter } from '@/types/listings';

/**
 * Context for tracking last expanded post in listings
 */
export const ListingsContextLastExpanded: Context<
  [string, (value: string) => void] | null
> = createContext<[string, (value: string) => void] | null>(null);

/**
 * Context for listings data and actions
 *
 * Provides listing functions (loadMore, loadNew, refetch) and data to child components
 * without prop drilling. Used by Posts, PostsFooter, Reload, etc.
 */
export interface ListingsContextValue {
  data: ListingsData | undefined;
  loadMore: () => void;
  loadNew: () => void;
  refetch: () => void;
  status: UseListingsQueryResult['status'];
  canLoadMore: boolean;
}

export const ListingsContext = createContext<ListingsContextValue | null>(null);

export function useListingsContext(): ListingsContextValue {
  const context = use(ListingsContext);
  if (!context) {
    throw new Error('useListingsContext must be used within ListingsProvider');
  }
  return context;
}

/**
 * Tree-scoped filters for the enclosing listing tree.
 *
 * Components INSIDE a listing tree must read listType/target/etc. from this
 * context rather than the global Redux currentFilter: while the post-detail
 * overlay is open the global filter describes the overlay, and reading it
 * from the suspended background tree would restyle/unmount parts of the
 * preserved list. The global currentFilter remains for singletons outside
 * the trees (Sort, Search, Reload, sidebar).
 */
export const ListingsFilterContext = createContext<ListingsFilter | null>(null);

export function useListingsFilter(): ListingsFilter {
  const filter = use(ListingsFilterContext);
  if (!filter) {
    throw new Error('useListingsFilter must be used within a Listings tree');
  }
  return filter;
}
