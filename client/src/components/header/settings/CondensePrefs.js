import { useDispatch, useSelector } from 'react-redux';
import { siteSettings } from '../../../redux/slices/siteSettingsSlice';

function CondensePrefs() {
  const condenseStickySetting = useSelector(
    (state) => state.siteSettings.condenseSticky
  );
  const condenseDuplicatesSetting = useSelector(
    (state) => state.siteSettings.condenseDuplicate
  );
  const condensePinnedSetting = useSelector(
    (state) => state.siteSettings.condensePinned
  );
  const dispatch = useDispatch();

  const toggleDupe = () => {
    dispatch(siteSettings({ condenseDuplicate: !condenseDuplicatesSetting }));
  };

  const toggleSticky = () => {
    dispatch(siteSettings({ condenseSticky: !condenseStickySetting }));
  };

  const togglePinned = () => {
    dispatch(siteSettings({ condensePinned: !condensePinnedSetting }));
  };

  return (
    <>
      <div className="mt-2 d-flex">
        <div className="fw-bold mb-1">Default Condense</div>
        <div
          className="ms-auto"
          data-bs-target="#condenseHelp"
          data-bs-toggle="modal"
          title="Auto Refresh Info"
        >
          <i className="fas fa-info-circle" />
        </div>
      </div>
      <div className="form-check">
        <label className="form-check-label" htmlFor="condenseStickySetting">
          <input
            className="form-check-input"
            defaultChecked={condenseStickySetting}
            id="condenseStickySetting"
            type="checkbox"
            onClick={toggleSticky}
          />
          Sticky
        </label>
      </div>
      <div className="form-check">
        <label className="form-check-label" htmlFor="condensePinnedSetting">
          <input
            className="form-check-input"
            defaultChecked={condensePinnedSetting}
            id="condensePinnedSetting"
            type="checkbox"
            onClick={togglePinned}
          />
          Pinned
        </label>
      </div>
      <div className="form-check">
        <label className="form-check-label" htmlFor="condenseDuplicatesSetting">
          <input
            className="form-check-input"
            defaultChecked={condenseDuplicatesSetting}
            id="condenseDuplicatesSetting"
            type="checkbox"
            onClick={toggleDupe}
          />
          Duplicate
        </label>
      </div>
    </>
  );
}

export default CondensePrefs;
