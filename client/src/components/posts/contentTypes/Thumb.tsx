import { useContext } from 'react';
import { PostsContextData } from '@/contexts';
import type { ThumbEmbedContent } from '../embeds/types';

interface ThumbProps {
  content: ThumbEmbedContent;
}

interface PostContextData {
  isLoaded: boolean;
}

function Thumb({ content }: ThumbProps) {
  const postContext = useContext(PostsContextData) as PostContextData;
  const { isLoaded } = postContext;

  let img;
  if (isLoaded) {
    img = (
      <img
        alt={content.title}
        className="loaded reddit-thumb preload"
        data-orig={content.thumbnail}
        src={content.thumbnail}
      />
    );
  } else {
    img = (
      <img
        alt="Placeholder"
        className="unloaded reddit-thumb"
        data-orig={content.thumbnail}
        src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
      />
    );
  }

  return (
    <div>
      <a href={content.url} rel="noopener noreferrer" target="_blank">
        {img}
      </a>
      <div className="no-embed">
        Embed not available. Click to view on
        {content.domain}
      </div>
    </div>
  );
}

export default Thumb;
