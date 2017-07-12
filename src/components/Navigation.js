import React, { PropTypes } from 'react';
import { NavLink } from 'react-router-dom';
import Cookies from 'universal-cookie';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { subredditsFetchData, subredditsFetchDefaultData, subredditsFilter } from '../redux/actions/subreddits';
import { debugMode } from '../redux/actions/auth';
import NavigationItem from './NavigationItem';
import Common from '../common';

// require('es6-promise').polyfill();
// require('isomorphic-fetch');

class Navigation extends React.Component {
  static resizeNavigation() {
    let vph;
    vph = jQuery(window).height();
    vph -= 150;
    jQuery('#subreddits nav').css('max-height', `${vph}px`);
  }

  constructor(props) {
    super(props);
    const cookies = new Cookies();
    this.lastKeyPressed = null;
    this.randomSub = this.randomSub.bind(this);
    this.filterData = this.filterData.bind(this);
    this.handleNavHotkey = this.handleNavHotkey.bind(this);
    this.reloadSubredditsClick = this.reloadSubredditsClick.bind(this);
    this.clearSearch = this.clearSearch.bind(this);
    this.accessToken = cookies.get('accessToken');
    this.redditUser = cookies.get('redditUser');
    // const authInfo = this.props.fetchAuthInfo();
  }

  componentWillMount() {
    this.intervals = [];
  }

  componentDidMount() {
    jQuery(document).keypress(this.handleNavHotkey);
    jQuery(window).on('load resize', Navigation.resizeNavigation);
    if (this.accessToken) {
      this.props.fetchSubreddits(true, false);
    } else {
      this.props.fetchDefaultSubreddits();
    }
  }

  componentDidUpdate() {
    Navigation.resizeNavigation();
  }

  componentWillUnmount() {
    this.intervals.map(clearInterval);
  }

  setInterval(...args) {
    this.intervals.push(setInterval(...args));
  }

  filterData(item) {
    const queryText = item.target.value;
    if (!queryText) {
      return this.props.setFilter('');
    }
    return this.props.setFilter(queryText);
  }

  handleNavHotkey(event) {
    const sort = (this.props.sort ? this.props.sort : 'hot');
    console.log(event.charCode);

    // {!filterText &&
    // (<ul className="nav">
    //   {!this.accessToken && (<li><div id="login"><a href="/api/reddit-login">Login</a> to view your subreddits.</div></li>)}
    //   <li><div><NavLink to={`/r/mine/${sort}`} title="Show all subreddits" activeClassName="activeSubreddit">Front</NavLink></div></li>
    //   <li><div><NavLink to={`/r/popular/${sort}`} title="Show popular posts">Popular</NavLink></div></li>
    //   <li><div><a href="/r/myrandom" onClick={this.randomSub}>Random</a></div></li>
    //   {this.accessToken && (<li><div><NavLink to={`/r/friends/${sort}`} title="Show Friends Posts" activeClassName="activeSubreddit">Friends</NavLink></div></li>)}
    //   {this.redditUser && (<li><div><NavLink to={`/user/${this.redditUser}/submitted/${sort}`} title="Submitted" activeClassName="activeSubreddit">Submitted</NavLink></div></li>)}
    //   {this.redditUser && (<li><div><NavLink to={`/user/${this.redditUser}/upvoted/${sort}`} title="Upvoted" activeClassName="activeSubreddit">Upvoted</NavLink></div></li>)}
    //   {this.redditUser && (<li><div><NavLink to={`/user/${this.redditUser}/downvoted/${sort}`} title="Downvoted" activeClassName="activeSubreddit">Downvoted</NavLink></div></li>)}
    //   {this.redditUser && (<li><div><NavLink to={`/user/${this.redditUser}/saved`} title="Saved" activeClassName="activeSubreddit">Saved</NavLink></div></li>)}
    //
    // </ul>)


      // Navigation key commands
    if (this.lastKeyPressed === 103) {
      // Logged in only
      if (this.redditUser) {
        switch (event.charCode) {
          case 102: // gf
            this.props.push(`/r/friends/${sort}`);
            break;
          default:
            break;
        }
      }

      switch (event.charCode) {
        case 104: // gh
          this.props.push('/');
          break;
        case 112: // gp
          this.props.push(`/r/popular/${sort}`);
          break;
        case 114: // gr
          this.randomSubPush();
          break;
        default:
          break;
      }
    }

    switch (event.charCode) {
      case 206: // opt-shift-d
        this.props.setDebug(!this.props.debug);
        break;
      case 76: // shift-l
        this.reloadSubreddits();
        break;
      default:
        break;
    }
    this.lastKeyPressed = event.charCode;
  }

