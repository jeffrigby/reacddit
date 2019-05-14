import { createStore, applyMiddleware } from 'redux';
import { routerMiddleware } from 'connected-react-router';
import axios from 'axios';
import axiosMiddleware from 'redux-axios-middleware';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import rootReducer from './reducers';

const axClient = axios.create({
  // all axios can be used, shown in axios documentation
  responseType: 'json',
});

const configureStore = (initialState, history) => {
  // Build the middleware for intercepting and dispatching navigation actions
  // Apply Middlewares
  const middleware = [];
  middleware.push(thunk);
  middleware.push(axiosMiddleware(axClient));
  middleware.push(routerMiddleware(history));
  // middleware.push(createLogger());

  const store = createStore(
    rootReducer(history),
    initialState,
    composeWithDevTools(
      applyMiddleware(...middleware)
      // DevTools.instrument(),
    )
  );

  return store;
};

export default configureStore;