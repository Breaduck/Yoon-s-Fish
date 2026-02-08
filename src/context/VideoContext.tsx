import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';
import { VideoState, VideoSource, PlaybackRate } from '../types/video';

interface VideoContextType {
  videoState: VideoState;
  videoRef: React.RefObject<HTMLVideoElement>;
  videoRef2: React.RefObject<HTMLVideoElement>;
  setSource: (source: VideoSource | null) => void;
  setSource2: (source: VideoSource | null) => void;
  secondVideoSource: VideoSource | null;
  clearSource: () => void;
  clearSource2: () => void;
  play: () => void;
  pause: () => void;
  playVideo1: () => void;
  pauseVideo1: () => void;
  playVideo2: () => void;
  pauseVideo2: () => void;
  playBoth: () => void;
  setPlaybackRate: (rate: PlaybackRate) => void;
  seek: (time: number) => void;
  updateTime: (time: number) => void;
}

const VideoContext = createContext<VideoContextType | null>(null);

export const useVideo = () => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error('useVideo must be used within VideoProvider');
  }
  return context;
};

interface VideoProviderProps {
  children: ReactNode;
}

export const VideoProvider: React.FC<VideoProviderProps> = ({ children }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoRef2 = useRef<HTMLVideoElement>(null);
  const [secondVideoSource, setSecondVideoSource] = useState<VideoSource | null>(null);
  const [videoState, setVideoState] = useState<VideoState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    playbackRate: 1,
    source: null,
  });

  const setSource = (source: VideoSource | null) => {
    setVideoState((prev) => ({ ...prev, source }));
  };

  const setSource2 = (source: VideoSource | null) => {
    setSecondVideoSource(source);
  };

  const clearSource = () => {
    setVideoState((prev) => ({ ...prev, source: null }));
  };

  const clearSource2 = () => {
    setSecondVideoSource(null);
  };

  const play = () => {
    if (videoRef.current) {
      videoRef.current.play();
    }
    if (videoRef2.current && secondVideoSource) {
      videoRef2.current.play();
    }
    setVideoState((prev) => ({ ...prev, isPlaying: true }));
  };

  const pause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    if (videoRef2.current && secondVideoSource) {
      videoRef2.current.pause();
    }
    setVideoState((prev) => ({ ...prev, isPlaying: false }));
  };

  const playVideo1 = () => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const pauseVideo1 = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const playVideo2 = () => {
    if (videoRef2.current && secondVideoSource) {
      videoRef2.current.play();
    }
  };

  const pauseVideo2 = () => {
    if (videoRef2.current && secondVideoSource) {
      videoRef2.current.pause();
    }
  };

  const playBoth = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
    if (videoRef2.current && secondVideoSource) {
      videoRef2.current.currentTime = 0;
      videoRef2.current.play();
    }
    setVideoState((prev) => ({ ...prev, isPlaying: true }));
  };

  const setPlaybackRate = (rate: PlaybackRate) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    if (videoRef2.current && secondVideoSource) {
      videoRef2.current.playbackRate = rate;
    }
    setVideoState((prev) => ({ ...prev, playbackRate: rate }));
  };

  const seek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
    if (videoRef2.current && secondVideoSource) {
      videoRef2.current.currentTime = time;
    }
    setVideoState((prev) => ({ ...prev, currentTime: time }));
  };

  const updateTime = (time: number) => {
    const duration = videoRef.current?.duration || 0;
    setVideoState((prev) => ({
      ...prev,
      currentTime: time,
      duration: isFinite(duration) ? duration : 0
    }));
  };

  return (
    <VideoContext.Provider
      value={{
        videoState,
        videoRef,
        videoRef2,
        setSource,
        setSource2,
        secondVideoSource,
        clearSource,
        clearSource2,
        play,
        pause,
        playVideo1,
        pauseVideo1,
        playVideo2,
        pauseVideo2,
        playBoth,
        setPlaybackRate,
        seek,
        updateTime,
      }}
    >
      {children}
    </VideoContext.Provider>
  );
};