  clearSearch() {
    this.props.setFilter('');
  }

  reloadSubreddits() {
    if (this.accessToken) {
      this.props.fetchSubreddits(true);
    } else {
      this.props.fetchDefaultSubreddits();
    }
  }

  reloadSubredditsClick(e) {
    e.preventDefault();
    this.reloadSubreddits();
  }

  filterSubreddits(subreddits) {
    if (Common.isEmpty(subreddits)) {
      return {};
    }

    const filterText = this.props.filter.toLowerCase();
    // No filter defined
    if (!filterText) {
      return subreddits;
    }

    const filteredSubreddits = {};

    Object.keys(subreddits).forEach((key, index) => {
      if (Object.prototype.hasOwnProperty.call(subreddits, key)) {
        if (subreddits[key].display_name.toLowerCase().indexOf(filterText) !== -1) {
          filteredSubreddits[key] = subreddits[key];
        }
      }
    });

    return filteredSubreddits;
  }

  generateNavItems(subreddits) {
    const lastUpdated = this.props.lastUpdated;
    const navigationItems = [];
    Object.keys(subreddits).forEach((key, index) => {
      if (Object.prototype.hasOwnProperty.call(subreddits, key)) {
        const item = subreddits[key];
        const subLastUpdated = lastUpdated[item.name] ? lastUpdated[item.name] : 0;
        navigationItems.push(<NavigationItem item={item} key={item.name} lastUpdated={subLastUpdated} />);
      }
    });
    return navigationItems;
  }

  randomSub(e) {
    e.preventDefault();
    this.randomSubPush();
  }

  randomSubPush() {
    const subreddits = this.props.subreddits;
    const keys = Object.keys(subreddits);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const randomSubreddit = subreddits[randomKey];
    const url = randomSubreddit.url + (this.props.sort ? this.props.sort : 'hot');
    // @todo add the top sorting.
    this.props.push(url);
  }

