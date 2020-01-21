import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { siteSettings } from '../../redux/actions/misc';
import { hotkeyStatus } from '../../common';
import { listingState } from '../../redux/selectors/listingsSelector';

const ViewMode = ({ siteSettingsView, setSiteSetting, actionable }) => {
  const btnClasses = 'btn btn-secondary btn-sm';

  const toggleView = async view => {
    // const currentFocus = document.getElementById(actionable);
    window.scrollTo(0, 0);
    await setSiteSetting({ view });
  };

  const hotkeys = event => {
    if (hotkeyStatus()) {
      const pressedKey = event.key;
      try {
        if (pressedKey === 'v') {
          const action =
            siteSettingsView === 'expanded' ? 'condensed' : 'expanded';
          toggleView(action);
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

  const button =
    siteSettingsView === 'expanded' ? (
      <button
        onClick={() => toggleView('condensed')}
        type="button"
        className={btnClasses}
        title="Condensed View (v)"
      >
        <i className="fas fa-compress-arrows-alt" />
      </button>
    ) : (
      <button
        onClick={() => toggleView('expanded')}
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
  actionable: PropTypes.string,
};

ViewMode.defaultProps = {
  siteSettingsView: 'view',
  actionable: '',
};

const mapStateToProps = state => ({
  siteSettingsView: state.siteSettings.view,
  actionable: listingState(state).actionable,
});

export default connect(mapStateToProps, {
  setSiteSetting: siteSettings,
})(ViewMode);
