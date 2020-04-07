import React from 'react';
import { useSelector } from 'react-redux';
import * as serviceWorker from '../../../serviceWorker';

/* global BUILDTIME */

// I'm not sure how well this works.
const reload = () => {
  if (caches) {
    // Service worker cache should be cleared with caches.delete()
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name));
    });
  }
  serviceWorker.unregister();
  window.location.reload(true);
};

const ForceRefresh = () => {
  const settings = useSelector((state) => state.siteSettings);

  return (
    <div>
      <button
        className="btn btn-primary btn-sm m-0 small w-100"
        onClick={reload}
        type="button"
      >
        <small>Load Newest Version</small>
      </button>
      {settings.debug && (
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
};

ForceRefresh.propTypes = {};

ForceRefresh.defaultProps = {};

export default ForceRefresh;
