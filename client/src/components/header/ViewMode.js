import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { siteSettings } from '../../redux/actions/misc';
import { hotkeyStatus } from '../../common';

function ViewMode() {
  const siteSettingsView = useSelector((state) => state.siteSettings.view);
  const dispatch = useDispatch();

  const btnClasses = 'btn btn-secondary btn-sm';

  const toggleView = async (view) => {
    // const currentFocus = document.getElementById(actionable);
    window.scrollTo(0, 0);
    await dispatch(siteSettings({ view }));
  };

  const hotkeys = (event) => {
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
}

export default ViewMode;