  render() {
    const subreddits = this.props.subreddits;

    if (this.props.isLoading || Common.isEmpty(subreddits)) {
      return (
        <div id="subreddits">
          <div className="alert alert-info" id="subreddits-loading" role="alert">
            <span className="glyphicon glyphicon-refresh glyphicon-refresh-animate" /> Getting subreddits.
          </div>
        </div>
      );
    }

    if (this.props.hasErrored) {
      return (
        <div className="alert alert-danger" id="subreddits-load-error" role="alert" style={{ display: 'none' }}>
          <span className="glyphicon glyphicon glyphicon-alert" /> Error loading subreddits.
          <a href="" onClick={this.reloadSubredditsClick}>Click here to try again.</a>
        </div>
      );
    }

    const filterText = this.props.filter;
    const filteredSubreddits = this.filterSubreddits(subreddits);
    const sort = this.props.sort ? this.props.sort : 'hot';

    let navItems;
    let subredditsActive = 0;

    if (!Common.isEmpty(filteredSubreddits)) {
      navItems = this.generateNavItems(filteredSubreddits);
      subredditsActive = 1;
    }

    const notFound = Common.isEmpty(navItems) ? 1 : 0;

    return (
      <div id="subreddits">
        <div id="subreddit-filter-group">
          <div className="form-group-sm">
            <input
              type="search"
              className="form-control"
              onChange={this.filterData}
              placeholder="Filter Subreddits"
              id="subreddit-filter"
              value={filterText}
            />
            {filterText && (
            <button id="searchclear" onClick={this.clearSearch} >
              <span className="glyphicon glyphicon-remove-circle" />
            </button>
            )}
          </div>
          <div className="subreddit-options">
            <div className="checkbox">
              <input type="checkbox" id="subreddit-filter-only-new" />
              <label htmlFor="subreddit-filter-only-new">Show only new</label>
            </div>
          </div>

          <nav className="navigation subreddits-nav hidden-print" id="side-nav">
            <div className="alert alert-info" id="subreddits-end" role="alert" style={notFound !== 1 ? { display: 'none' } : null}>
              <span className="glyphicon glyphicon-info-sign" /> No subreddits found
            </div>

            {!filterText &&
            (<ul className="nav">
              {!this.accessToken && (<li><div id="login"><a href="/api/reddit-login">Login</a> to view your subreddits.</div></li>)}
              <li><div><NavLink to={`/r/mine/${sort}`} title="Show all subreddits" activeClassName="activeSubreddit">Front</NavLink></div></li>
              <li><div><NavLink to={`/r/popular/${sort}`} title="Show popular posts">Popular</NavLink></div></li>
              <li><div><a href="/r/myrandom" onClick={this.randomSub}>Random</a></div></li>
              {this.accessToken && (<li><div><NavLink to={`/r/friends/${sort}`} title="Show Friends Posts" activeClassName="activeSubreddit">Friends</NavLink></div></li>)}
              {this.redditUser && (<li><div><NavLink to={`/user/${this.redditUser}/submitted/${sort}`} title="Submitted" activeClassName="activeSubreddit">Submitted</NavLink></div></li>)}
              {this.redditUser && (<li><div><NavLink to={`/user/${this.redditUser}/upvoted/${sort}`} title="Upvoted" activeClassName="activeSubreddit">Upvoted</NavLink></div></li>)}
              {this.redditUser && (<li><div><NavLink to={`/user/${this.redditUser}/downvoted/${sort}`} title="Downvoted" activeClassName="activeSubreddit">Downvoted</NavLink></div></li>)}
              {this.redditUser && (<li><div><NavLink to={`/user/${this.redditUser}/saved`} title="Saved" activeClassName="activeSubreddit">Saved</NavLink></div></li>)}

            </ul>)
            }
            <div className="nav-divider" />

            <ul className="nav">
              {navItems}
            </ul>

          </nav>
          <div>
            <a href="" style={subredditsActive === 0 ? { display: 'none' } : null} onClick={this.reloadSubredditsClick}>Reload Subreddits</a>
          </div>
        </div>
      </div>
    );
  }
}

Navigation.propTypes = {
  sort: PropTypes.string.isRequired,
  fetchSubreddits: PropTypes.func.isRequired,
  fetchDefaultSubreddits: PropTypes.func.isRequired,
  // fetchLastUpdated: PropTypes.func.isRequired,
  setFilter: PropTypes.func.isRequired,
  push: PropTypes.func.isRequired,
  subreddits: PropTypes.object.isRequired,
  lastUpdated: PropTypes.object.isRequired,
  hasErrored: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
  filter: PropTypes.string.isRequired,
  // authInfo: PropTypes.object,
  debug: PropTypes.bool.isRequired,
  setDebug: PropTypes.func.isRequired,
  // fetchAuthInfo: PropTypes.func.isRequired,
};

Navigation.defaultProps = {
  // authInfo: {},
};

const mapStateToProps = state => ({
  sort: state.listingsFilter.sort,
  subreddits: state.subreddits,
  lastUpdated: state.lastUpdated,
  hasErrored: state.subredditsHasErrored,
  isLoading: state.subredditsIsLoading,
  filter: state.subredditsFilter,
  // authInfo: state.authInfo,
  debug: state.debugMode,
});

const mapDispatchToProps = dispatch => ({
  fetchSubreddits: (auth, reload) => dispatch(subredditsFetchData(auth, reload)),
  fetchDefaultSubreddits: () => dispatch(subredditsFetchDefaultData()),
  // fetchAuthInfo: () => dispatch(authInfoFetch()),
  setFilter: filterText => dispatch(subredditsFilter(filterText)),
  setDebug: debug => dispatch(debugMode(debug)),
  // fetchLastUpdated: (subreddits, lastUpdated) => dispatch(subredditsFetchLastUpdated(subreddits, lastUpdated)),
  push: url => dispatch(push(url)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Navigation);
