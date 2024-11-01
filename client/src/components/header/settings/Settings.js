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
        type="button"
        className="btn btn-secondary btn-sm form-control-sm"
        data-bs-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false"
        aria-label="Settings"
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
