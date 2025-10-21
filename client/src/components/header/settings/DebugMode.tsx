import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { siteSettingsChanged } from '@/redux/slices/siteSettingsSlice';

interface DebugModeProps {
  className?: string;
}

function DebugMode({ className = '' }: DebugModeProps) {
  const debug = useAppSelector((state) => state.siteSettings.debug ?? false);
  const dispatch = useAppDispatch();

  const debugToggle = () => {
    dispatch(siteSettingsChanged({ debug: !debug }));
  };

  return (
    <div className={`form-check ${className}`.trim()}>
      <label className="form-check-label" htmlFor="debugCheck">
        <input
          checked={debug}
          className="form-check-input"
          id="debugCheck"
          type="checkbox"
          onChange={debugToggle}
        />
        Show Debug Info
      </label>
    </div>
  );
}

export default DebugMode;
