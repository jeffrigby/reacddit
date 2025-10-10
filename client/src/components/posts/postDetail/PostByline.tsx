import PostBylineAuthor from './PostBylineAuthor';
import PostTimeAgo from './PostTimeAgo';
import PostSubLink from './PostSubLink';
import PostCommentLink from './PostCommentLink';
import type { LinkData, CommentData } from '../../../types/redditApi';

interface PostBylineProps {
  data: LinkData | CommentData;
  kind: string;
}

function PostByline({ data, kind }: PostBylineProps): React.JSX.Element {
  const {
    author,
    author_flair_text: flair,
    created_utc: createdUtc,
    subreddit,
  } = data;

  // Type guard to check if data is LinkData
  const isLinkData = (d: LinkData | CommentData): d is LinkData => {
    return 'num_comments' in d;
  };

  const isSubmitter = 'is_submitter' in data ? data.is_submitter : false;
  const numComments = isLinkData(data) ? data.num_comments : 0;
  const permalink = data.permalink;

  return (
    <>
      <span className="pe-2">
        <PostBylineAuthor
          author={author}
          flair={flair ?? null}
          isSubmitter={isSubmitter}
        />
      </span>
      <span className="pe-2">
        <PostTimeAgo createdUtc={createdUtc} />
      </span>
      {kind === 't3' && (
        <>
          <span className="pe-2">
            <PostCommentLink numComments={numComments} permalink={permalink} />
          </span>
          <PostSubLink subreddit={subreddit} />
        </>
      )}
    </>
  );
}

export default PostByline;
