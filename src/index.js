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
import Root from './containers/Root';

const queryString = require('query-string');

const { hash, search } = window.location;

const parsed = queryString.parse(search);

if (parsed.logout !== undefined) {
  localStorage.clear();
  sessionStorage.clear();
  window.history.replaceState({}, document.title, '/');
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
