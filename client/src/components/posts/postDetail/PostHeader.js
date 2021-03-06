import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import PostVote from '../postActions/PostVote';
import PostSave from '../postActions/PostSave';
import { PostsContextData } from '../../../contexts';

const PostHeader = ({ toggleView, expand, visible, duplicate }) => {
  const data = useContext(PostsContextData);

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

  let searchLink = '';
  if (!data.is_self) {
    const searchTo = `/duplicates/${data.id}`;
    searchLink = (
      <div>
        <Link
          to={searchTo}
          title="Search for other posts linking to this link"
          className="btn btn-link btn-sm m-0 p-0"
        >
          <i className="far fa-copy" />
        </Link>
      </div>
    );
  }

  const viewIcon = expand
    ? 'fas fa-compress-arrows-alt'
    : 'fas fa-expand-arrows-alt';

  const viewTitle = expand ? 'Close this post (x)' : 'Open this post (x)';

  const expandContractButton = (
    <button
      onClick={toggleView}
      type="button"
      className="btn btn-link btn-sm m-0 p-0"
      title={viewTitle}
    >
      <i className={viewIcon} />
    </button>
  );

  const title = expand ? (
    <h6 className="title list-group-item-heading">
      <a
        href={data.url}
        target="_blank"
        rel="noopener noreferrer"
        className="list-group-item-heading"
        aria-label="Title"
        // eslint-disable-next-line
        dangerouslySetInnerHTML={{ __html: data.title }}
      />
      {linkFlair}
      {dupeFlair}
    </h6>
  ) : (
    <h6 className="p-0 m-0">
      <button
        onClick={toggleView}
        className="btn btn-link m-0 p-0 post-title"
        type="button"
        aria-label="Title"
        // eslint-disable-next-line
        dangerouslySetInnerHTML={{ __html: data.title }}
      />
      {linkFlair} {dupeFlair}{' '}
      <a
        href={data.url}
        target="_blank"
        rel="noopener noreferrer"
        className="list-group-item-heading"
        title="Open link in new tab"
      >
        <i className="fas fa-link direct-link" />
      </a>
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
          <div>{expandContractButton}</div>
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
