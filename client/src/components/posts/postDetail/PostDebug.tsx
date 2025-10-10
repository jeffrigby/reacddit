import { Suspense, useContext } from 'react';
import JsonView from 'react18-json-view';
import 'react18-json-view/src/style.css';
import 'react18-json-view/src/dark.css';
import { PostsContextData } from '../../../contexts';
import type { LinkData, CommentData } from '../../../types/redditApi';

interface PostDebugProps {
  renderedContent?: Record<string, unknown> | null;
}

function PostDebug({
  renderedContent = null,
}: PostDebugProps): React.JSX.Element {
  const postContext = useContext(PostsContextData) as {
    post: { data: LinkData | CommentData };
  };
  const { post } = postContext;
  const { data } = post;

  return (
    <div className="debug">
      <Suspense fallback={<div>Loading Debug Info...</div>}>
        {renderedContent && (
          <div className="code-block rounded">
            <h6>Content</h6>
            <JsonView
              dark
              src={{ ...renderedContent, url: data.url }}
              theme="atom"
            />
          </div>
        )}
        {data.preview && (
          <div className="code-block rounded">
            <h6>Preview</h6>
            <JsonView dark src={data.preview} theme="atom" />
          </div>
        )}
        <div className="code-block rounded">
          <h6>Entry</h6>
          <JsonView dark src={data} theme="atom" />
        </div>
      </Suspense>
    </div>
  );
}

export default PostDebug;
