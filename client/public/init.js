// theme.js
(function () {
  document.addEventListener('DOMContentLoaded', () => {
    try {
      // Try to retrieve and parse the stored state from localStorage
      const savedState = localStorage.getItem('state');
      const state = savedState ? JSON.parse(savedState) : null;

      // Extract the theme from the stored state, defaulting to system preference
      const prefersDarkMode = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      const defaultTheme = prefersDarkMode ? 'dark' : 'light';

      const currentTheme =
        state && state.siteSettings && state.siteSettings.theme
          ? state.siteSettings.theme
          : defaultTheme;

      // Apply the theme to the document
      if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-bs-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-bs-theme');
      }
    } catch (error) {
      console.error('Error applying theme from localStorage:', error);
    }
  });
})();
