import { lazy } from 'react';

// Only the debug panels render this, and debug is off by default — loading the
// library and its stylesheets dynamically keeps them out of the main bundle.
const LazyJsonView = lazy(async () => {
  const [jsonView] = await Promise.all([
    import('react18-json-view'),
    import('react18-json-view/src/style.css'),
    import('react18-json-view/src/dark.css'),
  ]);
  return jsonView;
});

export default LazyJsonView;
