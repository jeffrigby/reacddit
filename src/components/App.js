import React from 'react';
import { Route, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Navigation from './Navigation';
import Header from '../containers/Header';
import Entries from '../containers/Entries';
import * as reddit from '../redux/actions/reddit';
import RedditAPI from '../reddit/redditAPI';


class App extends React.Component {
  async componentDidMount() {
    // Make sure the token is set before loading the app.
    const token = await RedditAPI.getToken();
    if (token !== null) {
      this.props.getMe();
    }
  }

  render() {
    // const { authInfo } = this.props;
    // if (authInfo.status !== 'loaded') {
    //   return (<div />);
    // }

    return (
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
                <Route path="/:listType(user)/:target/:multi(m)/:userType/:sort(hot|new|top|controversial|rising)?" component={Entries} />
                <Route path="/:listType(user)/:target/:userType(upvoted|downvoted|submitted|saved)/:sort(hot|new|top|controversial|rising)?" component={Entries} />
                <Route path="/:sort(hot|new|top|controversial|rising)" component={Entries} />
              </div>
            </div>
          </div>
        </div>
        <div id="push" />
      </div>);
  }
}

App.propTypes = {
  // getAuthInfo: PropTypes.func.isRequired,
  getMe: PropTypes.func.isRequired,
  // authInfo: PropTypes.object,
};

App.defaultProps = {
  // authInfo: {},
};

const mapStateToProps = state => ({
  authInfo: state.redditAuthInfo,
});

const mapDispatchToProps = dispatch => ({
  // getAuthInfo: () => dispatch(reddit.redditAuthInfoFetch()),
  getMe: () => dispatch(reddit.redditFetchMe()),
});

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps,
)(App));
