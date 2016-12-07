import React, { PropTypes }  from 'react';

const Image = ({ content }) => {
    // limit the height of images
    const width = content.height > 800 ? ((content.width * 800) / content.height) : content.width;
    const contStyle = {width: width + 'px'};
    const ratioStyle = {paddingBottom: content.ratio + '%'};
    let imgClass = 'unloaded embed-responsive-item';
    if (content.class) {
        imgClass += ' ' + content.class;
    }
    return (<div className="ratio-bg">
        <div style={contStyle} className="ratio-container">
            <div style={ratioStyle} className="ratio embed-responsive">
                <img
                    src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
                    alt={content.title}
                    data-thumb={content.thumb}
                    data-orig={content.src}
                    className={imgClass} />
            </div>
        </div>
    </div>);
};

Image.propTypes = {
    content: PropTypes.object
};

export default Image;
