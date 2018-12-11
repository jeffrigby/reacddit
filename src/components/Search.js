import React from 'react';
import PropTypes from 'prop-types';
import { push } from 'connected-react-router';
import { connect } from 'react-redux';
import { disableHotKeys } from '../redux/actions/misc';

const queryString = require('query-string');

/**
 * Import all actions as an object.
 */

class Search extends React.Component {
  constructor(props) {
    super(props);
    this.enableHotkeys = this.enableHotkeys.bind(this);
    this.disableHotkeys = this.disableHotkeys.bind(this);
    this.processSearch = this.processSearch.bind(this);
  }

  disableHotkeys() {
    const { setDisableHotkeys } = this.props;
    setDisableHotkeys(true);
  }

  enableHotkeys() {
    const { setDisableHotkeys } = this.props;
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
        qs.sort = 'relavance';
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
    }
  }

  render() {
    const { listingsFilter, location } = this.props;

    let placeholder = 'search Reddit';
    if (listingsFilter.listType === 'r' && listingsFilter.target !== 'mine') {
      placeholder = `search in /r/${listingsFilter.target}`;
    } else if (listingsFilter.listType === 'm') {
      placeholder = `search in /m/${listingsFilter.target}`;
    }

    const title =
      listingsFilter.listType === 'r' || listingsFilter.listType === 'm'
        ? 'Press shift-entry to search all of reddit'
        : '';

    const currentSearch = queryString.parse(location.search);

    return (
      <div
        style={{
          display: 'inline-block',
          width: '250px',
          marginRight: '10px',
          marginBottom: 0,
        }}
        className="form-group form-group-sm"
      >
        <input
          type="text"
          className="form-control"
          onFocus={this.disableHotkeys}
          onBlur={this.enableHotkeys}
          onKeyUp={this.processSearch}
          placeholder={placeholder}
          title={title}
          defaultValue={currentSearch.q}
        />
      </div>
    );
  }
}

Search.propTypes = {
  listingsFilter: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  pushUrl: PropTypes.func.isRequired,
  setDisableHotkeys: PropTypes.func.isRequired,
};

Search.defaultProps = {};

const mapStateToProps = (state, ownProps) => ({
  location: state.router.location,
  listingsFilter: state.listingsFilter,
});

const mapDispatchToProps = dispatch => ({
  pushUrl: url => dispatch(push(url)),
  setDisableHotkeys: disable => dispatch(disableHotKeys(disable)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Search);
