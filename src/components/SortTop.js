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
    const liKey = `sortTop${key}`;
    links.push(
      <li key={liKey}>
        <Link to={url}>{linkString}</Link>
      </li>
    );
  });

  return (
    <div style={{ display: 'inline-block' }}>
      <button
        className="btn btn-default btn-sm dropdown-toggle"
        type="button"
        id="dropdownMenu1"
        data-toggle="dropdown"
        aria-haspopup
        aria-expanded
      >
        <span className="glyphicon glyphicon-time" /> {sortValue}{' '}
        <span className="caret" />
      </button>
      <ul className="dropdown-menu" aria-labelledby="dropdownMenu1">
        {links}
      </ul>
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
