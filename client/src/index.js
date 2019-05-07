import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { createBrowserHistory } from 'history';
import throttle from 'lodash/throttle';
import configureStore from './redux/configureStore';
import { loadState, saveState } from './redux/localStorage';
import './styles/main.scss';
import Root from './components/layout/Root';
import * as serviceWorker from './serviceWorker';

const queryString = require('query-string');

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

if (parsed.login !== undefined || parsed.logout !== undefined) {
  // Don't render anything if logging out/in.
  ReactDOM.render(<></>, document.getElementById('root'));
} else {
  // Clear the local/session cache. Mostly for debugging.
  if (parsed.cb !== undefined) {
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
  const history = createBrowserHistory();
  const store = configureStore(persistedState, history);

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
      });
    }, 1000)
  );

  const render = Component => {
    ReactDOM.render(
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <Component />
        </ConnectedRouter>
      </Provider>,
      document.getElementById('root')
    );
  };

  render(Root);
}

serviceWorker.register();
