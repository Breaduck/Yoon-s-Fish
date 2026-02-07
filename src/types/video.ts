export interface VideoSource {
  type: 'file' | 'camera';
  url?: string;
  stream?: MediaStream;
}

export interface VideoState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  source: VideoSource | null;
}

export type PlaybackRate = 0.25 | 0.5 | 0.75 | 1 | 1.5 | 2;
