import { memo } from 'react';
import { Link } from 'react-router';
import PostVote from '@/components/posts/postActions/PostVote';
import PostSave from '@/components/posts/postActions/PostSave';
import { usePostContext } from '@/contexts';
import { useDetailNavState } from '@/hooks/useDetailNavState';
import { decodeHTMLEntities } from '@/utils/sanitize';
import { getInternalRedditPath } from '@/utils/redditLinks';
import type { CommentData } from '@/types/redditApi';
import PostBylineAuthor from './PostBylineAuthor';
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

  const postPath = linkPermalink ? getInternalRedditPath(linkPermalink) : null;
  const postTitle = linkTitle ? decodeHTMLEntities(linkTitle) : null;

  return (
    <header className="comment-listing-header">
      <div className="d-flex align-items-center">
        <div className="me-auto comment-meta meta text-truncate">
          <PostSubLink subreddit={subreddit} />
          {postTitle && (
            <>
              <span className="px-1 text-muted">&middot;</span>
              {postPath ? (
                <Link
                  className="comment-listing-title"
                  state={detailNavState}
                  to={postPath}
                >
                  {postTitle}
                </Link>
              ) : (
                <span className="comment-listing-title">{postTitle}</span>
              )}
            </>
          )}
        </div>
        <div className="text-nowrap align-middle d-flex actions">
          <PostVote />
          <PostSave />
        </div>
      </div>
      <div className="comment-meta meta d-flex align-items-center">
        <span className="pe-1">
          <PostBylineAuthor
            author={author}
            flair={flair ?? null}
            isSubmitter={Boolean(isSubmitter)}
          />
        </span>
        <span className="pe-1 text-muted">commented</span>
        <Link state={detailNavState} to={permalink}>
          <PostTimeAgo createdUtc={createdUtc} />
        </Link>
      </div>
    </header>
  );
}

export default memo(PostHeaderCommentListing);
