import React, { useEffect, useRef } from 'react';
import { useTool } from '../../context/ToolContext';
import { useVideo } from '../../context/VideoContext';
import VideoPlayer from './VideoPlayer';
import VideoPlayer2 from './VideoPlayer2';
import VideoCanvas from './VideoCanvas';
import VideoCanvas2 from './VideoCanvas2';
import VideoControls from './VideoControls';
import CompactToolbar from '../tools/CompactToolbar';

const FullscreenPlayer: React.FC = () => {
  const { isFullscreen, setIsFullscreen, isComparisonMode } = useTool();
  const { videoState, play, secondVideoSource } = useVideo();
  const containerRef = useRef<HTMLDivElement>(null);
  const wasPlayingRef = useRef<boolean>(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        const shouldPlay = wasPlayingRef.current;
        setIsFullscreen(false);
        // Restore playing state after exiting fullscreen
        if (shouldPlay) {
          // Longer delay to ensure fullscreen transition is complete
          setTimeout(() => {
            play();
          }, 300);
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [setIsFullscreen, play]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (isFullscreen) {
      // Save current playing state before entering fullscreen
      wasPlayingRef.current = videoState.isPlaying;
      container.requestFullscreen().catch((err) => {
        console.error('Failed to enter fullscreen:', err);
        setIsFullscreen(false);
      });
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    }
  }, [isFullscreen, setIsFullscreen, videoState.isPlaying]);

  if (!isFullscreen) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black z-50"
    >
      {/* Compact toolbar on the left */}
      <CompactToolbar />

      {/* Main content */}
      <div className="w-full h-full flex flex-col">
        {/* Video area - maintains aspect ratio for both portrait and landscape */}
        <div
          className="flex items-center justify-center overflow-hidden gap-2"
          style={{ height: 'calc(100vh - 120px)' }}
        >
          {isComparisonMode && secondVideoSource ? (
            <>
              <div className="relative flex-1 h-full">
                <div className="absolute top-2 left-2 bg-black bg-opacity-70 px-3 py-1 rounded text-sm font-semibold z-10">
                  Before
                </div>
                <VideoPlayer />
                <VideoCanvas />
              </div>
              <div className="relative flex-1 h-full">
                <div className="absolute top-2 left-2 bg-black bg-opacity-70 px-3 py-1 rounded text-sm font-semibold z-10">
                  After
                </div>
                <VideoPlayer2 />
                <VideoCanvas2 />
              </div>
            </>
          ) : (
            <div className="relative w-full h-full">
              <VideoPlayer />
              <VideoCanvas />
            </div>
          )}
        </div>

        {/* Controls at bottom */}
        <div className="flex-shrink-0 p-4" style={{ height: '120px' }}>
          <VideoControls />
        </div>
      </div>
    </div>
  );
};

export default FullscreenPlayer;
