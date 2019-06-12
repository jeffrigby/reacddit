import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import { connect } from 'react-redux';
import RedditAPI from '../../reddit/redditAPI';
import { redditFetchMultis } from '../../redux/actions/reddit';

const MultiToggle = ({ about, redditBearer, multis, srName, fetchMultis }) => {
  const multiRef = React.createRef();

  useEffect(() => {
    const disableClose = e => {
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

  const addRemove = async e => {
    let rsp = '';
    if (e.target.checked) {
      rsp = await RedditAPI.multiAddSubreddit(e.target.value, srName);
    } else {
      rsp = await RedditAPI.multiRemoveSubreddit(e.target.value, srName);
    }

    if (rsp.status === 200 || rsp.status === 201) {
      await fetchMultis(true);
    } else {
      // Show an error?
    }
  };

  const getSubreddits = subs => {
    const subNames = [];
    subs.forEach(sub => {
      subNames.push(sub.name);
    });
    return subNames;
  };

  const menuItems = [];
  multis.multis.forEach(item => {
    const key = `${item.data.display_name}-${item.data.created}`;
    const subNames = getSubreddits(item.data.subreddits);
    const checked = subNames.includes(srName);

    menuItems.push(
      <div key={key} className="form-check dropdown-item small">
        <label className="form-check-label" htmlFor={key}>
          <input
            className="form-check-input multi-toggle-input"
            type="checkbox"
            id={key}
            defaultChecked={checked}
            onChange={addRemove}
            value={item.data.path}
          />{' '}
          {item.data.display_name}
        </label>
      </div>
    );
  });

  return (
    <div className="btn-group multi-menu header-button ml-2">
      <button
        type="button"
        className="btn btn-primary btn-sm form-control-sm"
        data-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false"
        aria-label="Multis"
      >
        Multis <i className="fas fa-caret-down" />
      </button>
      <div className="dropdown-menu dropdown-menu-right" ref={multiRef}>
        {menuItems}
      </div>
    </div>
  );
};

MultiToggle.propTypes = {
  about: PropTypes.object,
  srName: PropTypes.string.isRequired,
  multis: PropTypes.object,
  redditBearer: PropTypes.object.isRequired,
  fetchMultis: PropTypes.func.isRequired,
};

MultiToggle.defaultProps = {
  about: {},
  multis: { status: 'unloaded' },
};

const mapStateToProps = state => ({
  about: state.currentSubreddit,
  multis: state.redditMultiReddits,
  redditBearer: state.redditBearer,
});

export default connect(
  mapStateToProps,
  { fetchMultis: redditFetchMultis }
)(MultiToggle);
