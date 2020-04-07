import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const ListingsHeaderError = ({ filter }) => {
  const { target } = filter;

  return (
    <>
      <div className="d-flex">
        <div className="mr-auto title-contrainer">
          <h5 className="m-0 p-0 w-100">Error Loading {target}</h5>
        </div>
      </div>
    </>
  );
};

ListingsHeaderError.propTypes = {
  filter: PropTypes.object.isRequired,
};

ListingsHeaderError.defaultProps = {};

const mapStateToProps = (state) => ({
  filter: state.listingsFilter,
});

export default connect(mapStateToProps, {})(ListingsHeaderError);
