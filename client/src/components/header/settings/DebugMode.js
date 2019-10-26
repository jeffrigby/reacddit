import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { siteSettings } from '../../../redux/actions/misc';
import { hotkeyStatus } from '../../../common';

const DebugMode = ({ setSiteSetting, debug }) => {
  const debugToggle = () => {
    setSiteSetting({ debug: !debug });
  };

  const hotkeys = event => {
    if (hotkeyStatus()) {
      const pressedKey = event.key;
      try {
        if (pressedKey === 'Î') {
          // opt-shift-d
          debugToggle();
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
    <div className="debug-settings">
      <div className="form-check d-flex">
        <div>
          <label className="form-check-label" htmlFor="debugCheck">
            <input
              type="checkbox"
              className="form-check-input"
              id="autoPlayCheck"
              defaultChecked={debug}
              onClick={debugToggle}
            />
            Show Debug Info
          </label>
        </div>
      </div>
    </div>
  );
};

DebugMode.propTypes = {
  debug: PropTypes.bool,
  setSiteSetting: PropTypes.func.isRequired,
};

DebugMode.defaultProps = {
  debug: false,
};

const mapStateToProps = state => ({
  debug: state.siteSettings.debug,
});

export default connect(
  mapStateToProps,
  {
    setSiteSetting: siteSettings,
  }
)(DebugMode);
