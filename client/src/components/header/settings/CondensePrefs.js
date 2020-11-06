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
  const dispatch = useDispatch();

  const toggleDupe = () => {
    dispatch(siteSettings({ condenseDuplicate: !condenseDuplicatesSetting }));
  };

  const toggleSticky = () => {
    dispatch(siteSettings({ condenseSticky: !condenseStickySetting }));
  };

  return (
    <div className="condense-settings">
      <div className="form-check d-flex">
        <div>
          <label className="form-check-label" htmlFor="debugCheck">
            <input
              type="checkbox"
              className="form-check-input"
              id="autoPlayCheck"
              defaultChecked={condenseStickySetting}
              onClick={toggleSticky}
            />
            Condense sticky posts
          </label>
        </div>
      </div>
      <div className="form-check d-flex">
        <div>
          <label className="form-check-label" htmlFor="debugCheck">
            <input
              type="checkbox"
              className="form-check-input"
              id="autoPlayCheck"
              defaultChecked={condenseDuplicatesSetting}
              onClick={toggleDupe}
            />
            Condense duplicate posts
          </label>
        </div>
      </div>
    </div>
  );
};

export default CondensePrefs;
