import type { MouseEvent } from 'react';
import { useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCompressArrowsAlt,
  faExpandArrowsAlt,
} from '@fortawesome/free-solid-svg-icons';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { siteSettingsChanged } from '@/redux/slices/siteSettingsSlice';
import { hotkeyStatus } from '@/common';

type ViewModeType = 'expanded' | 'condensed';

function ViewMode() {
  const siteSettingsView = useAppSelector(
    (state) => (state.siteSettings.view as ViewModeType) || 'expanded'
  );
  const dispatch = useAppDispatch();

  const toggleView = async (view: ViewModeType) => {
    window.scrollTo(0, 0);
    await dispatch(siteSettingsChanged({ view }));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteSettingsView]);

  const viewIcon =
    siteSettingsView === 'expanded' ? faCompressArrowsAlt : faExpandArrowsAlt;
  const viewLabel =
    siteSettingsView === 'expanded' ? 'Condensed View' : 'Full View';
  const viewTitle =
    siteSettingsView === 'expanded' ? 'Condensed View (v)' : 'Full View (v)';
  const viewAction = siteSettingsView === 'expanded' ? 'condensed' : 'expanded';

  return (
    <div className="header-button">
      <Button
        aria-label={viewLabel}
        size="sm"
        title={viewTitle}
        variant="secondary"
        onClick={handleButtonClick(viewAction)}
      >
        <FontAwesomeIcon icon={viewIcon} />
      </Button>
    </div>
  );
}

export default ViewMode;
