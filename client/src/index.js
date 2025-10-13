import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import throttle from 'lodash/throttle';
import cookies from 'js-cookie';
import { BrowserRouter } from 'react-router-dom';
import queryString from 'query-string';
import configureReduxStore from './redux/configureStore';
import { loadState, saveState } from './redux/localStorage';
import './styles/bootstrap.scss';
import './styles/main.scss';
import Root from './components/layout/Root';
import { register as serviceWorkerRegister } from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

const { hash, search } = window.location;

const parsed = queryString.parse(search);

// Start at the top of the page
window.scrollTo(0, 0);

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

  const persistedState = loadState();

  // Create a history of your choosing (we're using a browser history in this case)
  const store = configureReduxStore(persistedState);

  store.subscribe(
    throttle(() => {
      saveState({
        // subreddits: store.getState().subreddits,
        debugMode: store.getState().debugMode,
        lastUpdated: store.getState().lastUpdated,
        lastUpdatedTime: store.getState().lastUpdatedTime,
        redditMe: store.getState().redditMe,
        siteSettings: store.getState().siteSettings,
        subreddits: store.getState().subreddits,
        redditMultiReddits: store.getState().redditMultiReddits,
        redditFriends: store.getState().redditFriends,
        menus: store.getState().menus,
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
