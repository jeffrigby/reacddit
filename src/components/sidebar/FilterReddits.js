import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import { subredditsFilter } from '../../redux/actions/subreddits';
import { disableHotKeys } from '../../redux/actions/misc';

class FilterReddits extends React.Component {
  filterInput = React.createRef();

  componentDidMount() {
    document.addEventListener('keydown', this.handleFilterHotkey);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleFilterHotkey);
  }

  handleFilterHotkey = event => {
    const {
      disableHotkeys,
      filter,
      setFilter,
      subredditUrls,
      goto,
    } = this.props;
    const pressedKey = event.key;
    const subLength = subredditUrls.length;

    if (!disableHotkeys) {
      switch (pressedKey) {
        case 'F':
          this.filterInput.current.focus();
          document.body.classList.add('show-menu');
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
          if (subLength <= filter.activeIndex + 1) {
            break;
          }
          const activeIndex = filter.activeIndex + 1;
          setFilter({ activeIndex });
          event.preventDefault();
          break;
        }
        case 'Enter': {
          goto(subredditUrls[filter.activeIndex]);
          document.body.classList.remove('show-menu');
          this.filterInput.current.blur();
          break;
        }
        case 'Escape':
          this.filterInput.current.blur();
          document.body.classList.remove('show-menu');
          this.clearSearch();
          break;
        default:
          break;
      }
    }
  };

  /**
   * Set the subreddit filter data.
   * @param item
   * @returns {void|*}
   */
  filterReddits = item => {
    const { setFilter } = this.props;
    const filterText = item.target.value;
    // Always reset the index.
    const activeIndex = 0;
    if (!filterText) {
      return setFilter({ filterText: '', activeIndex });
    }
    return setFilter({ filterText, activeIndex });
  };

  /**
   * Helper to clear the filter textbox
   */
  clearSearch = () => {
    const { setFilter } = this.props;
    const filterText = '';
    const activeIndex = 0;
    setFilter({ filterText, activeIndex });
  };

  /**
   * Disable the hotkeys when using the filter.
   */
  disableHotkeys = () => {
    const { setDisableHotkeys, setFilter } = this.props;
    const active = true;
    setFilter({ active });
    setDisableHotkeys(true);
  };

  /**
   * Enable the hotkeys when not in a textbox.
   */
  enableHotkeys = () => {
    const { setDisableHotkeys, setFilter } = this.props;
    const active = false;
    const activeIndex = 0;
    setFilter({ active, activeIndex });
    setDisableHotkeys(false);
  };

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

const getFilteredUrls = (subreddits, filterText, sort, search) => {
  if (subreddits.status === 'unloaded' || subreddits.status === 'loading') {
    return [];
  }

  const filterLower = filterText.toLowerCase();

  let currentSort = sort || '';
  if (search) {
    currentSort += `?${search}`;
  }

  const urls = Object.keys(subreddits.subreddits)
    .filter(key => key.indexOf(filterLower) > -1)
    .reduce((arr, key) => {
      const { url } = subreddits.subreddits[key];
      arr.push(`${url}${currentSort}`);
      return arr;
    }, []);

  return urls;
};

FilterReddits.propTypes = {
  setFilter: PropTypes.func.isRequired,
  goto: PropTypes.func.isRequired,
  setDisableHotkeys: PropTypes.func.isRequired,
  filter: PropTypes.object.isRequired,
  disableHotkeys: PropTypes.bool.isRequired,
  subredditUrls: PropTypes.array.isRequired,
};

FilterReddits.defaultProps = {};

const mapStateToProps = state => ({
  filter: state.subredditsFilter,
  disableHotkeys: state.disableHotKeys,
  subredditUrls: getFilteredUrls(
    state.subreddits,
    state.subredditsFilter.filterText,
    state.listingsFilter.sort,
    state.router.location.search
  ),
});

export default connect(
  mapStateToProps,
  {
    setDisableHotkeys: disableHotKeys,
    setFilter: subredditsFilter,
    goto: push,
  }
)(FilterReddits);
