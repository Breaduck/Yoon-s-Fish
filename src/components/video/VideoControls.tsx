import React, { useState, useRef, useEffect } from 'react';
import { useVideo } from '../../context/VideoContext';
import { useTool } from '../../context/ToolContext';
import { PlaybackRate } from '../../types/video';

const PLAYBACK_RATES: PlaybackRate[] = [0.25, 0.5, 0.75, 1, 1.5, 2];

const VideoControls: React.FC = () => {
  const { videoState, play, pause, setPlaybackRate, seek } = useVideo();
  const { setIsFullscreen } = useTool();
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [customSpeed, setCustomSpeed] = useState('');
  const speedMenuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (speedMenuRef.current && !speedMenuRef.current.contains(event.target as Node)) {
        setShowSpeedMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCustomSpeedSubmit = () => {
    const speed = parseFloat(customSpeed);
    if (!isNaN(speed) && speed > 0 && speed <= 4) {
      setPlaybackRate(speed as PlaybackRate);
      setCustomSpeed('');
      setShowSpeedMenu(false);
    }
  };

  const handlePlayPause = () => {
    if (videoState.isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const handleSeekBack = () => {
    seek(Math.max(0, videoState.currentTime - 5));
  };

  const handleSeekForward = () => {
    seek(Math.min(videoState.duration, videoState.currentTime + 5));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!videoState.source) return null;

  return (
    <div className="space-y-2">
      {/* Progress bar - prominent at top */}
      <div className="flex items-center gap-3">
        <div className="text-white text-xs font-medium drop-shadow-lg">
          {formatTime(videoState.currentTime)}
        </div>
        <input
          type="range"
          min="0"
          max={videoState.duration || 100}
          value={videoState.currentTime}
          onChange={(e) => seek(parseFloat(e.target.value))}
          className="flex-1 h-1 bg-white/30 rounded-full appearance-none cursor-pointer accent-blue-500"
          style={{
            backgroundImage: `linear-gradient(to right, rgb(59, 130, 246) 0%, rgb(59, 130, 246) ${(videoState.currentTime / videoState.duration) * 100}%, rgba(255,255,255,0.3) ${(videoState.currentTime / videoState.duration) * 100}%, rgba(255,255,255,0.3) 100%)`
          }}
        />
        <div className="text-white text-xs font-medium drop-shadow-lg">
          {formatTime(videoState.duration)}
        </div>
      </div>

      {/* Centered play button and side controls */}
      <div className="flex items-center justify-center gap-2 relative">
        {/* Left controls */}
        <div className="absolute left-0 flex items-center gap-2">
          <button
            onClick={handleSeekBack}
            className="w-7 h-7 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-white flex items-center justify-center transition-all text-sm"
            title="5초 뒤로"
          >
            ⏮
          </button>
        </div>

        {/* Center play button */}
        <button
          onClick={handlePlayPause}
          className="w-10 h-10 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full text-gray-800 font-semibold flex items-center justify-center transition-all shadow-lg"
        >
          {videoState.isPlaying ? '⏸' : '▶'}
        </button>

        {/* Right controls */}
        <div className="absolute right-0 flex items-center gap-2">
          <button
            onClick={handleSeekForward}
            className="w-7 h-7 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-white flex items-center justify-center transition-all text-sm"
            title="5초 앞으로"
          >
            ⏭
          </button>

          {/* Playback speed */}
          <div className="relative" ref={speedMenuRef}>
            <button
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className="px-2 py-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-white text-xs font-semibold transition-all"
            >
              {videoState.playbackRate}x
            </button>

            {showSpeedMenu && (
              <div className="absolute bottom-full right-0 mb-2 bg-white rounded-xl shadow-xl border border-gray-200 p-2 min-w-[160px] z-50">
                <div className="space-y-1">
                  {PLAYBACK_RATES.map((rate) => (
                    <button
                      key={rate}
                      onClick={() => {
                        setPlaybackRate(rate);
                        setShowSpeedMenu(false);
                      }}
                      className={`w-full px-3 py-1.5 rounded-lg text-xs font-semibold text-left transition-all ${
                        videoState.playbackRate === rate
                          ? 'bg-blue-500 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsFullscreen(true)}
            className="w-7 h-7 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-white flex items-center justify-center transition-all text-sm"
            title="전체화면"
          >
            ⛶
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoControls;
