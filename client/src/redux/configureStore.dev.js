import { createStore, applyMiddleware } from 'redux';
import { routerMiddleware } from 'connected-react-router';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import rootReducer from './reducers';

const configureStore = (initialState, history) => {
  // Build the middleware for intercepting and dispatching navigation actions
  // Apply Middlewares
  const middleware = [];
  middleware.push(thunk);
  middleware.push(routerMiddleware(history));

  const store = createStore(
    rootReducer(history),
    initialState,
    composeWithDevTools(applyMiddleware(...middleware))
  );

  return store;
};

export default configureStore;
