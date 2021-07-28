import { memo } from 'react';
import { useSelector } from 'react-redux';
import {
  listingData,
  listingStatus,
} from '../../../redux/selectors/listingsSelector';

const PostsLoadingStatus = () => {
  const data = useSelector((state) => listingData(state));
  const status = useSelector((state) => listingStatus(state));

  let message;
  let icon;
  let alertType;
  if (status === 'error') {
    message =
      'Error fetching content from Reddit. Reddit might be down. Try reloading.';
    icon = 'fas fa-exclamation-triangle';
    alertType = 'alert alert-danger';
  }

  if (status === 'loaded' && !data.children) {
    message = 'Nothing here.';
    icon = 'fas fa-exclamation-triangle';
    alertType = 'alert alert-warning';
  }

  if (status === 'unloaded' || status === 'loading') {
    message = 'Getting entries from Reddit.';
    icon = 'fas fa-spinner fa-spin';
    alertType = 'alert alert-info';
  }

  if (status === 'loadingNew') {
    message = 'Getting new entries from Reddit.';
    icon = 'fas fa-spinner fa-spin';
    alertType = 'alert alert-info';
  }

  if (!message) {
    return <></>;
  }

  return (
    <div className={`${alertType} m-2`} id="content-loading" role="alert">
      <i className={icon} /> {message}
    </div>
  );
};

export default memo(PostsLoadingStatus);
