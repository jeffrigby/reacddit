import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { siteSettings } from '../../redux/slices/siteSettingsSlice';
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
        console.error('Error in view mode hotkeys', e);
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
        aria-label="Condensed View"
        className={btnClasses}
        title="Condensed View (v)"
        type="button"
        onClick={() => toggleView('condensed')}
      >
        <i className="fas fa-compress-arrows-alt" />
      </button>
    ) : (
      <button
        aria-label="Full View"
        className={btnClasses}
        title="Full View (v)"
        type="button"
        onClick={() => toggleView('expanded')}
      >
        <i className="fas fa-expand-arrows-alt" />
      </button>
    );

  return <div className="header-button">{button}</div>;
}

export default ViewMode;
