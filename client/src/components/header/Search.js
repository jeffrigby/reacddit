import React from 'react';
import PropTypes from 'prop-types';
import { push } from 'connected-react-router';
import { connect } from 'react-redux';
import { disableHotKeys } from '../../redux/actions/misc';

const queryString = require('query-string');

class Search extends React.PureComponent {
  searchInput = React.createRef();

  searchInputParent = React.createRef();

  state = {
    focused: false,
    search: '',
    qs: this.props.location.search,
    pathname: this.props.location.pathname,
  };

  componentDidMount() {
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

  handleChange = event => {
    this.setState({ search: event.target.value });
  };

  handleSearchHotkey = event => {
    const { disableHotkeys } = this.props;
    const { focused } = this.state;
    const pressedKey = event.key;

    if (!disableHotkeys) {
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
    const { setDisableHotkeys } = this.props;
    this.setState({ focused: true });
    document.body.classList.add('search-active');
    setDisableHotkeys(true);
  };

  blurSearch = () => {
    const { setDisableHotkeys } = this.props;
    this.setState({ focused: false });
    setDisableHotkeys(false);
    // @TODO I have no idea why this is needed. Doesn't work w/o it.
    setTimeout(() => {
      document.body.classList.remove('search-active');
    }, 250);
  };

  clearSearch = () => {
    this.setState({ search: '' });
    this.searchInput.current.blur();
  };

  processSearch = e => {
    const { listingsFilter, pushUrl, location } = this.props;
    const { listType, target, user, multi } = listingsFilter;
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
        if (
          (listType === 'r' || (listType === 's' && !multi)) &&
          target !== 'mine'
        ) {
          url = `/r/${target}`;
        } else if (
          (listType === 'm' || (listType === 's' && multi)) &&
          user !== 'me'
        ) {
          url = `/user/${target}/m/${target}`;
        } else if (
          (listType === 'm' || (listType === 's' && multi)) &&
          user === 'me'
        ) {
          url = `/me/m/${target}`;
        }
      }

      const qsString = queryString.stringify(qs);
      url += `/search?${qsString}`;

      pushUrl(url);
      this.searchInput.current.blur();
    }
  };

  render() {
    const { listingsFilter } = this.props;
    const { focused, search } = this.state;

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

    const searchClassName = focused ? 'search-focused m-0' : 'm-0';

    return (
      <div id="search" ref={this.searchInputParent} className={searchClassName}>
        <input
          type="text"
          className="form-control form-control-dark form-control-sm w-100"
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
