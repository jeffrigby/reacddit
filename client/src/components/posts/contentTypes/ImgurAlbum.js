import React from 'react';
import PropTypes from 'prop-types';
import VideoComp from './VideoComp';
import Image from './ImageComp';

class ImgurAlbum extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      imgNum: 0,
    };
    this.prevSlide = this.prevSlide.bind(this);
    this.nextSlide = this.nextSlide.bind(this);
  }

  nextSlide() {
    const { imgNum } = this.state;
    const { content } = this.props;
    const currentImgNum = imgNum;
    const numSlides = content.images_count;
    return this.setState({
      imgNum: currentImgNum + 2 > numSlides ? 0 : currentImgNum + 1,
    });
  }

  prevSlide() {
    const { imgNum } = this.state;
    const { content } = this.props;
    const currentImgNum = imgNum;
    const numSlides = content.images_count;
    return this.setState({
      imgNum: currentImgNum - 1 < 0 ? numSlides - 1 : currentImgNum - 1,
    });
  }

  render() {
    const { content, load } = this.props;
    const { imgNum } = this.state;
    // limit the height of images
    const maxHeight = 650;
    if (content.cover_height > maxHeight) {
      content.cover_width =
        (content.cover_width * maxHeight) / content.cover_height;
      content.cover_height = maxHeight;
    }
    // limit the height of images
    const width =
      content.cover_height > 800
        ? (content.cover_width * 800) / content.cover_height
        : content.cover_width;
    const contStyle = { width: `${width}px` };
    const ratio = (content.cover_height / content.cover_width) * 100;
    const ratioStyle = { paddingBottom: `${ratio}%` };
    const totalSlides = content.images_count;
    const currentSlide = imgNum + 1;
    const currentImage = content.images[imgNum];
    let render;
    if (currentImage.animated) {
      render = (
        <VideoComp content={currentImage} key={currentImage.id} load={load} />
      );
    } else {
      // Full Image
      // currentImage.src = currentImage.link;
      currentImage.src = `//i.imgur.com/${currentImage.id}h.jpg`;
      // grabbig 1024x1024 version
      render = (
        <Image content={currentImage} key={currentImage.id} load={load} />
      );
    }

    return (
      <div className="ratio-bg albumEntry">
        <div className="btn-group btn-group-xs albumNav">
          <button
            type="button"
            className="btn btn-default shadow-none"
            aria-label="Previous Slide"
            onClick={this.prevSlide}
          >
            <i className="fas fa-backward" />
          </button>
          <div className="btn btn-default">
            {currentSlide} / {totalSlides}
          </div>
          <button
            type="button"
            className="btn btn-default shadow-none"
            aria-label="Next Slide"
            onClick={this.nextSlide}
          >
            <i className="fas fa-forward" />
          </button>
        </div>
        <div style={contStyle} className="ratio-container">
          <div style={ratioStyle} className="ratio embed-responsive">
            {render}
          </div>
        </div>
      </div>
    );
  }
}

ImgurAlbum.propTypes = {
  content: PropTypes.object.isRequired,
  load: PropTypes.bool.isRequired,
};

export default ImgurAlbum;
