import React from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import { NavLink } from 'react-router-dom';
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
    this.renderTimeSubLinks = this.renderTimeSubLinks.bind(this);
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

    this.timeCats = {
      hour: 'past hour',
      day: 'past 24 hour',
      week: 'past week',
      month: 'past month',
      year: 'past year',
      all: 'all time',
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

  genLink(sort, t) {
    const { listingsFilter, search } = this.props;
    const { listType, target, userType, me } = listingsFilter;
    const qs = queryString.parse(search);
    // add the timeline if requested.
    if (t) {
      qs.t = t;
    }

    let link;
    if (listType === 'r') {
      link = target === 'mine' ? `/${sort}` : `/r/${target}/${sort}`;
    } else if (listType === 'm' && !me) {
      link = `/user/${target}/m/${userType}/${sort}`;
    } else if (listType === 'm' && me) {
      link = `/me/m/${userType}/${sort}`;
    } else if (listType === 's') {
      // add the sort query string
      qs.sort = sort;

      if (target === 'mine') {
        link = `/search${userType}`;
      } else {
        link = `/r/${target}/search${userType}`;
      }
    }

    if (!isEmpty(qs)) {
      const searchRendered = queryString.stringify(qs);
      link += `?${searchRendered}`;
    }

    return link;
  }

  renderTimeSubLinks(sort) {
    const { listingsFilter, search } = this.props;
    const { listType, target } = listingsFilter;

    console.log(search);
    const qs = queryString.parse(search);

    if (
      !sort.match(/^(top|controversial|relevance)$/) ||
      target === 'friends' ||
      listType === 'u'
    ) {
      return null;
    }

    const links = [];
    Object.entries(this.timeCats).forEach(([t, linkString]) => {
      const url = this.genLink(sort, t);
      const linkKey = `time${sort}${t}`;
      const active = () => listingsFilter.sort === sort && qs.t === t;

      links.push(
        <NavLink
          to={url}
          key={linkKey}
          className="dropdown-item"
          activeClassName="sort-active"
          isActive={active}
        >
          {linkString}
        </NavLink>
      );
    });

    return links;
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
        const subLinks = this.renderTimeSubLinks(sortName);
        const subLinksRendered = !isEmpty(subLinks) ? (
          <div className="subsortlinks pl-3">{subLinks}</div>
        ) : null;

        links.push(
          <div key={sortName} className="small">
            <NavLink
              to={this.genLink(sortName)}
              className="dropdown-item d-flex"
              activeClassName="sort-active"
            >
              <div className="mr-auto pr-2">{sortName}</div>{' '}
              <span className="menu-shortcut">&#x21E7;{key}</span>
            </NavLink>
            {subLinksRendered}
          </div>
        );
      }
    });

    return links;
  }

  render() {
    const { listingsFilter, subreddits, search } = this.props;
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
      const searchParsed = queryString.parse(search);
      currentSort = searchParsed.sort || 'relevance';
    }

    const links = this.renderLinks();

    return (
      <div className="btn-group sort-menu">
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
  search: PropTypes.string,
  disableHotKeys: PropTypes.bool.isRequired,
  push: PropTypes.func.isRequired,
};

Sort.defaultProps = {
  search: '',
};

const mapStateToProps = (state, ownProps) => ({
  search: state.router.location.search,
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
