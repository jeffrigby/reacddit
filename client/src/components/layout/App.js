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

class App extends React.PureComponent {
  tokenQuery = null;

  state = {
    error: false,
    loading: true,
    message: null,
  };

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
    const { disableHotkeys, setSiteSetting, settings } = this.props;
    const pressedKey = event.key;

    if (!disableHotkeys) {
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
    const { redditBearer, subredditsFilter } = this.props;

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
    combinedPaths.forEach((value, i) => {
      const key = `route${i}}`;
      routes.push(<Route exact path={value} component={Listings} key={key} />);
    });
    routes.push(<Route component={NotFound404} key="NotFound404" />);

    return (
      <>
        <React.StrictMode>
          <header className="navbar navbar-dark fixed-top bg-dark flex-nowrap p-0 shadow">
            <Header />
          </header>
          <aside className="sidebar bg-light" id="navigation">
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
        </React.StrictMode>
        <ReactTooltip effect="solid" html place="right" />
        <div id="menu-overlay" />
      </>
    );
  }
}

App.propTypes = {
  disableHotkeys: PropTypes.bool.isRequired,
  getBearer: PropTypes.func.isRequired,
  getMe: PropTypes.func.isRequired,
  setSiteSetting: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired,
  redditBearer: PropTypes.object.isRequired,
  subredditsFilter: PropTypes.object.isRequired,
};

App.defaultProps = {};

const mapStateToProps = state => ({
  redditBearer: state.redditBearer,
  disableHotkeys: state.disableHotKeys,
  settings: state.siteSettings,
  subredditsFilter: state.subredditsFilter,
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
