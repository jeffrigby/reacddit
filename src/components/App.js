// import React, { PropTypes } from 'react';
import { Route } from 'react-router-dom';
import React from 'react';
import Navigation from './Navigation';
import Header from '../containers/Header';
// import cookie from 'react-cookie';
// import { BrowserRouter, Match } from 'react-router';

import Entries from '../containers/Entries';
// import RouteTest from '../components/RouteTest';


const App = () => (
  <div>
    <Header />
    <div className="row-offcanvas row-offcanvas-left">
      <div id="sidebar" className="sidebar-offcanvas">
        <div className="col-md-12">
          <div id="subreddits-nav">
            <Navigation />
          </div>
        </div>
      </div>
      <div id="main">
        <div className="col-md-12">
          <div className="list-group" id="entries">
            <Route exact path="/" component={Entries} />
            <Route path="/:listType(r)/:target/:sort(hot|new|top|controversial|rising)?" component={Entries} />
            <Route path="/:listType(user)/:target/:userType/:sort?" component={Entries} />
            <Route path="/:sort(hot|new|top|controversial|rising)" component={Entries} />
          </div>
        </div>
      </div>
    </div>
    <div id="push" />
  </div>
);

export default App;

// <Header params={this.props.params} query={this.props.location.query}
// accessToken={accessToken} location={this.props.location} />
// <Navigation params={this.props.params} query={this.props.location.query}
// accessToken={accessToken} />
// <Match path="/r/:target(/:sort)" component={Entries} />
// <Match path="/user/:target/:userType(/:sort)" component={Entries} />
// <Match path="/hot" component={Entries} />
// <Match path="/new" component={Entries} />
// <Match path="/top" component={Entries} />
// <Match path="/controversial" component={Entries} />
// <Match path="/rising" component={Entries} />
