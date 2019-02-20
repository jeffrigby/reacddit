import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as subredditsActions from '../../redux/actions/subreddits';
import isEmpty from 'lodash.isempty';

// const queryString = require('query-string');

class NavigationSubReddits extends React.Component {
  constructor(props) {
    super(props);
    this.reloadSubredditsClick = this.reloadSubredditsClick.bind(this);
    this.handleSubredditHotkey = this.handleSubredditHotkey.bind(this);
  }

  componentDidMount() {
    const { fetchSubreddits, redditBearer } = this.props;
    document.addEventListener('keydown', this.handleSubredditHotkey);
    const where = redditBearer.status === 'anon' ? 'default' : 'subscriber';
    fetchSubreddits(false, where);
  }

  /**
   * Configure the navigation hotkeys.
   * @param event
   */
  handleSubredditHotkey(event) {
    const { disableHotkeys } = this.props;
    const pressedKey = event.key;

    if (!disableHotkeys) {
      switch (pressedKey) {
        case '®': // alt-r (option)
          this.reloadSubreddits();
          break;
        default:
          break;
      }
    }
  }

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
    const { subreddits } = this.props;

    let content;
    if (subreddits.status === 'loading' || subreddits.status === 'unloaded') {
      content = (
        <div className="alert alert-info" id="subreddits-loading" role="alert">
          <i className="fas fa-spinner fa-spin" /> Loading Subreddits
        </div>
      );
    } else if (subreddits.status === 'error') {
      content = (
        <div
          className="alert alert-danger small"
          id="subreddits-load-error"
          role="alert"
        >
          <i className="fas fa-exclamation-triangle" /> Error loading subreddits
          <br />
          <button
            className="astext"
            onClick={this.reloadSubredditsClick}
            type="button"
          >
            try again.
          </button>
        </div>
      );
    } else if (subreddits.status === 'loaded') {
      content = <div>Subreddits Here</div>;
    }

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
  disableHotkeys: PropTypes.bool.isRequired,
  subreddits: PropTypes.object.isRequired,
};

NavigationSubReddits.defaultProps = {};

const mapStateToProps = state => ({
  redditBearer: state.redditBearer,
  subredditsFilter: state.subredditsFilter,
  disableHotkeys: state.disableHotKeys,
  subreddits: state.subreddits,
});

const mapDispatchToProps = dispatch => ({
  fetchSubreddits: (reset, where) =>
    dispatch(subredditsActions.subredditsFetchData(reset, where)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NavigationSubReddits);
