import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ListingsSubHeader from './ListingsSubHeader';
import ListingsMultiHeader from './ListingsMultiHeader';

const ListingsHeader = ({ filter }) => {
  const { listType } = filter;

  let header;
  if (listType === 'm') {
    header = <ListingsMultiHeader />;
  } else {
    header = <ListingsSubHeader />;
  }

  return <div className="list-group-item listings-header">{header}</div>;
};

ListingsHeader.propTypes = {
  filter: PropTypes.object.isRequired,
};

ListingsHeader.defaultProps = {};

const mapStateToProps = state => ({
  filter: state.listingsFilter,
});

export default connect(
  mapStateToProps,
  {}
)(ListingsHeader);
