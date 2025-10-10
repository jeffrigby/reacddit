import { useContext } from 'react';
import ImageComp from './contentTypes/ImageComp';
import VideoComp from './contentTypes/videoComponents/VideoComp';
import IFrame from './contentTypes/IFrame';
import Thumb from './contentTypes/Thumb';
import Self from './contentTypes/Self';
import ImgurAlbum from './contentTypes/ImgurAlbum';
import RawHTML from './contentTypes/RawHTML';
import Placeholder from './Placeholder';
import {
  PostsContextData,
  PostsContextContent,
  type PostContextData,
} from '../../contexts';
import HTTPSError from './contentTypes/HTTPSError';
import RedditGallery from './contentTypes/RedditGallery';
import Social from './contentTypes/Social';
import type { LinkData } from '../../types/redditApi';
import type { EmbedContent } from './embeds/types';

interface ContentProps {
  content?: EmbedContent | null;
}

function Content({ content = null }: ContentProps) {
  const postContext = useContext(PostsContextData) as PostContextData;
  const { post } = postContext;
  const { data } = post;
  const linkData = data as LinkData;

  const { name, url } = linkData;

  if (linkData.is_self && !linkData.selftext) {
    return null;
  }

  if (!content) {
    return <Placeholder />;
  }

  let contentRendered: React.JSX.Element | null = null;
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

export default Content;
