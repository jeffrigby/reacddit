import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import _isEmpty from 'lodash/isEmpty';
import { NavLink } from 'react-router-dom';
import { push } from 'connected-react-router';
import { connect } from 'react-redux';
import { hotkeyStatus } from '../../common';

const queryString = require('query-string');

const catsSearch = {
  R: 'relevance',
  T: 'top',
  H: 'hot',
  N: 'new',
  C: 'comments',
};

const catsFront = {
  B: 'best',
  H: 'hot',
  T: 'top',
  N: 'new',
  C: 'controversial',
  R: 'rising',
};

const catsReddits = {
  H: 'hot',
  T: 'top',
  N: 'new',
  C: 'controversial',
  R: 'rising',
};

const catsMultis = {
  H: 'hot',
  T: 'top',
  N: 'new',
  C: 'controversial',
  R: 'rising',
};

const catsComments = {
  B: 'best',
  T: 'top',
  N: 'new',
  C: 'controversial',
  O: 'old',
  Q: 'qa',
};

const timeCats = {
  hour: 'past hour',
  day: 'past 24 hour',
  week: 'past week',
  month: 'past month',
  year: 'past year',
  all: 'all time',
};

const iconClasses = {
  relevance: 'fas fa-bullseye fa-fw',
  hot: 'fas fa-fire-alt fa-fw',
  best: 'fas fa-award fa-fw',
  rising: 'fas fa-chart-line fa-fw',
  new: 'fas fa-clock fa-fw',
  controversial: 'fas fa-bolt fa-fw',
  top: 'fas fa-sort-amount-up fa-fw',
  comments: 'fas fa-comment fa-fw',
  qa: 'fas fa-question-circle fa-fw',
  old: 'fas fa-history fa-fw',
};

const Sort = ({ listingsFilter, search, me, gotoLink }) => {
  const getIcon = (sort) => {
    return <i className={iconClasses[sort]} />;
  };

  const genLink = (sort, t) => {
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
    } else if (listType === 's' || listType === 'comments') {
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

  const handleSortHotkey = (event) => {
    const { target, listType } = listingsFilter;
    if (hotkeyStatus() && target !== 'friends') {
      const pressedKey = event.key;
      switch (pressedKey) {
        case 'H': {
          gotoLink(genLink('hot'));
          break;
        }
        case 'B': {
          gotoLink(genLink('best'));
          break;
        }
        case 'N': {
          gotoLink(genLink('new'));
          break;
        }
        case 'C': {
          gotoLink(genLink('controversial'));
          break;
        }
        case 'R': {
          gotoLink(genLink('rising'));
          break;
        }
        case 'T': {
          gotoLink(genLink('top'));
          break;
        }
        case 'Q': {
          if (listType === 'comments') {
            gotoLink(genLink('qa'));
          }
          break;
        }
        case 'O': {
          if (listType === 'comments') {
            gotoLink(genLink('old'));
          }
          break;
        }
        default:
          break;
      }
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleSortHotkey);
    return () => {
      document.removeEventListener('keydown', handleSortHotkey);
    };
  });

  const renderTimeSubLinks = (sort) => {
    const { listType, target } = listingsFilter;

    const qs = queryString.parse(search);

    if (
      !sort.match(/^(top|controversial|relevance)$/) ||
      target === 'friends' ||
      listType === 'u' ||
      listType === 'comments'
    ) {
      return null;
    }

    const links = [];
    Object.entries(timeCats).forEach(([t, linkString]) => {
      const url = genLink(sort, t);
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

  const renderLinks = () => {
    const { listType, target } = listingsFilter;
    let links2render = {};

    if (listType === 'r' && target === 'mine') {
      links2render = { ...catsFront };
    } else if (listType === 'r') {
      links2render = { ...catsReddits };
    } else if (listType === 's') {
      links2render = { ...catsSearch };
    } else if (listType === 'm') {
      links2render = { ...catsMultis };
    } else if (listType === 'comments') {
      links2render = { ...catsComments };
    }

    const links = [];

    Object.keys(links2render).forEach((key, index) => {
      if (Object.prototype.hasOwnProperty.call(links2render, key)) {
        const sortName = links2render[key];
        const subLinks = renderTimeSubLinks(sortName);
        const active = () => listingsFilter.sort === sortName;

        const subLinksRendered = !_isEmpty(subLinks) ? (
          <div className="subsortlinks">{subLinks}</div>
        ) : null;

        links.push(
          <div key={sortName}>
            <NavLink
              to={genLink(sortName)}
              className="dropdown-item d-flex small"
              activeClassName="active"
              isActive={active}
            >
              <div className="mr-auto pr-2 sort-title">
                {getIcon(sortName)} {sortName}
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
  } else if (listType === 'comments') {
    currentSort = sort || 'best';
  }

  const icon = getIcon(currentSort);
  const links = renderLinks();

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
};

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
