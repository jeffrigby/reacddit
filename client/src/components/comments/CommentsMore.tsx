import { useState } from 'react';
import { Button } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import type { Thing, CommentData, MoreChildrenData } from '@/types/redditApi';
import redditAPI from '@/reddit/redditAPI';
import CommentsRender from './CommentsRender';

const arrayToObject = <T extends { data: Record<string, unknown> }>(
  arr: T[],
  keyField: string
): Record<string, T> =>
  Object.assign({}, ...arr.map((item) => ({ [item.data[keyField]]: item })));

interface CommentsMoreProps {
  linkId: string;
  moreList: Thing<MoreChildrenData>;
}

function CommentsMore({ moreList, linkId }: CommentsMoreProps) {
  const { count, children } = moreList.data;
  const [replies, setReplies] = useState<Record<
    string,
    Thing<CommentData> | Thing<MoreChildrenData>
  > | null>(null);
  const [loading, setLoading] = useState(false);
  const { target, postName, postTitle } = useParams<{
    target: string;
    postName: string;
    postTitle: string;
  }>();

  const getMoreComments = async () => {
    setLoading(true);
    const commentReplies = await redditAPI.getMoreComments(linkId, children);
    if (commentReplies.status === 200) {
      const commentRepliesKeyed = arrayToObject(
        commentReplies.data.json.data.things,
        'name'
      );

      setReplies(commentRepliesKeyed);
      setLoading(false);
    }
  };

  if (moreList.data.id === '_') {
    const parantID = moreList.data.parent_id.split('_')[1];

    return (
      <div className="comments-more">
        <Button
          as={Link}
          className="mb-2"
          size="sm"
          to={`/r/${target}/comments/${postName}/${postTitle}/${parantID}`}
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
        disabled={loading}
        size="sm"
        variant="outline-secondary"
        onClick={getMoreComments}
      >
        {loading ? (
          <>Fetchng more comments.</>
        ) : (
          <>{count.toLocaleString()} more replies.</>
        )}
      </Button>
    </div>
  );
}

export default CommentsMore;
