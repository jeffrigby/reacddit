import { useSelector } from 'react-redux';
import type { RootState } from '@/types/redux';
import { unregister } from '../../../serviceWorkerRegistration';

/* global BUILDTIME */

const reload = () => {
  if (caches) {
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name));
    });
  }
  unregister();
  setTimeout(() => {
    window.location.reload();
  }, 1000);
};

function ForceRefresh() {
  const debug = useSelector((state: RootState) => state.siteSettings.debug);

  return (
    <div>
      <button
        className="btn btn-primary btn-sm m-0 small w-100"
        type="button"
        onClick={reload}
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
