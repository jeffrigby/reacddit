import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useParams } from 'react-router-dom';
import redditAPI from '../../reddit/redditAPI';
// eslint-disable-next-line import/no-cycle
import CommentsRender from './CommentsRender';

const arrayToObject = (arr, keyField) =>
  Object.assign({}, ...arr.map((item) => ({ [item.data[keyField]]: item })));

function CommentsMore({ moreList, linkId }) {
  const { count, children } = moreList.data;
  const [replies, setReplies] = useState(null);
  const [loading, setLoading] = useState(false);
  // Object { target: "pics", listType: "comments", postName: "iz5fis", postTitle: "ginsburgs_clerks_standing_on_guard_on_the_steps", comment: undefined }
  // CommentsMore.js:16
  const { target, postName, postTitle } = useParams();
  // console.log(params);

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
          to={`/r/${target}/comments/${postName}/${postTitle}/${parantID}`}
          role="button"
        >
          Continue This Thread
        </Link>
      </div>
    );
  }

  if (replies) {
    return <CommentsRender listType="reply" posts={replies} linkId={linkId} />;
  }

  // console.log(moreList.data.id, moreList);

  return (
    <div className="comments-more pl-2 mt-2">
      <button
        className="btn btn-outline-secondary btn-sm mb-2"
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
