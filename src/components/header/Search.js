import React from 'react';
import PropTypes from 'prop-types';
import { push } from 'connected-react-router';
import { connect } from 'react-redux';
import { disableHotKeys } from '../../redux/actions/misc';

const queryString = require('query-string');

/**
 * Import all actions as an object.
 */

class Search extends React.Component {
  constructor(props) {
    super(props);
    this.focusSearch = this.focusSearch.bind(this);
    this.blurSearch = this.blurSearch.bind(this);
    this.processSearch = this.processSearch.bind(this);
    this.handleSearchHotkey = this.handleSearchHotkey.bind(this);
    this.searchInput = React.createRef();
    this.state = {
      focused: false,
    };
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleSearchHotkey);
  }

  componentWillReceiveProps(nextProps) {
    // @TODO not convinced this is the right or best way to do this.
    const { location } = this.props;
    if (
      location.pathname !== nextProps.location.pathname &&
      nextProps.location.pathname.indexOf('search') === -1
    ) {
      this.searchInput.current.value = '';
    }

    if (location.search !== nextProps.location.search) {
      const qs = queryString.parse(nextProps.location.search);
      this.searchInput.current.value = qs.q || '';
    }
  }

  handleSearchHotkey(event) {
    const { disableHotkeys } = this.props;
    const { focused } = this.state;
    const pressedKey = event.key;

    if (!disableHotkeys) {
      switch (pressedKey) {
        case 'S':
          this.searchInput.current.focus();
          this.searchInput.current.value = '';
          event.preventDefault();
          break;
        default:
          break;
      }
    } else if (focused) {
      switch (pressedKey) {
        case 'Escape':
          this.searchInput.current.blur();
          this.searchInput.current.value = '';
          event.preventDefault();
          break;
        default:
          break;
      }
    }
  }

  focusSearch() {
    const { setDisableHotkeys } = this.props;
    this.setState({ focused: true });
    setDisableHotkeys(true);
  }

  blurSearch() {
    const { setDisableHotkeys } = this.props;
    this.setState({ focused: false });
    setDisableHotkeys(false);
  }

  processSearch(e) {
    const { listingsFilter, pushUrl, location } = this.props;
    const { listType, target, user } = listingsFilter;
    const q = e.target.value;
    if (!q) {
      return;
    }

    if (e.keyCode === 13) {
      const currentSearch = queryString.parse(location.search);
      const qs = { q };

      if (currentSearch.sort !== undefined) {
        qs.sort = currentSearch.sort.match(/^(relevance|new|top)$/)
          ? currentSearch.sort
          : 'relevance';

        qs.t = currentSearch.t || null;
      } else {
        qs.sort = 'relevance';
      }

      let url = '';
      if (!e.shiftKey) {
        if (listType === 'r' && target !== 'mine') {
          url = `/r/${target}`;
        } else if (listType === 'm' && user !== 'me') {
          url = `/user/${target}/m/${target}`;
        } else if (listType === 'm' && user === 'me') {
          url = `/me/m/${target}`;
        }
      }

      const qsString = queryString.stringify(qs);
      url += `/search?${qsString}`;

      pushUrl(url);
      this.searchInput.current.blur();
    }
  }

  render() {
    const { listingsFilter, location } = this.props;
    const { focused } = this.state;

    let placeholder = 'search Reddit';
    let global = true;

    if (listingsFilter.listType === 'r' && listingsFilter.target !== 'mine') {
      placeholder = `search in /r/${listingsFilter.target}`;
      global = false;
    } else if (listingsFilter.listType === 'm') {
      placeholder = `search in /m/${listingsFilter.target}`;
      global = false;
    }

    const title =
      listingsFilter.listType === 'r' || listingsFilter.listType === 'm'
        ? 'Press shift-return to search all of reddit'
        : '';

    const currentSearch = queryString.parse(location.search);

    return (
      <div id="search">
        <input
          type="text"
          className="form-control form-control-dark form-control-sm w-100"
          id="search-reddit"
          onFocus={this.focusSearch}
          onBlur={this.blurSearch}
          onKeyUp={this.processSearch}
          placeholder={placeholder}
          title={title}
          defaultValue={currentSearch.q}
          ref={this.searchInput}
        />
        {focused && !global && (
          <div className="searchToolTip small p-1 mt-1">
            <div>shift-return to seach everywhere</div>
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
  setDisableHotkeys: PropTypes.func.isRequired,
  disableHotkeys: PropTypes.bool.isRequired,
};

Search.defaultProps = {};

const mapStateToProps = (state, ownProps) => ({
  location: state.router.location,
  listingsFilter: state.listingsFilter,
  disableHotkeys: state.disableHotKeys,
});

const mapDispatchToProps = dispatch => ({
  pushUrl: url => dispatch(push(url)),
  setDisableHotkeys: disable => dispatch(disableHotKeys(disable)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Search);
