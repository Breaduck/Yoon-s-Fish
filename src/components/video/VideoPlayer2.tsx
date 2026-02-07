import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { useVideo } from '../../context/VideoContext';

const VideoPlayer2: React.FC = () => {
  const { videoRef2, secondVideoSource, updateTime } = useVideo();
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const video = videoRef2.current;
    if (!video || !secondVideoSource) return;

    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (secondVideoSource.type === 'file' && secondVideoSource.url) {
      video.srcObject = null;
      video.src = secondVideoSource.url;
      video.load();
    } else if (secondVideoSource.type === 'camera' && secondVideoSource.stream) {
      video.src = '';
      video.srcObject = secondVideoSource.stream;
    } else if (secondVideoSource.type === 'stream' && secondVideoSource.url) {
      video.srcObject = null;

      // Check if it's an HLS stream
      if (secondVideoSource.url.includes('.m3u8')) {
        if (Hls.isSupported()) {
          const hls = new Hls();
          hlsRef.current = hls;
          hls.loadSource(secondVideoSource.url);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(err => console.log('Auto-play prevented:', err));
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          // Native HLS support (Safari)
          video.src = secondVideoSource.url;
          video.addEventListener('loadedmetadata', () => {
            video.play().catch(err => console.log('Auto-play prevented:', err));
          });
        }
      } else {
        video.src = secondVideoSource.url;
        video.load();
        video.play().catch(err => console.log('Auto-play prevented:', err));
      }
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
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
