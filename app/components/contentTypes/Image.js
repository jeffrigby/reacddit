import React, { PropTypes }  from 'react';

const Image = ({ content }) => {
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

    let image;
    if (content.preload === true) {
        image = (<img
            src={content.src}
            alt={content.title}
            data-thumb={content.thumb}
            data-orig={content.src}
            className={imgClass} />);
    } else {
        image = (<img
            src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
            alt={content.title}
            data-thumb={content.thumb}
            data-orig={content.src}
            className={imgClass} />);
    }

    return (<div className="ratio-bg">
        <div style={contStyle} className="ratio-container">
            <div style={ratioStyle} className="ratio embed-responsive">
                {image}
            </div>
        </div>
    </div>);
};

Image.propTypes = {
    content: PropTypes.object
};

export default Image;
