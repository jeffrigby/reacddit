import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

/**
 * Import all actions as an object.
 */
const SortTop = ({ listingFilter }) => {
  if (
    (listingFilter.sort !== 'top' && listingFilter.sort !== 'controversial') ||
    listingFilter.target === 'friends'
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

  const sortValue = sortArgs[listingFilter.sortTop];
  const { sort, target, listType } = listingFilter;
  const url = `/${listType}/${target}/${sort}?t=`;

  return (
    <div style={{ display: 'inline-block' }}>
      <button
        className="btn btn-default btn-xs dropdown-toggle"
        type="button"
        id="dropdownMenu1"
        data-toggle="dropdown"
        aria-haspopup
        aria-expanded
      >
        <span className="glyphicon glyphicon-time" /> {sortValue} <span className="caret" />
      </button>
      <ul className="dropdown-menu" aria-labelledby="dropdownMenu1">
        <li><Link to={`${url}hour`}>past hour</Link></li>
        <li><Link to={`${url}day`}>past 24 hours</Link></li>
        <li><Link to={`${url}week`}>past week</Link></li>
        <li><Link to={`${url}month`}>past month</Link></li>
        <li><Link to={`${url}year`}>past year</Link></li>
        <li><Link to={`${url}all`}>all time</Link></li>
      </ul>
    </div>
  );
};


SortTop.propTypes = {
  listingFilter: PropTypes.object.isRequired,
};

SortTop.defaultProps = {
};

const mapStateToProps = state => ({
  listingFilter: state.listingsFilter,
});

const mapDispatchToProps = dispatch => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(SortTop);
