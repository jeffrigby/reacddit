import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import { subredditsFilter } from '../../redux/actions/subreddits';
import { hotkeyStatus } from '../../common';

class FilterReddits extends React.Component {
  filterInput = React.createRef();

  componentDidMount() {
    document.addEventListener('keydown', this.handleFilterHotkey);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleFilterHotkey);
  }

  handleFilterHotkey = (event) => {
    const { filter, setFilter, goto } = this.props;
    const pressedKey = event.key;
    const subLength = document.querySelectorAll(
      '#sidebar-subreddits .nav-item a'
    ).length;

    if (hotkeyStatus()) {
      switch (pressedKey) {
        case 'F':
        case 'q':
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
          const trigger = document.querySelector(
            '#sidebar-subreddits .nav-item a.trigger'
          );
          if (trigger && trigger.pathname) {
            goto(trigger.pathname);
          }
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
  filterReddits = (item) => {
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
  setFocus = () => {
    document.getElementById('aside-content').scrollTop = 0;
    const { setFilter } = this.props;
    const active = true;
    this.filterInput.current.select();
    setFilter({ active });
    // document.body.classList.add('filter-active');
  };

  /**
   * Enable the hotkeys when not in a textbox.
   */
  setBlur = () => {
    const { setFilter } = this.props;
    const active = false;
    const activeIndex = 0;
    setFilter({ active, activeIndex });
    // document.body.classList.remove('filter-active');
  };

  render() {
    const { filter } = this.props;
    return (
      <div className="filterText w-100 d-flex m-0 p-2">
        <input
          type="text"
          className="form-control form-control-dark form-control-sm w-100"
          onChange={this.filterReddits}
          onFocus={this.setFocus}
          onBlur={this.setBlur}
          placeholder="Filter"
          id="subreddit-filter"
          value={filter.filterText}
          ref={this.filterInput}
        />
        {(filter.active || filter.filterText) && (
          <i
            className="far fa-times-circle form-control-clear"
            onClick={this.clearSearch}
            aria-hidden
            role="button"
            aria-label="Clear Filter Box"
          />
        )}
      </div>
    );
  }
}

FilterReddits.propTypes = {
  setFilter: PropTypes.func.isRequired,
  goto: PropTypes.func.isRequired,
  filter: PropTypes.object.isRequired,
};

FilterReddits.defaultProps = {};

const mapStateToProps = (state) => ({
  filter: state.subredditsFilter,
});

export default connect(mapStateToProps, {
  setFilter: subredditsFilter,
  goto: push,
})(FilterReddits);
