import SettingsCheckbox from './SettingsCheckbox';

function AutoPlay(): React.JSX.Element {
  return (
    <div className="auto-play">
      <SettingsCheckbox
        id="autoPlayCheck"
        label="Auto Play Videos"
        settingKey="autoplay"
      />
    </div>
  );
}

export default AutoPlay;
