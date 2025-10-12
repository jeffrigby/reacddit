import { useEffect, useRef } from 'react';
import isEmpty from 'lodash/isEmpty';
import { Form, Button } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import RedditAPI from '../../reddit/redditAPI';
import { redditFetchMultis } from '../../redux/actions/reddit';

interface MultiToggleProps {
  srName: string;
}

function MultiToggle({ srName }: MultiToggleProps) {
  const multiRef = useRef<HTMLDivElement>(null);

  const about = useAppSelector((state) => state.currentSubreddit);
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
    multis.status !== 'loaded'
  ) {
    return null;
  }

  if (!multis.multis) {
    return null;
  }

  const addRemove = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rsp = e.target.checked
      ? await RedditAPI.multiAddSubreddit(e.target.value, srName)
      : await RedditAPI.multiRemoveSubreddit(e.target.value, srName);

    if (rsp.status === 200 || rsp.status === 201) {
      await dispatch(redditFetchMultis(true));
    }
  };

  const getSubreddits = (subs: Array<{ name: string }>) =>
    subs.map((sub) => sub.name);

  const menuItems = multis.multis.map((item) => {
    const key = `${item.data.display_name}-${item.data.created}-${srName}`;
    const subNames = getSubreddits(item.data.subreddits);
    const checked = subNames.includes(srName);

    return (
      <div className="dropdown-item small m-0 p-0" key={key}>
        <Form.Check
          className="multi-toggle-input mx-2 w-100"
          defaultChecked={checked}
          id={key}
          label={item.data.display_name}
          type="checkbox"
          value={item.data.path}
          onChange={addRemove}
        />
      </div>
    );
  });

  return (
    <div className="multi-menu header-button ms-2">
      <Button
        aria-expanded="false"
        aria-haspopup="true"
        aria-label="Multis"
        className="form-control-sm"
        data-bs-toggle="dropdown"
        size="sm"
        variant="primary"
      >
        Multis <i className="fas fa-caret-down" />
      </Button>
      <div className="dropdown-menu dropdown-menu-end" ref={multiRef}>
        {menuItems}
      </div>
    </div>
  );
}

export default MultiToggle;
