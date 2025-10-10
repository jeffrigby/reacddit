import { useContext } from 'react';
import PropTypes from 'prop-types';
import ImageComp from './contentTypes/ImageComp';
import VideoComp from './contentTypes/videoComponents/VideoComp';
import IFrame from './contentTypes/IFrame';
import Thumb from './contentTypes/Thumb';
import Self from './contentTypes/Self';
import ImgurAlbum from './contentTypes/ImgurAlbum';
import RawHTML from './contentTypes/RawHTML';
import Placeholder from './Placeholder';
import { PostsContextData, PostsContextContent } from '../../contexts';
import HTTPSError from './contentTypes/HTTPSError';
import RedditGallery from './contentTypes/RedditGallery';
import Social from './contentTypes/Social';

function Content({ content = null }) {
  const postContext = useContext(PostsContextData);
  const { post } = postContext;
  const { data } = post;

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
        contentRendered = <ImageComp content={content} />;
        break;
      case 'video':
        contentRendered = <VideoComp content={content} link={url} />;
        break;
      case 'iframe':
        contentRendered = <IFrame content={content} />;
        break;
      case 'imgur_album':
        contentRendered = <ImgurAlbum content={content} />;
        break;
      case 'thumb':
        contentRendered = <Thumb content={content} />;
        break;
      case 'self':
        contentRendered = <Self content={content} name={name} />;
        break;
      case 'raw_html':
        contentRendered = <RawHTML content={content} />;
        break;
      case 'social':
        contentRendered = (
          <Social network={content.network} url={content.url} />
        );
        break;
      case 'httpserror':
        contentRendered = <HTTPSError content={content} />;
        break;
      case 'redditGallery':
        contentRendered = <RedditGallery content={content} />;
        break;
      default:
        break;
    }
  } else {
    // couldn't load an embed
    return null;
  }
  return (
    <PostsContextContent.Provider value={postContext}>
      <div className="content">{contentRendered}</div>
    </PostsContextContent.Provider>
  );
}

Content.propTypes = {
  content: PropTypes.object,
};

export default Content;
