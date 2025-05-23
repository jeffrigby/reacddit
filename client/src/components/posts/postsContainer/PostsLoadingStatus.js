import { memo } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router';
import {
  listingData,
  listingStatus,
} from '../../../redux/selectors/listingsSelector';

// Function to get message, icon, and alertType based on status and data.children
/**
 * Get the message, icon, and alertType based on the status and data.children
 * @param status {string} - Listing status
 * @param data {object} - Listing data
 * @returns {{alertType: string, icon: string, message: string}|null} - Object with message, icon, and alertType or null if status is not found
 */
function getStatusInfo(status, data) {
  switch (status) {
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

function PostsLoadingStatus() {
  const location = useLocation();
  const data = useSelector((state) => listingData(state, location.key));
  const status = useSelector((state) => listingStatus(state, location.key));

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
