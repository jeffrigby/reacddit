import React, { useContext } from 'react';
import { PostsContextData } from '../../../contexts';

const IFrame4x4 = () => {
  const postContext = useContext(PostsContextData);
  const { content } = postContext;
  const load = postContext.isLoaded;
  return (
    <div className="media-cont">
      <div className="embed-container media-cont">
        {load && (
          <iframe
            src={content.src}
            scrolling="no"
            title={content.name}
            className="iframe_4x4 loading-icon"
            allowFullScreen
          />
        )}
      </div>
    </div>
  );
};

// IFrame4x4.propTypes = {};

export default IFrame4x4;
