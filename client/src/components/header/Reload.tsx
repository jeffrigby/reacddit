import { useLocation } from 'react-router';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import {
  fetchListingsNew,
  selectListingStatus,
} from '@/redux/slices/listingsSlice';

function Reload() {
  const stream = useAppSelector((state) => state.siteSettings.stream);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const listingsStatus = useAppSelector((state) =>
    selectListingStatus(state, location.key)
  );

  const loading = listingsStatus !== 'loaded' && listingsStatus !== 'loadedAll';
  const variant = stream ? 'primary' : 'secondary';

  const refresh = async (): Promise<void> => {
    window.scrollTo(0, 0);
    await dispatch(fetchListingsNew({ location }));
  };

  return (
    <div className="header-button">
      <Button
        aria-label="Load New Entries"
        disabled={loading}
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
