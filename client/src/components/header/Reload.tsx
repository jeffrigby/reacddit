import { useLocation } from 'react-router';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { listingsFetchRedditNew } from '@/redux/actions/listings';
import { listingStatus } from '@/redux/selectors/listingsSelector';

function Reload() {
  const stream = useAppSelector((state) => state.siteSettings.stream);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const listingsStatus = useAppSelector((state) =>
    listingStatus(state, location.key)
  );

  const loading = listingsStatus !== 'loaded' && listingsStatus !== 'loadedAll';
  const variant = stream ? 'primary' : 'secondary';

  const refresh = async (): Promise<void> => {
    window.scrollTo(0, 0);
    await dispatch(listingsFetchRedditNew(location));
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
