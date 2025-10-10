import { createRef, useEffect } from 'react';
import isEmpty from 'lodash/isEmpty';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import RedditAPI from '../../reddit/redditAPI';
import { redditFetchMultis } from '../../redux/actions/reddit';

interface MultiToggleProps {
  srName: string;
}

function MultiToggle({ srName }: MultiToggleProps) {
  const multiRef = createRef<HTMLDivElement>();

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
    return () => {};
  });

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
    let rsp = '';
    if (e.target.checked) {
      rsp = await RedditAPI.multiAddSubreddit(e.target.value, srName);
    } else {
      rsp = await RedditAPI.multiRemoveSubreddit(e.target.value, srName);
    }

    if (rsp.status === 200 || rsp.status === 201) {
      await dispatch(redditFetchMultis(true));
    } else {
      // Show an error?
    }
  };

  const getSubreddits = (subs: Array<{ name: string }>) => {
    const subNames: string[] = [];
    subs.forEach((sub) => {
      subNames.push(sub.name);
    });
    return subNames;
  };

  const menuItems: JSX.Element[] = [];
  multis.multis.forEach((item) => {
    const key = `${item.data.display_name}-${item.data.created}-${srName}`;
    const subNames = getSubreddits(item.data.subreddits);
    const checked = subNames.includes(srName);

    menuItems.push(
      <div className="form-check dropdown-item small m-0 p-0" key={key}>
        <label className="form-check-label w-100" htmlFor={key}>
          <input
            className="form-check-input multi-toggle-input mx-2"
            defaultChecked={checked}
            id={key}
            type="checkbox"
            value={item.data.path}
            onChange={addRemove}
          />
          {item.data.display_name}
        </label>
      </div>
    );
  });

  return (
    <div className="multi-menu header-button ms-2">
      <button
        aria-expanded="false"
        aria-haspopup="true"
        aria-label="Multis"
        className="btn btn-primary btn-sm form-control-sm"
        data-bs-toggle="dropdown"
        type="button"
      >
        Multis <i className="fas fa-caret-down" />
      </button>
      <div className="dropdown-menu dropdown-menu-end" ref={multiRef}>
        {menuItems}
      </div>
    </div>
  );
}

export default MultiToggle;
