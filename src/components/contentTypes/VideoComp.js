import React from 'react';
import PropTypes from 'prop-types';
// import Video from 'react-html5video';

const VideoComp = ({ content, load }) => {
  const contentRender = content;

  // limit the height of video
  const maxHeight = 650;
  if (contentRender.height > maxHeight) {
    contentRender.width = (contentRender.width * maxHeight) / contentRender.height;
    contentRender.height = maxHeight;
  }

  const width = contentRender.height > 800 ? ((contentRender.width * 800) / contentRender.height) : contentRender.width;
  const contStyle = { width: `${width}px` };
  const ratio = (contentRender.height / contentRender.width) * 100;
  const ratioStyle = { paddingBottom: `${ratio}%` };
  const videoId = `video-${contentRender.id}`;

  // load = false;
  let video;
  if (load === true) {
    video = (
      <video
        autoPlay
        loop
        muted
        id={videoId}
        key={videoId}
        poster={contentRender.thumb}
        className="loaded embed-responsive-item preload"
      >
        {contentRender.webm && (<source id="webmsource" src={contentRender.webm} type="video/webm" />)}
        {contentRender.mp4 && (<source id="mp4source" src={contentRender.mp4} type="video/mp4" />)}
      </video>
    );
  } else {
    // replace with thumb if loading is too slow.
    video = (
      <img src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" className="embed-responsive-item" alt={contentRender.id} />
    );
  }

  return (<div className="ratio-bg">
    <div style={contStyle} className="ratio-container">
      <div style={ratioStyle} className="ratio embed-responsive">
        {video}
      </div>
    </div>
  </div>);
};

VideoComp.propTypes = {
  content: PropTypes.object.isRequired,
  load: PropTypes.bool.isRequired,
};

export default VideoComp;
