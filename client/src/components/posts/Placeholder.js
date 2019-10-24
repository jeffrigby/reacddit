import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { PostsContextData } from '../../contexts';
import renderSelf from './embeds/domains/self';
import Self from './contentTypes/Self';

const Placeholder = ({ load }) => {
  const data = useContext(PostsContextData);

  const getRatio = (width, height) => {
    const maxHeight = 625;

    const widthContrained =
      height > maxHeight ? (width * maxHeight) / height : width;
    const heightConstrained = height > maxHeight ? maxHeight : height;
    const ratio = (heightConstrained / widthContrained) * 100;

    return {
      width: widthContrained,
      ratio,
      contStyle: { width: `${widthContrained}px` },
      ratioStyle: { paddingBottom: `${ratio}%` },
    };
  };

  const getDimensions = () => {
    const { preview } = data;
    if (preview) {
      // Check for video preview
      if (preview.reddit_video_preview) {
        return [
          preview.reddit_video_preview.width,
          preview.reddit_video_preview.height,
        ];
      }

      // Check for source
      if (preview.images) {
        const { resolutions } = preview.images[0];
        if (resolutions[5]) {
          return [resolutions[5].width, resolutions[5].height];
        }

        const { source } = preview.images[0];
        if (source) {
          return [source.width, source.height];
        }
      }
    }

    return [];
  };

  const getRatioRounded = (width, height) =>
    Math.round((width / height) * 100) / 100;

  const fixedRatio = r => {
    return (
      <div className="content">
        <div className="media-cont black-bg">
          <div className="media-contain-width">
            <div
              className={`embed-responsive embed-responsive-${r} black-bg`}
            />
          </div>
        </div>
      </div>
    );
  };

  if (data.is_self && data.selftext) {
    const selfContent = renderSelf(data);
    return (
      <div className="content">
        <Self content={selfContent} load={load} name={data.name} />
      </div>
    );
  }

  const dimensions = getDimensions();
  if (dimensions.length) {
    const [width, height] = dimensions;
    const ratioRounded = getRatioRounded(width, height);
    if (ratioRounded >= 1.76 && ratioRounded <= 1.79) {
      return fixedRatio('16by9');
    }

    if (ratioRounded >= 1.3 && ratioRounded <= 1.36) {
      return fixedRatio('4by3');
    }

    if (ratioRounded >= 2.3 && ratioRounded <= 2.36) {
      return fixedRatio('21by9');
    }

    if (ratioRounded === 1) {
      return fixedRatio('1by1');
    }

    const { contStyle, ratioStyle } = getRatio(width, height);

    return (
      <div className="content">
        <div className="media-cont">
          <div className="ratio-bg">
            <div style={contStyle} className="ratio-container">
              <div style={ratioStyle} className="ratio embed-responsive" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>THIS IS A PLACEHOLDER</>;
};

Placeholder.propTypes = {
  load: PropTypes.bool.isRequired,
};

export default Placeholder;
