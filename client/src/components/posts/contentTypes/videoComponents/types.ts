// Shared types for video components

export interface VideoSource {
  src: string;
  type: string;
}

export interface VideoContent {
  id?: string;
  width?: number;
  height?: number;
  sources: VideoSource[];
  hasAudio?: boolean;
  audioWarning?: boolean;
  thumb?: string | null;
}

export interface Buffer {
  range: string;
  marginLeft: number;
  marginRight: number;
}

export interface BufferRange extends Buffer {
  start: number;
  end: number;
  duration: number;
}

export interface BufferData {
  status: 'unloaded' | 'loading' | 'full';
  buffers: BufferRange[];
}

// Extend HTMLVideoElement to include vendor-prefixed fullscreen methods
export interface ExtendedHTMLVideoElement extends HTMLVideoElement {
  requestFullScreen?: () => void;
  webkitRequestFullScreen?: () => void;
  mozRequestFullScreen?: () => void;
  webkitEnterFullscreen?: () => void;
}
