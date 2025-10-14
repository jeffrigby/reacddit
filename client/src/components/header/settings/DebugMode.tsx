import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { siteSettingsChanged } from '@/redux/slices/siteSettingsSlice';
import { hotkeyStatus } from '@/common';

interface DebugModeProps {
  className?: string;
}

function DebugMode({ className = '' }: DebugModeProps) {
  const debug = useAppSelector((state) => state.siteSettings.debug ?? false);
  const dispatch = useAppDispatch();

  const debugToggle = () => {
    dispatch(siteSettingsChanged({ debug: !debug }));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`form-check ${className}`.trim()}>
      <label className="form-check-label" htmlFor="debugCheck">
        <input
          checked={debug}
          className="form-check-input"
          id="debugCheck"
          type="checkbox"
          onChange={debugToggle}
        />
        Show Debug Info
      </label>
    </div>
  );
}

export default DebugMode;
