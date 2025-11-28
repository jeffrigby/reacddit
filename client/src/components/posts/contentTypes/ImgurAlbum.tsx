import { useState, useMemo, type MouseEvent } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBackward, faForward } from '@fortawesome/free-solid-svg-icons';
import type { ImgurAlbumEmbedContent } from '@/components/posts/embeds/types';
import VideoComp from './videoComponents/VideoComp';
import Image from './ImageComp';
import type { VideoContent } from './videoComponents/types';
import type { ImageContent } from './types';

interface ImgurAlbumProps {
  content: ImgurAlbumEmbedContent;
}

interface AlbumStyle {
  width: string;
}

interface RatioStyle {
  paddingBottom: string;
}

function ImgurAlbum({ content }: ImgurAlbumProps) {
  const [imgNum, setImgNum] = useState<number>(0);

  const nextSlide = (e: MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    const numSlides = content.images_count;
    setImgNum((currentImgNum) =>
      currentImgNum + 2 > numSlides ? 0 : currentImgNum + 1
    );
  };

  const prevSlide = (e: MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    const numSlides = content.images_count;
    setImgNum((currentImgNum) =>
      currentImgNum - 1 < 0 ? numSlides - 1 : currentImgNum - 1
    );
  };

  const { contStyle, ratioStyle } = useMemo(() => {
    let coverHeight = content.cover_height;
    let coverWidth = content.cover_width;

    const maxHeight = 650;
    if (coverHeight > maxHeight) {
      coverWidth = (coverWidth * maxHeight) / coverHeight;
      coverHeight = maxHeight;
    }

    const width =
      coverHeight > 800 ? (coverWidth * 800) / coverHeight : coverWidth;

    const contStyle: AlbumStyle = { width: `${width}px` };
    const ratio = (coverHeight / coverWidth) * 100;
    const ratioStyle: RatioStyle = { paddingBottom: `${ratio}%` };

    return { contStyle, ratioStyle };
  }, [content.cover_height, content.cover_width]);

  const totalSlides = content.images_count;
  const currentSlide = imgNum + 1;

  const imageToRender = useMemo(() => {
    const currentImage = content.images[imgNum];
    const img = { ...currentImage };
    if (!img.animated) {
      img.src = `//i.imgur.com/${img.id}h.jpg`;
    }
    return img;
  }, [content.images, imgNum]);

  const render = useMemo(() => {
    if (imageToRender.animated) {
      const videoContent: VideoContent = {
        id: imageToRender.id,
        width: imageToRender.width ?? 0,
        height: imageToRender.height ?? 0,
        sources: imageToRender.sources ?? [],
        hasAudio: imageToRender.hasAudio ?? false,
        audioWarning: imageToRender.audioWarning,
        thumb: imageToRender.thumb,
      };
      return <VideoComp content={videoContent} key={imageToRender.id} />;
    }

    const imageContent: ImageContent = {
      src: imageToRender.src ?? '',
      title: '', // Imgur albums don't typically have individual titles
      width: imageToRender.width,
      height: imageToRender.height,
    };
    return <Image content={imageContent} key={imageToRender.id} />;
  }, [imageToRender]);

  return (
    <div className="ratio-bg albumEntry">
      <ButtonGroup className="btn-group-xs albumNav" size="sm">
        <Button
          aria-label="Previous Slide"
          className="shadow-none"
          variant="secondary"
          onClick={prevSlide}
        >
          <FontAwesomeIcon icon={faBackward} />
        </Button>
        <Button disabled className="shadow-none" variant="secondary">
          {currentSlide} / {totalSlides}
        </Button>
        <Button
          aria-label="Next Slide"
          className="shadow-none"
          variant="secondary"
          onClick={nextSlide}
        >
          <FontAwesomeIcon icon={faForward} />
        </Button>
      </ButtonGroup>
      <div className="ratio-container" style={contStyle}>
        <div className="ratio embed-responsive" style={ratioStyle}>
          {render}
        </div>
      </div>
    </div>
  );
}

export default ImgurAlbum;
