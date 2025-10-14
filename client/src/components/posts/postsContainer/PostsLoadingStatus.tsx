import type { ReactElement } from 'react';
import { memo, useMemo } from 'react';
import { useLocation } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSpinner,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import { useAppSelector } from '../../../redux/hooks';
import {
  selectListingData,
  selectListingStatus,
} from '../../../redux/slices/listingsSlice';

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
 * Get the message, icon, and alertType based on the status and data.children
 */
function getStatusInfo(status: string, data: ListingData): StatusInfo | null {
  switch (status as ListingStatus) {
    case 'error':
      return {
        message:
          'Error fetching content from Reddit. Reddit might be down. Try reloading.',
        icon: faExclamationTriangle,
        alertType: 'alert alert-danger',
      };
    case 'loaded': {
      if (!data.children) {
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
  const location = useLocation();

  // Combine selectors to reduce re-renders
  const { data, status } = useAppSelector((state) => ({
    data: selectListingData(state, location.key),
    status: selectListingStatus(state, location.key),
  }));

  // Memoize statusInfo to prevent recalculation on every render
  const statusInfo = useMemo(() => getStatusInfo(status, data), [status, data]);

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
