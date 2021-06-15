import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { siteSettings } from '../../../redux/actions/misc';
import { hotkeyStatus } from '../../../common';

const AutoRefresh = ({ setSiteSetting, stream }) => {
  const autoRefreshToggle = () => {
    window.scrollTo(0, 0);
    setSiteSetting({ stream: !stream });
  };

  const hotkeys = (event) => {
    if (hotkeyStatus()) {
      const pressedKey = event.key;
      try {
        if (pressedKey === '>') {
          autoRefreshToggle();
        }
      } catch (e) {
        // console.log(e);
      }
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', hotkeys);
    return () => {
      document.removeEventListener('keydown', hotkeys);
    };
  });

  return (
    <div className="auto-refresh">
      <div className="form-check d-flex">
        <div>
          <label className="form-check-label" htmlFor="autoRefreshCheck">
            <input
              type="checkbox"
              className="form-check-input"
              id="autoRefreshCheck"
              defaultChecked={stream}
              onClick={autoRefreshToggle}
            />
            Auto Refresh
          </label>
        </div>
        <div
          data-bs-toggle="modal"
          data-bs-target="#autoRefresh"
          title="Auto Refresh Info"
          className="ms-auto"
        >
          <i className="fas fa-info-circle" />
        </div>
      </div>
    </div>
  );
};

AutoRefresh.propTypes = {
  stream: PropTypes.bool,
  setSiteSetting: PropTypes.func.isRequired,
};

AutoRefresh.defaultProps = {
  stream: false,
};

const mapStateToProps = (state) => ({
  stream: state.siteSettings.stream,
});

export default connect(mapStateToProps, {
  setSiteSetting: siteSettings,
})(AutoRefresh);
