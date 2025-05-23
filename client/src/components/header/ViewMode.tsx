import type { MouseEvent } from 'react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/types/redux';
import { siteSettings } from '../../redux/slices/siteSettingsSlice';
import { hotkeyStatus } from '../../common';

type ViewModeType = 'expanded' | 'condensed';

function ViewMode() {
  const siteSettingsView = useSelector(
    (state: RootState) =>
      (state.siteSettings.view as ViewModeType) || 'expanded'
  );
  const dispatch = useDispatch<AppDispatch>();

  const btnClasses = 'btn btn-secondary btn-sm';

  const toggleView = async (view: ViewModeType) => {
    window.scrollTo(0, 0);
    await dispatch(siteSettings({ view }));
  };

  const handleButtonClick =
    (view: ViewModeType) => (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      toggleView(view);
    };

  const hotkeys = (event: KeyboardEvent) => {
    if (hotkeyStatus()) {
      const pressedKey = event.key;
      try {
        if (pressedKey === 'v') {
          const action: ViewModeType =
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
  }, [siteSettingsView]);

  const button =
    siteSettingsView === 'expanded' ? (
      <button
        aria-label="Condensed View"
        className={btnClasses}
        title="Condensed View (v)"
        type="button"
        onClick={handleButtonClick('condensed')}
      >
        <i className="fas fa-compress-arrows-alt" />
      </button>
    ) : (
      <button
        aria-label="Full View"
        className={btnClasses}
        title="Full View (v)"
        type="button"
        onClick={handleButtonClick('expanded')}
      >
        <i className="fas fa-expand-arrows-alt" />
      </button>
    );

  return <div className="header-button">{button}</div>;
}

export default ViewMode;
