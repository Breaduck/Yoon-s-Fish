import React, { useEffect } from 'react';
import { useVideo } from '../../context/VideoContext';

const VideoPlayer: React.FC = () => {
  const { videoRef, videoState, updateTime } = useVideo();

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoState.source) return;

    if (videoState.source.type === 'file' && videoState.source.url) {
      video.srcObject = null;
      video.src = videoState.source.url;
      video.load();
    } else if (videoState.source.type === 'camera' && videoState.source.stream) {
      video.src = '';
      video.srcObject = videoState.source.stream;
    }
  }, [videoRef, videoState.source]);

  // Update time and duration
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

  return (
    <video
      ref={videoRef}
      className="w-full h-full object-contain"
      playsInline
      style={{ display: videoState.source ? 'block' : 'none' }}
    />
  );
};

export default VideoPlayer;
