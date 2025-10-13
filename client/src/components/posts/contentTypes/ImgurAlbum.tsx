import { useState, useMemo, type MouseEvent } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBackward, faForward } from '@fortawesome/free-solid-svg-icons';
import VideoComp from './videoComponents/VideoComp';
import Image from './ImageComp';
import type { ImgurAlbumEmbedContent } from '../embeds/types';
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
    // Create a mutable copy of the content dimensions
    let coverHeight = content.cover_height;
    let coverWidth = content.cover_width;

    // Limit the height of images
    const maxHeight = 650;
    if (coverHeight > maxHeight) {
      coverWidth = (coverWidth * maxHeight) / coverHeight;
      coverHeight = maxHeight;
    }

    // Further limit if still too tall
    const width =
      coverHeight > 800 ? (coverWidth * 800) / coverHeight : coverWidth;

    const contStyle: AlbumStyle = { width: `${width}px` };
    const ratio = (coverHeight / coverWidth) * 100;
    const ratioStyle: RatioStyle = { paddingBottom: `${ratio}%` };

    return { contStyle, ratioStyle };
  }, [content.cover_height, content.cover_width]);

  const totalSlides = content.images_count;
  const currentSlide = imgNum + 1;

  // Prepare current image for rendering - use imgNum directly as dependency
  const imageToRender = useMemo(() => {
    const currentImage = content.images[imgNum];
    const img = { ...currentImage };
    if (!img.animated) {
      // Full Image - grabbing 1024x1024 version
      img.src = `//i.imgur.com/${img.id}h.jpg`;
    }
    return img;
  }, [content.images, imgNum]);

  // Render either video or image based on type
  const render = useMemo(() => {
    if (imageToRender.animated) {
      // For animated images, ensure we have the required VideoContent properties
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

    // For static images
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
