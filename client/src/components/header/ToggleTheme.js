import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { siteSettings } from '../../redux/slices/siteSettingsSlice';

const ToggleTheme = () => {
  const dispatch = useDispatch();
  const siteSettingsTheme = useSelector((state) => state.siteSettings.theme);

  useEffect(() => {
    if (siteSettingsTheme) {
      document.documentElement.setAttribute(
        'data-bs-theme',
        siteSettingsTheme === 'dark' ? 'dark' : ''
      );
    }
  }, [siteSettingsTheme]);

  const toggleTheme = () => {
    const newTheme = siteSettingsTheme === 'dark' ? 'light' : 'dark';
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
};

export default ToggleTheme;
