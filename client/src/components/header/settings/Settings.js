import AutoRefresh from './AutoRefresh';
import ForceRefresh from './ForceRefresh';
import AutoPlay from './AutoPlay';
import DebugMode from './DebugMode';
import CondensePrefs from './CondensePrefs';

function Settings() {
  return (
    <div
      className="btn-group settings-menu header-button"
      role="button"
      tabIndex="0"
    >
      <button
        aria-expanded="false"
        aria-haspopup="true"
        aria-label="Settings"
        className="btn btn-secondary btn-sm form-control-sm"
        data-bs-toggle="dropdown"
        type="button"
      >
        <i className="fas fa-cog" />
      </button>
      <div className="dropdown-menu dropdown-menu-end p-2">
        <div className="small">
          <AutoRefresh />
          <AutoPlay />
          <DebugMode />
          <CondensePrefs />
        </div>
        <div className="dropdown-divider" />
        <ForceRefresh />
      </div>
    </div>
  );
}

Settings.propTypes = {};

export default Settings;
