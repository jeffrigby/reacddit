import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import isEqual from 'lodash.isequal';
import * as listings from '../redux/actions/listings';
import * as misc from '../redux/actions/misc';
import Entry from '../components/Entry';
import RedditAPI from '../reddit/redditAPI';
import '../styles/entries.scss';

const queryString = require('query-string');

class Entries extends React.Component {
  static nextEntry(focused) {
    const next =
      focused === undefined
        ? document.getElementsByClassName('entry')[0].nextElementSibling
        : document.getElementById(focused).nextElementSibling;

    if (next.classList.contains('entry')) {
      const scrollBy =
        next.getBoundingClientRect().top +
        document.documentElement.scrollTop -
        50 -
        window.scrollY;
      window.scrollBy({ top: scrollBy, left: 0 });
    } else {
      Entries.scrollToBottom();
    }
  }

  static prevEntry(focused) {
    if (focused === undefined) return;

    const prev = document.getElementById(focused).previousElementSibling;
    if (prev === undefined || !prev.classList.contains('entry')) return;

    const scrollBy =
      prev.getBoundingClientRect().top +
      document.documentElement.scrollTop -
      50 -
      window.scrollY;

    window.scrollBy({ top: scrollBy, left: 0 });
  }

  static scrollToBottom() {
    window.scrollTo(0, document.body.scrollHeight);
  }

  constructor(props) {
    super(props);
    this.monitorEntriesInterval = null;
    this.scrollResize = true;
    this.scrollResizeStop = true;
    this.initTriggered = null;
    // this.renderedLinks = [];
    this.monitorEntries = this.monitorEntries.bind(this);
    this.state = {
      focused: null,
      visible: [],
      hasError: false,
    };
    this.handleEntriesHotkey = this.handleEntriesHotkey.bind(this);
    this.setScrollResize = this.setScrollResize.bind(this);
  }

  async componentDidMount() {
    this.accessToken = await RedditAPI.getToken(false);
    this.scrollResizeStop = false;
    const { match, location } = this.props;
    this.setRedux(match, location);

    // Events.
    document.addEventListener('keydown', this.handleEntriesHotkey);
    document.addEventListener('resize', this.setScrollResize, false);
    document.addEventListener('scroll', this.setScrollResize, false);

    this.monitorEntriesInterval = setInterval(this.monitorEntries, 500);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { ...props } = this.props;
    const { focused, visible } = this.state;

    if (!isEqual(nextProps.listingsFilter, props.listingsFilter)) {
      return true;
    }
    if (props.listingsStatus !== nextProps.listingsStatus) {
      return true;
    }

    if (props.entries !== nextProps.entries) {
      return true;
    }

    if (props.siteSettings.debug !== nextProps.siteSettings.debug) {
      return true;
    }

    if (props.siteSettings.view !== nextProps.siteSettings.view) {
      return true;
    }

    if (focused !== nextState.focused) {
      return true;
    }

    if (!isEqual(visible, nextState.visible)) {
      return true;
    }

    const matchCompare = isEqual(nextProps.match, props.match);
    const locationCompare = isEqual(nextProps.location, props.location);
    if (!matchCompare || !locationCompare) {
      return true;
    }
    return false;
  }

  componentDidUpdate(prevProps) {
    const { match, location, listingsFilter, getEntriesReddit } = this.props;
    const matchCompare = isEqual(prevProps.match, match);
    const locationCompare = prevProps.location.search === location.search;
    if (!matchCompare || !locationCompare) {
      this.setRedux(match, location);
    }

    if (
      !isEqual(prevProps.listingsFilter, listingsFilter) ||
      !locationCompare
    ) {
      getEntriesReddit(listingsFilter);
    }
    document.body.classList.add('show-menu');

    this.setInitFocusedAndVisible();
  }

  componentWillUnmount() {
    this.scrollResizeStop = true;
    clearInterval(this.monitorEntriesInterval);
  }

