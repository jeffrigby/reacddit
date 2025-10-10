import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router';
import type { AppDispatch } from '@/types/redux';
import { useAppSelector } from '@/redux/hooks';
import { listingsFetchRedditNew } from '@/redux/actions/listings';
import { listingStatus } from '@/redux/selectors/listingsSelector';

function Reload() {
  const stream = useAppSelector((state) => state.siteSettings.stream);
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const listingsStatus = useAppSelector((state) =>
    listingStatus(state, location.key)
  );

  const loading = listingsStatus !== 'loaded' && listingsStatus !== 'loadedAll';
  const iconClass = `fas fa-sync-alt${loading ? ' fa-spin' : ''}`;
  const btnClass = stream
    ? 'btn btn-primary btn-sm'
    : 'btn btn-secondary btn-sm';

  const refresh = async (): Promise<void> => {
    window.scrollTo(0, 0);
    await dispatch(listingsFetchRedditNew(location));
  };

  return (
    <div className="header-button">
      <button
        aria-label="Load New Entries"
        className={btnClass}
        disabled={loading}
        title="Load New Entries"
        type="button"
        onClick={refresh}
      >
        <i className={iconClass} />
      </button>
    </div>
  );
}

export default Reload;
