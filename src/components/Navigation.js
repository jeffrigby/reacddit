import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import Cookies from 'universal-cookie';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { isEmpty } from 'lodash';
import { subredditsFetchData, subredditsFetchDefaultData } from '../redux/actions/subreddits';
import { debugMode, disableHotKeys } from '../redux/actions/auth';
import NavigationItem from './NavigationItem';

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
    this.randomSub = this.randomSub.bind(this);
    this.filterData = this.filterData.bind(this);
    this.handleNavHotkey = this.handleNavHotkey.bind(this);
    this.handleNavHotkeyKeyDown = this.handleNavHotkeyKeyDown.bind(this);
    this.reloadSubredditsClick = this.reloadSubredditsClick.bind(this);
    this.clearSearch = this.clearSearch.bind(this);
    this.enableHotkeys = this.enableHotkeys.bind(this);
    this.disableHotkeys = this.disableHotkeys.bind(this);
    this.accessToken = cookies.get('accessToken');
    this.redditUser = cookies.get('redditUser');
    this.lastKeyPressed = null;
    this.filterActive = false;
    this.subredditTarget = null;
    this.state = {
      subredditsFilter: '',
      subredditTargetIdx: 0,
    };
  }

  componentDidMount() {
    jQuery(document).keypress(this.handleNavHotkey);
    jQuery(document).keydown(this.handleNavHotkeyKeyDown);
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

  filterData(item) {
    const queryText = item.target.value;
    if (!queryText) {
      return this.setState({ subredditsFilter: '' });
    }
    return this.setState({ subredditsFilter: queryText });
  }

  handleNavHotkeyKeyDown(event) {
    if (this.filterActive) {
      // up down arrows move the navigation
      const filter = jQuery('#subreddit-filter');
      switch (event.key) {
        case 'ArrowUp': {
          const nextIdx = this.state.subredditTargetIdx - 1;
          if (nextIdx >= 0) {
            this.setState({
              subredditTargetIdx: nextIdx,
            });
          }
          event.preventDefault();
          break;
        }
        case 'ArrowDown': {
          const nextIdx = this.state.subredditTargetIdx + 1;
          this.setState({
            subredditTargetIdx: nextIdx,
          });
          event.preventDefault();
          break;
        }
        case 'Enter':
        case 'ArrowRight': {
          this.props.push(this.subredditTarget);
          filter.blur();
          event.preventDefault();
          break;
        }
        case 'Escape':
          if (!filter.val()) {
            filter.blur();
          }
          break;
        default:
          break;
      }
    }
  }

  handleNavHotkey(event) {
    const pressedKey = event.key;

    // Clear filter IDX
    if (this.filterActive) {
      this.setState({
        subredditTargetIdx: 0,
      });
    }

    if (!this.props.disableHotkeys) {
      const sort = (this.props.sort ? this.props.sort : 'hot');

      // Navigation key commands
      if (this.lastKeyPressed === 'g') {
        // Logged in only
        if (this.redditUser) {
          switch (pressedKey) {
            case 'f':
              this.props.push('/r/friends');
              break;
            case 'u':
              this.props.push(`/user/${this.redditUser}/upvoted/${sort}`);
              break;
            case 'd':
              this.props.push(`/user/${this.redditUser}/downvoted/${sort}`);
              break;
            case 'b':
              this.props.push(`/user/${this.redditUser}/submitted/${sort}`);
              break;
            case 's':
              this.props.push(`/user/${this.redditUser}/saved`);
              break;
            default:
              break;
          }
        }

        switch (pressedKey) {
          case 'h':
            this.props.push('/');
            break;
          case 'p':
            this.props.push(`/r/popular/${sort}`);
            break;
          case 'r':
            this.randomSubPush();
            break;
          default:
            break;
        }
      }

      switch (pressedKey) {
        case 'Î': // opt-shift-d
          this.props.setDebug(!this.props.debug);
          break;
        case '?':
          jQuery('#hotkeys').modal();
          break;
        case 'R': // shift-R
          this.reloadSubreddits();
          break;
        case 'F':
          jQuery('#subreddit-filter').focus();
          this.setState({ subredditsFilter: '' });
          event.preventDefault();
          break;
        default:
          break;
      }

      // Not logged in globals
      if (!this.redditUser) {
        switch (pressedKey) {
          case 'L': // shift-L
            window.location.href = '/api/reddit-login';
            break;
          default:
            break;
        }
      }


      this.lastKeyPressed = pressedKey;
    }
  }

  clearSearch() {
    this.setState({ subredditsFilter: '' });
  }

  disableHotkeys() {
    this.props.setDisableHotkeys(true);
    this.filterActive = true;
    this.subredditTarget = null;
    this.setState({
      subredditTargetIdx: 0,
    });
  }

  enableHotkeys() {
    this.props.setDisableHotkeys(false);
    this.filterActive = false;
    this.subredditTarget = null;
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
    if (isEmpty(subreddits)) {
      return {};
    }

    const filterText = this.state.subredditsFilter.toLowerCase();
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
    const { lastUpdated } = this.props;
    const navigationItems = [];
    Object.keys(subreddits).forEach((key, index) => {
      if (Object.prototype.hasOwnProperty.call(subreddits, key)) {
        const item = subreddits[key];
        const subLastUpdated = lastUpdated[item.name] ? lastUpdated[item.name] : 0;
        const trigger = this.state.subredditTargetIdx === index && (this.filterActive || !isEmpty(this.state.subredditsFilter));
        if (trigger) {
          let sort = this.props.sort ? this.props.sort : '';
          if (sort === 'top') {
            sort = `${sort}?t=${this.props.sortTop}`;
          }
          this.subredditTarget = `${item.url}${sort}`;
        }
        navigationItems.push(<NavigationItem item={item} key={item.name} lastUpdated={subLastUpdated} trigger={trigger} />);
      }
    });

    return navigationItems;
  }

  randomSub(e) {
    e.preventDefault();
    this.randomSubPush();
  }

  randomSubPush() {
    const { subreddits } = this.props.subreddits;
    if (isEmpty(subreddits)) {
      return false;
    }
    const keys = Object.keys(subreddits);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const randomSubreddit = subreddits[randomKey];
    const url = randomSubreddit.url + (this.props.sort ? this.props.sort : 'hot');
    // @todo add the top sorting.
    return this.props.push(url);
  }

  render() {
    const { subreddits } = this.props;

    if (subreddits.status === 'loading' || subreddits.status === 'unloaded') {
      return (
        <div id="subreddits">
          <div className="alert alert-info" id="subreddits-loading" role="alert">
            <span className="glyphicon glyphicon-refresh glyphicon-refresh-animate" /> Getting subreddits.
          </div>
        </div>
      );
    }
    if (subreddits.status === 'error') {
      return (
        <div className="alert alert-danger small" id="subreddits-load-error" role="alert">
          <span className="glyphicon glyphicon glyphicon-alert" /> Error loading subreddits<br />
          <button className="astext" onClick={this.reloadSubredditsClick}>try again.</button>
        </div>
      );
    }

    const filterText = this.state.subredditsFilter;
    const filteredSubreddits = this.filterSubreddits(subreddits.subreddits);
    const navItems = this.generateNavItems(filteredSubreddits);
    const sort = this.props.sort ? this.props.sort : 'hot';
    const noItems = isEmpty(navItems);
    const hideExtras = this.filterActive || (!this.filterActive && !isEmpty(filterText));

    return (
      <div id="subreddits">
        <div id="subreddit-filter-group">
          <div className="form-group-sm">
            <input
              type="search"
              className="form-control"
              onChange={this.filterData}
              onFocus={this.disableHotkeys}
              onBlur={this.enableHotkeys}
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

          {noItems && (
            <div>
              <div className="nav-divider" />
              <div className="alert alert-info" id="subreddits-end" role="alert">
                <span className="glyphicon glyphicon-info-sign" /> No subreddits found
              </div>
            </div>
          )}

          <nav className="navigation subreddits-nav hidden-print" id="side-nav">
            {!hideExtras &&
            (
              <ul className="nav">
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
            {!hideExtras && (<div className="nav-divider" />)}
            <ul className="nav">
              {navItems}
            </ul>

          </nav>
          <div>
            <button className="astext" onClick={this.reloadSubredditsClick}>Reload Subreddits</button>
          </div>
        </div>
      </div>
    );
  }
}

Navigation.propTypes = {
  sort: PropTypes.string.isRequired,
  sortTop: PropTypes.string,
  fetchSubreddits: PropTypes.func.isRequired,
  fetchDefaultSubreddits: PropTypes.func.isRequired,
  push: PropTypes.func.isRequired,
  subreddits: PropTypes.object.isRequired,
  lastUpdated: PropTypes.object.isRequired,
  debug: PropTypes.bool.isRequired,
  disableHotkeys: PropTypes.bool.isRequired,
  setDebug: PropTypes.func.isRequired,
  setDisableHotkeys: PropTypes.func.isRequired,
};

Navigation.defaultProps = {
  sortTop: '',
};

const mapStateToProps = state => ({
  sort: state.listingsFilter.sort,
  sortTop: state.listingsFilter.sortTop,
  subreddits: state.subreddits,
  lastUpdated: state.lastUpdated,
  debug: state.debugMode,
  disableHotkeys: state.disableHotKeys,
});

const mapDispatchToProps = dispatch => ({
  fetchSubreddits: (auth, reload) => dispatch(subredditsFetchData(auth, reload)),
  fetchDefaultSubreddits: () => dispatch(subredditsFetchDefaultData()),
  setDebug: debug => dispatch(debugMode(debug)),
  setDisableHotkeys: disable => dispatch(disableHotKeys(disable)),
  push: url => dispatch(push(url)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Navigation);
