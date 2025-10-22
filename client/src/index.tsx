import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import throttle from 'lodash/throttle';
import cookies from 'js-cookie';
import { BrowserRouter } from 'react-router-dom';
import queryString from 'query-string';
import { Workbox } from 'workbox-window';
import { initializeStore } from './redux/configureStore';
import { loadState, saveState } from './redux/localStorage';
import { scrollToPosition } from './common';
import './styles/bootstrap.scss';
import './styles/main.scss';
import Root from './components/layout/Root';
import reportWebVitals from './reportWebVitals';

const { hash, search } = window.location;

const parsed = queryString.parse(search) as {
  logout?: string;
  login?: string;
  cb?: string;
};

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
  root.render(<div className="app-loading" />);
} else {
  const cookieToken = cookies.get('token');

  if (parsed.cb !== undefined || cookieToken === undefined) {
    localStorage.clear();
    sessionStorage.clear();
  }

  if (hash) {
    window.history.replaceState({}, document.title, hash.substring(1));
  }

  const persistedState = loadState();

  const store = initializeStore(persistedState);

  store.subscribe(
    throttle(() => {
      const state = store.getState();
      saveState({
        siteSettings: state.siteSettings,
        subreddits: state.subreddits,
        redditMultiReddits: state.redditMultiReddits,
        redditMe: state.redditMe,
        history: state.history,
      });
    }, 1000)
  );

  let wb: Workbox | null = null;
  if ('serviceWorker' in navigator && import.meta.env.MODE === 'production') {
    wb = new Workbox('/service-worker.js');
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
