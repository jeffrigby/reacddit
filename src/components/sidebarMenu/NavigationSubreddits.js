import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as subredditsActions from '../../redux/actions/subreddits';

// const queryString = require('query-string');

class NavigationSubReddits extends React.Component {
  constructor(props) {
    super(props);
    this.reloadSubredditsClick = this.reloadSubredditsClick.bind(this);
  }

  componentDidMount() {}

  /**
   * Force reload all of the subreddits.
   */
  reloadSubreddits() {
    const { fetchSubreddits, redditBearer } = this.props;
    const where = redditBearer.status === 'anon' ? 'default' : 'subscriber';
    fetchSubreddits(true, where);
  }

  /**
   * Handle the click on the reload subreddits
   * @TODO why is this separate?
   * @param e
   */
  reloadSubredditsClick(e) {
    e.preventDefault();
    this.reloadSubreddits();
  }

  isSubredditFiltered(subreddit) {
    const { subredditsFilter } = this.props;
    const filterText = subredditsFilter.filterText.toLowerCase();
    // No filter defined

    if (!filterText) {
      return false;
    }

    if (subreddit.display_name.toLowerCase().indexOf(filterText) !== -1) {
      return false;
    }

    return true;
  }

  render() {
    const content = <div>Subreddits Here</div>;
    return (
      <div id="sidebar-subreddits">
        <div className="sidebar-heading d-flex text-muted">
          <span className="mr-auto">Subreddits</span>
          <span>
            <button
              className="btn btn-link btn-sm m-0 p-0 text-muted"
              onClick={this.reloadSubredditsClick}
              type="button"
            >
              <i className="fas fa-sync-alt" />
            </button>
          </span>
        </div>
        {content}
      </div>
    );
  }
}

NavigationSubReddits.propTypes = {
  fetchSubreddits: PropTypes.func.isRequired,
  redditBearer: PropTypes.object.isRequired,
  subredditsFilter: PropTypes.object.isRequired,
};

NavigationSubReddits.defaultProps = {};

const mapStateToProps = state => ({
  redditBearer: state.redditBearer,
  subredditsFilter: state.subredditsFilter,
});

const mapDispatchToProps = dispatch => ({
  fetchSubreddits: (reset, where) =>
    dispatch(subredditsActions.subredditsFetchData(reset, where)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NavigationSubReddits);
