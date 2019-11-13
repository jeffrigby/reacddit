import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { siteSettings } from '../../../redux/actions/misc';

const AutoPlay = ({ setSiteSetting, autoplay }) => {
  const autoPlayToggle = () => {
    setSiteSetting({ autoplay: !autoplay });
  };

  return (
    <div className="auto-play">
      <div className="form-check d-flex">
        <div>
          <label className="form-check-label" htmlFor="autoPlayCheck">
            <input
              type="checkbox"
              className="form-check-input"
              id="autoPlayCheck"
              defaultChecked={autoplay}
              onClick={autoPlayToggle}
            />
            Auto Play Videos
          </label>
        </div>
      </div>
    </div>
  );
};

AutoPlay.propTypes = {
  autoplay: PropTypes.bool,
  setSiteSetting: PropTypes.func.isRequired,
};

AutoPlay.defaultProps = {
  autoplay: true,
};

const mapStateToProps = state => ({
  autoplay: state.siteSettings.autoplay,
});

export default connect(mapStateToProps, {
  setSiteSetting: siteSettings,
})(AutoPlay);
