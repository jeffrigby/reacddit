import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';
import createHistory from 'history/createBrowserHistory';
import throttle from 'lodash/throttle';
import configureStore from './redux/configureStore';
import { loadState, saveState } from './redux/localStorage';
import './styles/main.scss';
import Root from './containers/Root';

const persistedState = loadState();

// Create a history of your choosing (we're using a browser history in this case)
const history = createHistory();
const store = configureStore(persistedState, history);

store.subscribe(
  throttle(() => {
    saveState({
      // subreddits: store.getState().subreddits,
      debugMode: store.getState().debugMode,
      lastUpdated: store.getState().lastUpdated,
      lastUpdatedTime: store.getState().lastUpdatedTime,
      redditMe: store.getState().redditMe,
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
