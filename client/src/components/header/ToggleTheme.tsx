import { useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { siteSettingsChanged } from '@/redux/slices/siteSettingsSlice';

type ThemeType = 'dark' | 'light';

function ToggleTheme() {
  const dispatch = useAppDispatch();
  const siteSettingsTheme = useAppSelector(
    (state) => state.siteSettings.theme as ThemeType | undefined
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
    dispatch(siteSettingsChanged({ theme: newTheme }));
  };

  const themeIcon = siteSettingsTheme === 'dark' ? faSun : faMoon;
  const buttonTitle = siteSettingsTheme === 'dark' ? 'Light Mode' : 'Dark Mode';

  return (
    <div className="header-button">
      <Button
        aria-label={`Enable ${buttonTitle}`}
        size="sm"
        title={buttonTitle}
        variant="secondary"
        onClick={toggleTheme}
      >
        <FontAwesomeIcon icon={themeIcon} />
      </Button>
    </div>
  );
}

export default ToggleTheme;
