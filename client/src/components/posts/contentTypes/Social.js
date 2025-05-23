import PropTypes from 'prop-types';
import {
  XEmbed,
  InstagramEmbed,
  FacebookEmbed,
} from 'react-social-media-embed';
import { Component } from 'react';

class EmbedErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    const { state, props } = this;
    if (state.hasError) {
      return <div>Failed to load social media content</div>;
    }
    return props.children;
  }
}

EmbedErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

function Social({ url, network }) {
  const renderEmbed = () => {
    switch (network) {
      case 'x':
        return <XEmbed url={url} />;
      case 'instagram':
        return <InstagramEmbed url={url} />;
      case 'facebook':
        return <FacebookEmbed url={url} />;
      default:
        return null;
    }
  };

  return <EmbedErrorBoundary>{renderEmbed()}</EmbedErrorBoundary>;
}

Social.propTypes = {
  url: PropTypes.string.isRequired,
  network: PropTypes.string.isRequired,
};

export default Social;
