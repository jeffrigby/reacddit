import { Button } from 'react-bootstrap';
import { useAppSelector } from '@/redux/hooks';
import { unregister } from '@/serviceWorkerRegistration';

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
  const debug = useAppSelector((state) => state.siteSettings.debug);

  return (
    <div>
      <Button
        className="m-0 small w-100"
        size="sm"
        variant="primary"
        onClick={reload}
      >
        <small>Load Newest Version</small>
      </Button>
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
