import React, { useState } from 'react';
import PropTypes from 'prop-types';
import redditAPI from '../../reddit/redditAPI';
import CommentsRender from './CommentsRender';
import { Link } from 'react-router-dom';

const arrayToObject = (arr, keyField) =>
  Object.assign({}, ...arr.map((item) => ({ [item.data[keyField]]: item })));

function CommentsMore({ moreList, linkId }) {
  const { count, children } = moreList.data;
  const [replies, setReplies] = useState(null);
  const [loading, setLoading] = useState(false);

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
    return <div className="comments-more">Continue This Thread.</div>;
  }

  if (replies) {
    return <CommentsRender listType="reply" posts={replies} linkId={linkId} />;
  }

  console.log(moreList.data.id, moreList);

  return (
    <div className="comments-more">
      <button
        className="btn btn-sm btn-link"
        onClick={getMoreComments}
        type="button"
        disabled={loading}
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

CommentsMore.propTypes = {
  linkId: PropTypes.string.isRequired,
  moreList: PropTypes.object.isRequired,
};

export default CommentsMore;
