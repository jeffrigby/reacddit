import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import isEqual from 'lodash/isEqual';
import isNil from 'lodash/isNil';
import {
  listingsFilter,
  listingsFetchEntriesReddit,
  listingsFetchRedditNext,
} from '../../redux/actions/listings';
import { siteSettings } from '../../redux/actions/misc';
import Post from '../posts/Post';
import '../../styles/entries.scss';
import PostsDebug from './PostsDebug';
import ListingsHeader from './ListingsHeader';

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

  mounted = false;

  monitorEntriesInterval = null;

  scrollResize = true;

  scrollResizeStop = true;

  initTriggered = null;

  state = {
    focused: '',
    visible: [],
    actionable: null,
    hasError: false,
  };

  actionPost = React.createRef();

  componentDidMount() {
    this.mounted = true;

    this.scrollResizeStop = false;
    const { match, location } = this.props;
    this.setRedux(match, location);

    // Events.
    document.addEventListener('keydown', this.handleEntriesHotkey);
    document.addEventListener('resize', this.setScrollResize, false);
    document.addEventListener('scroll', this.setScrollResize, false);

    // Trigger this after a second/two seconds to load anything missed.
    // Delayed to let component load. Pretty sure I can remove this
    // when I implement Hooks
    setTimeout(() => this.monitorEntries(true), 1000);
    setTimeout(() => this.monitorEntries(true), 2000);

    this.monitorEntriesInterval = setInterval(this.monitorEntries, 250);
  }

  componentDidUpdate(prevProps) {
    const { match, location, filter, getEntriesReddit } = this.props;
    const matchCompare = isEqual(prevProps.match, match);
    const locationCompare = prevProps.location.search === location.search;
    if (!matchCompare || !locationCompare) {
      this.setRedux(match, location);
    }

    if (!isEqual(prevProps.filter, filter) || !locationCompare) {
      getEntriesReddit(filter);
    }
    this.setInitFocusedAndVisible();
  }

  componentWillUnmount() {
    this.scrollResizeStop = true;
    this.mounted = false;

    // Events.
    document.removeEventListener('keydown', this.handleEntriesHotkey);
    document.removeEventListener('resize', this.setScrollResize, false);
    document.removeEventListener('scroll', this.setScrollResize, false);
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
        actionable: entryKeys[0],
        visible: entryKeys.slice(0, 5),
      };
      this.setState(newState);
    }
  }

  setRedux(match, location) {
    const qs = queryString.parse(location.search);
    const { filter, setFilter } = this.props;
    const { listType, target, sort, user, userType, multi } = match.params;

    let listingType = match.params.listType || 'r';
    if (listType === 'user') listingType = 'u';
    if (listType === 'multi') listingType = 'm';
    if (listType === 'search') listingType = 's';
    // if (listType === 'duplicates') listingType = 'd';

    const newFilter = {
      sort: sort || qs.sort || 'hot',
      target: target || 'mine',
      multi: multi === 'm' || false,
      userType: userType || '',
      user: user || '',
      listType: listingType,
    };

    if (!isEqual(filter, newFilter)) {
      setFilter(newFilter);
    }
  }

  setScrollResize = () => {
    this.scrollResize = true;
  };

  handleEntriesHotkey = event => {
    const {
      disableHotkeys,
      setSiteSetting,
      settings,
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
          case 'x':
            this.actionPost.current.toggleViewAction();
            break;
          case 'o':
          case 'Enter':
            this.actionPost.current.openReddit();
            break;
          case 'l':
            this.actionPost.current.openLink();
            break;
          case 'd':
            this.actionPost.current.gotoDuplicates();
            break;
          case '.':
            Entries.scrollToBottom();
            break;
          case 'v':
            setSiteSetting({
              view: settings.view === 'expanded' ? 'condensed' : 'expanded',
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
    if (!this.mounted) return;
    if ((this.scrollResize && !this.scrollResizeStop) || force) {
      this.scrollResize = false;

      const postsCollection = document.getElementsByClassName('entry');
      const posts = Array.from(postsCollection);
      let newFocus = '';
      let newActionable = null;
      const newVis = [];
      let prevPostId = null;

      posts.forEach(post => {
        const { top, bottom } = post.getBoundingClientRect();

        // If it's not in the visible range skip it.
        if (bottom >= -780 && top - window.innerHeight <= 800) {
          if (!newFocus) {
            const focusTop = bottom - 55;
            if (focusTop > 0) {
              newFocus = post.id;
            }
          }

          if (!newActionable) {
            const actionTop = top - 16;
            if (actionTop > 0) {
              const inView = top - window.innerHeight <= -16;
              newActionable = inView ? post.id : prevPostId;
            }
          }

          newVis.push(post.id);
        }
        prevPostId = post.id;

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
      setTimeout(() => {
        window.focus();
        document.activeElement.blur();
      }, 1000);
    }
  };

  async checkLoadMore() {
    const { listingsStatus, getMoreRedditEntries } = this.props;
    const loadedStatus = listingsStatus;
    if (
      loadedStatus === 'loaded' &&
      window.scrollY + window.innerHeight >
        document.documentElement.scrollHeight - 2500
    ) {
      // getMoreEntries();
      await getMoreRedditEntries();
      // Dumb way to handle this.
      setTimeout(() => this.monitorEntries(true), 1000);
      setTimeout(() => this.monitorEntries(true), 2000);
    }
  }

  renderPost = post => {
    const { focused, visible, actionable } = this.state;
    const isFocused = focused === post.data.name;
    const isVisible = visible.includes(post.data.name);
    const isActionable = actionable === post.data.name;
    const ref = isActionable ? this.actionPost : null;
    return (
      <Post
        entry={post}
        key={post.data.id}
        loaded={post.data.loaded}
        focused={isFocused}
        visible={isVisible}
        actionable={isActionable}
        ref={ref}
      />
    );
  };

  render() {
    const {
      listingsStatus,
      listingsEntries,
      settings,
      filter,
      location,
      match,
    } = this.props;

    const { listType } = filter;

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
          {
            ' Error fetching content from Reddit. Reddit might be down. Try reloading.'
          }
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
        return this.renderPost(entriesObject[key]);
      });
    }

    // console.log( listingsEntries.originalPost);
    // const originalPost = null;
    const originalPost =
      listingsEntries.originalPost && listType === 'duplicates'
        ? this.renderPost(listingsEntries.originalPost)
        : null;

    return (
      <>
        <div className="list-group" id="entries">
          <ListingsHeader />
          {originalPost && listType === 'duplicates' && (
            <>
              {originalPost}
              <div className="list-title">Duplicate/Cross Posts</div>
            </>
          )}
          {entries}
          <div className="footer-status">{footerStatus}</div>
        </div>
        {settings.debug && (
          <PostsDebug
            visible={visible}
            requestURL={listingsEntries.requestUrl}
            focused={focused}
            actionable={actionable}
            match={match}
            location={location}
            listingsFilter={filter}
          />
        )}
      </>
    );
  }
}

Entries.propTypes = {
  location: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,

  /* Redux Props */
  disableHotkeys: PropTypes.bool.isRequired,
  filter: PropTypes.object.isRequired,
  listingsEntries: PropTypes.object.isRequired,
  listingsStatus: PropTypes.string.isRequired,
  settings: PropTypes.object,

  /* Redux actions */
  getEntriesReddit: PropTypes.func.isRequired,
  getMoreRedditEntries: PropTypes.func.isRequired,
  setFilter: PropTypes.func.isRequired,
  setSiteSetting: PropTypes.func.isRequired,
};

Entries.defaultProps = {
  settings: { debug: false, view: 'expanded' },
};

const mapStateToProps = (state, ownProps) => ({
  disableHotkeys: state.disableHotKeys,
  filter: state.listingsFilter,
  listingsEntries: state.listingsRedditEntries,
  listingsStatus: state.listingsRedditStatus,
  settings: state.siteSettings,
});

export default connect(
  mapStateToProps,
  {
    getEntriesReddit: listingsFetchEntriesReddit,
    getMoreRedditEntries: listingsFetchRedditNext,
    setFilter: listingsFilter,
    setSiteSetting: siteSettings,
  }
)(Entries);
