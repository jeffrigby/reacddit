import React, { PropTypes }  from 'react';

const Video = ({ content }) => {
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
    if (content.preload === true) {
        video = ( <video
            muted="muted"
            loop="loop"
            playsInline
            autoPlay
            id={videoId}
            preload="auto"
            poster={content.thumb}
            data-poster={content.thumb}
            className="loaded embed-responsive-item">
            <source id="webmsource" src={content.webm} data-src={content.webm} type="video/webm"></source>
            <source id="mp4source" src={content.mp4} data-src={content.mp4} type="video/mp4"></source>
        </video>);
    } else {
        video = ( <video
            muted="muted"
            loop="loop"
            playsInline
            id={videoId}
            preload="none"
            poster="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
            data-poster={content.thumb}
            className="unloaded embed-responsive-item">
            <source id="webmsource" data-src={content.webm} type="video/webm"></source>
            <source id="mp4source" data-src={content.mp4} type="video/mp4"></source>
        </video>);
    }
    return (<div className="ratio-bg">
        <div style={contStyle} className="ratio-container">
            <div style={ratioStyle} className="ratio embed-responsive">
                {video}
            </div>
        </div>
    </div>);
};

Video.propTypes = {
    content: PropTypes.object
};

export default Video;
