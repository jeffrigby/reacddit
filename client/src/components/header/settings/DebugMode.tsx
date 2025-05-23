import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/types/redux';
import { siteSettings } from '../../../redux/slices/siteSettingsSlice';
import { hotkeyStatus } from '../../../common';

interface DebugModeProps {
  className?: string;
}

function DebugMode({ className = '' }: DebugModeProps) {
  const debug = useSelector(
    (state: RootState) => state.siteSettings.debug ?? false
  );
  const dispatch = useDispatch<AppDispatch>();

  const debugToggle = () => {
    dispatch(siteSettings({ debug: !debug }));
  };

  const hotkeys = (event: KeyboardEvent) => {
    if (hotkeyStatus()) {
      const pressedKey = event.key;
      try {
        if (pressedKey === 'Î') {
          // opt-shift-d
          debugToggle();
        }
      } catch (e) {
        console.error('Error in debug hotkeys', e);
      }
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', hotkeys);
    return () => {
      document.removeEventListener('keydown', hotkeys);
    };
  }, []);

  return (
    <div className={`form-check ${className}`.trim()}>
      <label className="form-check-label" htmlFor="debugCheck">
        <input
          className="form-check-input"
          defaultChecked={debug}
          id="debugCheck"
          type="checkbox"
          onClick={debugToggle}
        />
        Show Debug Info
      </label>
    </div>
  );
}

export default DebugMode;
