import React, { PropTypes }  from 'react';

const Thumb = ({ content, preload }) => {
    let img;
    if (preload) {
        img = (<img
            src={content.thumbnail}
            data-orig={content.thumbnail}
            alt={content.title}
            className="loaded reddit-thumb preload"
        />);
    } else {
        img = (<img
            src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
            data-orig={content.thumbnail}
            alt={content.title}
            className="unloaded reddit-thumb"
        />);
    }

    return (
        <div>
            <a href={content.url} target="_blank">{img}</a>
            <div className="no-embed">Embed not available. Click to view on {content.domain}</div>
        </div>);
};

Thumb.propTypes = {
    content: PropTypes.object,
    preload: PropTypes.bool
};

export default Thumb;
