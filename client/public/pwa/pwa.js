/**
 * Pre-React Error Handler
 * Provides fallback UI if React bundle fails to load
 * Runs before React initialization
 */

const LOADING_TIMEOUT = 8000; // 8 seconds - balanced timeout

const clearCachesAndReload = async () => {
  try {
    // Clear all service worker caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
    }

    // Unregister all service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((reg) => reg.unregister()));
    }

    // Hard reload (bypass cache)
    window.location.reload();
  } catch (error) {
    console.error('Error during cache clear:', error);
    // Fallback to simple reload
    window.location.reload();
  }
};

// Set timeout to show error UI if React doesn't load in time
const loadingTimeout = setTimeout(() => {
  try {
    const errorDiv = document.getElementById('error-loading');
    const loadingIcon = document.getElementById('landing-icon');
    const reloadBtn = document.getElementById('force-refresh');

    if (errorDiv) {
      errorDiv.classList.remove('d-none');
    }

    if (loadingIcon) {
      loadingIcon.classList.add('d-none');
    }

    if (reloadBtn) {
      reloadBtn.addEventListener('click', clearCachesAndReload);
    }
  } catch (error) {
    console.error('Error showing fallback UI:', error);
  }
}, LOADING_TIMEOUT);

// Cancel timeout if React loads successfully
// React will remove or hide the #splash div when it renders
const observer = new MutationObserver(() => {
  const splash = document.getElementById('splash');
  if (!splash || !document.body.contains(splash)) {
    clearTimeout(loadingTimeout);
    observer.disconnect();
  }
});

// Start observing the root element for changes (optimized - only watch direct children)
const rootElement = document.getElementById('root');
if (rootElement) {
  observer.observe(rootElement, {
    childList: true, // Watch for children being added/removed
    subtree: false, // Don't watch nested children (performance optimization)
  });
}

// Also cancel timeout on window load (fallback)
window.addEventListener('load', () => {
  // Give React a moment to render
  setTimeout(() => {
    const splash = document.getElementById('splash');
    if (!splash || !document.body.contains(splash)) {
      clearTimeout(loadingTimeout);
      observer.disconnect();
    }
  }, 100);
});
