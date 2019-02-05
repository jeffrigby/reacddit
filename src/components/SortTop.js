import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

const queryString = require('query-string');

/**
 * Import all actions as an object.
 */
const SortTop = ({ listingFilter, location }) => {
  const { sort, target, listType } = listingFilter;
  const { search, pathname } = location;

  if (
    !sort.match(/^(top|controversial|relavance)$/) ||
    target === 'friends' ||
    listType === 'u'
  ) {
    return null;
  }

  const sortArgs = {
    hour: 'past hour',
    day: 'past 24 hour',
    week: 'past week',
    month: 'past month',
    year: 'past year',
    all: 'all time',
  };

  const searchParsed = queryString.parse(search);
  const sortValue = sortArgs[searchParsed.t] || 'month';

  const links = [];
  Object.keys(sortArgs).forEach((key, i) => {
    const newSearch = queryString.stringify({ ...searchParsed, t: key });
    const url =
      target === 'mine' && listType === 'r'
        ? `/${sort}?${newSearch}`
        : `${pathname}?${newSearch}`;
    const linkString = sortArgs[key];
    const linkKey = `sortTop${key}`;
    links.push(
      <Link to={url} key={linkKey} className="dropdown-item">
        {linkString}
      </Link>
    );
  });

  return (
    <div className="btn-group">
      <button
        type="button"
        className="btn btn-sm dropdown-toggle"
        data-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false"
      >
        <i className="fas fa-clock" /> {sortValue}
      </button>
      <div className="dropdown-menu dropdown-menu-right">{links}</div>
    </div>
  );
};

SortTop.propTypes = {
  location: PropTypes.object.isRequired,
  listingFilter: PropTypes.object.isRequired,
};

SortTop.defaultProps = {};

const mapStateToProps = state => ({
  location: state.router.location,
  listingFilter: state.listingsFilter,
});

const mapDispatchToProps = dispatch => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SortTop);
