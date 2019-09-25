import React, { Suspense, useContext } from 'react';
import PropTypes from 'prop-types';
import { PostsContextData } from '../../contexts';

const ReactJson = React.lazy(() => import('react-json-view'));

const PostDebug = ({ renderedContent }) => {
  const data = useContext(PostsContextData);

  return (
    <div className="debug">
      <Suspense fallback={<div>Loading JSON...</div>}>
        {renderedContent && (
          <ReactJson
            src={renderedContent}
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
