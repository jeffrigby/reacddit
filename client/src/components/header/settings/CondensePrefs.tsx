import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { useModals } from '@/contexts/ModalContext';
import { siteSettingsChanged } from '@/redux/slices/siteSettingsSlice';

function CondensePrefs() {
  const condenseStickySetting = useAppSelector(
    (state) => state.siteSettings.condenseSticky
  );
  const condenseDuplicatesSetting = useAppSelector(
    (state) => state.siteSettings.condenseDuplicate
  );
  const condensePinnedSetting = useAppSelector(
    (state) => state.siteSettings.condensePinned
  );
  const dispatch = useAppDispatch();
  const { setShowCondenseHelp } = useModals();

  const toggleDupe = () => {
    dispatch(
      siteSettingsChanged({ condenseDuplicate: !condenseDuplicatesSetting })
    );
  };

  const toggleSticky = () => {
    dispatch(siteSettingsChanged({ condenseSticky: !condenseStickySetting }));
  };

  const togglePinned = () => {
    dispatch(siteSettingsChanged({ condensePinned: !condensePinnedSetting }));
  };

  return (
    <>
      <div className="mt-2 d-flex">
        <div className="fw-bold mb-1">Default Condense</div>
        <div
          className="ms-auto"
          role="button"
          tabIndex={0}
          title="Condense Info"
          onClick={() => setShowCondenseHelp(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setShowCondenseHelp(true);
            }
          }}
        >
          <FontAwesomeIcon icon={faInfoCircle} />
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
