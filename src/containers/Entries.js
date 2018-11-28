import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import isEqual from 'lodash.isequal';
import * as listings from '../redux/actions/listings';
import Entry from '../components/Entry';
import RedditAPI from '../reddit/redditAPI';

const queryString = require('query-string');

class Entries extends React.Component {
  static nextEntry() {
    let focus = jQuery('div.entry.focused');
    if (focus.length === 0) {
      focus = jQuery('div.entry:first');
    }
    const goto = focus.next('div.entry');
    if (goto.length > 0) {
      jQuery('html, body').scrollTop(goto.offset().top - 50);
    } else {
      Entries.scrollToBottom();
    }
  }

  static prevEntry() {
    const focus = jQuery('div.entry.focused');
    const goto = focus.prev('div.entry');
    if (goto.length > 0) {
      jQuery('html, body').scrollTop(goto.offset().top - 50);
    }
  }

  static scrollToBottom() {
    window.scrollTo(0, document.body.scrollHeight);
  }

  static isInViewport(elm, y) {
    const viewport = {};
    viewport.top = jQuery(window).scrollTop();
    viewport.height = jQuery(window).height();
    viewport.bottom = viewport.top + viewport.height;

    const element = {};
    element.top = jQuery(elm).offset().top;
    element.height = jQuery(elm).height();
    element.bottom = element.top + element.height;

    if (
      viewport.top - element.bottom <= y &&
      element.top - viewport.bottom <= y
    ) {
      return true;
    }

    return false;
  }

  static handleEntriesHotkey(event) {
    switch (event.charCode) {
      case 106: // j
        Entries.nextEntry();
        break;
      case 107: // k
        Entries.prevEntry();
        break;
      case 46: // .
        Entries.scrollToBottom();
        break;
      default:
        break;
    }
  }

  // static createEntriesUrl(filter) {
  //   const qs = queryString.parse(window.location.search);
  //
  //   if (!filter.target || !filter.sort) {
  //     return null;
  //   }
  //
  //   let url = '/json/';
  //
  //   if (filter.listType === 'r') {
  //     url += `r/${filter.target}/${filter.sort}`;
  //   }
  //
  //   if (filter.listType === 'u') {
  //     url += `user/${filter.target}/${filter.userType}`;
  //     if (filter.userType !== 'saved') {
  //       url += `/${filter.sort}`;
  //     }
  //   }
  //
  //   if (filter.listType === 'm') {
  //     url += `user/${filter.target}/m/${filter.userType}`;
  //     if (filter.userType !== 'saved') {
  //       url += `/${filter.sort}`;
  //     }
  //   }
  //
  //   // Reset the default query strings
  //   qs.limit = filter.limit;
  //   qs.before = filter.before;
  //   qs.after = filter.after;
  //   if (filter.sort === 'top') {
  //     qs.t = filter.t;
  //   }
  //   Object.keys(qs).forEach(key => !qs[key] && delete qs[key]);
  //
  //   const qsStr = `?${queryString.stringify(qs)}`;
  //
  //   if (qsStr) {
  //     url += qsStr;
  //   }
  //   return url;
  // }

