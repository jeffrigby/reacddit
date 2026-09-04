import { lazy } from 'react';

const LazyJsonView = lazy(async () => {
  const [jsonView] = await Promise.all([
    import('react18-json-view'),
    import('react18-json-view/src/style.css'),
    import('react18-json-view/src/dark.css'),
  ]);
  return jsonView;
});

export default LazyJsonView;
