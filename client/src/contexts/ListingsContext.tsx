import { createContext, useContext } from 'react';
import type { UseListingsQueryResult } from '@/hooks/useListingsQuery';
import type { ListingsData } from '@/redux/api/endpoints/listings';

/**
 * Context for tracking last expanded post in listings
 */
export const ListingsContextLastExpanded = createContext<
  [string, (value: string) => void] | object
>({});

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
  const context = useContext(ListingsContext);
  if (!context) {
    throw new Error('useListingsContext must be used within ListingsProvider');
  }
  return context;
}
