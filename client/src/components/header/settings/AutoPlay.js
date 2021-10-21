import { useDispatch, useSelector } from 'react-redux';
import { siteSettings } from '../../../redux/actions/misc';

const AutoPlay = () => {
  const autoplay = useSelector((state) => state.siteSettings.autoplay);
  const dispatch = useDispatch();

  const autoPlayToggle = () => {
    dispatch(siteSettings({ autoplay: !autoplay }));
  };

  return (
    <div className="auto-play">
      <div className="form-check">
        <label className="form-check-label" htmlFor="autoPlayCheck">
          <input
            type="checkbox"
            className="form-check-input"
            id="autoPlayCheck"
            defaultChecked={autoplay}
            onClick={autoPlayToggle}
          />
          Auto Play Videos
        </label>
      </div>
    </div>
  );
};

export default AutoPlay;
