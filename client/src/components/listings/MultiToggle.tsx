import { useEffect, useRef } from 'react';
import { useParams } from 'react-router';
import { Form, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { useAppSelector } from '@/redux/hooks';
import {
  useGetMultiRedditsQuery,
  useAddSubredditToMultiMutation,
  useRemoveSubredditFromMultiMutation,
  useGetSubredditsQuery,
  subredditSelectors,
} from '@/redux/api';
import type { Thing, LabeledMultiData } from '@/types/redditApi';

interface MultiToggleProps {
  srName: string;
}

function MultiToggle({ srName }: MultiToggleProps) {
  const multiRef = useRef<HTMLDivElement>(null);
  const params = useParams();

  const redditBearer = useAppSelector((state) => state.redditBearer);
  const where = redditBearer.status === 'anon' ? 'default' : 'subscriber';

  const { target } = params;

  // Use RTK Query to get cached subreddit data
  const { about } = useGetSubredditsQuery(
    { where },
    {
      selectFromResult: ({ data }) => ({
        about:
          data && target
            ? subredditSelectors.selectById(data, target.toLowerCase())
            : null,
      }),
    }
  );

  // RTK Query hooks
  const { data: multis } = useGetMultiRedditsQuery(
    { expandSubreddits: true },
    { skip: redditBearer.status !== 'auth' }
  );
  const [addSubreddit] = useAddSubredditToMultiMutation();
  const [removeSubreddit] = useRemoveSubredditFromMultiMutation();

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

  if (!about || redditBearer.status !== 'auth') {
    return null;
  }

  if (!multis || multis.length === 0) {
    return null;
  }

  const addRemove = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (e.target.checked) {
        await addSubreddit({
          multiPath: e.target.value,
          srName,
        }).unwrap();
      } else {
        await removeSubreddit({
          multiPath: e.target.value,
          srName,
        }).unwrap();
      }
      // RTK Query will automatically refetch via tag invalidation
    } catch (error) {
      console.error('Failed to update multi subreddit:', error);
      // Note: Checkbox state will be corrected when multis refresh
    }
  };

  const getSubreddits = (subs: Array<{ name: string }>) =>
    subs.map((sub) => sub.name);

  const menuItems = multis.map((item: Thing<LabeledMultiData>) => {
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
