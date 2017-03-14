import React from 'react';
import { Route, IndexRoute } from 'react-router';
import App from './components/App';
import Entries from './containers/Entries';
import LayoutContainer from './containers/LayoutContainer';

const Routes = (
    <Route path="/" component={LayoutContainer}>
        <Route component={App}>
            <IndexRoute component={Entries} />
            <Route path="/r/:target(/:sort)" component={Entries} />
            <Route path="/user/:target/:userType(/:sort)" component={Entries} />
            <Route path="/hot" component={Entries} />
            <Route path="/new" component={Entries} />
            <Route path="/top" component={Entries} />
            <Route path="/controversial" component={Entries} />
            <Route path="/rising" component={Entries} />
        </Route>
    </Route>
);

export default Routes;
