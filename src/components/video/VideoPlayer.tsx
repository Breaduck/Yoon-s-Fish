import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { useVideo } from '../../context/VideoContext';

const VideoPlayer: React.FC = () => {
  const { videoRef, videoState, updateTime } = useVideo();
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoState.source) return;

    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (videoState.source.type === 'file' && videoState.source.url) {
      video.srcObject = null;
      video.src = videoState.source.url;
      video.load();
    } else if (videoState.source.type === 'camera' && videoState.source.stream) {
      video.src = '';
      video.srcObject = videoState.source.stream;
    } else if (videoState.source.type === 'stream' && videoState.source.url) {
      video.srcObject = null;

      // Check if it's an HLS stream
      if (videoState.source.url.includes('.m3u8')) {
        if (Hls.isSupported()) {
          const hls = new Hls();
          hlsRef.current = hls;
          hls.loadSource(videoState.source.url);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(err => console.log('Auto-play prevented:', err));
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          // Native HLS support (Safari)
          video.src = videoState.source.url;
          video.addEventListener('loadedmetadata', () => {
            video.play().catch(err => console.log('Auto-play prevented:', err));
          });
        }
      } else {
        video.src = videoState.source.url;
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
