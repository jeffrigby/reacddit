import type { ReactElement } from 'react';
import { memo } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router';
import type { RootState } from '../../../types/redux';
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
  const data = useSelector((state: RootState) =>
    listingData(state, location.key)
  );
  const status = useSelector((state: RootState) =>
    listingStatus(state, location.key)
  );

  // Get the message, icon, and alertType based on the status and data.children
  const statusInfo = getStatusInfo(status, data);

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