  constructor(props) {
    super(props);
    this.monitorEntriesInterval = null;
    this.scrollResize = true;
    this.scrollResizeStop = true;
    this.initTriggered = null;
    this.monitorEntries = this.monitorEntries.bind(this);
    this.state = {
      focused: null,
      visible: [],
      hasError: false,
    };
    // this.handleEntriesHotkey = this.handleEntriesHotkey.bind(this);
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  async componentDidMount() {
    this.accessToken = await RedditAPI.getToken(false);
    this.scrollResizeStop = false;
    const { match, location } = this.props;
    jQuery(document).keypress(Entries.handleEntriesHotkey);
    this.setRedux(match, location);
    jQuery(window).on('load resize scroll', () => {
      this.scrollResize = true;
    });
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

    if (props.debug !== nextProps.debug) {
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
    const locationCompare = isEqual(prevProps.location, location);
    if (!matchCompare || !locationCompare) {
      this.setRedux(match, location);
    }

    if (!isEqual(prevProps.listingsFilter, listingsFilter)) {
      getEntriesReddit(listingsFilter);
    }

    this.setInitFocusedAndVisible();
  }

  componentWillUnmount() {
    this.scrollResizeStop = true;
  }

  setInitFocusedAndVisible() {
    const { listingsEntries } = this.props;
    if (
      listingsEntries.type === 'init' &&
      this.initTriggered !== listingsEntries.requestUrl
    ) {
      this.initTriggered = listingsEntries.requestUrl;
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

    let listType = match.params.listType || 'r';
    if (listType === 'user' && !match.params.multi) listType = 'u';
    if (listType === 'user' && match.params.multi) listType = 'm';

    const newListingsFilter = {
      sort: match.params.sort || 'hot',
      t: qs.t || 'day',
      target: match.params.target || 'mine',
      before: qs.before || '',
      after: qs.after || '',
      limit: qs.limit || '20',
      userType: match.params.userType || '',
      listType,
    };

    if (!isEqual(listingsFilter, newListingsFilter)) {
      setFilter(newListingsFilter);
    }
  }

  componentDidCatch(error, info) {
    // You can also log the error to an error reporting service
    // eslint-disable-next-line no-console
    console.log(error, info);
  }

  monitorEntries() {
    if (this.scrollResize && !this.scrollResizeStop) {
      this.scrollResize = false;
      // Set the focus.
      const entries = jQuery('.entry');
      let focused = 0;
      const visibleContent = [];
      let visibleItr = 'looking';
      let newVisible = false;
      let newFocuseId = null;
      jQuery.each(entries, (idx, entry) => {
        if (focused === 0) {
          const inFocus = Entries.isInViewport(entry, -50);
          if (inFocus) {
            newFocuseId = entry.id;
            focused = 1;
          }
        }
        const visible = Entries.isInViewport(entry, 1000);

        if (visible) {
          visibleItr = 'visible';
          visibleContent.push(entry.id);
          if (!newVisible) {
            newVisible = true;
          }

          // Check to see if there's a video to autoplay (mostly for Safari in High Sierra.
          const videos = jQuery(entry)
            .find('video')
            .not('.autoplay-triggered');
          if (videos.length > 0) {
            jQuery.each(videos, (videoidx, video) => {
              document.getElementById(video.id).play();
              jQuery(video).addClass('autoplay-triggered');
            });

            //   document.getElementById(video[0].id).play();
          }
        }

        if (!visible && visibleItr === 'visible') {
          // Stop this loop. We have everything we need.
          return false;
        }

        return true;
      });

      this.setState({
        focused: newFocuseId,
        visible: visibleContent,
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
      jQuery(window).scrollTop() + jQuery(window).height() >
        jQuery(document).height() - 2500
    ) {
      // getMoreEntries();
      getMoreRedditEntries();
    }
  }

  render() {
    const {
      listingsStatus,
      listingsEntries,
      debug,
      listingsFilter,
    } = this.props;

    const { hasError } = this.state;

    if (listingsStatus === 'unloaded' || listingsStatus === 'loading') {
      return (
        <div className="alert alert-info" id="content-loading" role="alert">
          <span className="glyphicon glyphicon-refresh glyphicon-refresh-animate" />
          {' Getting entries from Reddit.'}
        </div>
      );
    }

    if (listingsStatus === 'error' || hasError) {
      return (
        <div
          className="alert alert-danger"
          id="subreddits-load-error"
          role="alert"
        >
          <span className="glyphicon glyphicon glyphicon-alert" />
          Error loading this subreddit.
        </div>
      );
    }

    if (listingsStatus === 'loaded' && !listingsEntries.children) {
      return (
        <div className="alert alert-warning" id="content-empty" role="alert">
          <span className="glyphicon glyphicon glyphicon-alert" /> Nothing here.
        </div>
      );
    }

    let footerStatus = '';
    if (listingsStatus === 'loadingNext') {
      footerStatus = (
        <div
          className="alert alert-info"
          id="content-more-loading"
          role="alert"
        >
          <span className="glyphicon glyphicon-refresh glyphicon-refresh-animate" />
          {' Getting more entries.'}
        </div>
      );
    } else if (listingsStatus === 'loadedAll') {
      footerStatus = (
        <div className="alert alert-warning" id="content-end" role="alert">
          <span className="glyphicon glyphicon glyphicon-alert" />
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
        // const isFocused = false;
        // const isVisible = false;
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

    return (
      <div>
        {debug && (
          <div className="debugInfo">
            <pre>
              Target: {listingsFilter.target}
              <br />
              Sort: {listingsFilter.sort}
              <br />
              t: {listingsFilter.t}
              <br />
              Type: {listingsFilter.listType}
              <br />
              URL: {listingsEntries.requestUrl}
              <br />
              Focus: {focused}
            </pre>
          </div>
        )}
        {entries}
        <div className="footer-status">{footerStatus}</div>
      </div>
    );
  }
}

Entries.propTypes = {
  match: PropTypes.object.isRequired, // eslint-disable-line react/no-unused-prop-types
  location: PropTypes.object.isRequired, // eslint-disable-line react/no-unused-prop-types
  setFilter: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
  getEntriesReddit: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
  getMoreRedditEntries: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
  listingsEntries: PropTypes.object.isRequired, // eslint-disable-line react/no-unused-prop-types
  listingsFilter: PropTypes.object.isRequired, // eslint-disable-line react/no-unused-prop-types
  listingsStatus: PropTypes.string.isRequired, // eslint-disable-line react/no-unused-prop-types
  entries: PropTypes.object,
  debug: PropTypes.bool,
};

Entries.defaultProps = {
  entries: {},
  debug: false,
};

const mapStateToProps = (state, ownProps) => ({
  listingsFilter: state.listingsFilter,
  listingsEntries: state.listingsRedditEntries,
  listingsStatus: state.listingsRedditStatus,
  entries: state.listingsRedditEntries.children,
  debug: state.debugMode,
});

const mapDispatchToProps = dispatch => ({
  setFilter: filter => dispatch(listings.listingsFilter(filter)),
  getEntriesReddit: (subreddit, sort, options) =>
    dispatch(listings.listingsFetchEntriesReddit(subreddit, sort, options)),
  getMoreRedditEntries: () => dispatch(listings.listingsFetchRedditNext()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Entries);
