import type { MouseEvent, KeyboardEvent } from 'react';
import { memo, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faThumbtack,
  faStickyNote,
  faLink,
} from '@fortawesome/free-solid-svg-icons';
import { faCopy } from '@fortawesome/free-regular-svg-icons';
import { faReddit } from '@fortawesome/free-brands-svg-icons';
import PostVote from '../postActions/PostVote';
import PostSave from '../postActions/PostSave';
import { PostsContextData } from '../../../contexts';
import PostExpandContract from '../postActions/PostExpandContract';
import PostHeaderComment from './PostHeaderComment';
import PostTimeAgo from './PostTimeAgo';
import PostCommentLink from './PostCommentLink';
import PostSubLink from './PostSubLink';
import { useAppSelector } from '../../../redux/hooks';
import type { LinkData } from '../../../types/redditApi';

interface PostHeaderProps {
  toggleView: (event: MouseEvent | KeyboardEvent) => void;
  expand: boolean;
  duplicate: boolean;
  parent?: boolean;
}

function PostHeader({
  toggleView,
  expand,
  duplicate,
  parent = false,
}: PostHeaderProps): React.JSX.Element {
  const postContext = useContext(PostsContextData) as {
    post: { data: LinkData; kind: string };
    isLoaded: boolean;
  };
  const listType = useAppSelector(
    (state) => state.listings.currentFilter.listType
  );
  const params = useParams<{ listType?: string; target?: string }>();
  const { post, isLoaded } = postContext;
  const { data, kind } = post;

  // Is this a comment?
  if (kind === 't1') {
    return <PostHeaderComment expand={expand} toggleView={toggleView} />;
  }

  let linkFlair: React.JSX.Element | null = null;
  if (data.link_flair_text) {
    const flairLinkQuery = encodeURIComponent(
      `flair:"${data.link_flair_text}"`
    );
    const flairLink = `/r/${data.subreddit}/search`;
    linkFlair = (
      <Link
        className="badge bg-dark mx-1"
        state={{ showBack: true }}
        to={`${flairLink}?q=${flairLinkQuery}`}
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
    <div className="badge me-1" title="Pinned Post">
      <FontAwesomeIcon icon={faThumbtack} />
    </div>
  ) : null;

  const sticky = data.stickied ? (
    <div className="badge me-1" title="Sticky Post">
      <FontAwesomeIcon icon={faStickyNote} />
    </div>
  ) : null;

  const flairs = (
    <>
      {nsfwFlair}
      {linkFlair}
    </>
  );

  const btnClass = 'btn btn-link btn-sm m-0 p-0 shadow-none';

  let searchLink: React.JSX.Element | null = null;
  let directLink: React.JSX.Element | null = null;
  if (!data.is_self) {
    const searchTo = `/duplicates/${data.id}`;
    searchLink = (
      <div>
        <Link
          className={btnClass}
          state={{ showBack: true }}
          title="Search for other posts linking to this link"
          to={searchTo}
        >
          <FontAwesomeIcon icon={faCopy} />
        </Link>
      </div>
    );

    directLink = (
      <div>
        <a
          aria-label="Open this link directly"
          className={btnClass}
          href={data.url}
          rel="noopener noreferrer"
          target="_blank"
          title="Open this link directly"
        >
          <FontAwesomeIcon icon={faLink} />
        </a>
      </div>
    );
  }

  const redditLink = (
    <div>
      <a
        aria-label="Open on Reddit"
        className={btnClass}
        href={`https://reddit.com${data.permalink}`}
        rel="noopener noreferrer"
        target="_blank"
        title="Open on Reddit"
      >
        <FontAwesomeIcon icon={faReddit} />
      </a>
    </div>
  );

  let titleLink: React.JSX.Element;
  if (listType === 'comments') {
    titleLink = (
      <a
        aria-label="Title"
        className="list-group-item-heading align-middle"
        dangerouslySetInnerHTML={{ __html: data.title }}
        href={data.url}
        rel="noopener noreferrer"
        target="_blank"
      />
    );
  } else {
    titleLink = (
      <Link
        aria-label="Title"
        className="list-group-item-heading align-middle"
        dangerouslySetInnerHTML={{ __html: data.title }}
        state={{ showBack: true }}
        to={data.permalink}
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

  const handleKeyDown = (event: MouseEvent | KeyboardEvent): void => {
    if ('key' in event && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      toggleView(event);
    }
  };

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
          role="button"
          tabIndex={0}
          title="Click to expand"
          onClick={toggleView}
          onKeyDown={handleKeyDown}
        >
          <span
            className="fw-bold"
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
              kind={kind}
              toggleView={toggleView}
            />
          </div>
        </div>
      ) : (
        <div className="text-nowrap d-flex actions ms-auto offscreen-placeholder" />
      )}
    </header>
  );
}

export default memo(PostHeader);
