import React from 'react';
import PropTypes from 'prop-types';
import _isEmpty from 'lodash/isEmpty';
import { NavLink } from 'react-router-dom';
import { push } from 'connected-react-router';
import { connect } from 'react-redux';
import { hotkeyStatus } from '../../common';

const queryString = require('query-string');

class Sort extends React.PureComponent {
  catsSearch = {
    R: 'relevance',
    T: 'top',
    H: 'hot',
    N: 'new',
    C: 'comments',
  };

  catsFront = {
    B: 'best',
    H: 'hot',
    T: 'top',
    N: 'new',
    C: 'controversial',
    R: 'rising',
  };

  catsReddits = {
    H: 'hot',
    T: 'top',
    N: 'new',
    C: 'controversial',
    R: 'rising',
  };

  catsMultis = {
    H: 'hot',
    T: 'top',
    N: 'new',
    C: 'controversial',
    R: 'rising',
  };

  timeCats = {
    hour: 'past hour',
    day: 'past 24 hour',
    week: 'past week',
    month: 'past month',
    year: 'past year',
    all: 'all time',
  };

  iconClasses = {
    relevance: 'fas fa-bullseye fa-fw',
    hot: 'fas fa-fire-alt fa-fw',
    best: 'fas fa-award fa-fw',
    rising: 'fas fa-chart-line fa-fw',
    new: 'fas fa-clock fa-fw',
    controversial: 'fas fa-bolt fa-fw',
    top: 'fas fa-sort-amount-up fa-fw',
    comments: 'fas fa-comment fa-fw',
  };

  componentDidMount() {
    document.addEventListener('keydown', this.handleSortHotkey);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleSortHotkey);
  }

  handleSortHotkey = (event) => {
    const { listingsFilter, gotoLink } = this.props;
    if (hotkeyStatus() && listingsFilter.target !== 'friends') {
      const pressedKey = event.key;
      switch (pressedKey) {
        case 'H': {
          gotoLink(this.genLink('hot'));
          break;
        }
        case 'B': {
          gotoLink(this.genLink('best'));
          break;
        }
        case 'N': {
          gotoLink(this.genLink('new'));
          break;
        }
        case 'C': {
          gotoLink(this.genLink('controversial'));
          break;
        }
        case 'R': {
          gotoLink(this.genLink('rising'));
          break;
        }
        case 'T': {
          gotoLink(this.genLink('top'));
          break;
        }
        default:
          break;
      }
    }
  };

  genLink = (sort, t) => {
    const { listingsFilter, search, me } = this.props;
    const { listType, target, userType } = listingsFilter;
    const qs = queryString.parse(search);
    // add the timeline if requested.
    if (t) {
      qs.t = t;
    }

    let link = '';
    if (listType === 'r') {
      link = target === 'mine' ? `/${sort}` : `/r/${target}/${sort}`;
    } else if (listType === 'm' && !me) {
      link = `/user/${target}/m${userType}/${sort}`;
    } else if (listType === 'm' && me) {
      link = `/me/m/${target}/${sort}`;
    } else if (listType === 's') {
      // // no need to
      qs.sort = sort;
    }

    if (!_isEmpty(qs)) {
      if (!sort.match(/^(top|controversial|relevance)$/)) {
        delete qs.t;
      }
      const searchRendered = queryString.stringify(qs);
      link += `?${searchRendered}`;
    }

    return link;
  };

  renderTimeSubLinks = (sort) => {
    const { listingsFilter, search } = this.props;
    const { listType, target } = listingsFilter;

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
          <span className="sort-title pl-3 small">{linkString}</span>
        </NavLink>
      );
    });

    return links;
  };

  getIcon = (sort) => {
    return <i className={this.iconClasses[sort]} />;
  };

  renderLinks = () => {
    const { listingsFilter } = this.props;
    const { listType, target } = listingsFilter;
    let links2render = {};

    if (listType === 'r' && target === 'mine') {
      links2render = { ...this.catsFront };
    } else if (listType === 'r') {
      links2render = { ...this.catsReddits };
    } else if (listType === 's') {
      links2render = { ...this.catsSearch };
    } else if (listType === 'm') {
      links2render = { ...this.catsMultis };
    }

    const links = [];

    Object.keys(links2render).forEach((key, index) => {
      if (Object.prototype.hasOwnProperty.call(links2render, key)) {
        const sortName = links2render[key];
        const subLinks = this.renderTimeSubLinks(sortName);
        const active = () => listingsFilter.sort === sortName;

        const subLinksRendered = !_isEmpty(subLinks) ? (
          <div className="subsortlinks">{subLinks}</div>
        ) : null;

        links.push(
          <div key={sortName}>
            <NavLink
              to={this.genLink(sortName)}
              className="dropdown-item d-flex small"
              activeClassName="active"
              isActive={active}
            >
              <div className="mr-auto pr-2 sort-title">
                {this.getIcon(sortName)} {sortName}
              </div>{' '}
              <span className="menu-shortcut">&#x21E7;{key}</span>
            </NavLink>
            {subLinksRendered}
          </div>
        );
      }
    });

    return links;
  };

  render() {
    const { listingsFilter, search } = this.props;
    const { listType, sort, target } = listingsFilter;
    if (target === 'friends' || listType === 'u' || listType === 'duplicates') {
      return false;
    }
    let currentSort;
    if (listType === 'r' || listType === 'm') {
      currentSort = sort || 'hot';
    } else if (listType === 's') {
      const searchParsed = queryString.parse(search);
      currentSort = searchParsed.sort || 'relevance';
    }

    const icon = this.getIcon(currentSort);
    const links = this.renderLinks();

    return (
      <div className="btn-group sort-menu header-button">
        <button
          type="button"
          className="btn btn-secondary btn-sm form-control-sm dropdown-toggle sort-button"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
          aria-label="Sort"
        >
          {icon} {currentSort}
        </button>
        <div className="dropdown-menu dropdown-menu-right">{links}</div>
      </div>
    );
  }
}

Sort.propTypes = {
  listingsFilter: PropTypes.object.isRequired,
  search: PropTypes.string,
  gotoLink: PropTypes.func.isRequired,
  me: PropTypes.object.isRequired,
};

Sort.defaultProps = {
  search: '',
};

const mapStateToProps = (state, ownProps) => ({
  me: state.redditMe.me,
  search: state.router.location.search,
  listingsFilter: state.listingsFilter,
});

export default connect(mapStateToProps, { gotoLink: push })(Sort);
