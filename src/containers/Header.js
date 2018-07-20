import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import SubredditActions from './SubredditActions';

class Header extends React.Component {
  static showSubs() {
    jQuery('.row-offcanvas').toggleClass('active');
  }

  render() {
    const { listingsTarget } = this.props;
    const target = listingsTarget === 'mine' ? 'RedditJS' : listingsTarget;
    return (
      <div className="navbar navbar-inverse navbar-fixed-top" id="header">
        <div id="header-sidebar">
          <div className="col-md-12">
            <h5 className="header-target">{target}</h5>
          </div>
        </div>
        <div id="header-main">
          <div className="col-md-12 col-lg-9">
            <div className="navbar-header">
              <SubredditActions />
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
  listingsTarget: PropTypes.string,
};

Header.defaultProps = {
  listingsTarget: 'mine',
};

const mapStateToProps = state => ({
  listingsTarget: state.listingsTarget,
});

const mapDispatchToProps = dispatch => ({
  // onSortTopChange: sortTop => dispatch(storeSortTop(sortTop)),
  // onSortChange: sort => dispatch(storeSort(sort))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Header);
