import React from 'react';
import { Route, IndexRoute } from 'react-router';
import App from './components/App';
import Entries from './containers/Entries';
import LayoutContainer from './containers/LayoutContainer';


export default (
	<Route path="/" component={LayoutContainer}>
        <Route component={App}>
            <IndexRoute component={Entries} />
            <Route path="/r/:subreddit(/:sort)" component={Entries} />
        </Route>
	</Route>
);
