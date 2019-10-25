import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import Navigation from './Navigation';
import Header from './Header';
import Listings from '../listings/Listings';
import Help from './Help';
import NotFound404 from '../../NotFound404';
import { redditGetBearer, redditFetchMe } from '../../redux/actions/reddit';
import { siteSettings } from '../../redux/actions/misc';
import '../../styles/layout.scss';
import { hotkeyStatus } from '../../common';

class App extends React.PureComponent {
  tokenQuery = null;

  constructor(props) {
    // Required step: always call the parent class' constructor
    super(props);

    // Set the state directly. Use props if necessary.
    this.state = {
      error: false,
      loading: true,
      message: null,
    };
  }

  async componentDidMount() {
    const { getBearer, getMe } = this.props;
    document.addEventListener('keydown', this.handleNGlobalHotkey.bind(this));

    // Make sure the token is set before loading the app.
    const token = await getBearer();

    if (token !== null) {
      // check for a new token every 10s.
      this.tokenQuery = setInterval(getBearer, 10000);
      await getMe();
      this.setState({ loading: false });
    } else {
      this.setState({
        error: true,
        message:
          'Fatal error getting Reddit token. This is bad. Please try again in a few.',
      });
    }
  }

  componentWillUnmount() {
    clearInterval(this.tokenQuery);
    document.removeEventListener(
      'keydown',
      this.handleNGlobalHotkey.bind(this)
    );
  }

  handleNGlobalHotkey(event) {
    const { setSiteSetting, settings } = this.props;
    const pressedKey = event.key;

    if (hotkeyStatus()) {
      switch (pressedKey) {
        case 'Î': // opt-shift-d
          setSiteSetting({ debug: !settings.debug });
          break;
        case '?':
          jQuery('#hotkeys').modal();
          break;
        default:
          break;
      }
    }
  }

  render() {
    const { error, message, loading } = this.state;
    const { redditBearer, subredditsFilter, redditMe } = this.props;

    if (redditMe.status === 'error') {
      return (
        <div className="alert alert-danger m-2" role="alert">
          {"Can't connect to the reddit API. This is possibly related to your browser blocking connections to " +
            'oauth.reddit.com. Please check your browser content blocking settings and try again.'}{' '}
          {redditMe.error}
        </div>
      );
    }

    if (error) {
      return (
        <div className="alert alert-danger m-2" role="alert">
          {message}
        </div>
      );
    }

    // This is to handle am issue where the account or bearer isn't fetched correctly.
    if (loading) {
      return <></>;
    }

    if (redditBearer.status === 'unloaded') {
      return <></>;
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

    const duplicatesPaths = [`/:listType(duplicates)/:target`];

    const combinedPaths = [
      ...redditPaths,
      ...searchPaths,
      ...multiPaths,
      ...userPaths,
      ...duplicatesPaths,
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

    return (
      <>
        <React.StrictMode>
          <header className="navbar navbar-dark fixed-top bg-dark flex-nowrap p-0 shadow">
            <Header />
          </header>
          <aside className="sidebar bg-light pt-2" id="navigation">
            <div id="aside-content" className="h-100 d-flex px-3">
              <Navigation
                redditBearer={redditBearer}
                subredditsFilter={subredditsFilter}
              />
            </div>
          </aside>

          <main id="main">
            <Switch>{routes}</Switch>
          </main>

          <Help />
          <ReactTooltip effect="solid" html place="right" />
          <div id="menu-overlay" />
        </React.StrictMode>
      </>
    );
  }
}

App.propTypes = {
  getBearer: PropTypes.func.isRequired,
  getMe: PropTypes.func.isRequired,
  setSiteSetting: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired,
  redditBearer: PropTypes.object.isRequired,
  subredditsFilter: PropTypes.object.isRequired,
  redditMe: PropTypes.object.isRequired,
};

App.defaultProps = {};

const mapStateToProps = state => ({
  redditBearer: state.redditBearer,
  settings: state.siteSettings,
  subredditsFilter: state.subredditsFilter,
  redditMe: state.redditMe,
});

export default withRouter(
  connect(
    mapStateToProps,
    {
      getBearer: redditGetBearer,
      getMe: redditFetchMe,
      setSiteSetting: siteSettings,
    }
  )(App)
);
