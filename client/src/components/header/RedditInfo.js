import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import RedditAPI from '../../reddit/redditAPI';

const RedditInfo = ({ subreddits, listingsFilter }) => {
  const [open, toggleOpen] = useState(false);
  const [currentSub, setCurrentSub] = useState({});
  const [loading, setLoading] = useState(true);

  const { target, listType, multi } = listingsFilter;
  const badTarget = !target || target.match(/mine|popular|friends/);
  const subsNotLoaded = subreddits.status !== 'loaded';
  const stopRender =
    (listType !== 's' && listType !== 'r') ||
    multi ||
    badTarget ||
    subsNotLoaded;

  const clickAction = () => {
    if (open) {
      toggleOpen(false);
    } else {
      toggleOpen(true);
    }
  };

  const loadReddit = () => {
    setLoading(true);
    if (!stopRender && open) {
      const getAbout = async () => {
        const subredditAbout = await RedditAPI.subredditAbout(target);
        setCurrentSub(subredditAbout.data);
      };
      getAbout();
    }
    setCurrentSub({});
    setLoading(false);
  };

  useEffect(() => {
    loadReddit();
  }, [open, target]);

  if (stopRender) return null;

  const interior = loading ? (
    '...loading'
  ) : (
    <>
      <div>SUB/UNSUB</div>
      <div
        dangerouslySetInnerHTML={{ __html: currentSub.public_description_html }}
      />
    </>
  );

  return (
    <>
      <button
        type="button"
        className="btn btn-link menu-link m-0 p-0"
        onClick={clickAction}
      >
        <i className="fas fa-caret-down" />
      </button>
      {open && (
        <div className="subInfo small" onBlur={() => toggleOpen(false)}>
          {interior}
        </div>
      )}
    </>
  );
};

RedditInfo.propTypes = {
  subreddits: PropTypes.object.isRequired,
  listingsFilter: PropTypes.object.isRequired,
};

RedditInfo.defaultProps = {};

const mapStateToProps = state => ({
  listingsFilter: state.listingsFilter,
  subreddits: state.subreddits,
});

export default connect(
  mapStateToProps,
  {}
)(RedditInfo);
