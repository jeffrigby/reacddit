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
    <div className="auto-refresh">
      <div className="form-check d-flex">
        <div>
          <label className="form-check-label" htmlFor="autoRefreshCheck">
            <input
              type="checkbox"
              className="form-check-input"
              id="autoRefreshCheck"
              defaultChecked={stream}
              onClick={autoRefreshToggle}
            />
            Auto Refresh
          </label>
        </div>
        <div
          data-bs-toggle="modal"
          data-bs-target="#autoRefresh"
          title="Auto Refresh Info"
          className="ms-auto"
        >
          <i className="fas fa-info-circle" />
        </div>
      </div>
    </div>
  );
}

export default AutoRefresh;
