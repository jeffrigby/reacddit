import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { siteSettings } from '../../redux/slices/siteSettingsSlice';

function ToggleTheme() {
  const dispatch = useDispatch();
  const siteSettingsTheme = useSelector((state) => state.siteSettings.theme);

  useEffect(() => {
    document.documentElement.setAttribute(
      'data-bs-theme',
      siteSettingsTheme === 'dark' ? 'dark' : ''
    );
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
        onClick={toggleTheme}
        type="button"
        className="btn btn-secondary btn-sm"
        title={buttonTitle}
        aria-label={`Enable ${buttonTitle}`}
      >
        <i className={iconClass} />
      </button>
    </div>
  );
}

export default ToggleTheme;
