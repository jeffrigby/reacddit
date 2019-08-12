import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import isEqual from 'lodash/isEqual';
import ListingEntries from './ListingsEntries';
import { listingsFilter } from '../../redux/actions/listings';

const queryString = require('query-string');

const Listings = ({ location, match, filter, setFilter }) => {
  useEffect(() => {
    const qs = queryString.parse(location.search);
    const { listType, target, sort, user, userType, multi } = match.params;

    let listingType = match.params.listType || 'r';
    if (listType === 'user') listingType = 'u';
    if (listType === 'multi') listingType = 'm';
    if (listType === 'search') listingType = 's';
    // if (listType === 'duplicates') listingType = 'd';

    // Set to best if it's the front page.
    const getSort = sort || qs.sort || (target ? 'hot' : 'best');

    const newFilter = {
      sort: getSort,
      target: target || 'mine',
      multi: multi === 'm' || false,
      userType: userType || '',
      user: user || '',
      listType: listingType,
    };

    if (!isEqual(filter, newFilter)) {
      setFilter(newFilter);
    }
  }, [match, location, filter, setFilter]);

  return <ListingEntries location={location} match={match} />;
};

Listings.propTypes = {
  location: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  filter: PropTypes.object.isRequired,
  setFilter: PropTypes.func.isRequired,
};

Listings.defaultProps = {};

const mapStateToProps = state => ({
  filter: state.listingsFilter,
});

export default connect(
  mapStateToProps,
  {
    setFilter: listingsFilter,
  }
)(Listings);
