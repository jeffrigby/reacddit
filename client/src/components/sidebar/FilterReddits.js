import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { subredditsFilter } from '../../redux/actions/subreddits';
import { hotkeyStatus } from '../../common';

function FilterReddits() {
  const filterInput = useRef();
  const filter = useSelector((state) => state.subredditsFilter);
  const dispatch = useDispatch();
  const history = useHistory();

  /**
   * Set the subreddit filter data.
   * @param item
   * @returns {void|*}
   */
  const filterReddits = (item) => {
    const filterText = item.target.value;
    // Always reset the index.
    const activeIndex = 0;
    if (!filterText) {
      return dispatch(subredditsFilter({ filterText: '', activeIndex }));
    }
    return dispatch(subredditsFilter({ filterText, activeIndex }));
  };

  /**
   * Helper to clear the filter textbox
   */
  const clearSearch = () => {
    const filterText = '';
    const activeIndex = 0;
    dispatch(subredditsFilter({ filterText, activeIndex }));
  };

  /**
   * Disable the hotkeys when using the filter.
   */
  const setFocus = () => {
    document.getElementById('aside-content').scrollTop = 0;
    const active = true;
    filterInput.current.select();
    dispatch(subredditsFilter({ active }));
  };

  /**
   * Enable the hotkeys when not in a textbox.
   */
  const setBlur = () => {
    const active = false;
    const activeIndex = 0;
    dispatch(subredditsFilter({ active, activeIndex }));
  };

  const handleFilterHotkey = (event) => {
    const pressedKey = event.key;
    const subLength = document.querySelectorAll(
      '#sidebar-subreddits .nav-item a'
    ).length;

    if (hotkeyStatus()) {
      switch (pressedKey) {
        case 'F':
        case 'q':
          filterInput.current.focus();
          document.body.classList.add('show-menu');
          clearSearch();
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
            dispatch(subredditsFilter({ activeIndex }));
          }
          event.preventDefault();
          break;
        }
        case 'ArrowDown': {
          if (subLength <= filter.activeIndex + 1) {
            break;
          }
          const activeIndex = filter.activeIndex + 1;
          dispatch(subredditsFilter({ activeIndex }));
          event.preventDefault();
          break;
        }
        case 'Enter': {
          const trigger = document.querySelector(
            '#sidebar-subreddits .nav-item a.trigger'
          );
          if (trigger && trigger.pathname) {
            history.push(trigger.pathname);
          }
          document.body.classList.remove('show-menu');
          filterInput.current.blur();
          break;
        }
        case 'Escape':
          filterInput.current.blur();
          document.body.classList.remove('show-menu');
          clearSearch();
          break;
        default:
          break;
      }
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleFilterHotkey);
    return () => {
      document.removeEventListener('keydown', handleFilterHotkey);
    };
  });

  return (
    <div
      className={`filterText w-100 d-flex m-0 p-2 ${
        filter.active ? 'filter-focused' : 'filter-unfocused'
      }`}
    >
      <input
        type="text"
        className="form-control form-control-dark form-control-sm w-100 py-0"
        onChange={filterReddits}
        onFocus={setFocus}
        onBlur={setBlur}
        placeholder="Filter"
        id="subreddit-filter"
        value={filter.filterText}
        ref={filterInput}
      />
      {(filter.active || filter.filterText) && (
        <i
          className="far fa-times-circle form-control-clear filter-clear"
          onClick={clearSearch}
          aria-hidden
          role="button"
          aria-label="Clear Filter Box"
        />
      )}
    </div>
  );
}

export default FilterReddits;
