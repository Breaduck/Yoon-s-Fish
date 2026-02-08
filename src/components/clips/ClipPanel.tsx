import React, { useState } from 'react';
import { useClips } from '../../context/ClipContext';
import { useVideo } from '../../context/VideoContext';

const ClipPanel: React.FC = () => {
  const { clips, removeClip, updateClipTitle, selectedClip, setSelectedClip, selectedClips, toggleClipSelection, clearSelection } = useClips();
  const { setSource } = useVideo();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleDownloadSelected = () => {
    selectedClips.forEach(clipId => {
      const clip = clips.find(c => c.id === clipId);
      if (clip) {
        const a = document.createElement('a');
        a.href = clip.url;
        a.download = `${clip.title}.webm`;
        a.click();
      }
    });
  };

  const handleClipClick = (clip: typeof clips[0]) => {
    setSelectedClip(clip);
    setSource({ type: 'file', url: clip.url });
  };

  const handleDoubleClick = (clip: typeof clips[0]) => {
    setEditingId(clip.id);
    setEditTitle(clip.title);
  };

  const handleTitleSubmit = (id: string) => {
    if (editTitle.trim()) {
      updateClipTitle(id, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="w-full h-full bg-white rounded-2xl lg:rounded-l-3xl lg:rounded-r-none p-3 sm:p-4 shadow-xl">
      <div className="mb-3 sm:mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">클립</h2>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs sm:text-sm rounded-lg sm:rounded-xl font-semibold transition-all"
          >
            {isCollapsed ? '▼' : '▲'}
          </button>
        </div>
        {selectedClips.length > 0 && (
          <button
            onClick={handleDownloadSelected}
            className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg font-semibold transition-all"
          >
            다운로드 ({selectedClips.length})
          </button>
        )}
      </div>

      {!isCollapsed && (
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {clips.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">
              녹화된 클립이 없습니다
            </p>
          ) : (
            clips.map((clip, index) => (
              <div
                key={clip.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('clipId', clip.id);
                  e.dataTransfer.effectAllowed = 'copy';
                }}
                className={`p-3 rounded-xl cursor-pointer transition-all ${
                  selectedClip?.id === clip.id
                    ? 'bg-blue-100 border-2 border-blue-500'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => handleClipClick(clip)}
                onDoubleClick={() => handleDoubleClick(clip)}
              >
                <div className="flex items-center justify-between">
                  <input
                    type="checkbox"
                    checked={selectedClips.includes(clip.id)}
                    onChange={() => toggleClipSelection(clip.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4 accent-blue-500 rounded mr-2"
                  />
                  <div className="flex-1">
                    {editingId === clip.id ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={() => handleTitleSubmit(clip.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleTitleSubmit(clip.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        className="w-full px-2 py-1 text-sm font-semibold bg-white border-2 border-blue-500 rounded"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <div className="text-sm font-semibold text-gray-800">
                        {clip.title}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      {clip.duration}초 · {new Date(clip.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeClip(clip.id);
                    }}
                    className="ml-2 w-6 h-6 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-xs font-bold transition-all"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ClipPanel;
