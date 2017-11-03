import React from 'react';
import PropTypes from 'prop-types';
import VideoComp from './VideoComp';
import Image from './Image';

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
    const currentImgNum = this.state.imgNum;
    const numSlides = this.props.content.images_count;
    return this.setState({
      imgNum: ((currentImgNum + 2 > numSlides) ? 0 : currentImgNum + 1),
    });
  }

  prevSlide() {
    const currentImgNum = this.state.imgNum;
    const numSlides = this.props.content.images_count;
    return this.setState({
      imgNum: ((currentImgNum - 1 < 0) ? numSlides - 1 : currentImgNum - 1),
    });
  }

  render() {
    const { content } = this.props;
    // limit the height of images
    const maxHeight = 650;
    if (content.cover_height > maxHeight) {
      content.cover_width = (content.cover_width * maxHeight) / content.cover_height;
      content.cover_height = maxHeight;
    }
    // limit the height of images
    const width = content.cover_height > 800 ? ((content.cover_width * 800) / content.cover_height) : content.cover_width;
    const contStyle = { width: `${width}px` };
    const ratio = (content.cover_height / content.cover_width) * 100;
    const ratioStyle = { paddingBottom: `${ratio}%` };
    const totalSlides = this.props.content.images_count;
    const currentSlide = this.state.imgNum + 1;
    const currentImage = content.images[this.state.imgNum];
    let render;
    if (currentImage.animated) {
      render = <VideoComp content={currentImage} key={currentImage.id} load={this.props.load} />;
    } else {
      // Full Image
      // currentImage.src = currentImage.link;
      currentImage.src = `//i.imgur.com/${currentImage.id}h.jpg`;
      // grabbig 1024x1024 version
      render = <Image content={currentImage} key={currentImage.id} load={this.props.load} />;
    }

    return (
      <div className="ratio-bg albumEntry">
        <div className="btn-group btn-group-xs albumNav">
          <button type="button" className="btn btn-default" aria-label="Previous Slide" onClick={this.prevSlide}>
            <span className="glyphicon glyphicon glyphicon-backward" aria-hidden="true" />
          </button>
          <div className="btn btn-default">{currentSlide} / {totalSlides}</div>
          <button type="button" className="btn btn-default" aria-label="Next Slide" onClick={this.nextSlide}>
            <span className="glyphicon glyphicon glyphicon-forward" aria-hidden="true" />
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
  content: PropTypes.object.isRequired,
  load: PropTypes.bool.isRequired,
};

export default ImgurAlbum;

