import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  subredditsFilter,
  subredditsFilterActive,
} from '../redux/actions/subreddits';
import { disableHotKeys } from '../redux/actions/misc';

class FilterReddits extends React.Component {
  constructor(props) {
    super(props);
    this.clearSearch = this.clearSearch.bind(this);
    this.disableHotkeys = this.disableHotkeys.bind(this);
    this.enableHotkeys = this.enableHotkeys.bind(this);
    this.filterReddits = this.filterReddits.bind(this);
    this.handleFilterHotkey = this.handleFilterHotkey.bind(this);
  }

  componentDidMount() {
    jQuery(document).keypress(this.handleFilterHotkey);
  }

  handleFilterHotkey(event) {
    const { disableHotkeys, setFilter } = this.props;
    const pressedKey = event.key;

    if (!disableHotkeys) {
      switch (pressedKey) {
        case 'F':
          jQuery('#subreddit-filter').focus();
          setFilter('');
          event.preventDefault();
          break;
        default:
          break;
      }
    }
  }

  /**
   * Set the subreddit filter data.
   * @param item
   * @returns {void|*}
   */
  filterReddits(item) {
    const { setFilter } = this.props;
    const queryText = item.target.value;
    if (!queryText) {
      return setFilter('');
    }
    return setFilter(queryText);
  }

  /**
   * Helper to clear the filter textbox
   */
  clearSearch() {
    const { setFilter } = this.props;
    setFilter('');
  }

  /**
   * Disable the hotkeys when using the filter.
   */
  disableHotkeys() {
    const { setDisableHotkeys, setFilterActive } = this.props;
    setFilterActive(true);
    setDisableHotkeys(true);
  }

  /**
   * Enable the hotkeys when not in a textbox.
   */
  enableHotkeys() {
    const { setDisableHotkeys, setFilterActive } = this.props;
    setFilterActive(false);
    setDisableHotkeys(false);
  }

  render() {
    const { filterText } = this.props;

    return (
      <div className="filterText w-100 d-flex m-0 p-2">
        <input
          type="search"
          className="form-control form-control-dark form-control-sm w-100"
          onChange={this.filterReddits}
          onFocus={this.disableHotkeys}
          onBlur={this.enableHotkeys}
          placeholder="Filter"
          id="subreddit-filter"
          value={filterText}
        />
        {filterText && (
          <i
            className="far fa-times-circle form-control-clear"
            onClick={this.clearSearch}
            aria-hidden
            role="button"
            aria-label="Clear Search Box"
          />
        )}
      </div>
    );
  }
}

FilterReddits.propTypes = {
  setFilter: PropTypes.func.isRequired,
  setDisableHotkeys: PropTypes.func.isRequired,
  setFilterActive: PropTypes.func.isRequired,
  filterText: PropTypes.string.isRequired,
  disableHotkeys: PropTypes.bool.isRequired,
};

FilterReddits.defaultProps = {};

const mapStateToProps = state => ({
  filterText: state.subredditsFilter,
  disableHotkeys: state.disableHotKeys,
});

const mapDispatchToProps = dispatch => ({
  setDisableHotkeys: disable => dispatch(disableHotKeys(disable)),
  setFilter: filter => dispatch(subredditsFilter(filter)),
  setFilterActive: active => dispatch(subredditsFilterActive(active)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FilterReddits);
