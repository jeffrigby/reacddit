import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { siteSettings } from '../../redux/actions/misc';

const AutoRefresh = ({ setSiteSetting, stream }) => {
  const autoRefreshToggle = () => {
    window.scrollTo(0, 0);
    setSiteSetting({ stream: !stream });
  };

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
          data-toggle="modal"
          data-target="#autoRefresh"
          title="Auto Refresh Info"
          className="ml-auto"
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

const mapStateToProps = state => ({
  stream: state.siteSettings.stream,
});

export default connect(
  mapStateToProps,
  {
    setSiteSetting: siteSettings,
  }
)(AutoRefresh);