  setInitFocusedAndVisible() {
    const { listingsEntries } = this.props;
    if (
      listingsEntries.type === 'init' &&
      this.initTriggered !== listingsEntries.requestUrl
    ) {
      this.initTriggered = listingsEntries.requestUrl;
      // this.renderedLinks = [];
      const entryKeys = Object.keys(listingsEntries.children);
      const newState = {
        focused: entryKeys[0],
        visible: entryKeys.slice(0, 5),
      };
      this.setState(newState);
    }
  }

  setRedux(match, location) {
    const qs = queryString.parse(location.search);
    const { listingsFilter, setFilter } = this.props;
    const { listType, target, sort, user, userType, multi } = match.params;

    let listingType = match.params.listType || 'r';
    if (listType === 'user') listingType = 'u';
    if (listType === 'multi') listingType = 'm';
    if (listType === 'search') listingType = 's';

    // @todo, just pass all the query strings
    const newListingsFilter = {
      sort: sort || qs.sort || 'hot',
      target: target || 'mine',
      multi: multi === 'm' || false,
      userType: userType || '',
      user: user || '',
      listType: listingType,
    };

    if (!isEqual(listingsFilter, newListingsFilter)) {
      setFilter(newListingsFilter);
    }
  }

  setScrollResize() {
    this.scrollResize = true;
  }

  handleEntriesHotkey(event) {
    const { disableHotkeys, setSiteSetting, siteSettings } = this.props;
    const { focused } = this.state;
    if (!disableHotkeys) {
      const pressedKey = event.key;
      switch (pressedKey) {
        case 'j':
          Entries.nextEntry(focused);
          break;
        case 'k':
          Entries.prevEntry(focused);
          break;
        case '.':
          Entries.scrollToBottom();
          break;
        case 'V':
          setSiteSetting({
            view: siteSettings.view === 'expanded' ? 'condensed' : 'expanded',
          });
          window.scrollTo(0, document.getElementById(focused).offsetTop);
          break;
        default:
          break;
      }
    }
  }

  // componentDidCatch(error, info) {
  //   // You can also log the error to an error reporting service
  //   // eslint-disable-next-line no-console
  //   console.log(error, info);
  // }

  monitorEntries() {
    if (this.scrollResize && !this.scrollResizeStop) {
      this.scrollResize = false;

      const postsCollection = document.getElementsByClassName('entry');
      const posts = Array.from(postsCollection);
      let newFocus = false;
      const newVis = [];

      posts.forEach(post => {
        const { top, bottom } = post.getBoundingClientRect();

        // If it's not visible skip it.
        if (bottom >= -980 && top - window.innerHeight <= 1000) {
          if (!newFocus) {
            const focusTop = bottom - 55;
            if (focusTop > 0) {
              newFocus = post.id;
            }
          }
          newVis.push(post.id);
        }
      });

      this.setState({
        focused: newFocus,
        visible: newVis,
      });

      this.checkLoadMore();
    }

    // Check if iframe is focused. If it is, unfocus it.
    if (document.activeElement.tagName === 'IFRAME') {
      window.focus();
    }
  }

  checkLoadMore() {
    const { listingsStatus, getMoreRedditEntries } = this.props;
    const loadedStatus = listingsStatus;
    if (
      loadedStatus === 'loaded' &&
      window.scrollY + window.innerHeight >
        document.documentElement.scrollHeight - 2500
    ) {
      // getMoreEntries();
      getMoreRedditEntries();
    }
  }

