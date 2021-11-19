import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './reducers';

const configureStore = (initialState) => {
  // Build the middleware for intercepting and dispatching navigation actions
  // Apply Middlewares
  const middleware = [];
  middleware.push(thunk);

  const store = createStore(
    rootReducer(),
    initialState,
    compose(applyMiddleware(...middleware))
  );

  return store;
};

export default configureStore;
