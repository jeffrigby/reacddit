import { useEffect, useRef } from 'react';
import isEmpty from 'lodash/isEmpty';
import { useLocation } from 'react-router';
import { Form, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchMultiReddits } from '@/redux/slices/multiRedditsSlice';
import { selectSubredditData } from '@/redux/slices/listingsSlice';
import { multiAddSubreddit, multiRemoveSubreddit } from '@/reddit/redditApiTs';

interface MultiToggleProps {
  srName: string;
}

function MultiToggle({ srName }: MultiToggleProps) {
  const multiRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const about = useAppSelector((state) =>
    selectSubredditData(state, location.key)
  );
  const multis = useAppSelector((state) => state.redditMultiReddits);
  const redditBearer = useAppSelector((state) => state.redditBearer);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const disableClose = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target.classList.contains('multi-toggle-input')) {
        e.stopPropagation();
      }
    };

    const multiMenu = multiRef.current;
    if (multiMenu) {
      multiMenu.addEventListener('click', disableClose);
      return () => {
        multiMenu.removeEventListener('click', disableClose);
      };
    }
  }, []);

  if (
    isEmpty(about) ||
    redditBearer.status !== 'auth' ||
    multis.status !== 'succeeded'
  ) {
    return null;
  }

  if (!multis.multis || multis.multis.length === 0) {
    return null;
  }

  const addRemove = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      await (e.target.checked
        ? multiAddSubreddit(e.target.value, srName)
        : multiRemoveSubreddit(e.target.value, srName));

      await dispatch(fetchMultiReddits(true));
    } catch (error) {
      console.error('Failed to update multi subreddit:', error);
      // Note: Checkbox state will be corrected when multis refresh
    }
  };

  const getSubreddits = (subs: Array<{ name: string }>) =>
    subs.map((sub) => sub.name);

  const menuItems = multis.multis.map((item) => {
    const key = `${item.data.display_name}-${item.data.created}-${srName}`;
    const subNames = getSubreddits(item.data.subreddits);
    const checked = subNames.includes(srName);

    return (
      <Dropdown.Item as="div" className="small m-0 p-0" key={key}>
        <Form.Check
          className="multi-toggle-input mx-2 w-100"
          defaultChecked={checked}
          id={key}
          label={item.data.display_name}
          type="checkbox"
          value={item.data.path}
          onChange={addRemove}
        />
      </Dropdown.Item>
    );
  });

  return (
    <Dropdown className="multi-menu header-button ms-2">
      <Dropdown.Toggle
        aria-label="Multis"
        className="form-control-sm"
        id="dropdown-multis"
        size="sm"
        variant="primary"
      >
        Multis <FontAwesomeIcon icon={faCaretDown} />
      </Dropdown.Toggle>
      <Dropdown.Menu align="end" ref={multiRef}>
        {menuItems}
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default MultiToggle;
