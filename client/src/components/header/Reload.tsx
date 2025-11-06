import { useMemo } from 'react';
import { useLocation } from 'react-router';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import {
  selectListingStatus,
  refreshRequested,
} from '@/redux/slices/listingsSlice';
import { scrollToPosition } from '@/common';

function Reload() {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const stream = useAppSelector((state) => state.siteSettings.stream);
  const locationKey = location.key || 'front';

  // Read status from Redux (updated by Listings component)
  const status = useAppSelector((state) =>
    selectListingStatus(state, locationKey)
  );

  // Determine if we're on a listings page and not loading
  const isListingsPage = status !== 'unloaded';
  const loading = useMemo(() => {
    return (
      status === 'loading' ||
      status === 'loadingNext' ||
      status === 'loadingNew' ||
      status === 'loadingStream'
    );
  }, [status]);

  const variant = stream ? 'primary' : 'secondary';

  const refresh = async (): Promise<void> => {
    scrollToPosition(0, 0);
    // Dispatch action to trigger refresh in Listings component
    dispatch(refreshRequested({ locationKey }));
  };

  return (
    <div className="header-button">
      <Button
        aria-label="Load New Entries"
        disabled={!isListingsPage || loading}
        size="sm"
        title="Load New Entries"
        variant={variant}
        onClick={refresh}
      >
        <FontAwesomeIcon icon={faSyncAlt} spin={loading} />
      </Button>
    </div>
  );
}

export default Reload;
