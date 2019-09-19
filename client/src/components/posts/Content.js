import React, { useState, useEffect } from 'react';
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
import renderSelf from './embeds/domains/self';

const Content = ({ content, data, load }) => {
  const [resolvedContent, setResolvedContent] = useState(null);

  useEffect(() => {
    // This is only for inline GFYCAT gifs. @todo find a better way.∏
    if (Promise.resolve(content) === content) {
      Promise.resolve(content).then(resolved => {
        setResolvedContent(resolved);
      });
    } else {
      setResolvedContent(content);
    }
  }, [content]);

  if (!resolvedContent) {
    return null;
  }

  const { name, url } = data;

  let contentRendered = '';
  if (resolvedContent.type) {
    switch (resolvedContent.type) {
      case 'image':
        contentRendered = <Image content={resolvedContent} load={load} />;
        break;
      case 'video':
        contentRendered = (
          <VideoComp content={resolvedContent} load={load} link={url} />
        );
        break;
      case 'iframe_4x4':
        contentRendered = <IFrame4x4 content={resolvedContent} load={load} />;
        break;
      case 'iframe16x9':
        contentRendered = <IFrame16x9 content={resolvedContent} load={load} />;
        break;
      case 'imgur_album':
        contentRendered = <ImgurAlbum content={resolvedContent} load={load} />;
        break;
      case 'thumb':
        contentRendered = <Thumb content={resolvedContent} load={load} />;
        break;
      case 'self':
        contentRendered = (
          <Self content={resolvedContent} load={load} name={name} />
        );
        break;
      case 'raw_html':
        contentRendered = <RawHTML content={resolvedContent} load={load} />;
        break;
      case 'twitter':
        contentRendered = <Twitter content={resolvedContent} load={load} />;
        break;
      default:
        break;
    }
  } else {
    if (resolvedContent.js === false || (data.is_self && !data.selftext)) {
      return null;
    }

    // @todo remove the self stuff from the embeds. This is just for smoother
    // Loading previews
    if (data.is_self && data.selftext) {
      const selfContent = renderSelf(data);
      return (
        <div className="content">
          <Self content={selfContent} load={load} name={name} />
        </div>
      );
    }

    return (
      <div className="content">
        <div className="media-cont">
          <div className="embed-responsive embed-responsive-16by9 black-bg" />
        </div>
      </div>
    );
  }
  return <div className="content">{contentRendered}</div>;
};

Content.propTypes = {
  content: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
  load: PropTypes.bool.isRequired,
};

export default Content;