  render() {
    const {
      listingsStatus,
      listingsEntries,
      siteSettings,
      listingsFilter,
    } = this.props;

    const { hasError } = this.state;
    let message = '';

    if (listingsStatus === 'unloaded' || listingsStatus === 'loading') {
      message = (
        <div className="alert alert-info" id="content-loading" role="alert">
          <i className="fas fa-spinner fa-spin" />
          {' Getting entries from Reddit.'}
        </div>
      );
    }

    if (listingsStatus === 'error' || hasError) {
      message = (
        <div
          className="alert alert-danger"
          id="subreddits-load-error"
          role="alert"
        >
          <i className="fas fa-exclamation-triangle" />
          {' Error loading this subreddit.'}
        </div>
      );
    }

    if (listingsStatus === 'loaded' && !listingsEntries.children) {
      message = (
        <div className="alert alert-warning" id="content-empty" role="alert">
          <i className="fas fa-exclamation-triangle" /> Nothing here.
        </div>
      );
    }

    if (message) {
      return <div className="px-4 py-2">{message}</div>;
    }

    let footerStatus = '';
    if (listingsStatus === 'loadingNext') {
      footerStatus = (
        <div
          className="alert alert-info"
          id="content-more-loading"
          role="alert"
        >
          <i className="fas fa-spinner fa-spin" />
          {' Getting more entries.'}
        </div>
      );
    } else if (listingsStatus === 'loadedAll') {
      footerStatus = (
        <div className="alert alert-warning" id="content-end" role="alert">
          <i className="fas fa-exclamation-triangle" />
          {" That's it!"}
        </div>
      );
    }

    let entries = '';
    const entriesObject = listingsEntries.children;
    const { focused, visible } = this.state;
    const entriesKeys = Object.keys(entriesObject);
    if (entriesKeys.length > 0) {
      entries = entriesKeys.map(key => {
        const isFocused = focused === entriesObject[key].data.name;
        const isVisible = visible.includes(entriesObject[key].data.name);
        return (
          <Entry
            entry={entriesObject[key]}
            key={entriesObject[key].data.id}
            loaded={entriesObject[key].data.loaded}
            focused={isFocused}
            visible={isVisible}
          />
        );
      });
    }

    const visibleString = visible.join(' ');

    return (
      <>
        {siteSettings.debug && (
          <div id="debugInfo" className="p-2">
            <div>
              <strong>Target:</strong> {listingsFilter.target}
            </div>
            <div>
              <strong>Sort:</strong> {listingsFilter.sort}
            </div>
            <div>
              <strong>t:</strong> {listingsFilter.t}
            </div>
            <div>
              {' '}
              <strong>Type:</strong> {listingsFilter.listType}
            </div>
            <div>
              {' '}
              <strong>URL:</strong> {listingsEntries.requestUrl}
            </div>
            <div>
              {' '}
              <strong>Focus:</strong> {focused}
            </div>
            <div>
              {' '}
              <strong>Visible:</strong> {visibleString}
            </div>
          </div>
        )}
        {entries}
        <div className="footer-status">{footerStatus}</div>
      </>
    );
  }
}

Entries.propTypes = {
  match: PropTypes.object.isRequired, // eslint-disable-line react/no-unused-prop-types
  location: PropTypes.object.isRequired, // eslint-disable-line react/no-unused-prop-types
  setFilter: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
  getEntriesReddit: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
  getMoreRedditEntries: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
  setSiteSetting: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
  listingsEntries: PropTypes.object.isRequired, // eslint-disable-line react/no-unused-prop-types
  listingsFilter: PropTypes.object.isRequired, // eslint-disable-line react/no-unused-prop-types
  listingsStatus: PropTypes.string.isRequired, // eslint-disable-line react/no-unused-prop-types
  entries: PropTypes.object,
  disableHotkeys: PropTypes.bool.isRequired,
  siteSettings: PropTypes.object,
};

Entries.defaultProps = {
  entries: {},
  siteSettings: { debug: false, view: 'expanded' },
};

const mapStateToProps = (state, ownProps) => ({
  listingsFilter: state.listingsFilter,
  listingsEntries: state.listingsRedditEntries,
  listingsStatus: state.listingsRedditStatus,
  entries: state.listingsRedditEntries.children,
  disableHotkeys: state.disableHotKeys,
  siteSettings: state.siteSettings,
});

const mapDispatchToProps = dispatch => ({
  setFilter: filter => dispatch(listings.listingsFilter(filter)),
  getEntriesReddit: (subreddit, sort, options) =>
    dispatch(listings.listingsFetchEntriesReddit(subreddit, sort, options)),
  getMoreRedditEntries: () => dispatch(listings.listingsFetchRedditNext()),
  setSiteSetting: setting => dispatch(misc.siteSettings(setting)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Entries);
