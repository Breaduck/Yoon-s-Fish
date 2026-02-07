import React, { useEffect } from 'react';
import { useVideo } from '../../context/VideoContext';

const VideoPlayer2: React.FC = () => {
  const { videoRef2, secondVideoSource, updateTime } = useVideo();

  useEffect(() => {
    const video = videoRef2.current;
    if (!video || !secondVideoSource) return;

    if (secondVideoSource.type === 'file' && secondVideoSource.url) {
      video.src = secondVideoSource.url;
    } else if (secondVideoSource.type === 'camera' && secondVideoSource.stream) {
      video.srcObject = secondVideoSource.stream;
    }
  }, [videoRef2, secondVideoSource]);

  // Sync time updates with main video
  useEffect(() => {
    const video = videoRef2.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      updateTime(video.currentTime);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [videoRef2, updateTime]);

  if (!secondVideoSource) return null;

  return (
    <video
      ref={videoRef2}
      className="w-full h-full object-contain"
      playsInline
      style={{ display: secondVideoSource ? 'block' : 'none' }}
    />
  );
};

export default VideoPlayer2;
