import { useMemo } from 'react';
import type { SocialNetwork } from '@/components/posts/embeds/types';
import TwitterEmbed from '../embeds/TwitterEmbed';
import InstagramEmbed from '../embeds/InstagramEmbed';
import FacebookEmbed from '../embeds/FacebookEmbed';

interface SocialEmbedLoaderProps {
  url: string;
  network: SocialNetwork;
}

function SocialEmbedLoader({ url, network }: SocialEmbedLoaderProps) {
  const embedContent = useMemo(() => {
    switch (network) {
      case 'x':
        return <TwitterEmbed url={url} />;
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
