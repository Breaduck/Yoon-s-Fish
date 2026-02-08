import React from 'react';
import { useTool } from '../../context/ToolContext';
import { COLOR_OPTIONS } from '../../utils/colors';

const CompactToolbar: React.FC = () => {
  const { activeTool, setActiveTool, toolSettings, updateToolSettings, setIsFullscreen } = useTool();

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 bg-gray-900/90 backdrop-blur-sm p-3 rounded-lg space-y-2 z-50 border border-gray-700">
      {/* Close fullscreen */}
      <button
        onClick={() => setIsFullscreen(false)}
        className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
        title="전체화면 종료"
      >
        ✕
      </button>

      {/* Tool buttons */}
      <div className="space-y-1">
        <button
          onClick={() => setActiveTool(activeTool === 'arrow' ? null : 'arrow')}
          className={`w-full px-3 py-2 rounded text-sm ${
            activeTool === 'arrow'
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          화살표
        </button>

        <button
          onClick={() => setActiveTool(activeTool === 'pen' ? null : 'pen')}
          className={`w-full px-3 py-2 rounded text-sm ${
            activeTool === 'pen'
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          자유그리기
        </button>

        <button
          onClick={() => setActiveTool(activeTool === 'eraser' ? null : 'eraser')}
          className={`w-full px-3 py-2 rounded text-sm ${
            activeTool === 'eraser'
              ? 'bg-red-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          지우개
        </button>
      </div>

      {/* Quick color picker */}
      {(activeTool === 'arrow' || activeTool === 'pen') && (
        <div className="pt-2 border-t border-gray-700">
          <div className="grid grid-cols-3 gap-1">
            {COLOR_OPTIONS.slice(0, 6).map((color) => (
              <button
                key={color.value}
                onClick={() => updateToolSettings({ color: color.value })}
                className={`w-8 h-8 rounded border-2 ${
                  toolSettings.color === color.value
                    ? 'border-white'
                    : 'border-gray-600'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.label}
              />
            ))}
          </div>
        </div>
      )}

      {/* Arrow style for arrow tool */}
      {activeTool === 'arrow' && (
        <div className="pt-2 border-t border-gray-700 space-y-1">
          <button
            onClick={() => updateToolSettings({ arrowStyle: 'solid' })}
            className={`w-full px-2 py-1 rounded text-xs ${
              toolSettings.arrowStyle === 'solid'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            실선
          </button>
          <button
            onClick={() => updateToolSettings({ arrowStyle: toolSettings.arrowStyle === 'solid' ? 'dash-short' : 'solid' })}
            className={`w-full px-2 py-1 rounded text-xs ${
              toolSettings.arrowStyle !== 'solid'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            점선
          </button>
        </div>
      )}
    </div>
  );
};

export default CompactToolbar;
