import React, { PropTypes }  from 'react';
import Video from 'react-html5video';

const VideoComp = ({ content, preload }) => {
    // limit the height of images
    const maxHeight = 650;
    if (content.height > maxHeight) {
        content.width = (content.width * maxHeight) / content.height;
        content.height = maxHeight;
    }

    const width = content.height > 800 ? ((content.width * 800) / content.height) : content.width;
    const contStyle = {width: width + 'px'};
    const ratio = (content.height / content.width) * 100;
    const ratioStyle = {paddingBottom: ratio + '%'};
    const videoId = 'video-' + content.id;
    let video;
    if (preload === true) {
        video = (
            <Video
                autoPlay
                loop
                muted
                id={videoId}
                key={videoId}
                poster={content.thumb}
                className="loaded embed-responsive-item preload">
                <source id="webmsource" src={content.webm} type="video/webm"></source>
                <source id="mp4source" src={content.mp4} type="video/mp4"></source>
            </Video>
        );
    } else {
        video = (
            <img src={content.thumb} className="embed-responsive-item" />
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
    content: PropTypes.object,
    preload: PropTypes.bool
};

export default VideoComp;
