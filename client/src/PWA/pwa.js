// this is a file
const refresh = () => {
  if ('serviceWorker' in navigator) {
    if (caches) {
      // Service worker cache should be cleared with caches.delete()
      caches.keys().then(names => {
        for (let name of names) caches.delete(name);
      });
    }

    navigator.serviceWorker.ready.then(registration => {
      registration.unregister();
      window.location.reload(true);
    });
  } else {
    window.location.reload(true);
  }
};

setTimeout(() => {
  try {
    document.getElementById('error-loading').classList.remove('d-none');
    document.getElementById('landing-icon').classList.add('d-none');
    document
      .getElementById('force-refresh')
      .addEventListener('onclick', refresh);
  } catch (e) {}
}, 10000);
