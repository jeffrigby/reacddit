import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/types/redux';
import { siteSettings } from '@/redux/slices/siteSettingsSlice';

function CondensePrefs() {
  const condenseStickySetting = useSelector(
    (state: RootState) => state.siteSettings.condenseSticky
  );
  const condenseDuplicatesSetting = useSelector(
    (state: RootState) => state.siteSettings.condenseDuplicate
  );
  const condensePinnedSetting = useSelector(
    (state: RootState) => state.siteSettings.condensePinned
  );
  const dispatch = useDispatch<AppDispatch>();

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
          title="Condense Info"
        >
          <i className="fas fa-info-circle" />
        </div>
      </div>
      <div className="form-check">
        <label className="form-check-label" htmlFor="condenseStickySetting">
          <input
            checked={condenseStickySetting}
            className="form-check-input"
            id="condenseStickySetting"
            type="checkbox"
            onChange={toggleSticky}
          />
          Sticky
        </label>
      </div>
      <div className="form-check">
        <label className="form-check-label" htmlFor="condensePinnedSetting">
          <input
            checked={condensePinnedSetting}
            className="form-check-input"
            id="condensePinnedSetting"
            type="checkbox"
            onChange={togglePinned}
          />
          Pinned
        </label>
      </div>
      <div className="form-check">
        <label className="form-check-label" htmlFor="condenseDuplicatesSetting">
          <input
            checked={condenseDuplicatesSetting}
            className="form-check-input"
            id="condenseDuplicatesSetting"
            type="checkbox"
            onChange={toggleDupe}
          />
          Duplicate
        </label>
      </div>
    </>
  );
}

export default CondensePrefs;
