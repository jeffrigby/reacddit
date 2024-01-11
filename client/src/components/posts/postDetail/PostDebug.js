import { Suspense, useContext } from 'react';
import PropTypes from 'prop-types';
import JsonView from 'react18-json-view';
import 'react18-json-view/src/style.css';
import 'react18-json-view/src/dark.css';
import { PostsContextData } from '../../../contexts';

function PostDebug({ renderedContent }) {
  const postContext = useContext(PostsContextData);
  const { post } = postContext;
  const { data } = post;

  return (
    <div className="debug">
      <Suspense fallback={<div>Loading Debug Info...</div>}>
        {renderedContent && (
          <div className="code-block rounded">
            <h6>Content</h6>
            <JsonView
              src={{ ...renderedContent, url: data.url }}
              dark
              theme="atom"
            />
          </div>
        )}
        {data.preview && (
          <div className="code-block rounded">
            <h6>Preview</h6>
            <JsonView src={data.preview} dark theme="atom" />
          </div>
        )}
        <div className="code-block rounded">
          <h6>Entry</h6>
          <JsonView src={data} dark theme="atom" />
        </div>
      </Suspense>
    </div>
  );
}

PostDebug.propTypes = {
  renderedContent: PropTypes.object,
};

PostDebug.defaultProps = {
  renderedContent: null,
};

export default PostDebug;
