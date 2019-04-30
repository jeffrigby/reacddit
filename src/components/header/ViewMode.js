import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { siteSettings } from '../../redux/actions/misc';

const toggleView = async (view, setSiteSetting) => {
  const currentFocus = document.getElementsByClassName('focused');
  await setSiteSetting({ view });
  try {
    window.scrollTo(0, currentFocus[0].offsetTop);
  } catch (e) {
    // continue regardless of error
  }
};

const ViewMode = ({ siteSettingsView, setSiteSetting }) => {
  const btnClasses = 'btn btn-secondary btn-sm';

  const button =
    siteSettingsView === 'expanded' ? (
      <button
        onClick={() => toggleView('condensed', setSiteSetting)}
        type="button"
        className={btnClasses}
        title="Condensed View (v)"
      >
        <i className="fas fa-compress-arrows-alt" />
      </button>
    ) : (
      <button
        onClick={() => toggleView('expanded', setSiteSetting)}
        type="button"
        className={btnClasses}
        title="Full View (v)"
      >
        <i className="fas fa-expand-arrows-alt" />
      </button>
    );

  return <div className="header-button">{button}</div>;
};

ViewMode.propTypes = {
  siteSettingsView: PropTypes.string,
  setSiteSetting: PropTypes.func.isRequired,
};

ViewMode.defaultProps = {
  siteSettingsView: 'view',
};

const mapStateToProps = state => ({
  siteSettingsView: state.siteSettings.view,
});

export default connect(
  mapStateToProps,
  {
    setSiteSetting: siteSettings,
  }
)(ViewMode);
