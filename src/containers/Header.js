import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import SubredditActions from './SubredditActions';

class Header extends React.Component {
  static showSubs() {
    jQuery('.row-offcanvas').toggleClass('active');
  }

  render() {
    const { listType, target } = this.props.listingsFilter;
    const title = target === 'mine' ? '' : `${listType}/${target}`;
    return (
      <div className="navbar navbar-inverse navbar-fixed-top" id="header">
        <div id="header-sidebar">
          <div className="col-md-12">
            <h5 className="header-target">RedditJS</h5>
          </div>
        </div>
        <div id="header-main">
          <div className="col-md-12 col-lg-9">
            <SubredditActions />
            <div className="navbar-header">
              <h5 className="header-target">{title}</h5>
              <button
                type="button"
                className="navbar-toggle"
                onClick={this.showSubs}
              >
                <span className="icon-bar" />
                <span className="icon-bar" />
                <span className="icon-bar" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Header.propTypes = {
  // params: PropTypes.object,
  // query: PropTypes.object,
  // accessToken: PropTypes.object,
  // location: PropTypes.object,
  listingsFilter: PropTypes.object.isRequired,
};

Header.defaultProps = {};

const mapStateToProps = state => ({
  listingsFilter: state.listingsFilter,
});

const mapDispatchToProps = dispatch => ({
  // onSortTopChange: sortTop => dispatch(storeSortTop(sortTop)),
  // onSortChange: sort => dispatch(storeSort(sort))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Header);
