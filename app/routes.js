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
            <Route path="/u/:subreddit(/:sort)" component={Entries} />
            <Route path="/hot" component={Entries} />
            <Route path="/new" component={Entries} />
            <Route path="/top" component={Entries} />
            <Route path="/controversial" component={Entries} />
            <Route path="/rising" component={Entries} />
        </Route>
	</Route>
);
