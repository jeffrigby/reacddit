import { memo, useContext } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router';
import PostVote from '../postActions/PostVote';
import PostSave from '../postActions/PostSave';
import { PostsContextData } from '../../../contexts';
import PostExpandContract from '../postActions/PostExpandContract';
import PostHeaderComment from './PostHeaderComment';
import PostTimeAgo from './PostTimeAgo';
import PostCommentLink from './PostCommentLink';
import PostSubLink from './PostSubLink';

function PostHeader({ toggleView, expand, duplicate }) {
  const postContext = useContext(PostsContextData);
  const listType = useSelector((state) => state.listingsFilter.listType);
  const params = useParams();
  const { post, isLoaded } = postContext;
  const { data, kind } = post;

  // Is this a comment?
  if (kind === 't1') {
    return <PostHeaderComment expand={expand} toggleView={toggleView} />;
  }

  let linkFlair = null;
  if (data.link_flair_text) {
    const flairLinkQuery = encodeURIComponent(
      `flair:"${data.link_flair_text}"`
    );
    const flairLink = `/r/${data.subreddit}/search`;
    linkFlair = (
      <Link
        className="badge bg-dark mx-1"
        to={{
          pathname: flairLink,
          search: `?q=${flairLinkQuery}`,
          state: { showBack: true },
        }}
      >
        {data.link_flair_text}
      </Link>
    );
  }

  const dupeFlair = duplicate ? (
    <div
      className="badge bg-dark me-1"
      title="This post appears in the list above."
    >
      Duplicate
    </div>
  ) : null;

  const nsfwFlair = data.over_18 ? (
    <div
      className="badge bg-danger mx-1"
      title="This post Contains NSFW content"
    >
      NSFW
    </div>
  ) : null;

  const pinned = data.pinned ? (
    <div className="badge text-dark me-1" title="Pinned Post">
      <i className="fas fa-thumbtack" />
    </div>
  ) : null;

  const sticky = data.stickied ? (
    <div className="badge text-dark me-1" title="Sticky Post">
      <i className="fas fa-sticky-note" />
    </div>
  ) : null;

  const flairs = (
    <>
      {nsfwFlair}
      {linkFlair}
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
          to={{ pathname: searchTo, state: { showBack: true } }}
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
        className="list-group-item-heading align-middle"
        aria-label="Title"
        // eslint-disable-next-line
        dangerouslySetInnerHTML={{ __html: data.title }}
      />
    );
  } else {
    titleLink = (
      <Link
        to={{
          pathname: data.permalink,
          state: {
            showBack: true,
          },
        }}
        className="list-group-item-heading align-middle"
        aria-label="Title"
        // eslint-disable-next-line
        dangerouslySetInnerHTML={{ __html: data.title }}
      />
    );
  }

  const title = (
    <h6 className="title list-group-item-heading">
      {pinned}
      {sticky}
      {dupeFlair}
      {titleLink}
      {flairs}
    </h6>
  );

  // Show subreddit?
  let showSubreddits = true;
  if (params.listType === 'r' && params.target !== 'popular') {
    showSubreddits = false;
  }

  if (!expand) {
    return (
      <header className="d-flex flex-nowrap">
        <div>
          {pinned}
          {sticky}
          {dupeFlair}
        </div>
        <div
          className="flex-grow-1 list-group-item-heading shadow-none align-middle title me-2"
          onClick={toggleView}
          role="link"
          title="Click to expand"
          tabIndex={0}
          onKeyDown={toggleView}
        >
          <span
            className="fw-bold"
            // eslint-disable-next-line
            dangerouslySetInnerHTML={{ __html: data.title }}
          />
          {data.is_self && data.selftext && (
            <span className="ms-1 small">{data.selftext}</span>
          )}
        </div>
        {showSubreddits && (
          <div className="me-2">
            <PostSubLink subreddit={data.subreddit} />
          </div>
        )}
        <div className="me-2">
          <PostTimeAgo createdUtc={data.created_utc} />
        </div>
        <div>
          <PostCommentLink
            numComments={data.num_comments}
            permalink={data.permalink}
          />
        </div>
      </header>
    );
  }

  return (
    <header className="d-flex">
      {title}
      {isLoaded ? (
        <div className="text-nowrap d-flex actions ms-auto">
          <PostVote />
          <PostSave />
          {expand && (
            <>
              {searchLink}
              {redditLink}
              {directLink}
            </>
          )}
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
        <div className="text-nowrap d-flex actions ms-auto offscreen-placeholder" />
      )}
    </header>
  );
}

PostHeader.propTypes = {
  toggleView: PropTypes.func.isRequired,
  expand: PropTypes.bool.isRequired,
  duplicate: PropTypes.bool.isRequired,
};

export default memo(PostHeader);
