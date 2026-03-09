import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { useModals } from '@/contexts/ModalContext';
import SettingsCheckbox from './SettingsCheckbox';

function CondensePrefs(): React.JSX.Element {
  const { setShowCondenseHelp } = useModals();

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
      <SettingsCheckbox
        id="condenseStickySetting"
        label="Sticky"
        settingKey="condenseSticky"
      />
      <SettingsCheckbox
        id="condensePinnedSetting"
        label="Pinned"
        settingKey="condensePinned"
      />
      <SettingsCheckbox
        id="condenseDuplicatesSetting"
        label="Duplicate"
        settingKey="condenseDuplicate"
      />
    </>
  );
}

export default CondensePrefs;
