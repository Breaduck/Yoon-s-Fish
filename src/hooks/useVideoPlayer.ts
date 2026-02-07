import { useEffect } from 'react';
import { useVideo } from '../context/VideoContext';

export const useVideoPlayer = () => {
  const { videoRef, videoState, updateTime } = useVideo();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      updateTime(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      updateTime(video.currentTime);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [videoRef, updateTime]);

  return { videoRef, videoState };
};
