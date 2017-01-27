import React, { PropTypes }  from 'react';

const IFrame4x4 = ({ content, preload }) => {
    let iframe;
    if (preload) {
        iframe = <iframe src={content.src}  data-orig={content.src} scrolling="no" className="loaded iframe_4x4 preload" allowFullScreen></iframe>;
    } else {
        iframe = <iframe src="/iframe.html" data-orig={content.src} scrolling="no" className="unloaded iframe_4x4" allowFullScreen></iframe>;
    }

    return (<div className="embed-container">
        <iframe src="/iframe.html" data-orig={content.src} scrolling="no" className="unloaded iframe_4x4"></iframe>
    </div>);
};

IFrame4x4.propTypes = {
    content: PropTypes.object,
    preload: PropTypes.bool
};

export default IFrame4x4;
