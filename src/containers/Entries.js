import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { isEqual } from 'lodash';
import * as listings from '../redux/actions/listings';
import Entry from '../components/Entry';

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

    if ((viewport.top - element.bottom <= y) && (element.top - viewport.bottom <= y)) {
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

  static createEntriesUrl(filter) {
    const qs = queryString.parse(location.search);

    if (!filter.target || !filter.sort) {
      return null;
    }

    let url = '/json/';

    if (filter.listType === 'r') {
      url += `r/${filter.target}/${filter.sort}`;
    }

    if (filter.listType === 'u') {
      url += `user/${filter.target}/${filter.userType}`;
      if (filter.userType !== 'saved') {
        url += `/${filter.sort}`;
      }
    }

    // Reset the default query strings
    qs.limit = filter.limit;
    qs.before = filter.before;
    qs.after = filter.after;
    if (filter.sort === 'top') {
      qs.t = filter.sortTop;
    }
    Object.keys(qs).forEach(key => (!qs[key]) && delete qs[key]);

    const qsStr = `?${queryString.stringify(qs)}`;

    if (qsStr) {
      url += qsStr;
    }
    return url;
  }

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
    };
    // this.handleEntriesHotkey = this.handleEntriesHotkey.bind(this);
  }

  componentDidMount() {
    this.scrollResizeStop = false;
    jQuery(document).keypress(Entries.handleEntriesHotkey);
    this.setRedux(this.props.match, this.props.location);
    jQuery(window).on('load resize scroll', () => { this.scrollResize = true; });
    this.monitorEntriesInterval = setInterval(this.monitorEntries, 500);
  }

  componentWillReceiveProps(nextProps) {
    const matchCompare = isEqual(nextProps.match, this.props.match);
    const locationCompare = isEqual(nextProps.location, this.props.location);
    if (!matchCompare || !locationCompare) {
      this.setRedux(nextProps.match, nextProps.location);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!isEqual(nextProps.listingsFilter, this.props.listingsFilter)) {
      return true;
    }
    if (this.props.listingsStatus !== nextProps.listingsStatus) {
      return true;
    }

    if (this.props.entries !== nextProps.entries) {
      return true;
    }

    if (this.props.debug !== nextProps.debug) {
      return true;
    }

    if (this.state.focused !== nextState.focused) {
      return true;
    }

    if (!isEqual(this.state.visible, nextState.visible)) {
      return true;
    }
    return false;
  }

  componentDidUpdate(prevProps) {
    if (!isEqual(prevProps.listingsFilter, this.props.listingsFilter)) {
      this.props.getEntries(this.props.listingsFilter);
    }
  }

  componentWillUnmount() {
    this.scrollResizeStop = true;
  }

  setRedux(match, location) {
    const qs = queryString.parse(location.search);

    let listType = match.params.listType || 'r';
    if (listType === 'user') listType = 'u';

    const newListingsFilter = {
      sort: match.params.sort || 'hot',
      sortTop: qs.t || 'day',
      target: match.params.target || 'mine',
      before: qs.before || '',
      after: qs.after || '',
      limit: qs.limit || '20',
      userType: match.params.userType || '',
      listType,
    };

    newListingsFilter.url = Entries.createEntriesUrl(newListingsFilter);

    const listingsFilter = this.props.listingsFilter;

    if (!isEqual(listingsFilter, newListingsFilter)) {
      this.props.setFilter(newListingsFilter);
    }
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
    const loadedStatus = this.props.listingsStatus;
    if (loadedStatus === 'loaded' && jQuery(window).scrollTop() + jQuery(window).height() > jQuery(document).height() - 2500) {
      this.props.getMoreEntries();
    }
  }

  render() {
    if (this.props.listingsStatus === 'unloaded' || this.props.listingsStatus === 'loading') {
      return (
        <div className="alert alert-info" id="content-loading" role="alert">
          <span className="glyphicon glyphicon-refresh glyphicon-refresh-animate" /> Getting entries from Reddit.
        </div>
      );
    }

    if (this.props.listingsStatus === 'error') {
      return (
        <div className="alert alert-danger" id="subreddits-load-error" role="alert">
          <span className="glyphicon glyphicon glyphicon-alert" /> Error loading this subreddit.
        </div>
      );
    }

    if (this.props.listingsStatus === 'loaded' && !this.props.listingsEntries.entries) {
      return (
        <div className="alert alert-warning" id="content-empty" role="alert">
          <span className="glyphicon glyphicon glyphicon-alert" /> Nothing here.
        </div>
      );
    }

    let footerStatus = '';
    if (this.props.listingsStatus === 'loadingNext') {
      footerStatus = (
        <div className="alert alert-info" id="content-more-loading" role="alert">
          <span className="glyphicon glyphicon-refresh glyphicon-refresh-animate" /> Getting more entries.
        </div>
      );
    } else if (this.props.listingsStatus === 'loadedAll') {
      footerStatus = (
        <div className="alert alert-warning" id="content-end" role="alert">
          <span className="glyphicon glyphicon glyphicon-alert" /> {"That's it!"}
        </div>
      );
    }

    let entries = '';
    const entriesObject = this.props.listingsEntries.entries;
    let focused = '';
    let visible = {};
    if (this.props.listingsEntries.type === 'init' && this.props.listingsEntries.requestUrl !== this.initTriggered) {
      focused = this.props.listingsEntries.preload.focus;
      visible = this.props.listingsEntries.preload.visible;
      this.initTriggered = this.props.listingsEntries.requestUrl;
    } else {
      focused = this.state.focused;
      visible = this.state.visible;
    }
    const entriesKeys = Object.keys(entriesObject);
    if (entriesKeys.length > 0) {
      entries = entriesKeys.map((key) => {
        const isFocused = focused === entriesObject[key].name;
        const isVisible = visible.includes(entriesObject[key].name);
        return (<Entry
          entry={entriesObject[key]}
          key={entriesObject[key].id}
          loaded={entriesObject[key].loaded}
          focused={isFocused}
          visible={isVisible}
        />);
      });
    }

    return (
      <div>
        {this.props.debug &&
        <div className="debugInfo">
          <pre>
            Target: {this.props.listingsFilter.target}<br />
            Sort: {this.props.listingsFilter.sort}<br />
            SortTop: {this.props.listingsFilter.sortTop}<br />
            Type: {this.props.listingsFilter.listType}<br />
            URL: {this.props.listingsFilter.url}
          </pre>
        </div>
        }
        {entries}
        <div className="footer-status">
          {footerStatus}
        </div>
      </div>
    );
  }
}

Entries.propTypes = {
  match: PropTypes.object.isRequired, // eslint-disable-line react/no-unused-prop-types
  location: PropTypes.object.isRequired, // eslint-disable-line react/no-unused-prop-types
  setFilter: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
  setStatus: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
  getEntries: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
  getMoreEntries: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
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
  listingsEntries: state.listingsEntries,
  listingsStatus: state.listingsStatus,
  entries: state.listingsEntries.entries,
  debug: state.debugMode,
});

const mapDispatchToProps = dispatch => ({
  setFilter: filter => dispatch(listings.listingsFilter(filter)),
  setStatus: status => dispatch(listings.listingsStatus(status)),
  getEntries: (filter, query) => dispatch(listings.listingsFetch(filter, query)),
  getMoreEntries: () => dispatch(listings.listingsFetchNext()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Entries);
