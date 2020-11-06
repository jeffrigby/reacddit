import React, { Suspense, lazy, useContext } from 'react';
import PropTypes from 'prop-types';
import { PostsContextData } from '../../../contexts';

const ReactJson = lazy(() => import('react-json-view'));

const PostDebug = ({ renderedContent }) => {
  const post = useContext(PostsContextData);
  const { data } = post;

  return (
    <div className="debug">
      <Suspense fallback={<div>Loading Debug Info...</div>}>
        {renderedContent && (
          <ReactJson
            src={{ ...renderedContent, url: data.url }}
            name="content"
            theme="harmonic"
            sortKeys
            collapsed
          />
        )}
        {data.preview && (
          <ReactJson
            src={data.preview}
            name="preview"
            theme="harmonic"
            sortKeys
            collapsed
          />
        )}
        <ReactJson
          src={data}
          name="entry"
          theme="harmonic"
          sortKeys
          collapsed
        />
      </Suspense>
    </div>
  );
};

PostDebug.propTypes = {
  renderedContent: PropTypes.object,
};

PostDebug.defaultProps = {
  renderedContent: null,
};

export default PostDebug;
