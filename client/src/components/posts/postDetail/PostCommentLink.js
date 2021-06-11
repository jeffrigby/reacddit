import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

function abbr(value) {
  let newValue = value;
  const suffixes = ['', 'K', 'M', 'B', 'T'];
  let suffixNum = 0;
  while (newValue >= 1000) {
    newValue /= 1000;
    suffixNum += 1;
    newValue = newValue.toPrecision(2);
  }

  newValue += suffixes[suffixNum];
  return newValue;
}

const PostCommentLink = ({ numComments, permalink }) => {
  // const commentCount = parseFloat(numComments).toLocaleString('en');
  const commentCount = abbr(parseFloat(numComments));
  return (
    <>
      <Link
        to={{
          pathname: permalink,
          state: {
            showBack: true,
          },
        }}
      >
        <i className="far fa-comment" /> {commentCount}
      </Link>
    </>
  );
};

PostCommentLink.propTypes = {
  numComments: PropTypes.number.isRequired,
  permalink: PropTypes.string.isRequired,
};

export default PostCommentLink;
