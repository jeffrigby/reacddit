import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { siteSettingsChanged } from '@/redux/slices/siteSettingsSlice';

function AutoPlay() {
  const autoplay = useAppSelector((state) => state.siteSettings.autoplay);
  const dispatch = useAppDispatch();

  const autoPlayToggle = () => {
    dispatch(siteSettingsChanged({ autoplay: !autoplay }));
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
