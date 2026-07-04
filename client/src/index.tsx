import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import throttle from 'lodash/throttle';
import cookies from 'js-cookie';
import { BrowserRouter } from 'react-router';
import { Workbox } from 'workbox-window';
import { initializeStore } from './redux/configureStore';
import { loadState, saveState } from './redux/localStorage';
import { scrollToPosition } from './common';
import './styles/bootstrap.scss';
import './styles/main.scss';
import Root from './components/layout/Root';
import reportWebVitals from './reportWebVitals';

const { hash, search } = window.location;

const parsed = new URLSearchParams(search);

scrollToPosition(0, 0);

if (parsed.has('logout')) {
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = '/';
}

if (parsed.has('login')) {
  localStorage.removeItem('state');
  window.location.href = '/';
}

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element not found');
}

const root = createRoot(
  container,
  import.meta.env.PROD
    ? {
        onCaughtError(error, errorInfo) {
          console.error('React caught error:', error, errorInfo.componentStack);
        },
        onUncaughtError(error, errorInfo) {
          console.error(
            'React uncaught error:',
            error,
            errorInfo.componentStack
          );
        },
        onRecoverableError(error, errorInfo) {
          console.error(
            'React recoverable error:',
            error,
            errorInfo.componentStack
          );
        },
      }
    : undefined
);

if (parsed.login !== undefined || parsed.logout !== undefined) {
  root.render(<div className="app-loading" />);
} else {
  const cookieToken = cookies.get('token');

  if (parsed.has('cb') || cookieToken === undefined) {
    localStorage.clear();
    sessionStorage.clear();
  }

  if (hash) {
    const path = hash.substring(1);
    if (path.startsWith('/') && !path.startsWith('//')) {
      window.history.replaceState({}, document.title, path);
    }
  }

  const persistedState = loadState();

  const store = initializeStore(persistedState);

  store.subscribe(
    throttle(() => {
      const state = store.getState();
      saveState({
        siteSettings: state.siteSettings,
        subredditPolling: state.subredditPolling,
        redditMe: state.redditMe,
        history: state.history,
        redditApi: state.redditApi,
      });
    }, 1000)
  );

  let wb: Workbox | null = null;
  if ('serviceWorker' in navigator && import.meta.env.MODE === 'production') {
    wb = new Workbox('/worker.js');
    wb.register();
  }

  root.render(
    <Provider store={store}>
      <BrowserRouter>
        <Root workbox={wb} />
      </BrowserRouter>
    </Provider>
  );
}

reportWebVitals();
