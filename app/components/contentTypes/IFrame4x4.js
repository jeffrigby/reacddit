import React, { PropTypes }  from 'react';

const IFrame4x4 = ({ content }) =>
    <div className="embed-container">
        <iframe src="/iframe.html" data-orig={content.src} scrolling="no" className="unloaded iframe_4x4"></iframe>
    </div>;

IFrame4x4.propTypes = {
    content: PropTypes.object
};

export default IFrame4x4;
