import { createStore, applyMiddleware, compose } from 'redux';
import { routerMiddleware } from 'react-router-redux';
// import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';
import rootReducer from './reducers';
import DevTools from '../containers/DevTools';

// const logger = createLogger({
//   // ...options
// });

const configureStore = (initialState, history) => {
  // Build the middleware for intercepting and dispatching navigation actions
  const middleware = routerMiddleware(history);

  const store = createStore(
    rootReducer,
    initialState,
    compose(
      applyMiddleware(thunk, middleware),
      DevTools.instrument(),
    ),
  );

  return store;
};

export default configureStore;
