import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import * as listings from '../redux/actions/listings';
import Entry from '../components/Entry';

const queryString = require('query-string');
const VisibilitySensor = require('react-visibility-sensor');

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
      case 106:
        Entries.nextEntry();
        break;
      case 107:
        Entries.prevEntry();
        break;
      case 71:
        Entries.scrollToBottom();
        break;
      default:
        break;
    }
  }

  constructor(props) {
    super(props);
    this.loadMore = this.loadMore.bind(this);
    this.monitorEntriesInterval = null;
    this.scrollResize = true;
    this.scrollResizeStop = false;
    this.monitorEntries = this.monitorEntries.bind(this);
    // this.handleEntriesHotkey = this.handleEntriesHotkey.bind(this);
  }

  componentDidMount() {
    jQuery(document).keypress(Entries.handleEntriesHotkey);
    this.setRedux(this.props.match, this.props.location);
    jQuery(window).on('load resize scroll', () => { this.scrollResize = true; });
    this.monitorEntriesInterval = setInterval(this.monitorEntries, 500);
  }

  componentWillReceiveProps(nextProps) {
    this.setRedux(nextProps.match, nextProps.location);
  }

  shouldComponentUpdate(nextProps) {
    if (JSON.stringify(nextProps.listingsFilter) !== JSON.stringify(this.props.listingsFilter)) {
      return true;
    }
    if (this.props.listingsStatus !== nextProps.listingsStatus) {
      return true;
    }

    // if (this.props.listingsVisible !== nextProps.listingsVisible) {
    //   return true;
    // }

    if (this.props.entries !== nextProps.entries) {
      return true;
    }

    if (this.props.debug !== nextProps.debug) {
      return true;
    }

    return false;
  }

  componentDidUpdate(prevProps) {
    if (JSON.stringify(prevProps.listingsFilter) !== JSON.stringify(this.props.listingsFilter)) {
      this.props.getEntries(this.props.listingsFilter);
    }
  }

  setRedux(match, location) {
    const qs = queryString.parse(location.search);
    const sort = match.params.sort || 'hot';
    const sortTop = qs.t || 'day';
    const target = match.params.target || 'mine';
    const before = qs.before || '';
    const after = qs.after || '';
    const limit = qs.limit || '20';
    const userType = match.params.userType || '';
    let listType = match.params.listType || 'r';
    if (listType === 'user') listType = 'u';
    const url = this.getEntriesUrl();

    const listingsFilter = this.props.listingsFilter;
    const newListingsFilter = {
      listType,
      sort,
      sortTop,
      target,
      before,
      after,
      limit,
      userType,
      url,
    };

    if (JSON.stringify(listingsFilter) !== JSON.stringify(newListingsFilter)) {
      this.props.setFilter(newListingsFilter);
      // console.log('called');
      // this.props.getEntries(newListingsFilter, this.props.location.search);
    }
  }

  getEntriesUrl() {
    const qs = queryString.parse(location.search);
    const filter = this.props.listingsFilter;

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

    if (!qs.limit) {
      qs.limit = '20';
    }

    const qsStr = `?${queryString.stringify(qs)}`;

    if (qsStr) {
      url += qsStr;
    }
    return url;
  }

  loadMore(isVisible) {
    if (isVisible) {
      const loadedStatus = this.props.listingsStatus;
      if (loadedStatus === 'loaded') {
        this.props.getMoreEntries();
      }
    }
    return false;
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
      const currentVisible = this.props.listingsVisible;
      jQuery.each(entries, (idx, entry) => {
        const inFocus = Entries.isInViewport(entry, -50);
        const visible = Entries.isInViewport(entry, 500);
        if (inFocus && focused === 0) {
          if (this.props.listingsFocused !== entry.id) {
            this.props.setFocus(entry.id);
          }
          focused = 1;
        }

        if (visible) {
          visibleItr = 'visible';
          visibleContent.push(entry.id);
          if (!currentVisible.includes(entry.id) && !newVisible) {
            newVisible = true;
          }
        }

        if (!visible && visibleItr === 'visible') {
          // Stop this loop. We have everything we need.
          return false;
        }

        return true;
      });

      if (newVisible || (currentVisible.length !== currentVisible.length)) {
        this.props.setVisible(visibleContent);
      }
    }
  }

  render() {
    const jsonUrl = this.getEntriesUrl();

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
    const entriesKeys = Object.keys(entriesObject);
    if (entriesKeys.length > 0) {
      entries = entriesKeys.map(key =>
        <Entry
          entry={entriesObject[key]}
          key={entriesObject[key].id}
          loaded={entriesObject[key].loaded}
        />,
      );
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
            URL: {jsonUrl}
          </pre>
        </div>
        }
        {entries}
        <div className="footer-status">
          {footerStatus}
        </div>
        <VisibilitySensor onChange={this.loadMore} />
      </div>
    );
  }
}

Entries.propTypes = {
  match: PropTypes.object.isRequired, // eslint-disable-line react/no-unused-prop-types
  location: PropTypes.object.isRequired, // eslint-disable-line react/no-unused-prop-types
  setFilter: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
  setFocus: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
  setVisible: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
  getEntries: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
  getMoreEntries: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
  listingsEntries: PropTypes.object.isRequired, // eslint-disable-line react/no-unused-prop-types
  listingsFilter: PropTypes.object.isRequired, // eslint-disable-line react/no-unused-prop-types
  listingsStatus: PropTypes.string.isRequired, // eslint-disable-line react/no-unused-prop-types
  listingsFocused: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
  listingsVisible: PropTypes.array.isRequired, // eslint-disable-line react/no-unused-prop-types
  entries: PropTypes.object,
  debug: PropTypes.bool,
};

Entries.defaultProps = {
  entries: {},
  listingsFocused: null,
  debug: false,
};

const mapStateToProps = (state, ownProps) => ({
  listingsFilter: state.listingsFilter,
  listingsEntries: state.listingsEntries,
  listingsStatus: state.listingsStatus,
  listingsFocused: state.listingsFocused,
  listingsVisible: state.listingsVisible,
  entries: state.listingsEntries.entries,
  debug: state.debugMode,
});

const mapDispatchToProps = dispatch => ({
  setFilter: filter => dispatch(listings.listingsFilter(filter)),
  setFocus: focused => dispatch(listings.listingsFocus(focused)),
  setVisible: visible => dispatch(listings.listingsVisible(visible)),
  getEntries: (filter, query) => dispatch(listings.listingsFetch(filter, query)),
  getMoreEntries: () => dispatch(listings.listingsFetchNext()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Entries);
