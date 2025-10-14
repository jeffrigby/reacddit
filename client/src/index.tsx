import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import throttle from 'lodash/throttle';
import cookies from 'js-cookie';
import { BrowserRouter } from 'react-router-dom';
import queryString from 'query-string';
import { initializeStore } from './redux/configureStore';
import { loadState, saveState } from './redux/localStorage';
import { scrollToPosition } from './common';
import './styles/bootstrap.scss';
import './styles/main.scss';
import Root from './components/layout/Root';
import { register as serviceWorkerRegister } from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

const { hash, search } = window.location;

const parsed = queryString.parse(search) as {
  logout?: string;
  login?: string;
  cb?: string;
};

// Start at the top of the page
scrollToPosition(0, 0);

if (parsed.logout !== undefined) {
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = '/';
}

if (parsed.login !== undefined) {
  localStorage.removeItem('state');
  window.location.href = '/';
}

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element not found');
}

const root = createRoot(container);

if (parsed.login !== undefined || parsed.logout !== undefined) {
  // Don't render anything if logging out/in.
  root.render(<div className="app-loading" />);
} else {
  // Clear the local/session cache. Mostly for debugging or a weird cookie mismatch.
  const cookieToken = cookies.get('token');

  if (parsed.cb !== undefined || cookieToken === undefined) {
    localStorage.clear();
    sessionStorage.clear();
  }

  // Check for hash, this is for cloudflare caching.
  // Set up a page rule for https://mydomain.com/* -> https://mydomain.com/#$1
  // This allows all request to come through to / allowing the CDN to cache
  // Everything.
  if (hash) {
    window.history.replaceState({}, document.title, hash.substring(1));
  }

  // Load persisted state from localStorage
  const persistedState = loadState();

  // Initialize store with persisted state
  const store = initializeStore(persistedState);

  // Subscribe to store changes and persist to localStorage
  store.subscribe(
    throttle(() => {
      const state = store.getState();
      saveState({
        // Only persist slices that should be cached
        siteSettings: state.siteSettings,
        subreddits: state.subreddits,
        redditMultiReddits: state.redditMultiReddits,
        redditMe: state.redditMe,
        history: state.history,
      });
    }, 1000)
  );

  root.render(
    <Provider store={store}>
      <BrowserRouter>
        <Root />
      </BrowserRouter>
    </Provider>
  );
}

serviceWorkerRegister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
