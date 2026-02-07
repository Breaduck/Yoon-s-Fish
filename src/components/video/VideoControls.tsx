import React from 'react';
import { useVideo } from '../../context/VideoContext';
import { useTool } from '../../context/ToolContext';
import { PlaybackRate } from '../../types/video';

const PLAYBACK_RATES: PlaybackRate[] = [0.25, 0.5, 0.75, 1, 1.5, 2];

const VideoControls: React.FC = () => {
  const { videoState, play, pause, setPlaybackRate, seek } = useVideo();
  const { setIsFullscreen } = useTool();

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
          <button
            onClick={() => setIsFullscreen(true)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 text-sm font-semibold ml-2 transition-all"
            title="전체화면"
          >
            전체화면
          </button>
        </div>

        {/* Time display */}
        <div className="text-gray-700 text-sm font-semibold">
          {formatTime(videoState.currentTime)} / {formatTime(videoState.duration)}
        </div>

        {/* Playback speed */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-gray-500 text-sm font-medium">속도</span>
          {PLAYBACK_RATES.map((rate) => (
            <button
              key={rate}
              onClick={() => setPlaybackRate(rate)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                videoState.playbackRate === rate
                  ? 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow-md shadow-blue-500/30'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>
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
