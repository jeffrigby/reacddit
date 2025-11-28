import type { ReactElement } from 'react';
import { memo, useMemo } from 'react';
import { useLocation } from 'react-router';
import queryString from 'query-string';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSpinner,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import { useListingsContext } from '@/contexts/ListingsContext';
import { useAppSelector } from '@/redux/hooks';
import { selectFilter } from '@/redux/slices/listingsSlice';

type ListingStatus =
  | 'error'
  | 'loaded'
  | 'unloaded'
  | 'loading'
  | 'loadingNew'
  | 'loadingNext'
  | 'loadedAll';

interface StatusInfo {
  message: string;
  icon: typeof faSpinner | typeof faExclamationTriangle;
  alertType: string;
}

interface ListingData {
  children?: unknown;
  [key: string]: unknown;
}

/**
 * Check if a search query contains a site: operator with a Reddit domain
 */
function hasRedditDomainSearch(searchQuery: string): boolean {
  if (!searchQuery) {
    return false;
  }

  // Match site: operator with various Reddit domains
  const redditDomainPattern =
    /site:\s*["']?((?:i|v|preview|old|www|new)\.)?redd(?:it)?\.(?:com|it)["']?/i;

  return redditDomainPattern.test(searchQuery);
}

/**
 * Get the message, icon, and alertType based on the status and data.children
 */
function getStatusInfo(
  status: string,
  data: ListingData,
  searchQuery?: string,
  isGlobalSearch?: boolean
): StatusInfo | null {
  switch (status as ListingStatus) {
    case 'error':
      return {
        message:
          'Error fetching content from Reddit. Reddit might be down. Try reloading.',
        icon: faExclamationTriangle,
        alertType: 'alert alert-danger',
      };
    case 'loaded':
    case 'loadedAll': {
      // Check if children is empty (could be undefined, null, or empty object)
      const hasChildren =
        data.children &&
        typeof data.children === 'object' &&
        Object.keys(data.children).length > 0;

      if (!hasChildren) {
        // Check if this is a global search for Reddit domains
        if (
          isGlobalSearch &&
          searchQuery &&
          hasRedditDomainSearch(searchQuery)
        ) {
          return {
            message:
              'Searching for Reddit-hosted content by domain works within specific subreddits, but not in global search. Try searching within a subreddit instead.',
            icon: faExclamationTriangle,
            alertType: 'alert alert-info',
          };
        }
        return {
          message: 'Nothing here.',
          icon: faExclamationTriangle,
          alertType: 'alert alert-warning',
        };
      }
      return null;
    }
    case 'unloaded':
    case 'loading':
      return {
        message: 'Getting entries from Reddit.',
        icon: faSpinner,
        alertType: 'alert alert-info',
      };
    case 'loadingNew':
      return {
        message: 'Getting new entries from Reddit.',
        icon: faSpinner,
        alertType: 'alert alert-info',
      };
    default:
      return null;
  }
}

function PostsLoadingStatus(): ReactElement | null {
  // Get data and status from RTK Query via context
  const { data, status } = useListingsContext();
  const location = useLocation();
  const filter = useAppSelector(selectFilter);

  // Parse search query from URL
  const searchQuery = useMemo(() => {
    const qs = queryString.parse(location.search);
    return (qs.q as string) ?? '';
  }, [location.search]);

  // Determine if this is a global search (listType 's' and no target)
  const isGlobalSearch = useMemo(
    () => filter.listType === 's' && filter.target === 'mine',
    [filter.listType, filter.target]
  );

  // Convert to compatible format for getStatusInfo
  const listingData = useMemo(() => ({ children: data?.children }), [data]);

  // Memoize statusInfo to prevent recalculation on every render
  const statusInfo = useMemo(
    () => getStatusInfo(status, listingData, searchQuery, isGlobalSearch),
    [status, listingData, searchQuery, isGlobalSearch]
  );

  if (!statusInfo) {
    return null;
  }

  const { message, icon, alertType } = statusInfo;
  const isSpinner = icon === faSpinner;

  return (
    <div className={`${alertType} m-2`} id="content-loading" role="alert">
      <FontAwesomeIcon icon={icon} spin={isSpinner} /> {message}
    </div>
  );
}

export default memo(PostsLoadingStatus);
