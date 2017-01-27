import React, { PropTypes }  from 'react';

const IFrame16x9 = ({ content, preload }) => {
    let iframe;
    const src = preload ? content.src : '/iframe.html';
    return (<div className="embed-responsive embed-responsive-16by9 black-bg">
        <iframe src={src} scrolling="no" className="unloaded embed-responsive-item" allowFullScreen></iframe>
    </div>);
};

IFrame16x9.propTypes = {
    content: PropTypes.object,
    preload: PropTypes.bool
};

export default IFrame16x9;
