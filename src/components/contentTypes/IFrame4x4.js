import React, { PropTypes }  from 'react';

const IFrame4x4 = ({ content, preload }) => {
    const src = preload ? content.src : 'about:blank';
    return (<div className="embed-container">
        <iframe src={src} scrolling="no" className="iframe_4x4" allowFullScreen></iframe>
    </div>);
};

IFrame4x4.propTypes = {
    content: PropTypes.object,
    preload: PropTypes.bool
};

export default IFrame4x4;
