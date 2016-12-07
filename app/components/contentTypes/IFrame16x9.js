import React, { PropTypes }  from 'react';

const IFrame16x9 = ({ content }) =>
    <div className="embed-responsive embed-responsive-16by9">
        <iframe src="/iframe.html" data-orig={content.src} scrolling="no" className="unloaded embed-responsive-item" allowFullScreen></iframe>
    </div>;

IFrame16x9.propTypes = {
    content: PropTypes.object
};

export default IFrame16x9;
