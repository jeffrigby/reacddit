import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { siteSettings } from '../../../redux/slices/siteSettingsSlice';
import { hotkeyStatus } from '../../../common';

function DebugMode() {
  const debug = useSelector((state) => state.siteSettings.debug);
  const dispatch = useDispatch();

  const debugToggle = () => {
    dispatch(siteSettings({ debug: !debug }));
  };

  const hotkeys = (event) => {
    if (hotkeyStatus()) {
      const pressedKey = event.key;
      try {
        if (pressedKey === 'Î') {
          // opt-shift-d
          debugToggle();
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

  return (
    <div className="form-check">
      <label className="form-check-label" htmlFor="debugCheck">
        <input
          type="checkbox"
          className="form-check-input"
          id="debugCheck"
          defaultChecked={debug}
          onClick={debugToggle}
        />
        Show Debug Info
      </label>
    </div>
  );
}

export default DebugMode;
