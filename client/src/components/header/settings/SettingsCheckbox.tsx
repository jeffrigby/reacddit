import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import type { SiteSettingsState } from '@/redux/slices/siteSettingsSlice';
import { siteSettingsChanged } from '@/redux/slices/siteSettingsSlice';

type BooleanSettingKey = {
  [K in keyof SiteSettingsState]: SiteSettingsState[K] extends boolean
    ? K
    : never;
}[keyof SiteSettingsState];

interface SettingsCheckboxProps {
  settingKey: BooleanSettingKey;
  label: string;
  id: string;
  className?: string;
  onChange?: (newValue: boolean) => void;
}

function SettingsCheckbox({
  settingKey,
  label,
  id,
  className = '',
  onChange,
}: SettingsCheckboxProps): React.JSX.Element {
  const checked = useAppSelector(
    (state) => state.siteSettings[settingKey] ?? false
  );
  const dispatch = useAppDispatch();

  const handleChange = (): void => {
    const newValue = !checked;
    dispatch(siteSettingsChanged({ [settingKey as string]: newValue }));
    onChange?.(newValue);
  };

  return (
    <div className={`form-check ${className}`.trim()}>
      <label className="form-check-label" htmlFor={id}>
        <input
          checked={checked}
          className="form-check-input"
          id={id}
          type="checkbox"
          onChange={handleChange}
        />
        {label}
      </label>
    </div>
  );
}

export default SettingsCheckbox;
