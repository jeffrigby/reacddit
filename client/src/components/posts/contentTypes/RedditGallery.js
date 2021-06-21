import PropTypes from 'prop-types';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/scss/image-gallery.scss';

const RedditGallery = ({ content }) => {
  const { media } = content;
  const images = [];
  media.forEach((val) => {
    images.push({
      original: val.preview.u,
      thumbnail: val.thumb.u,
    });
  });

  return (
    <div className="redditGallery">
      <ImageGallery
        items={images}
        showFullscreenButton={false}
        showPlayButton={false}
      />
    </div>
  );
};

RedditGallery.propTypes = {
  content: PropTypes.object.isRequired,
};

export default RedditGallery;
