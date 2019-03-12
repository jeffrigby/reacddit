import React from 'react';
import PropTypes from 'prop-types';
import IFrame16x9 from './contentTypes/IFrame16x9';
import Image from './contentTypes/Image';
import VideoComp from './contentTypes/VideoComp';
import IFrame4x4 from './contentTypes/IFrame4x4';
import Thumb from './contentTypes/Thumb';
import Self from './contentTypes/Self';
import ImgurAlbum from './contentTypes/ImgurAlbum';
import RawHTML from './contentTypes/RawHTML';
import Twitter from './contentTypes/Twitter';

const Content = ({ content, name, load }) => {
  let contentRendered = '';
  if (content.type) {
    switch (content.type) {
      case 'image':
        contentRendered = <Image content={content} load={load} />;
        break;
      case 'video':
        contentRendered = <VideoComp content={content} load={load} />;
        break;
      case 'iframe_4x4':
        contentRendered = <IFrame4x4 content={content} load={load} />;
        break;
      case 'iframe16x9':
        contentRendered = <IFrame16x9 content={content} load={load} />;
        break;
      case 'imgur_album':
        contentRendered = <ImgurAlbum content={content} load={load} />;
        break;
      case 'thumb':
        contentRendered = <Thumb content={content} load={load} />;
        break;
      case 'self':
        contentRendered = <Self content={content} load={load} name={name} />;
        break;
      case 'raw_html':
        contentRendered = <RawHTML content={content} load={load} />;
        break;
      case 'twitter':
        contentRendered = <Twitter content={content} load={load} />;
        break;
      default:
        break;
    }
  } else {
    contentRendered = <div>No preview available!</div>;
  }
  return <div className="content">{contentRendered}</div>;
};

Content.propTypes = {
  content: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  load: PropTypes.bool.isRequired,
};

export default Content;
