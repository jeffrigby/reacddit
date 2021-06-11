import React, { Suspense, lazy, useContext } from 'react';
import PropTypes from 'prop-types';
import { PostsContextData } from '../../../contexts';

const ReactJson = lazy(() => import('react-json-view'));

const PostDebug = ({ renderedContent }) => {
  const postContext = useContext(PostsContextData);
  const { post } = postContext;
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
            quotesOnKeys={false}
          />
        )}
        {data.preview && (
          <ReactJson
            src={data.preview}
            name="preview"
            theme="harmonic"
            sortKeys
            collapsed
            quotesOnKeys={false}
          />
        )}
        <ReactJson
          src={data}
          name="entry"
          theme="harmonic"
          sortKeys
          collapsed
          quotesOnKeys={false}
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
