import { Button, Dropdown } from 'react-bootstrap';
import { useAppSelector } from '@/redux/hooks';

/* global BUILDTIME */

function ForceRefresh() {
  const debug = useAppSelector((state) => state.siteSettings.debug);

  const reload = async () => {
    // Clear all caches
    if (caches) {
      const names = await caches.keys();
      await Promise.all(names.map((name) => caches.delete(name)));
    }

    // Unregister service worker
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((reg) => reg.unregister()));
    }

    // Reload the page
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

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
          <Dropdown.Divider />
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
