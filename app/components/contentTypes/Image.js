import React, { PropTypes }  from 'react';

const Image = ({ content, preload }) => {
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
    let imgClass = 'unloaded embed-responsive-item';
    if (content.class) {
        imgClass += ' ' + content.class;
    }

    const src = preload === true ? content.src : 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

    return (<div className="ratio-bg">
        <div style={contStyle} className="ratio-container">
            <div style={ratioStyle} className="ratio embed-responsive">
               <img src={src} alt={content.title} className={imgClass} />
            </div>
        </div>
    </div>);
};

Image.propTypes = {
    content: PropTypes.object,
    preload: PropTypes.bool
};

export default Image;
