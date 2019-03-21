import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import isEqual from 'lodash/isEqual';
import isNil from 'lodash/isNil';
import * as listings from '../../redux/actions/listings';
import * as misc from '../../redux/actions/misc';
import Post from '../posts/Post';
import RedditAPI from '../../reddit/redditAPI';
import '../../styles/entries.scss';
import PostsDebug from './PostsDebug';

const queryString = require('query-string');

class Entries extends React.Component {
  static nextEntry(focused) {
    if (isNil(focused)) return;

    const current = document.getElementById(focused);
    if (isNil(current)) return;

    const next = current.nextElementSibling;

    if (next.classList.contains('entry')) {
      const scrollBy = next.getBoundingClientRect().top - 50;
      window.scrollBy({ top: scrollBy, left: 0 });
    } else {
      Entries.scrollToBottom();
    }
  }

  static prevEntry(focused) {
    if (isNil(focused)) return;

    const current = document.getElementById(focused);
    if (isNil(current)) return;

    const prev = current.previousElementSibling;
    // Is this the last one?
    if (isNil(prev) || !prev.classList.contains('entry')) return;

    const scrollBy = prev.getBoundingClientRect().top - 50;
    window.scrollBy({ top: scrollBy, left: 0 });
  }

  static scrollToBottom() {
    window.scrollTo(0, document.body.scrollHeight);
  }

  monitorEntriesInterval = null;

  scrollResize = true;

  scrollResizeStop = true;

  initTriggered = null;

  state = {
    focused: null,
    visible: [],
    actionable: null,
    hasError: false,
  };

  actionPost = React.createRef();

  async componentDidMount() {
    this.accessToken = await RedditAPI.getToken(false);
    this.scrollResizeStop = false;
    const { match, location } = this.props;
    this.setRedux(match, location);

    // Events.
    document.addEventListener('keydown', this.handleEntriesHotkey);
    document.addEventListener('resize', this.setScrollResize, false);
    document.addEventListener('scroll', this.setScrollResize, false);

    // Trigger this after a second/two seconds to load anything missed.
    // Delayed to let component load.
    setTimeout(() => this.monitorEntries(true), 1000);
    setTimeout(() => this.monitorEntries(true), 2000);

    this.monitorEntriesInterval = setInterval(this.monitorEntries, 250);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { ...props } = this.props;
    const { focused, visible, actionable } = this.state;

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

    if (actionable !== nextState.actionable) {
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
      this.postRefs = [];
      getEntriesReddit(listingsFilter);
    }

    this.setInitFocusedAndVisible();
  }

  componentWillUnmount() {
    this.scrollResizeStop = true;
    // Events.
    document.removeEventListener('keydown', this.handleEntriesHotkey);
    document.removeEventListener('resize', this.setScrollResize, false);
    document.removeEventListener('scroll', this.setScrollResize, false);
    clearInterval(this.monitorEntriesInterval);
    this.postRefs = {};
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
        actionable: entryKeys[0],
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

  setScrollResize = () => {
    this.scrollResize = true;
  };

  handleEntriesHotkey = event => {
    const {
      disableHotkeys,
      setSiteSetting,
      siteSettings,
      listingsStatus,
    } = this.props;
    const { focused } = this.state;
    if (
      !disableHotkeys &&
      (listingsStatus === 'loaded' || listingsStatus === 'loadedAll')
    ) {
      const pressedKey = event.key;
      try {
        switch (pressedKey) {
          case 'j':
            Entries.nextEntry(focused);
            break;
          case 'k':
            Entries.prevEntry(focused);
            break;
          case 'a':
            this.actionPost.current.voteUp();
            break;
          case 'z':
            this.actionPost.current.voteDown();
            break;
          case 's':
            this.actionPost.current.save();
            break;
          case 'o':
            this.actionPost.current.toggleViewAction();
            break;
          case '.':
            Entries.scrollToBottom();
            break;
          case 'V':
            setSiteSetting({
              view: siteSettings.view === 'expanded' ? 'condensed' : 'expanded',
            });
            try {
              window.scrollTo(0, document.getElementById(focused).offsetTop);
            } catch (e) {
              // continue regardless of error
            }
            break;
          default:
            break;
        }
      } catch (e) {
        // console.log(e);
      }
    }
  };

  monitorEntries = force => {
    if ((this.scrollResize && !this.scrollResizeStop) || force) {
      this.scrollResize = false;

      const postsCollection = document.getElementsByClassName('entry');
      const posts = Array.from(postsCollection);
      let newFocus = false;
      let newActionable = false;
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

          if (!newActionable) {
            const actionTop = top - 16;
            if (actionTop > 0) {
              newActionable = post.id;
            }
          }

          newVis.push(post.id);
        }

        // Check to see if there's a video to autoplay (mostly for Safari in High Sierra.
        // const videos = jQuery(post)
        //   .find('video')
        //   .not('.autoplay-triggered');
        //   if (videos.length > 0) {
        //     jQuery.each(videos, (videoidx, video) => {
        //       document.getElementById(video.id).play();
        //       jQuery(video).addClass('autoplay-triggered');
        //     });
        //
        //     //   document.getElementById(video[0].id).play();
        //   }
        // }
      });

      this.setState({
        focused: newFocus,
        actionable: newActionable,
        visible: newVis,
      });

      this.checkLoadMore();
    }

    // Check if iframe is focused. If it is, unfocus it so hotkeys work.
    if (document.activeElement.tagName === 'IFRAME') {
      window.focus();
      document.activeElement.blur();
    }
  };

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
      location,
      match,
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
    const { focused, visible, actionable } = this.state;
    const entriesKeys = Object.keys(entriesObject);
    if (entriesKeys.length > 0) {
      entries = entriesKeys.map(key => {
        const isFocused = focused === entriesObject[key].data.name;
        const isVisible = visible.includes(entriesObject[key].data.name);
        const isActionable = actionable === entriesObject[key].data.name;
        const ref = isActionable ? this.actionPost : null;
        return (
          <Post
            entry={entriesObject[key]}
            key={entriesObject[key].data.id}
            loaded={entriesObject[key].data.loaded}
            focused={isFocused}
            visible={isVisible}
            actionable={isActionable}
            ref={ref}
          />
        );
      });
    }

    return (
      <>
        {siteSettings.debug && (
          <PostsDebug
            visible={visible}
            requestURL={listingsEntries.requestUrl}
            focused={focused}
            actionable={actionable}
            match={match}
            location={location}
            listingsFilter={listingsFilter}
          />
        )}
        {entries}
        <div className="footer-status">{footerStatus}</div>
      </>
    );
  }
}

Entries.propTypes = {
  disableHotkeys: PropTypes.bool.isRequired,
  entries: PropTypes.object,
  getEntriesReddit: PropTypes.func.isRequired,
  getMoreRedditEntries: PropTypes.func.isRequired,
  listingsEntries: PropTypes.object.isRequired,
  listingsFilter: PropTypes.object.isRequired,
  listingsStatus: PropTypes.string.isRequired,
  location: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  setFilter: PropTypes.func.isRequired,
  setSiteSetting: PropTypes.func.isRequired,
  siteSettings: PropTypes.object,
};

Entries.defaultProps = {
  entries: {},
  siteSettings: { debug: false, view: 'expanded' },
};

const mapStateToProps = (state, ownProps) => ({
  disableHotkeys: state.disableHotKeys,
  entries: state.listingsRedditEntries.children,
  listingsEntries: state.listingsRedditEntries,
  listingsFilter: state.listingsFilter,
  listingsStatus: state.listingsRedditStatus,
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
