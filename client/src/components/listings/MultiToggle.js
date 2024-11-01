import { createRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import { useDispatch, useSelector } from 'react-redux';
import RedditAPI from '../../reddit/redditAPI';
import { redditFetchMultis } from '../../redux/actions/reddit';

function MultiToggle({ srName }) {
  const multiRef = createRef();

  const about = useSelector((state) => state.currentSubreddit);
  const multis = useSelector((state) => state.redditMultiReddits);
  const redditBearer = useSelector((state) => state.redditBearer);
  const dispatch = useDispatch();

  useEffect(() => {
    const disableClose = (e) => {
      if (!e.target.classList.contains('multi-toggle-input')) {
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

  const addRemove = async (e) => {
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

  const getSubreddits = (subs) => {
    const subNames = [];
    subs.forEach((sub) => {
      subNames.push(sub.name);
    });
    return subNames;
  };

  const menuItems = [];
  multis.multis.forEach((item) => {
    const key = `${item.data.display_name}-${item.data.created}-${srName}`;
    const subNames = getSubreddits(item.data.subreddits);
    const checked = subNames.includes(srName);

    menuItems.push(
      <div key={key} className="form-check dropdown-item small m-0 p-0">
        <label className="form-check-label w-100" htmlFor={key}>
          <input
            className="form-check-input multi-toggle-input mx-2"
            type="checkbox"
            id={key}
            defaultChecked={checked}
            onChange={addRemove}
            value={item.data.path}
          />
          {item.data.display_name}
        </label>
      </div>
    );
  });

  return (
    <div className="multi-menu header-button ms-2">
      <button
        type="button"
        className="btn btn-primary btn-sm form-control-sm"
        data-bs-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false"
        aria-label="Multis"
      >
        Multis <i className="fas fa-caret-down" />
      </button>
      <div className="dropdown-menu dropdown-menu-end" ref={multiRef}>
        {menuItems}
      </div>
    </div>
  );
}

MultiToggle.propTypes = {
  srName: PropTypes.string.isRequired,
};

export default MultiToggle;
