import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router';
import { listingsFetchRedditNew } from '../../redux/actions/listings';
import { listingStatus } from '../../redux/selectors/listingsSelector';

function Reload() {
  const stream = useSelector((state) => state.siteSettings.stream);
  const dispatch = useDispatch();
  const location = useLocation();
  const listingsStatus = useSelector((state) =>
    listingStatus(state, location.key)
  );

  const loading = listingsStatus !== 'loaded' && listingsStatus !== 'loadedAll';
  const iconClass = `fas fa-sync-alt${loading ? ' fa-spin' : ''}`;
  const btnClass = stream
    ? 'btn btn-primary btn-sm'
    : 'btn btn-secondary btn-sm';

  const refresh = async () => {
    window.scrollTo(0, 0);
    await dispatch(listingsFetchRedditNew(location));
  };

  return (
    <div className="header-button">
      <button
        type="button"
        className={btnClass}
        title="Load New Entries"
        onClick={refresh}
        disabled={loading}
        aria-label="Load New Entries"
      >
        <i className={iconClass} />
      </button>
    </div>
  );
}

export default Reload;
