import React, { useEffect } from 'react';
import { useVideo } from '../../context/VideoContext';

const VideoPlayer2: React.FC = () => {
  const { videoRef2, secondVideoSource, updateTime } = useVideo();

  useEffect(() => {
    const video = videoRef2.current;
    if (!video || !secondVideoSource) return;

    if (secondVideoSource.type === 'file' && secondVideoSource.url) {
      video.srcObject = null;
      video.src = secondVideoSource.url;
      video.load();
    } else if (secondVideoSource.type === 'camera' && secondVideoSource.stream) {
      video.src = '';
      video.srcObject = secondVideoSource.stream;
    } else if (secondVideoSource.type === 'stream' && secondVideoSource.url) {
      video.srcObject = null;
      video.src = secondVideoSource.url;
      video.load();
      video.play().catch(err => console.log('Auto-play prevented:', err));
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
