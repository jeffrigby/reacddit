import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { push } from 'connected-react-router';
import { connect } from 'react-redux';

const queryString = require('query-string');

/**
 * Import all actions as an object.
 */

class Sort extends React.Component {
  constructor(props) {
    super(props);
    this.handleSortHotkey = this.handleSortHotkey.bind(this);
    this.genLink = this.genLink.bind(this);
    this.renderLinks = this.renderLinks.bind(this);
    this.catsSearch = {
      R: 'relevance',
      T: 'top',
      N: 'new',
    };
    this.catsReddits = {
      B: 'best',
      H: 'hot',
      T: 'top',
      N: 'new',
      C: 'controversial',
      R: 'rising',
    };

    this.catsMultis = {
      H: 'hot',
      T: 'top',
      N: 'new',
      C: 'controversial',
      R: 'rising',
    };

    this.lastKeyPressed = null;
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleSortHotkey);
  }

  handleSortHotkey(event) {
    const { disableHotKeys, listingsFilter, ...props } = this.props;
    if (!disableHotKeys && listingsFilter.target !== 'friends') {
      const pressedKey = event.key;
      switch (pressedKey) {
        case 'H': {
          props.push(this.genLink('hot'));
          break;
        }
        case 'B': {
          props.push(this.genLink('best'));
          break;
        }
        case 'N': {
          props.push(this.genLink('new'));
          break;
        }
        case 'C': {
          props.push(this.genLink('controversial'));
          break;
        }
        case 'R': {
          props.push(this.genLink('rising'));
          break;
        }
        case 'T': {
          props.push(this.genLink('top'));
          break;
        }
        default:
          break;
      }
      this.lastKeyPressed = pressedKey;
    } else {
      this.lastKeyPressed = '';
    }
  }

  genLink(sort) {
    const { listingsFilter, location } = this.props;
    const { listType, target, userType, me } = listingsFilter;
    let link;
    if (listType === 'r') {
      link = `/r/${target}/${sort}`;
    } else if (listType === 'm' && !me) {
      link = `/user/${target}/m/${userType}/${sort}`;
    } else if (listType === 'm' && me) {
      link = `/me/m/${userType}/${sort}`;
    } else if (listType === 's') {
      // Get the query string
      const qs = queryString.parse(location.search);
      const querystring = queryString.stringify({
        ...qs,
        sort,
      });

      if (target === 'mine') {
        link = `/search${userType}?${querystring}`;
      } else {
        link = `/r/${target}/search${userType}?${querystring}`;
      }
    }
    return link;
  }

  renderLinks() {
    const { listingsFilter } = this.props;
    let links2render = {};
    if (listingsFilter.listType === 'r') {
      links2render = { ...this.catsReddits };
    } else if (listingsFilter.listType === 's') {
      links2render = { ...this.catsSearch };
    } else if (listingsFilter.listType === 'm') {
      links2render = { ...this.catsMultis };
    }

    const links = [];

    Object.keys(links2render).forEach((key, index) => {
      if (Object.prototype.hasOwnProperty.call(links2render, key)) {
        const sortName = links2render[key];
        links.push(
          <Link
            to={this.genLink(sortName)}
            className="dropdown-item d-flex"
            key={sortName}
          >
            <div className="mr-auto pr-2">{sortName}</div>{' '}
            <span className="menu-shortcut">&#x21E7;{key}</span>
          </Link>
        );
      }
    });

    return links;
  }

  render() {
    const { listingsFilter, subreddits, location } = this.props;
    if (
      listingsFilter.target === 'friends' ||
      listingsFilter.listType === 'u' ||
      subreddits.status !== 'loaded'
    ) {
      return false;
    }
    let currentSort;
    if (listingsFilter.listType === 'r' || listingsFilter.listType === 'm') {
      currentSort = listingsFilter.sort || 'hot';
    } else if (listingsFilter.listType === 's') {
      const search = queryString.parse(location.search);
      currentSort = search.sort || 'relevance';
    }

    const links = this.renderLinks();

    return (
      <div className="btn-group">
        <button
          type="button"
          className="btn btn-sm dropdown-toggle form-control-sm"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
        >
          <i className="fas fa-sort" /> {currentSort}
        </button>
        <div className="dropdown-menu dropdown-menu-right">{links}</div>
      </div>
    );
  }
}

Sort.propTypes = {
  listingsFilter: PropTypes.object.isRequired,
  subreddits: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  disableHotKeys: PropTypes.bool.isRequired,
  push: PropTypes.func.isRequired,
};

Sort.defaultProps = {};

const mapStateToProps = (state, ownProps) => ({
  location: state.router.location,
  listingsFilter: state.listingsFilter,
  subreddits: state.subreddits,
  disableHotKeys: state.disableHotKeys,
});

const mapDispatchToProps = dispatch => ({
  push: url => dispatch(push(url)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Sort);
