import React, { useRef, useState, useEffect } from 'react';
import { useVideo } from '../../context/VideoContext';

interface FrameScrubberProps {
  videoIndex?: number; // 0 for video1, 1 for video2
}

const FrameScrubber: React.FC<FrameScrubberProps> = ({ videoIndex = 0 }) => {
  const { videoState, seek, videoRef, videoRef2 } = useVideo();
  const scrubberRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fps] = useState(30); // Default 30fps, can be detected

  const currentVideoRef = videoIndex === 0 ? videoRef : videoRef2;
  const duration = videoState.duration || 0;
  const currentTime = videoState.currentTime || 0;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleScrub(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      handleScrub(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleScrub = (clientX: number) => {
    if (!scrubberRef.current || !duration) return;
    const rect = scrubberRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = x / rect.width;
    const newTime = percent * duration;
    
    // Snap to frame
    const frameTime = 1 / fps;
    const frameNumber = Math.round(newTime / frameTime);
    const snappedTime = frameNumber * frameTime;
    
    seek(Math.max(0, Math.min(duration, snappedTime)));
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const playheadPosition = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full px-2 py-1 bg-gray-900">
      <div
        ref={scrubberRef}
        className="relative w-full h-6 bg-gray-800 rounded cursor-pointer"
        onMouseDown={handleMouseDown}
      >
        {/* Ruler marks */}
        <div className="absolute inset-0 flex">
          {Array.from({ length: 11 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 border-l border-gray-600"
              style={{ opacity: i % 5 === 0 ? 1 : 0.3 }}
            />
          ))}
        </div>
        
        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
          style={{ left: `${playheadPosition}%` }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full" />
        </div>
        
        {/* Time display */}
        <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-mono">
          {currentTime.toFixed(2)}s / {duration.toFixed(2)}s
        </div>
      </div>
    </div>
  );
};

export default FrameScrubber;
