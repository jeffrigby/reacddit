import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Thing, CommentData, MoreChildrenData } from '@/types/redditApi';
import redditAPI from '../../reddit/redditAPI';
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
        <Link
          className="btn btn-outline-secondary btn-sm mb-2"
          role="button"
          to={`/r/${target}/comments/${postName}/${postTitle}/${parantID}`}
        >
          Continue This Thread
        </Link>
      </div>
    );
  }

  if (replies) {
    return <CommentsRender linkId={linkId} listType="reply" posts={replies} />;
  }

  return (
    <div className="comments-more ps-2 mt-2">
      <button
        className="btn btn-outline-secondary btn-sm mb-2"
        disabled={loading}
        type="button"
        onClick={getMoreComments}
      >
        {loading ? (
          <>Fetchng more comments.</>
        ) : (
          <>{count.toLocaleString()} more replies.</>
        )}
      </button>
    </div>
  );
}

export default CommentsMore;
