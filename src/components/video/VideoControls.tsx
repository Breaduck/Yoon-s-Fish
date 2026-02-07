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
    <div className="bg-white p-6 rounded-3xl shadow-lg">
      <div className="flex items-center gap-4">
        {/* Playback controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSeekBack}
            className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 flex items-center justify-center transition-all"
            title="5초 뒤로"
          >
            ⏮
          </button>
          <button
            onClick={handlePlayPause}
            className="w-14 h-14 bg-gradient-to-r from-blue-500 to-emerald-500 hover:shadow-lg rounded-2xl text-white font-semibold text-xl flex items-center justify-center transition-all shadow-md shadow-blue-500/30"
          >
            {videoState.isPlaying ? '⏸' : '▶'}
          </button>
          <button
            onClick={handleSeekForward}
            className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 flex items-center justify-center transition-all"
            title="5초 앞으로"
          >
            ⏭
          </button>
        </div>

        {/* Time display */}
        <div className="text-gray-700 text-sm font-semibold">
          {formatTime(videoState.currentTime)} / {formatTime(videoState.duration)}
        </div>

        {/* Playback speed */}
        <div className="relative ml-auto" ref={speedMenuRef}>
          <button
            onClick={() => setShowSpeedMenu(!showSpeedMenu)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 text-sm font-semibold transition-all flex items-center gap-2"
          >
            <span>{videoState.playbackRate}x</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showSpeedMenu && (
            <div className="absolute bottom-full right-0 mb-2 bg-white rounded-xl shadow-xl border border-gray-200 p-2 min-w-[200px] z-50">
              <div className="space-y-1">
                {PLAYBACK_RATES.map((rate) => (
                  <button
                    key={rate}
                    onClick={() => {
                      setPlaybackRate(rate);
                      setShowSpeedMenu(false);
                    }}
                    className={`w-full px-4 py-2 rounded-lg text-sm font-semibold text-left transition-all ${
                      videoState.playbackRate === rate
                        ? 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
              <div className="border-t border-gray-200 mt-2 pt-2">
                <p className="text-xs text-gray-500 mb-2 px-2">직접 입력 (0.1 ~ 4.0)</p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0.1"
                    max="4"
                    step="0.1"
                    value={customSpeed}
                    onChange={(e) => setCustomSpeed(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCustomSpeedSubmit()}
                    placeholder="1.0"
                    className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    onClick={handleCustomSpeedSubmit}
                    className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-lg transition-all"
                  >
                    설정
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fullscreen button */}
        <button
          onClick={() => setIsFullscreen(true)}
          className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 flex items-center justify-center transition-all text-lg"
          title="전체화면"
        >
          ⛶
        </button>
      </div>

      {/* Progress bar */}
      <div className="mt-5">
        <input
          type="range"
          min="0"
          max={videoState.duration || 100}
          value={videoState.currentTime}
          onChange={(e) => seek(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-500"
        />
      </div>
    </div>
  );
};

export default VideoControls;
