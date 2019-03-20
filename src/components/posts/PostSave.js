import React from 'react';
import PropTypes from 'prop-types';

const PostSave = ({ saved, save, bearer }) => {
  const saveStr =
    saved === true ? (
      <i className="fas fa-bookmark" />
    ) : (
      <i className="far fa-bookmark" />
    );
  const title = saved === true ? 'Unsave Post' : 'Save Post';

  if (bearer.status !== 'auth') {
    return null;
  }
  return (
    <div id="entry-save">
      <button
        className="btn btn-link btn-sm m-0 p-0"
        onClick={save}
        type="button"
        title={title}
      >
        {saveStr}
      </button>
    </div>
  );
};

PostSave.propTypes = {
  saved: PropTypes.bool.isRequired,
  save: PropTypes.func.isRequired,
  bearer: PropTypes.object.isRequired,
};

export default PostSave;
