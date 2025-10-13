import type { ReactElement } from 'react';
import { memo, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSpinner,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import { listingStatus } from '../../../redux/selectors/listingsSelector';
import { useAppSelector, useAppDispatch } from '../../../redux/hooks';
import { listingsFetchRedditNext } from '../../../redux/actions/listings';
import { useIntersectionObservers } from '../../../contexts';

type FooterStatus = 'loadingNext' | 'loadedAll';

// Move JSX outside function to prevent recreation on every render
const STATUS_COMPONENTS: Record<FooterStatus, ReactElement> = {
  loadingNext: (
    <div className="alert alert-info" id="content-more-loading" role="alert">
      <FontAwesomeIcon spin icon={faSpinner} /> Getting more entries.
    </div>
  ),
  loadedAll: (
    <div className="alert alert-warning" id="content-end" role="alert">
      <FontAwesomeIcon icon={faExclamationTriangle} /> That&apos;s it!
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
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => listingStatus(state, location.key));
  const footerRef = useRef<HTMLDivElement>(null);
  const { observeForLoading } = useIntersectionObservers();

  // Trigger loading more posts when footer comes into view
  const handleIntersection = useCallback(
    (isIntersecting: boolean) => {
      if (isIntersecting && status === 'loaded') {
        dispatch(listingsFetchRedditNext(location));
      }
    },
    [status, location, dispatch]
  );

  // Register footer with IntersectionObserver
  useEffect(() => {
    if (!footerRef.current) {
      return;
    }
    return observeForLoading(footerRef.current, handleIntersection);
  }, [observeForLoading, handleIntersection]);

  const footerStatus = renderFooterStatus(status);
  return (
    <div className="footer-status p-2" ref={footerRef}>
      {footerStatus}
    </div>
  );
}

export default memo(PostsFooter);
