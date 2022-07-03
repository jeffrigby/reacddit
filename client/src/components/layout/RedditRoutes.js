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

  // const redditSorts = 'hot|new|top|controversial|rising|best';
  // const redditPaths = [
  //   '/',
  //   `/:listType(r)/:target/:sort(${redditSorts})?`,
  //   `/:sort(${redditSorts})`,
  // ];
  //
  // const redditSortsNew = [
  //   'hot',
  //   'new',
  //   'top',
  //   'controversial',
  //   'rising',
  //   'best',
  // ];
  //
  // const generateSorts = (listType, path, optional = true) => {
  //   const generatedRoutes = [];
  //
  //   if (optional) {
  //     generatedRoutes.push(
  //       <Route
  //         path={path}
  //         exact
  //         key={`listings${listType}`}
  //         element={<Listings listType={listType} />}
  //       />
  //     );
  //   }
  //
  //   const sortRoutes = redditSortsNew.map((sort, index) => (
  //     <Route
  //       path={`${path}/${sort}`}
  //       exact
  //       key={`listings${listType}${sort}`}
  //       element={<Listings listType={listType} sort={sort} />}
  //     />
  //   ));
  //
  //   return [...generatedRoutes, ...sortRoutes];
  // };
  //
  // const redditPathsNew = (
  //   <>
  //     <Route index element={<Listings />} />
  //     {generateSorts('', '', false)}
  //     {generateSorts('r', 'r/:target')}
  //   </>
  // );
  //
  // const multiPathsNew = (
  //   <>
  //     {generateSorts('m', '/user/:user/m/:target')}
  //     {generateSorts('m', '/:user/m/:target')}
  //   </>
  // );
  //
  // return (
  //   <Routes>
  //     <Route
  //       path="/r/:target/comments/:postName/:postTitle/:comment"
  //       key="comments"
  //       element={<Listings listType="comments" />}
  //     />
  //     <Route
  //       path="/r/:target/comments/:postName/:postTitle"
  //       key="comments"
  //       element={<Listings listType="comments" />}
  //     />
  //     <Route
  //       path="/search"
  //       key="search-main"
  //       element={<Listings listType="search" />}
  //     />
  //     <Route
  //       path="/r/:target/search"
  //       key="search-subreddit"
  //       element={<Listings listType="search" />}
  //     />
  //     {redditPathsNew}
  //     {multiPathsNew}
  //     <Route path="*" key="NotFound404" element={<NotFound404 />} />
  //   </Routes>
  // );
  //
  // // const searchSorts = 'relevance|top|new';
  // const searchPaths = [
  //   '/:listType(search)',
  //   '/r/:target/:listType(search)',
  //   '/user/:target/:multi(m)/:userType/:listType(search)',
  //   '/:user(me)/:multi(m)/:target/:listType(search)',
  // ];
  //
  // const multiPaths = [
  //   `/user/:user/:listType(m)/:target/:sort(${redditSorts})?`,
  //   `/:user(me)/:listType(m)/:target/:sort(${redditSorts})?`,
  // ];
  //
  // const userSorts = 'hot|new|top|controversial';
  // const userPaths = [
  //   `/:listType(user)/:user/:target(upvoted|downvoted|posts|comments|overview|submitted|saved|hidden|gilded)/:sort(${userSorts})?`,
  // ];
  //
  // const duplicatesPaths = [`/:listType(duplicates)/:target`];
  //
  // const commentPaths = [
  //   `/r/:target/:listType(comments)/:postName/:postTitle/:comment?`,
  // ];
  //
  // const combinedPaths = [
  //   ...redditPaths,
  //   ...searchPaths,
  //   ...multiPaths,
  //   ...userPaths,
  //   ...duplicatesPaths,
  //   ...commentPaths,
  // ];
  //
  // const combinedRoutes = combinedPaths.map((path, index) => (
  //   // eslint-disable-next-line react/no-array-index-key
  //   <Route exact path={path} key={`listings-${index}`} element={<Listings />} />
  // ));
  //
  // combinedRoutes.push(
  //   <Route path="*" key="NotFound404" element={<NotFound404 />} />
  // );
  // return <Routes>{combinedRoutes}</Routes>;
}

export default RedditRoutes;
