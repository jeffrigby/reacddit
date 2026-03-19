import { useState, useMemo } from 'react';
import { Button } from 'react-bootstrap';
import { NavLink, useParams } from 'react-router';
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

  // Derive keyed object from fetched comment data for rendering
  const replies = useMemo(() => {
    if (!commentData?.json.data?.things) {
      return null;
    }
    return arrayToObject(
      commentData.json.data.things as CommentOrMore[],
      'name'
    );
  }, [commentData]);

  const loadMoreComments = () => {
    setShouldFetch(true);
  };

  if (moreList.data.id === '_') {
    const parentID = moreList.data.parent_id?.split('_')[1];

    return (
      <div className="comments-more">
        <NavLink
          className="btn btn-outline-secondary btn-sm mb-2"
          to={`/r/${target}/comments/${postName}/${postTitle}/${parentID}`}
        >
          Continue This Thread
        </NavLink>
      </div>
    );
  }

  if (replies) {
    return <CommentsRender linkId={linkId} posts={replies} />;
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
