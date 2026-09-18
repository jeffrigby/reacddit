import { memo, useMemo } from 'react';
import { Link } from 'react-router';
import { usePostContext } from '@/contexts';
import { useDetailNavState } from '@/hooks/useDetailNavState';
import { decodeHTMLEntities } from '@/utils/sanitize';
import { getInternalRedditPath } from '@/utils/redditLinks';
import type { CommentData } from '@/types/redditApi';
import PostBylineAuthor from './PostBylineAuthor';
import PostCommentActions from './PostCommentActions';
import PostSubLink from './PostSubLink';
import PostTimeAgo from './PostTimeAgo';

/**
 * Header for a comment shown outside its thread, such as a user's overview
 * or comments listing. Names the subreddit and the post the comment answers,
 * then the author and when it was written. The time links to the comment's
 * own permalink.
 */
function PostHeaderCommentListing(): React.JSX.Element {
  const { post } = usePostContext();
  const detailNavState = useDetailNavState();
  const data = post.data as CommentData;
  const {
    author,
    author_flair_text: flair,
    created_utc: createdUtc,
    is_submitter: isSubmitter,
    link_permalink: linkPermalink,
    link_title: linkTitle,
    permalink,
    subreddit,
  } = data;

  const postPath = useMemo(
    () =>
      (linkPermalink ? getInternalRedditPath(linkPermalink) : null) ??
      permalink,
    [linkPermalink, permalink]
  );
  const postTitle = useMemo(
    () => decodeHTMLEntities(linkTitle ?? ''),
    [linkTitle]
  );

  return (
    <header className="comment-listing-header">
      <div className="d-flex align-items-center">
        <div className="me-auto comment-meta meta text-truncate">
          <PostSubLink subreddit={subreddit} />
          <span className="px-1 text-muted">&middot;</span>
          <Link
            className="comment-listing-title"
            state={detailNavState}
            to={postPath}
          >
            {postTitle}
          </Link>
        </div>
        <PostCommentActions />
      </div>
      <div className="comment-meta meta d-flex align-items-center">
        <span className="pe-2">
          <PostBylineAuthor
            author={author}
            flair={flair}
            isSubmitter={isSubmitter}
          />
        </span>
        <span className="pe-2 text-muted">commented</span>
        <Link state={detailNavState} to={permalink}>
          <PostTimeAgo createdUtc={createdUtc} />
        </Link>
      </div>
    </header>
  );
}

export default memo(PostHeaderCommentListing);
