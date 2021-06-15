import React from 'react';
import PropTypes from 'prop-types';
import { push } from 'connected-react-router';
import { connect } from 'react-redux';
import { hotkeyStatus } from '../../common';

const queryString = require('query-string');

class Search extends React.PureComponent {
  searchInput = React.createRef();

  searchInputParent = React.createRef();

  constructor(props) {
    // Required step: always call the parent class' constructor
    super(props);

    this.state = {
      focused: false,
      search: '',
      qs: props.location.search,
      pathname: props.location.pathname,
    };
  }

  componentDidMount() {
    // Set the initial state.
    const { location } = this.props;
    const qs = queryString.parse(location.search);
    this.setState({
      search: qs.q || '',
    });
    document.addEventListener('keydown', this.handleSearchHotkey);
  }

  static getDerivedStateFromProps(props, state) {
    const { location } = props;
    if (state.pathname === location.pathname && state.qs === location.search) {
      return null;
    }

    const qs = queryString.parse(location.search);

    return {
      search: qs.q || '',
      pathname: location.pathname,
      qs: location.search,
    };
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleSearchHotkey);
  }

  handleChange = (event) => {
    this.setState({ search: event.target.value });
  };

  handleSearchHotkey = (event) => {
    const { focused } = this.state;
    const pressedKey = event.key;

    if (hotkeyStatus()) {
      switch (pressedKey) {
        case 'S':
          this.searchInput.current.focus();
          this.setState({ search: '' });
          document.body.classList.remove('show-menu');
          event.preventDefault();
          break;
        default:
          break;
      }
    } else if (focused) {
      switch (pressedKey) {
        case 'Escape':
          this.searchInput.current.blur();
          this.setState({ search: '' });
          event.preventDefault();
          break;
        default:
          break;
      }
    }
  };

  focusSearch = () => {
    this.setState({ focused: true });
    this.searchInput.current.select();
    document.body.classList.add('search-active');
  };

  blurSearch = () => {
    // delayed to allow button onclicks to trigger.
    setTimeout(() => {
      document.body.classList.remove('search-active');
      this.setState({ focused: false });
    }, 250);
  };

  clearSearch = () => {
    this.setState({ search: '' });
    this.searchInput.current.blur();
  };

  getCurrentSearchSort = () => {
    const { location } = this.props;
    const currentSearch = queryString.parse(location.search);
    const qs = {};
    if (currentSearch.sort !== undefined) {
      qs.sort = currentSearch.sort.match(/^(relevance|new|top)$/)
        ? currentSearch.sort
        : 'relevance';

      qs.t = currentSearch.t || null;
    } else {
      qs.sort = 'relevance';
    }
    return qs;
  };

  getMainSearchURL = (q) => {
    const currentSearch = this.getCurrentSearchSort();
    const qs = { ...currentSearch, q };
    const qsString = queryString.stringify(qs);
    return `/search?${qsString}`;
  };

  getTargetUrl = () => {
    const { listingsFilter } = this.props;
    const { listType, target, user, multi } = listingsFilter;
    if (
      (listType === 'r' || (listType === 's' && !multi)) &&
      target !== 'mine'
    ) {
      return `/r/${target}`;
    }

    if ((listType === 'm' || (listType === 's' && multi)) && user !== 'me') {
      return `/user/${target}/m/${target}`;
    }
    if ((listType === 'm' || (listType === 's' && multi)) && user === 'me') {
      return `/me/m/${target}`;
    }
    return '';
  };

  searchTarget = () => {
    const { pushUrl } = this.props;

    const q = this.searchInput.current.value;
    if (!q) {
      return;
    }
    const url = this.getMainSearchURL(q);
    const targetUrl = this.getTargetUrl();
    const finalUrl = `${targetUrl}${url}`;
    pushUrl(finalUrl);
    this.searchInput.current.blur();
  };

  searchEverywhere = () => {
    const { pushUrl } = this.props;
    const q = this.searchInput.current.value;
    if (!q) {
      return;
    }
    const url = this.getMainSearchURL(q);
    pushUrl(url);
    this.searchInput.current.blur();
  };

  processSearch = (e) => {
    const q = e.target.value;
    if (!q) {
      return;
    }

    if (e.keyCode === 13) {
      if (!e.shiftKey) {
        this.searchTarget();
      } else {
        this.searchEverywhere();
      }
    }
  };

  render() {
    const { listingsFilter } = this.props;
    const { focused, search } = this.state;
    const { target, listType, multi } = listingsFilter;

    let placeholder = 'search Reddit';
    let global = true;

    if (
      (listType === 'r' && target !== 'mine') ||
      (listType === 's' && target !== 'mine' && !multi)
    ) {
      placeholder = `search in /r/${target}`;
      global = false;
    } else if (
      listType === 'm' ||
      (listType === 's' && target !== 'mine' && multi)
    ) {
      placeholder = `search in /m/${target}`;
      global = false;
    }

    const showTargetSearch =
      listType === 'r' ||
      listType === 'm' ||
      (listType === 's' && target !== 'mine');
    const title = showTargetSearch
      ? 'Press shift-return to search all of reddit'
      : '';

    const searchClassName = focused ? 'search-focused m-0' : 'm-0';

    return (
      <div id="search" ref={this.searchInputParent} className={searchClassName}>
        <input
          type="text"
          className="form-control form-control-dark form-control-sm w-100 py-0"
          id="search-reddit"
          onFocus={this.focusSearch}
          onBlur={this.blurSearch}
          onKeyUp={this.processSearch}
          onChange={this.handleChange}
          placeholder={placeholder}
          title={title}
          value={search}
          ref={this.searchInput}
        />
        {(focused || search) && (
          <i
            className="far fa-times-circle form-control-clear"
            onClick={this.clearSearch}
            aria-hidden
            role="button"
            aria-label="Clear Search Box"
          />
        )}
        {focused && !global && (
          <div className="searchToolTip small p-1 mt-1">
            {showTargetSearch && (
              <button
                type="button"
                className="btn btn-primary btn-sm me-1"
                onClick={this.searchTarget}
                disabled={!search}
              >
                Search in /r/{listingsFilter.target}{' '}
                <span className="no-touch">⏎</span>
              </button>
            )}
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={this.searchEverywhere}
              disabled={!search}
            >
              Search Everywhere <span className="no-touch">⇧⏎</span>
            </button>
          </div>
        )}
      </div>
    );
  }
}

Search.propTypes = {
  listingsFilter: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  pushUrl: PropTypes.func.isRequired,
};

Search.defaultProps = {};

const mapStateToProps = (state, ownProps) => ({
  location: state.router.location,
  listingsFilter: state.listingsFilter,
});

const mapDispatchToProps = (dispatch) => ({
  pushUrl: (url) => dispatch(push(url)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Search);
