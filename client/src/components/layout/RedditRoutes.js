import { Route, Routes } from 'react-router-dom';
import NotFound404 from '../../NotFound404';
import ListingsRoute from '../listings/ListingsRoute';

const redditSorts = ['hot', 'new', 'top', 'controversial', 'rising', 'best'];
const userSorts = ['hot', 'new', 'top', 'controversial'];
const userTargets = [
  'upvoted',
  'downvoted',
  'posts',
  'comments',
  'overview',
  'submitted',
  'saved',
  'hidden',
  'gilded',
];

const routes = [
  // Reddit Paths
  {
    paths: ['/', '/:sort', '/r/:target', '/r/:target/:sort'],
    overrides: {
      listType: 'r',
    },
    validations: {
      sort: redditSorts,
    },
  },
  // Search Paths
  {
    paths: ['/search', '/r/:target/search'],
    overrides: {
      listType: 'search',
    },
    validations: {},
  },
  {
    paths: ['/user/:target/m/:userType/search', '/:user/m/:target/search'],
    overrides: {
      multi: true,
      listType: 'r',
    },
    validations: {
      user: 'me',
    },
  },
  // Multis
  {
    paths: [`/user/:user/m/:target`, `/user/:user/m/:target/:sort`],
    overrides: {
      listType: 'm',
    },
    validations: {
      sort: redditSorts,
    },
  },
  {
    paths: [`/me/m/:target`, `/me/m/:target/:sort`],
    overrides: {
      listType: 'm',
      user: 'me',
    },
    validations: {
      sort: redditSorts,
    },
  },
  {
    paths: [`/user/:user/:target`, `/user/:user/:target/:sort`],
    overrides: {
      listType: 'user',
    },
    validations: {
      sort: userSorts,
      target: userTargets,
    },
  },
  // Duplicates
  {
    paths: [`/duplicates/:target`],
    overrides: {
      listType: 'duplicates',
    },
    validations: {},
  },
  // Comments
  {
    paths: [
      `/r/:target/comments/:postName/:postTitle`,
      `/r/:target/comments/:postName/:postTitle/:comment`,
    ],
    overrides: {
      listType: 'comments',
    },
    validations: {},
  },
];

const extractArgs = (path) =>
  [...path.matchAll(/\/:(\w+)/g)].map((match) => match[1]);

const filterValidations = (args, validations) =>
  Object.keys(validations)
    .filter((key) => args.includes(key))
    .reduce(
      (obj, key) => ({
        ...obj,
        [key]: validations[key],
      }),
      {}
    );

function RedditRoutes() {
  const generatedRoutes = [];
  routes.forEach((route) => {
    const { paths, overrides, validations } = route;
    paths.forEach((path, index) => {
      const filteredValidations = filterValidations(
        extractArgs(path),
        validations
      );
      generatedRoutes.push(
        <Route
          exact
          path={path}
          key={path}
          element={
            <ListingsRoute
              validations={filteredValidations}
              overrides={overrides}
            />
          }
        />
      );
    });
  });

  return (
    <Routes>
      {generatedRoutes}
      <Route path="*" key="NotFound404" element={<NotFound404 />} />
    </Routes>
  );
}

export default RedditRoutes;
