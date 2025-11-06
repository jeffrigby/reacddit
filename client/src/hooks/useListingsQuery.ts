/**
 * Custom hook for managing listings queries with RTK Query
 *
 * This hook encapsulates the complexity of:
 * - Location-based caching with React Router
 * - Streaming/polling when auto-refresh is enabled
 * - Pagination helpers (load more, load new)
 * - Scroll position checks for streaming
 *
 * Usage:
 * const { data, status, loadMore, loadNew, canLoadMore } = useListingsQuery(filters, location);
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Location } from 'react-router';
import { useGetListingsQuery } from '@/redux/api';
import type { ListingsFilter } from '@/types/listings';
import { useAppSelector } from '@/redux/hooks';

export interface UseListingsQueryOptions {
  /** Limit for initial load (default: 25, or 100 for condensed view) */
  limit?: number;
}

export interface UseListingsQueryResult {
  /** Listings data */
  data: ReturnType<typeof useGetListingsQuery>['data'];
  /** Is loading initial data */
  isLoading: boolean;
  /** Has error */
  isError: boolean;
  /** Error object */
  error: ReturnType<typeof useGetListingsQuery>['error'];
  /** Current status (for backwards compatibility) */
  status:
    | 'unloaded'
    | 'loading'
    | 'loaded'
    | 'loadedAll'
    | 'loadingNext'
    | 'loadingNew'
    | 'error';
  /** Can load more posts (has after cursor) */
  canLoadMore: boolean;
  /** Load more posts (pagination) */
  loadMore: () => void;
  /** Load new posts (refresh/streaming) */
  loadNew: () => void;
  /** Refetch current query */
  refetch: () => void;
}

/**
 * Custom hook for listings queries with streaming support
 *
 * This hook manages pagination state and provides helpers for loading more/new posts.
 * It uses RTK Query's cache and merge functionality under the hood.
 */
export function useListingsQuery(
  filters: ListingsFilter,
  location: Location,
  options: UseListingsQueryOptions = {}
): UseListingsQueryResult {
  const stream = useAppSelector((state) => state.siteSettings.stream);
  const view = useAppSelector((state) => state.siteSettings.view);

  // Determine limit based on view mode
  const baseLimit = options.limit ?? (view === 'condensed' ? 100 : 25);

  // Track pagination state in component
  const [paginationState, setPaginationState] = useState<{
    after?: string;
    before?: string;
    limit: number;
    type: 'init' | 'next' | 'new';
  }>({
    limit: baseLimit,
    type: 'init',
  });

  // Reset pagination when filters or location change
  const prevFiltersRef = useRef<string>(JSON.stringify(filters));
  const prevLocationKeyRef = useRef<string | undefined>(location.key);

  useEffect(() => {
    const filtersChanged = JSON.stringify(filters) !== prevFiltersRef.current;
    const locationChanged = location.key !== prevLocationKeyRef.current;

    if (filtersChanged || locationChanged) {
      setPaginationState({
        limit: baseLimit,
        type: 'init',
      });
      prevFiltersRef.current = JSON.stringify(filters);
      prevLocationKeyRef.current = location.key;
    }
  }, [filters, location.key, baseLimit]);

  // Main query
  const queryArgs = {
    filters,
    location,
    pagination: paginationState,
  };

  const result = useGetListingsQuery(queryArgs, {
    // Enable polling when streaming is active and at top of page
    pollingInterval: stream && window.scrollY <= 10 ? 5000 : undefined,
    skip: false,
  });

  const { data, isLoading, isFetching, isError, error, refetch } = result;

  // Determine status for backwards compatibility
  const getStatus = useCallback((): UseListingsQueryResult['status'] => {
    if (isError) {
      return 'error';
    }
    if (isLoading && !data) {
      return 'loading';
    }
    if (isFetching && paginationState.type === 'next') {
      return 'loadingNext';
    }
    if (isFetching && paginationState.type === 'new') {
      return 'loadingNew';
    }
    if (data) {
      return data.after ? 'loaded' : 'loadedAll';
    }
    return 'unloaded';
  }, [isLoading, isFetching, isError, data, paginationState.type]);

  // Load more posts (pagination)
  const loadMore = useCallback(() => {
    if (!data?.after || isFetching) {
      return;
    }

    setPaginationState({
      after: data.after,
      limit: 50,
      type: 'next',
    });
  }, [data?.after, isFetching]);

  // Load new posts (refresh)
  const loadNew = useCallback(() => {
    if (!data || isFetching) {
      return;
    }

    const childKeys = Object.keys(data.children ?? {});
    if (childKeys.length === 0) {
      return;
    }

    const firstPostId = childKeys[0];
    setPaginationState({
      before: firstPostId,
      limit: 100,
      type: 'new',
    });
  }, [data, isFetching]);

  return {
    data,
    isLoading,
    isError,
    error,
    status: getStatus(),
    canLoadMore: !!data?.after,
    loadMore,
    loadNew,
    refetch,
  };
}
