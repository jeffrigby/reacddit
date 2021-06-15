import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { siteSettings } from '../../../redux/actions/misc';

const CondensePrefs = () => {
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
          data-bs-toggle="modal"
          data-bs-target="#condenseHelp"
          title="Auto Refresh Info"
          className="ms-auto"
        >
          <i className="fas fa-info-circle" />
        </div>
      </div>
      <div className="form-check">
        <label className="form-check-label" htmlFor="condenseStickySetting">
          <input
            type="checkbox"
            className="form-check-input"
            id="condenseStickySetting"
            defaultChecked={condenseStickySetting}
            onClick={toggleSticky}
          />
          Sticky
        </label>
      </div>
      <div className="form-check">
        <label className="form-check-label" htmlFor="condensePinnedSetting">
          <input
            type="checkbox"
            className="form-check-input"
            id="condensePinnedSetting"
            defaultChecked={condensePinnedSetting}
            onClick={togglePinned}
          />
          Pinned
        </label>
      </div>
      <div className="form-check">
        <label className="form-check-label" htmlFor="condenseDuplicatesSetting">
          <input
            type="checkbox"
            className="form-check-input"
            id="condenseDuplicatesSetting"
            defaultChecked={condenseDuplicatesSetting}
            onClick={toggleDupe}
          />
          Duplicate
        </label>
      </div>
    </>
  );
};

export default CondensePrefs;
