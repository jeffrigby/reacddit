import React, { useContext } from 'react';
// import PropTypes from 'prop-types';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/scss/image-gallery.scss';
import { PostsContextData } from '../../../contexts';

const RedditGallery = () => {
  const postContext = useContext(PostsContextData);
  const { content } = postContext;

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

RedditGallery.propTypes = {};

export default RedditGallery;
