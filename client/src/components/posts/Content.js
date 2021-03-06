import React, { useContext } from 'react';
// import PropTypes from 'prop-types';
import IFrame16x9 from './contentTypes/IFrame16x9';
import ImageComp from './contentTypes/ImageComp';
import VideoComp from './contentTypes/VideoComp';
import IFrame4x4 from './contentTypes/IFrame4x4';
import Thumb from './contentTypes/Thumb';
import Self from './contentTypes/Self';
import ImgurAlbum from './contentTypes/ImgurAlbum';
import RawHTML from './contentTypes/RawHTML';
import Twitter from './contentTypes/Twitter';
import Placeholder from './Placeholder';
import { PostsContextData } from '../../contexts';
import HTTPSError from './contentTypes/HTTPSError';
import RedditGallery from './contentTypes/RedditGallery';

const Content = () => {
  const postContext = useContext(PostsContextData);
  const { data } = postContext.post;
  const { content } = postContext;

  const { name, url } = data;

  if (data.is_self && !data.selftext) {
    return null;
  }

  if (!content) {
    return <Placeholder />;
  }

  let contentRendered = '';
  if (content.type) {
    switch (content.type) {
      case 'image':
        contentRendered = <ImageComp />;
        break;
      case 'video':
        contentRendered = <VideoComp link={url} />;
        break;
      case 'iframe_4x4':
        contentRendered = <IFrame4x4 />;
        break;
      case 'iframe16x9':
        contentRendered = <IFrame16x9 />;
        break;
      case 'imgur_album':
        contentRendered = (
          <ImgurAlbum content={content} load={postContext.isLoaded} />
        );
        break;
      case 'thumb':
        contentRendered = <Thumb />;
        break;
      case 'self':
        contentRendered = <Self name={name} />;
        break;
      case 'raw_html':
        contentRendered = <RawHTML />;
        break;
      case 'twitter':
        contentRendered = <Twitter tweetId={content.id} />;
        break;
      case 'httpserror':
        contentRendered = <HTTPSError />;
        break;
      case 'redditGallery':
        contentRendered = <RedditGallery />;
        break;
      default:
        break;
    }
  } else {
    // couldn't load an embed
    return null;
  }
  return <div className="content">{contentRendered}</div>;
};

Content.propTypes = {};

Content.defaultProps = {
  content: null,
};

export default Content;
