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
    this.filterInput = React.createRef();
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleFilterHotkey);
  }

  handleFilterHotkey(event) {
    const { disableHotkeys, filter, setFilter } = this.props;
    const pressedKey = event.key;

    if (!disableHotkeys) {
      switch (pressedKey) {
        case 'F':
          this.filterInput.current.focus();
          this.clearSearch();
          event.preventDefault();
          break;
        default:
          break;
      }
    } else if (filter.active) {
      // Filter is active
      switch (pressedKey) {
        case 'ArrowUp': {
          const activeIndex = filter.activeIndex - 1;
          if (activeIndex >= 0) {
            setFilter({ activeIndex });
          }
          event.preventDefault();
          break;
        }
        case 'ArrowDown': {
          const activeIndex = filter.activeIndex + 1;
          setFilter({ activeIndex });
          event.preventDefault();
          break;
        }
        case 'Escape':
          this.filterInput.current.blur();
          this.clearSearch();
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
    const filterText = item.target.value;
    if (!filterText) {
      return setFilter('');
    }
    return setFilter({ filterText });
  }

  /**
   * Helper to clear the filter textbox
   */
  clearSearch() {
    const { setFilter } = this.props;
    const filterText = '';
    const activeIndex = 0;
    setFilter({ filterText, activeIndex });
  }

  /**
   * Disable the hotkeys when using the filter.
   */
  disableHotkeys() {
    const { setDisableHotkeys, setFilter } = this.props;
    const active = true;
    setFilter({ active });
    setDisableHotkeys(true);
  }

  /**
   * Enable the hotkeys when not in a textbox.
   */
  enableHotkeys() {
    const { setDisableHotkeys, setFilter } = this.props;
    const active = false;
    setFilter({ active });
    setDisableHotkeys(false);
  }

  render() {
    const { filter } = this.props;

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
          value={filter.filterText}
          ref={this.filterInput}
        />
        {filter.filterText && (
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
  filter: PropTypes.object.isRequired,
  disableHotkeys: PropTypes.bool.isRequired,
};

FilterReddits.defaultProps = {};

const mapStateToProps = state => ({
  filter: state.subredditsFilter,
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
