import { Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import AutoRefresh from './AutoRefresh';
import ForceRefresh from './ForceRefresh';
import AutoPlay from './AutoPlay';
import DebugMode from './DebugMode';
import CondensePrefs from './CondensePrefs';

function Settings() {
  return (
    <Dropdown className="settings-menu header-button" tabIndex={0}>
      <Dropdown.Toggle
        aria-label="Settings"
        className="form-control-sm"
        id="dropdown-settings"
        size="sm"
        variant="secondary"
      >
        <FontAwesomeIcon icon={faCog} />
      </Dropdown.Toggle>
      <Dropdown.Menu align="end" className="p-2">
        <div className="small">
          <AutoRefresh />
          <AutoPlay />
          <DebugMode />
          <CondensePrefs />
        </div>
        <Dropdown.Divider />
        <ForceRefresh />
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default Settings;
