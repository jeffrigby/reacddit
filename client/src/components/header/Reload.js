import { useDispatch, useSelector } from 'react-redux';
import { listingsFetchRedditNew } from '../../redux/actions/listings';
import { listingStatus } from '../../redux/selectors/listingsSelector';

function Reload() {
  const listingsStatus = useSelector((state) => listingStatus(state));
  const stream = useSelector((state) => state.siteSettings.stream);
  const dispatch = useDispatch();

  const loading = listingsStatus !== 'loaded' && listingsStatus !== 'loadedAll';
  const iconClass = `fas fa-sync-alt${loading ? ' fa-spin' : ''}`;
  const btnClass = stream
    ? 'btn btn-primary btn-sm'
    : 'btn btn-secondary btn-sm';

  const refresh = async () => {
    window.scrollTo(0, 0);
    await dispatch(listingsFetchRedditNew());
  };

  return (
    <div className="header-button">
      <button
        type="button"
        className={btnClass}
        title="Load New Entries"
        onClick={refresh}
        disabled={loading}
      >
        <i className={iconClass} />
      </button>
    </div>
  );
}

export default Reload;
