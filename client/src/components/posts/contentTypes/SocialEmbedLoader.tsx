import { useMemo } from 'react';
import {
  XEmbed,
  InstagramEmbed,
  FacebookEmbed,
} from 'react-social-media-embed';
import type { SocialNetwork } from './types';

interface SocialEmbedLoaderProps {
  url: string;
  network: SocialNetwork;
}

function SocialEmbedLoader({ url, network }: SocialEmbedLoaderProps) {
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

  return embedContent;
}

export default SocialEmbedLoader;
