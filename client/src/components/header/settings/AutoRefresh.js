import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { siteSettings } from '../../../redux/slices/siteSettingsSlice';
import { hotkeyStatus } from '../../../common';

function AutoRefresh() {
  const stream = useSelector((state) => state.siteSettings.stream);
  const dispatch = useDispatch();

  const autoRefreshToggle = () => {
    window.scrollTo(0, 0);
    dispatch(siteSettings({ stream: !stream }));
  };

  const hotkeys = (event) => {
    if (hotkeyStatus()) {
      const pressedKey = event.key;
      try {
        if (pressedKey === '>') {
          autoRefreshToggle();
        }
      } catch (e) {
        console.error('Error in auto-refresh hotkeys', e);
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
    <div className="auto-refresh">
      <div className="form-check d-flex">
        <div>
          <label className="form-check-label" htmlFor="autoRefreshCheck">
            <input
              className="form-check-input"
              defaultChecked={stream}
              id="autoRefreshCheck"
              type="checkbox"
              onClick={autoRefreshToggle}
            />
            Auto Refresh
          </label>
        </div>
        <div
          className="ms-auto"
          data-bs-target="#autoRefresh"
          data-bs-toggle="modal"
          title="Auto Refresh Info"
        >
          <i className="fas fa-info-circle" />
        </div>
      </div>
    </div>
  );
}

export default AutoRefresh;
