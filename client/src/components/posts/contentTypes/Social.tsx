import { Component, lazy, Suspense, type ReactNode } from 'react';
import Placeholder from '@/components/posts/Placeholder';
import type { SocialNetwork } from './types';

// Lazy-load social media embeds to reduce initial bundle size
const SocialEmbedLoader = lazy(() => import('./SocialEmbedLoader'));

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
  return (
    <EmbedErrorBoundary>
      <Suspense fallback={<Placeholder />}>
        <SocialEmbedLoader network={network} url={url} />
      </Suspense>
    </EmbedErrorBoundary>
  );
}

export default Social;
