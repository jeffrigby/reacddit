import React from 'react';
import PropTypes from 'prop-types';
import _isEmpty from 'lodash/isEmpty';
import { NavLink } from 'react-router-dom';
import { push } from 'connected-react-router';
import { connect } from 'react-redux';

const queryString = require('query-string');

class Sort extends React.Component {
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
    relevance: 'fas fa-bullseye',
    hot: 'fas fa-fire-alt',
    best: 'fas fa-award',
    rising: 'fas fa-chart-line',
    new: 'fas fa-clock',
    controversial: 'fas fa-bolt',
    top: 'fas fa-sort-amount-up',
    comments: 'fas fa-comment',
  };

  componentDidMount() {
    document.addEventListener('keydown', this.handleSortHotkey);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleSortHotkey);
  }

  handleSortHotkey = event => {
    const { disableHotKeys, listingsFilter, gotoLink } = this.props;
    if (!disableHotKeys && listingsFilter.target !== 'friends') {
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

    let link;
    if (listType === 'r') {
      link = target === 'mine' ? `/${sort}` : `/r/${target}/${sort}`;
    } else if (listType === 'm' && !me) {
      link = `/user/${target}/m${userType}/${sort}`;
    } else if (listType === 'm' && me) {
      link = `/me/m/${target}/${sort}`;
    } else if (listType === 's') {
      // add the sort query string
      qs.sort = sort;

      if (target === 'mine') {
        link = `/search${userType}`;
      } else {
        link = `/r/${target}/search${userType}`;
      }
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

  renderTimeSubLinks = sort => {
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
          <span className="sort-title pl-3">{linkString}</span>
        </NavLink>
      );
    });

    return links;
  };

  getIcon = sort => {
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
        const subLinksRendered = !_isEmpty(subLinks) ? (
          <div className="subsortlinks">{subLinks}</div>
        ) : null;

        links.push(
          <div key={sortName} className="small">
            <NavLink
              to={this.genLink(sortName)}
              className="dropdown-item d-flex"
              activeClassName="sort-active"
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
    const { listingsFilter, subreddits, search } = this.props;
    const { listType, sort, target } = listingsFilter;
    if (
      target === 'friends' ||
      listType === 'u' ||
      listType === 'duplicates' ||
      subreddits.status !== 'loaded'
    ) {
      return false;
    }
    let currentSort;
    if (listType === 'r' || listType === 'm') {
      currentSort = sort || 'hot';
    } else if (listType === 's') {
      const searchParsed = queryString.parse(search);
      currentSort = searchParsed.sort || 'relevance';
    }

    const searchParsed = queryString.parse(search);
    const timeSearch = searchParsed.t ? ` > ${searchParsed.t}` : '';
    const icon = this.getIcon(currentSort);

    const links = this.renderLinks();

    return (
      <div className="btn-group sort-menu">
        <button
          type="button"
          className="btn btn-secondary btn-sm form-control-sm"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
          aria-label="Sort"
        >
          {icon} {timeSearch}
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
  subreddits: state.subreddits,
  disableHotKeys: state.disableHotKeys,
});

export default connect(
  mapStateToProps,
  { gotoLink: push }
)(Sort);
