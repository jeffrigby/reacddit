import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Navigation from './Navigation';
import Header from './Header';
import Entries from './Entries';
import * as reddit from '../redux/actions/reddit';
import '../styles/layout.scss';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.tokenQuery = null;
    this.state = {
      error: false,
      message: null,
    };
  }

  async componentDidMount() {
    const { getBearer, getMe } = this.props;
    // Make sure the token is set before loading the app.
    const token = await getBearer();
    if (token !== null) {
      this.tokenQuery = setInterval(getBearer, 10000);
      getMe();
    } else {
      this.setState({
        error: true,
        message: 'Fatal error getting Reddit token. This is bad. Please try again in a few.',
      });
    }
  }

  componentWillUnmount() {
    clearInterval(this.tokenQuery);
  }

  render() {
    const { error, message } = this.state;
    if (error) {
      return (
        <div className="alert alert-danger m-2" role="alert">
          {message}
        </div>
      );
    }

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

    const combinedPaths = [
      ...redditPaths,
      ...searchPaths,
      ...multiPaths,
      ...userPaths,
    ];

    const routes = [];
    combinedPaths.forEach((value, i) => {
      const key = `route${i}}`;
      routes.push(<Route exact path={value} component={Entries} key={key} />);
    });

    return (
      <>
        <header className="navbar navbar-dark fixed-top bg-dark flex-nowrap p-0 shadow">
          <Header />
        </header>
        <aside className="sidebar bg-light" id="navigation">
          <div id="aside-content" className="h-100 d-flex px-3">
            <Navigation />
          </div>
        </aside>

        <main id="main">
          <div className="list-group" id="entries">
            <Switch>{routes}</Switch>
          </div>
        </main>

        <div id="push" />
      </>
    );
  }
}

App.propTypes = {
  getMe: PropTypes.func.isRequired,
  getBearer: PropTypes.func.isRequired,
};

App.defaultProps = {
  // authInfo: {},
};

const mapStateToProps = state => ({
  // authInfo: state.redditAuthInfo,
  // bearer: state.redditBearer,
});

const mapDispatchToProps = dispatch => ({
  getBearer: () => dispatch(reddit.redditGetBearer()),
  getMe: () => dispatch(reddit.redditFetchMe()),
});

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(App)
);
