import { Component, useMemo, type ReactNode } from 'react';
import {
  XEmbed,
  InstagramEmbed,
  FacebookEmbed,
} from 'react-social-media-embed';
import type { SocialNetwork } from './types';

interface EmbedErrorBoundaryProps {
  children: ReactNode;
}

interface EmbedErrorBoundaryState {
  hasError: boolean;
}

class EmbedErrorBoundary extends Component<
  EmbedErrorBoundaryProps,
  EmbedErrorBoundaryState
> {
  constructor(props: EmbedErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): EmbedErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error to console for debugging
    console.error('Social media embed error:', error, errorInfo);
  }

  render(): ReactNode {
    const { state, props } = this;
    if (state.hasError) {
      return <div>Failed to load social media content</div>;
    }
    return props.children;
  }
}

interface SocialProps {
  url: string;
  network: SocialNetwork;
}

function Social({ url, network }: SocialProps) {
  const embedContent = useMemo(() => {
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
  }, [url, network]);

  return <EmbedErrorBoundary>{embedContent}</EmbedErrorBoundary>;
}

export default Social;
