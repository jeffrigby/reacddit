import React, { PropTypes }  from 'react';

const Thumb = ({ content }) =>
<div>
    <a href={content.url} target="_blank">
    <img
        src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
        data-orig={content.thumbnail}
        alt={content.title}
        className="unloaded reddit-thumb"
    />
    </a>
    <div className="no-embed">Embed not available. Click to view on {content.domain}</div>
</div>;

Thumb.propTypes = {
    content: PropTypes.object
};

export default Thumb;
