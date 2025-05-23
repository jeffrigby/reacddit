import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/types/redux';
import { siteSettings } from '../../redux/slices/siteSettingsSlice';

type ThemeType = 'dark' | 'light';

function ToggleTheme() {
  const dispatch = useDispatch<AppDispatch>();
  const siteSettingsTheme = useSelector(
    (state: RootState) => state.siteSettings.theme as ThemeType | undefined
  );

  useEffect(() => {
    if (siteSettingsTheme) {
      document.documentElement.setAttribute(
        'data-bs-theme',
        siteSettingsTheme === 'dark' ? 'dark' : ''
      );
    }
  }, [siteSettingsTheme]);

  const toggleTheme = () => {
    const newTheme: ThemeType = siteSettingsTheme === 'dark' ? 'light' : 'dark';
    dispatch(siteSettings({ theme: newTheme }));
  };

  const iconClass = siteSettingsTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  const buttonTitle = siteSettingsTheme === 'dark' ? 'Light Mode' : 'Dark Mode';

  return (
    <div className="header-button">
      <button
        aria-label={`Enable ${buttonTitle}`}
        className="btn btn-secondary btn-sm"
        title={buttonTitle}
        type="button"
        onClick={toggleTheme}
      >
        <i className={iconClass} />
      </button>
    </div>
  );
}

export default ToggleTheme;
