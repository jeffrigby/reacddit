import type { ReactElement } from 'react';
import { memo, useMemo } from 'react';
import { useLocation } from 'react-router';
import { useAppSelector } from '../../../redux/hooks';
import {
  listingData,
  listingStatus,
} from '../../../redux/selectors/listingsSelector';

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
  icon: string;
  alertType: string;
}

interface ListingData {
  children?: unknown;
  [key: string]: unknown;
}

/**
 * Get the message, icon, and alertType based on the status and data.children
 */
function getStatusInfo(status: string, data: ListingData): StatusInfo | null {
  switch (status as ListingStatus) {
    case 'error':
      return {
        message:
          'Error fetching content from Reddit. Reddit might be down. Try reloading.',
        icon: 'fas fa-exclamation-triangle',
        alertType: 'alert alert-danger',
      };
    case 'loaded': {
      if (!data.children) {
        return {
          message: 'Nothing here.',
          icon: 'fas fa-exclamation-triangle',
          alertType: 'alert alert-warning',
        };
      }
      return null;
    }
    case 'unloaded':
    case 'loading':
      return {
        message: 'Getting entries from Reddit.',
        icon: 'fas fa-spinner fa-spin',
        alertType: 'alert alert-info',
      };
    case 'loadingNew':
      return {
        message: 'Getting new entries from Reddit.',
        icon: 'fas fa-spinner fa-spin',
        alertType: 'alert alert-info',
      };
    default:
      return null;
  }
}

function PostsLoadingStatus(): ReactElement | null {
  const location = useLocation();

  // Combine selectors to reduce re-renders
  const { data, status } = useAppSelector((state) => ({
    data: listingData(state, location.key),
    status: listingStatus(state, location.key),
  }));

  // Memoize statusInfo to prevent recalculation on every render
  const statusInfo = useMemo(() => getStatusInfo(status, data), [status, data]);

  if (!statusInfo) {
    return null;
  }

  const { message, icon, alertType } = statusInfo;

  return (
    <div className={`${alertType} m-2`} id="content-loading" role="alert">
      <i className={icon} /> {message}
    </div>
  );
}

export default memo(PostsLoadingStatus);
