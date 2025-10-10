import type { ReactElement } from 'react';
import { memo } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router';
import type { RootState } from '../../../types/redux';
import { listingStatus } from '../../../redux/selectors/listingsSelector';

type FooterStatus = 'loadingNext' | 'loadedAll';

// Move JSX outside function to prevent recreation on every render
const STATUS_COMPONENTS: Record<FooterStatus, ReactElement> = {
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

/**
 * Render the footer status based on the listing status
 */
function renderFooterStatus(status: string): ReactElement | null {
  // Validate status before casting
  if (status === 'loadingNext' || status === 'loadedAll') {
    return STATUS_COMPONENTS[status];
  }
  return null;
}

function PostsFooter(): ReactElement {
  const location = useLocation();
  const status = useSelector((state: RootState) =>
    listingStatus(state, location.key)
  );
  const footerStatus = renderFooterStatus(status);
  return <div className="footer-status p-2">{footerStatus}</div>;
}

export default memo(PostsFooter);
