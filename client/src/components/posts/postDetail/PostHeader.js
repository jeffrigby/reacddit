import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PostVote from '../postActions/PostVote';
import PostSave from '../postActions/PostSave';
import { PostsContextData } from '../../../contexts';
import PostMeta from './PostMeta';
import PostExpandContract from '../postActions/PostExpandContract';

const PostHeader = ({ toggleView, expand, visible, duplicate }) => {
  const post = useContext(PostsContextData);
  const listType = useSelector((state) => state.listingsFilter.listType);
  const { data, kind } = post;

  if (kind === 't1') {
    return (
      <header className="d-flex">
        <div className="mr-2 post-action-expand">
          <PostExpandContract
            expand={expand}
            toggleView={toggleView}
            kind={kind}
          />
        </div>
        <div className="mr-auto comment-meta meta">
          <PostMeta />
        </div>
        <div className="text-nowrap align-middle d-flex actions">
          <PostVote />
          <PostSave />
        </div>
      </header>
    );
  }

  const linkFlair = data.link_flair_text ? (
    <Link
      className="badge badge-dark mx-1"
      to={`/r/${data.subreddit}/search?q=flair:%22${data.link_flair_text}%22`}
    >
      {data.link_flair_text}
    </Link>
  ) : null;

  const dupeFlair = duplicate ? (
    <div
      className="badge badge-dark mx-1"
      title="This post appears in the list above."
    >
      Duplicate Post
    </div>
  ) : null;

  const nsfwFlair = data.over_18 ? (
    <div
      className="badge badge-danger mx-1"
      title="This post Contains NSFW content"
    >
      NSFW
    </div>
  ) : null;

  const pinned = data.pinned ? (
    <div className="badge badge-darl mx-1" title="Pinned Post">
      <i className="fas fa-thumbtack" />
    </div>
  ) : null;

  const sticky = data.stickied ? (
    <div className="badge badge-darl mx-1" title="Sticky Post">
      <i className="fas fa-sticky-note" />
    </div>
  ) : null;

  const flairs = (
    <>
      {pinned}
      {sticky}
      {nsfwFlair}
      {linkFlair}
      {dupeFlair}
    </>
  );

  const btnClass = 'btn btn-link btn-sm m-0 p-0 shadow-none';

  let searchLink = '';
  let directLink = '';
  if (!data.is_self) {
    const searchTo = `/duplicates/${data.id}`;
    searchLink = (
      <div>
        <Link
          to={searchTo}
          title="Search for other posts linking to this link"
          className={btnClass}
        >
          <i className="far fa-copy" />
        </Link>
      </div>
    );

    directLink = (
      <div>
        <a
          href={data.url}
          target="_blank"
          rel="noopener noreferrer"
          className={btnClass}
          aria-label="Open this link directly"
          title="Open this link directly"
        >
          <i className="fas fa-link" />
        </a>
      </div>
    );
  }

  const redditLink = (
    <div>
      <a
        href={`https://reddit.com${data.permalink}`}
        target="_blank"
        rel="noopener noreferrer"
        className={btnClass}
        aria-label="Open on Reddit"
        title="Open on Reddit"
      >
        <i className="fab fa-reddit" />
      </a>
    </div>
  );

  let titleLink;
  if (listType === 'comments') {
    titleLink = (
      <a
        href={data.url}
        target="_blank"
        rel="noopener noreferrer"
        className="list-group-item-heading"
        aria-label="Title"
        // eslint-disable-next-line
        dangerouslySetInnerHTML={{ __html: data.title }}
      />
    );
  } else {
    titleLink = (
      <Link
        to={data.permalink}
        className="list-group-item-heading"
        aria-label="Title"
        // eslint-disable-next-line
        dangerouslySetInnerHTML={{ __html: data.title }}
      />
    );
  }

  const title = (
    <h6 className="title list-group-item-heading">
      {titleLink}
      {flairs}
    </h6>
  );

  return (
    <header className="d-flex">
      {title}
      {visible ? (
        <div className="text-nowrap d-flex actions ml-auto">
          <PostVote />
          <PostSave />
          {searchLink}
          {redditLink}
          {directLink}
          <div>
            <PostExpandContract
              expand={expand}
              toggleView={toggleView}
              kind={kind}
            />
          </div>
        </div>
      ) : (
        // eslint-disable-next-line
        <div className="text-nowrap d-flex actions ml-auto offscreen-placeholder" />
      )}
    </header>
  );
};

PostHeader.propTypes = {
  toggleView: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired,
  expand: PropTypes.bool.isRequired,
  duplicate: PropTypes.bool.isRequired,
};

export default React.memo(PostHeader);
