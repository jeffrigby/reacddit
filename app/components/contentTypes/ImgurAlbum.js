import React, { PropTypes }  from 'react';
import Video from './Video';
import Image from './Image';

class ImgurAlbum extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            imgNum: 0,
            preload: false
        };
    }

    nextSlide() {
        const currentImgNum = this.state.imgNum;
        const numSlides = this.props.content.images_count;
        return this.setState({
            imgNum: ((currentImgNum + 2 > numSlides) ? 0 : currentImgNum + 1),
            preload: true
        });
    }

    prevSlide() {
        const currentImgNum = this.state.imgNum;
        const numSlides = this.props.content.images_count;
        return this.setState({
            imgNum: ((currentImgNum - 1 < 0) ? numSlides - 1 : currentImgNum - 1),
            preload: true
        });
    }

    render() {
        const content = this.props.content;
        // limit the height of images
        const maxHeight = 650;
        if (content.cover_height > maxHeight) {
            content.cover_width = (content.cover_width * maxHeight) / content.cover_height;
            content.cover_height = maxHeight;
        }
        // limit the height of images
        const width = content.cover_height > 800 ? ((content.cover_width * 800) / content.cover_height) : content.cover_width;
        const contStyle = {width: width + 'px'};
        const ratio = (content.cover_height / content.cover_width) * 100;
        const ratioStyle = {paddingBottom: ratio + '%'};
        const totalSlides = this.props.content.images_count;
        const currentSlide = this.state.imgNum + 1;
        let imgClass = 'unloaded embed-responsive-item';
        if (content.class) {
            imgClass += ' ' + content.class;
        }

        const currentImage = content.images[this.state.imgNum];
        currentImage.preload = this.state.preload;
        let render;
        if (currentImage.animated) {
            render = <Video content={currentImage} key={currentImage.id} />;
        } else {
            // Full Image
            // currentImage.src = currentImage.link;
            currentImage.src = '//i.imgur.com/' + currentImage.id + 'h.jpg';
            // grabbig 1024x1024 version
            render = <Image content={currentImage} key={currentImage.id} />;
        }

        return (<div className="ratio-bg albumEntry">
            <div className="btn-group btn-group-xs albumNav">
                <button type="button" className="btn btn-default" aria-label="Previous Slide" onClick={this.prevSlide.bind(this)}>
                    <span className="glyphicon glyphicon glyphicon-backward" aria-hidden="true"></span>
                </button>
                <div className="btn btn-default">{currentSlide} / {totalSlides}</div>
                <button type="button" className="btn btn-default" aria-label="Next Slide" onClick={this.nextSlide.bind(this)}>
                    <span className="glyphicon glyphicon glyphicon-forward" aria-hidden="true"></span>
                </button>
            </div>
            <div style={contStyle} className="ratio-container">
                <div style={ratioStyle} className="ratio embed-responsive">
                    {render}
                </div>
            </div>
        </div>);
    }
}

ImgurAlbum.propTypes = {
    content: PropTypes.object
};

module.exports = ImgurAlbum;

