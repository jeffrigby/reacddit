import React, { Suspense } from 'react';
import PropTypes from 'prop-types';

const ReactJson = React.lazy(() => import('react-json-view'));

const PostDebug = ({ renderedContent, entry }) => {
  return (
    <div className="debug">
      <Suspense fallback={<div>Loading JSON...</div>}>
        <ReactJson
          src={renderedContent}
          name="content"
          theme="harmonic"
          sortKeys
          collapsed
        />
        <ReactJson
          src={entry}
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
  renderedContent: PropTypes.object.isRequired,
  entry: PropTypes.object.isRequired,
};

export default PostDebug;
