import React from 'react';
import AutoRefresh from './AutoRefresh';

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
      </div>
    </div>
  );
};

Settings.propTypes = {};

Settings.defaultProps = {};

export default Settings;
