import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { useModals } from '@/contexts/ModalContext';
import { siteSettingsChanged } from '@/redux/slices/siteSettingsSlice';
import { scrollToPosition } from '@/common';

function AutoRefresh() {
  const stream = useAppSelector((state) => state.siteSettings.stream);
  const dispatch = useAppDispatch();
  const { setShowAutoRefresh } = useModals();

  const autoRefreshToggle = () => {
    scrollToPosition(0, 0);
    dispatch(siteSettingsChanged({ stream: !stream }));
  };

  return (
    <div className="auto-refresh">
      <div className="form-check d-flex">
        <div>
          <label className="form-check-label" htmlFor="autoRefreshCheck">
            <input
              checked={stream}
              className="form-check-input"
              id="autoRefreshCheck"
              type="checkbox"
              onChange={autoRefreshToggle}
            />
            Auto Refresh
          </label>
        </div>
        <div
          className="ms-auto"
          role="button"
          tabIndex={0}
          title="Auto Refresh Info"
          onClick={() => setShowAutoRefresh(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setShowAutoRefresh(true);
            }
          }}
        >
          <FontAwesomeIcon icon={faInfoCircle} />
        </div>
      </div>
    </div>
  );
}

export default AutoRefresh;
