import SettingsCheckbox from './SettingsCheckbox';

interface DebugModeProps {
  className?: string;
}

function DebugMode({ className = '' }: DebugModeProps): React.JSX.Element {
  return (
    <SettingsCheckbox
      className={className}
      id="debugCheck"
      label="Show Debug Info"
      settingKey="debug"
    />
  );
}

export default DebugMode;
