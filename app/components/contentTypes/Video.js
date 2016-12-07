import React, { PropTypes }  from 'react';

const Video = ({ content }) => {
    const width = content.height > 800 ? ((content.width * 800) / content.height) : content.width;
    const contStyle = {width: width + 'px'};
    const ratioStyle = {paddingBottom: content.ratio + '%'};
    const videoId = 'video-' + content.id;
    return (<div className="ratio-bg">
        <div style={contStyle} className="ratio-container">
            <div style={ratioStyle} className="ratio embed-responsive">
                <video
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
                </video>
            </div>
        </div>
    </div>);
};

Video.propTypes = {
    content: PropTypes.object
};

export default Video;
