import React, { PropTypes } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

/**
 * Import all actions as an object.
 */

class Sort extends React.Component {
  render() {
    if (this.props.listingsFilter.target === 'friends') {
      return false;
    }
    const currentSort = this.props.listingsFilter.sort ? this.props.listingsFilter.sort : 'hot';
    return (
      <div style={{ display: 'inline-block' }}>
        <button
          type="button"
          className="btn btn-default btn-xs dropdown-toggle"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
        >
          <span className="glyphicon glyphicon-time" />
          <span className="dropdownActive"> {currentSort} </span>
          <span className="caret" />
        </button>
        <ul className="dropdown-menu" aria-labelledby="sortDropdownMenu">
          <li><Link to={`/r/${this.props.listingsFilter.target}/hot`}>hot</Link></li>
          <li><Link to={`/r/${this.props.listingsFilter.target}/new`}>new</Link></li>
          <li><Link to={`/r/${this.props.listingsFilter.target}/top`}>top</Link></li>
          <li><Link to={`/r/${this.props.listingsFilter.target}/rising`}>rising</Link></li>
          <li><Link to={`/r/${this.props.listingsFilter.target}/controversial`}>controversial</Link></li>
        </ul>
      </div>
    );
  }
}

Sort.propTypes = {
  listingsFilter: PropTypes.object.isRequired,
};

Sort.defaultProps = {
};


const mapStateToProps = (state, ownProps) => ({
  listingsFilter: state.listingsFilter,
});

const mapDispatchToProps = dispatch => ({
  // setSort: sort => dispatch(listingsSort(sort)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Sort);
