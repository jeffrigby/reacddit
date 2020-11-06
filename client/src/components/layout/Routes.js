import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { withRouter } from 'react-router';
import Listings from '../listings/Listings';
import NotFound404 from '../../NotFound404';

const Routes = () => {
  const redditSorts = 'hot|new|top|controversial|rising|best';
  const redditPaths = [
    '/',
    `/:listType(r)/:target/:sort(${redditSorts})?`,
    `/:sort(${redditSorts})`,
  ];

  // const searchSorts = 'relevance|top|new';
  const searchPaths = [
    '/:listType(search)',
    '/r/:target/:listType(search)',
    '/user/:target/:multi(m)/:userType/:listType(search)',
    '/:user(me)/:multi(m)/:target/:listType(search)',
  ];

  const multiPaths = [
    `/user/:user/:listType(m)/:target/:sort(${redditSorts})?`,
    `/:user(me)/:listType(m)/:target/:sort(${redditSorts})?`,
  ];

  const userSorts = 'hot|new|top|controversial';
  const userPaths = [
    `/:listType(user)/:user/:target(upvoted|downvoted|submitted|saved|hidden|gilded)/:sort(${userSorts})?`,
  ];

  const duplicatesPaths = [`/:listType(duplicates)/:target`];

  const commentPaths = [
    `/r/:target/:listType(comments)/:postName/:postTitle/:comment?`,
  ];

  const combinedPaths = [
    ...redditPaths,
    ...searchPaths,
    ...multiPaths,
    ...userPaths,
    ...duplicatesPaths,
    ...commentPaths,
  ];

  const routes = [];
  routes.push(
    <Route exact path={combinedPaths} key="Listings">
      <Listings />
    </Route>
  );
  routes.push(
    <Route key="NotFound404">
      <NotFound404 />
    </Route>
  );

  return <Switch>{routes}</Switch>;
};

export default withRouter(Routes);
