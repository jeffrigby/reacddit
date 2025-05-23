import { memo } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router';
import { listingStatus } from '../../../redux/selectors/listingsSelector';

/**
 * Render the footer status based on the listing status
 * @param status {string} - Listing status
 * @returns {*|null} - Rendered footer status or null if status is not found
 */
function renderFooterStatus(status) {
  const statusMapping = {
    loadingNext: (
      <div className="alert alert-info" id="content-more-loading" role="alert">
        <i className="fas fa-spinner fa-spin" /> Getting more entries.
      </div>
    ),
    loadedAll: (
      <div className="alert alert-warning" id="content-end" role="alert">
        <i className="fas fa-exclamation-triangle" /> That&apos;s it!
      </div>
    ),
  };

  return statusMapping[status] || null;
}

function PostsFooter() {
  const location = useLocation();
  const status = useSelector((state) => listingStatus(state, location.key));
  const footerStatus = renderFooterStatus(status);
  return <div className="footer-status p-2">{footerStatus}</div>;
}

export default memo(PostsFooter);
