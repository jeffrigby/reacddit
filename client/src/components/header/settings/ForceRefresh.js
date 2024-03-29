import { useSelector } from 'react-redux';
import { unregister } from '../../../serviceWorkerRegistration';

/* global BUILDTIME */

// I'm not sure how well this works.
const reload = () => {
  if (caches) {
    // Service worker cache should be cleared with caches.delete()
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name));
    });
  }
  unregister();
  setTimeout(() => {
    window.location.reload(true);
  }, 1000);
};

function ForceRefresh() {
  const debug = useSelector((state) => state.siteSettings.debug);

  return (
    <div>
      <button
        className="btn btn-primary btn-sm m-0 small w-100"
        onClick={reload}
        type="button"
      >
        <small>Load Newest Version</small>
      </button>
      {debug && (
        <>
          <div className="dropdown-divider" />
          <div className="supersmall">
            Build Date:
            <br />
            {BUILDTIME}
          </div>
        </>
      )}
    </div>
  );
}

export default ForceRefresh;
