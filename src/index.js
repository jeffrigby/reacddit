import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';
import createHistory from 'history/createBrowserHistory';
import configureStore from './redux/configureStore';
import './styles/main.scss';
import Root from './containers/Root';

// Create a history of your choosing (we're using a browser history in this case)
const history = createHistory();
const store = configureStore({}, history);

const render = (Component) => {
  ReactDOM.render(
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <AppContainer>
          <Component />
        </AppContainer>
      </ConnectedRouter>
    </Provider>,
    document.getElementById('root'),
  );
};

render(Root);

if (module.hot) {
  module.hot.accept('./containers/Root', () => {
    const NewRoot = require('./containers/Root').default;
    render(NewRoot);
  });
}
