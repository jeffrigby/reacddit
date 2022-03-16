import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from '@redux-devtools/extension';
import rootReducer from './reducers';

const configureStore = (initialState) => {
  // Build the middleware for intercepting and dispatching navigation actions
  // Apply Middlewares
  const middleware = [];
  middleware.push(require('redux-immutable-state-invariant').default(), thunk);
  middleware.push(thunk);

  const store = createStore(
    rootReducer(),
    initialState,
    composeWithDevTools(applyMiddleware(...middleware))
  );

  return store;
};

export default configureStore;
