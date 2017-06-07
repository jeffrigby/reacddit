import React, { PropTypes } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

/**
 * Import all actions as an object.
 */
class SortTop extends React.Component {
  render() {
    if (
      (this.props.listingFilter.sort !== 'top' && this.props.listingFilter.sort !== 'controversial') ||
      this.props.listingFilter.target === 'friends'
    ) {
      return null;
    }

    const sortArgs = {
      hour: 'past hour',
      day: 'past 24 hour',
      month: 'past month',
      year: 'past year',
      all: 'all time',
    };

    const sortValue = sortArgs[this.props.listingFilter.sortTop];
    const sort = this.props.listingFilter.sort;
    const target = this.props.listingFilter.target;
    const listType = this.props.listingFilter.listType;
    const url = `/${listType}/${target}/${sort}?t=`;

    return (
      <div style={{ display: 'inline-block' }}>
        <button
          className="btn btn-default btn-xs dropdown-toggle"
          type="button"
          id="dropdownMenu1"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="true"
        >
          <span className="glyphicon glyphicon-time" /> {sortValue} <span className="caret" />
        </button>
        <ul className="dropdown-menu" aria-labelledby="dropdownMenu1">
          <li><Link to={`${url}hour`}>past hour</Link></li>
          <li><Link to={`${url}day`}>past 24 hours</Link></li>
          <li><Link to={`${url}month`}>past month</Link></li>
          <li><Link to={`${url}year`}>past year</Link></li>
          <li><Link to={`${url}all`}>all time</Link></li>
        </ul>
      </div>
    );
  }
}

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
