import React from 'react';
import AutoRefresh from './AutoRefresh';
import * as serviceWorker from '../../serviceWorker';

const reload = () => {
  serviceWorker.unregister();
  window.location.reload(true);
};

const Settings = () => {
  return (
    <div
      className="btn-group settings-menu header-button"
      onClick={e => e.stopPropagation()}
      onKeyDown={null}
      role="button"
      tabIndex="0"
    >
      <button
        type="button"
        className="btn btn-secondary btn-sm form-control-sm"
        data-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false"
        aria-label="Sort"
      >
        <i className="fas fa-cog" />
      </button>
      <div className="dropdown-menu dropdown-menu-right p-2">
        <div className="small">
          <AutoRefresh />
        </div>
        <div className="dropdown-divider" />
        <div>
          <button
            className="btn btn-primary btn-sm m-0 small w-100"
            onClick={reload}
            type="button"
          >
            <small>Load Newest Version</small>
          </button>
        </div>
      </div>
    </div>
  );
};

Settings.propTypes = {};

Settings.defaultProps = {};

export default Settings;
