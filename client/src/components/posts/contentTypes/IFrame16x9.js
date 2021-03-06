import React, { useContext } from 'react';
// import PropTypes from 'prop-types';
import { PostsContextData } from '../../../contexts';

const IFrame16x9 = () => {
  const postContext = useContext(PostsContextData);
  const { content } = postContext;
  const load = postContext.isLoaded;
  return (
    <div className="media-cont black-bg">
      <div className="media-contain-width">
        <div className="embed-responsive embed-responsive-16by9 black-bg">
          {load && (
            <iframe
              src={content.src}
              scrolling="no"
              title={content.name}
              allow={content.allow}
              className="embed-responsive-item loading-icon"
              allowFullScreen
            />
          )}
        </div>
      </div>
    </div>
  );
};

IFrame16x9.propTypes = {};

export default IFrame16x9;
