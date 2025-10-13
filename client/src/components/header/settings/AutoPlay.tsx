import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/types/redux';
import { siteSettings } from '@/redux/slices/siteSettingsSlice';

function AutoPlay() {
  const autoplay = useSelector(
    (state: RootState) => state.siteSettings.autoplay
  );
  const dispatch = useDispatch<AppDispatch>();

  const autoPlayToggle = () => {
    dispatch(siteSettings({ autoplay: !autoplay }));
  };

  return (
    <div className="auto-play">
      <div className="form-check">
        <label className="form-check-label" htmlFor="autoPlayCheck">
          <input
            checked={Boolean(autoplay)}
            className="form-check-input"
            id="autoPlayCheck"
            type="checkbox"
            onChange={autoPlayToggle}
          />
          Auto Play Videos
        </label>
      </div>
    </div>
  );
}

export default AutoPlay;
