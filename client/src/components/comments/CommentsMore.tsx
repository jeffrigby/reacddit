import { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { NavLink, useParams } from 'react-router-dom';
import type { Thing, CommentData, MoreChildrenData } from '@/types/redditApi';
import { useGetMoreChildrenQuery } from '@/redux/api';
import CommentsRender from './CommentsRender';

type CommentOrMore = Thing<CommentData> | Thing<MoreChildrenData>;

/**
 * Converts an array of comments/more items into a keyed object for efficient lookup.
 * Used to transform Reddit API responses into a format suitable for nested rendering.
 */
const arrayToObject = (
  arr: CommentOrMore[],
  keyField: string
): Record<string, CommentOrMore> => {
  const result: Record<string, CommentOrMore> = {};
  arr.forEach((item) => {
    const key = (item.data as unknown as Record<string, unknown>)[keyField];
    if (
      typeof key !== 'string' &&
      typeof key !== 'number' &&
      typeof key !== 'symbol'
    ) {
      throw new Error(
        `Key field "${keyField}" must be a string, number, or symbol`
      );
    }
    result[String(key)] = item;
  });
  return result;
};

interface CommentsMoreProps {
  linkId: string;
  moreList: Thing<MoreChildrenData>;
}

function CommentsMore({ moreList, linkId }: CommentsMoreProps) {
  const { count, children } = moreList.data;
  const [shouldFetch, setShouldFetch] = useState(false);
  const [replies, setReplies] = useState<Record<string, CommentOrMore> | null>(
    null
  );
  const { target, postName, postTitle } = useParams<{
    target: string;
    postName: string;
    postTitle: string;
  }>();

  // Fetch comments on-demand using skip pattern (manual trigger via shouldFetch state)
  const { data: commentData, isLoading } = useGetMoreChildrenQuery(
    { linkId, children },
    { skip: !shouldFetch }
  );

  // Process fetched comment data into keyed object for rendering
  useEffect(() => {
    if (commentData?.json.data?.things && !replies) {
      const commentRepliesKeyed = arrayToObject(
        commentData.json.data.things as CommentOrMore[],
        'name'
      );
      setReplies(commentRepliesKeyed);
    }
  }, [commentData, replies]);

  const loadMoreComments = () => {
    setShouldFetch(true);
  };

  if (moreList.data.id === '_') {
    const parentID = moreList.data.parent_id?.split('_')[1];

    return (
      <div className="comments-more">
        <Button
          as={NavLink}
          className="mb-2"
          size="sm"
          to={`/r/${target}/comments/${postName}/${postTitle}/${parentID}`}
          variant="outline-secondary"
        >
          Continue This Thread
        </Button>
      </div>
    );
  }

  if (replies) {
    return <CommentsRender linkId={linkId} listType="reply" posts={replies} />;
  }

  return (
    <div className="comments-more ps-2 mt-2">
      <Button
        className="mb-2"
        disabled={isLoading}
        size="sm"
        variant="outline-secondary"
        onClick={loadMoreComments}
      >
        {isLoading ? (
          <>Fetching more comments.</>
        ) : (
          <>{count.toLocaleString()} more replies.</>
        )}
      </Button>
    </div>
  );
}

export default CommentsMore;
