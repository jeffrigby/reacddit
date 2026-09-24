/**
 * Custom hook for listings queries with streaming and pagination
 *
 * Encapsulates:
 * - Location-based caching with React Router
 * - Streaming/polling when auto-refresh is enabled (active tree only)
 * - Pagination helpers (load more, load new)
 */

import { useCallback, useState } from 'react';
import type { Location } from 'react-router';
import { useGetListingsQuery } from '@/redux/api';
import type { ListingsFilter } from '@/types/listings';
import { useAppSelector } from '@/redux/hooks';

export interface UseListingsQueryOptions {
  /** Limit for initial load (default: 25, or 100 for condensed view) */
  limit?: number;
  /**
   * Whether this listing tree is the active (visible) one (default: true).
   * Suspended background trees must not stream-poll.
   */
  active?: boolean;
}

interface Pagination {
  after?: string;
  before?: string;
  limit: number;
  type: 'init' | 'next' | 'new';
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
  /** Current status */
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

export function useListingsQuery(
  filters: ListingsFilter,
  location: Location,
  options: UseListingsQueryOptions = {}
): UseListingsQueryResult {
  const stream = useAppSelector((state) => state.siteSettings.stream);
  const view = useAppSelector((state) => state.siteSettings.view);
  const active = options.active ?? true;

  // Determine limit based on view mode
  const baseLimit = options.limit ?? (view === 'condensed' ? 100 : 25);

  // A page belongs to the navigation that requested it. Every navigation,
  // including one back to the same listing, carries a new location key, so
  // a page from an earlier navigation gives way to the first page and the
  // new listing is never requested with the previous listing's cursor.
  const [paged, setPaged] = useState<{
    locationKey: string;
    pagination: Pagination;
  } | null>(null);
  const pagination: Pagination =
    paged?.locationKey === location.key
      ? paged.pagination
      : { limit: baseLimit, type: 'init' };
  const setPagination = useCallback(
    (next: Pagination) => {
      setPaged({ locationKey: location.key, pagination: next });
    },
    [location.key]
  );

  // Main query
  const queryArgs = {
    filters,
    location,
    pagination,
  };

  const result = useGetListingsQuery(queryArgs, {
    // Poll whenever this tree is active and streaming is on. No scroll-
    // position gate: a render-time scrollTop read only re-evaluates when
    // something else re-renders, so it would latch polling off after the
    // user scrolls down and never resume it at the top. (This matches the
    // long-shipped behavior — the old `window.scrollY <= 10` check was
    // always true with the body element scroller.)
    pollingInterval: active && stream ? 5000 : undefined,
    skip: false,
  });

  const { isLoading, isFetching, isError, error, refetch } = result;
  // currentData is undefined until this listing's own first page arrives, so
  // a new listing shows a loading state and a failed load shows its error
  // alone, never over the previous listing. Pages merge into one cache entry
  // per filter, so it stays populated while later pages load.
  const displayData = result.currentData;

  // Determine status based on query state
  const getStatus = useCallback((): UseListingsQueryResult['status'] => {
    if (isError) {
      return 'error';
    }
    if (isLoading && !displayData) {
      return 'loading';
    }
    if (isFetching && pagination.type === 'next') {
      return 'loadingNext';
    }
    if (isFetching && pagination.type === 'new') {
      return 'loadingNew';
    }
    if (displayData) {
      return displayData.after ? 'loaded' : 'loadedAll';
    }
    return 'unloaded';
  }, [isLoading, isFetching, isError, displayData, pagination.type]);

  // Load more posts (pagination)
  const loadMore = useCallback(() => {
    if (!displayData?.after || isFetching) {
      return;
    }

    setPagination({
      after: displayData.after,
      limit: 50,
      type: 'next',
    });
  }, [displayData?.after, isFetching, setPagination]);

  // Load new posts (refresh)
  const loadNew = useCallback(() => {
    if (!displayData || isFetching) {
      return;
    }

    const childKeys = Object.keys(displayData.children ?? {});
    if (childKeys.length === 0) {
      return;
    }

    const firstPostId = childKeys[0];
    setPagination({
      before: firstPostId,
      limit: 100,
      type: 'new',
    });
  }, [displayData, isFetching, setPagination]);

  return {
    data: displayData,
    isLoading,
    isError,
    error,
    status: getStatus(),
    canLoadMore: !!displayData?.after,
    loadMore,
    loadNew,
    refetch,
  };
}
