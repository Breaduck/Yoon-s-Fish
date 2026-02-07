import React from 'react';
import { useTool } from '../../context/ToolContext';
import { useAnnotations } from '../../context/AnnotationContext';
import { COLOR_OPTIONS, THICKNESS_OPTIONS } from '../../utils/colors';
import ReferenceLines from './ReferenceLines';

const ToolPanel: React.FC = () => {
  const { activeTool, setActiveTool, toolSettings, updateToolSettings, resetSettings } = useTool();
  const { clearDrawings } = useAnnotations();

  const handleReset = () => {
    resetSettings();
    clearDrawings();
  };

  return (
    <div className="w-72 bg-white rounded-3xl p-6 shadow-xl space-y-5">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-gray-800">도구</h2>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-xl font-semibold transition-all"
          title="설정 및 그림 초기화"
        >
          초기화
        </button>
      </div>

      {/* Tool buttons */}
      <div className="space-y-2">
        <button
          onClick={() => setActiveTool(activeTool === 'reference-lines' ? null : 'reference-lines')}
          className={`w-full px-5 py-3.5 rounded-xl text-left font-semibold transition-all ${
            activeTool === 'reference-lines'
              ? 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow-lg shadow-blue-500/30'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
        >
          📏 기준선
        </button>

        <button
          onClick={() => setActiveTool(activeTool === 'arrow' ? null : 'arrow')}
          className={`w-full px-5 py-3.5 rounded-xl text-left font-semibold transition-all ${
            activeTool === 'arrow'
              ? 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow-lg shadow-blue-500/30'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
        >
          ➤ 화살표
        </button>

        <button
          onClick={() => setActiveTool(activeTool === 'pen' ? null : 'pen')}
          className={`w-full px-5 py-3.5 rounded-xl text-left font-semibold transition-all ${
            activeTool === 'pen'
              ? 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow-lg shadow-blue-500/30'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
        >
          ✏️ 자유 그리기
        </button>

        <button
          onClick={() => setActiveTool(activeTool === 'eraser' ? null : 'eraser')}
          className={`w-full px-5 py-3.5 rounded-xl text-left font-semibold transition-all ${
            activeTool === 'eraser'
              ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/30'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
        >
          🗑️ 지우개
        </button>

        <button
          onClick={() => setActiveTool(activeTool === 'angle' ? null : 'angle')}
          className={`w-full px-5 py-3.5 rounded-xl text-left font-semibold transition-all ${
            activeTool === 'angle'
              ? 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow-lg shadow-blue-500/30'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
        >
          📐 각도기
        </button>
      </div>

      {/* Reference Lines Settings */}
      {activeTool === 'reference-lines' && <ReferenceLines />}

      {/* Arrow Settings */}
      {activeTool === 'arrow' && (
        <div className="space-y-5 pt-5 border-t border-gray-200">
          <div>
            <label className="block text-sm text-gray-400 mb-2">스타일</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => updateToolSettings({ arrowStyle: 'solid' })}
                className={`px-3 py-2 rounded text-sm ${
                  toolSettings.arrowStyle === 'solid'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                실선
              </button>
              <button
                onClick={() => updateToolSettings({ arrowStyle: 'dashed' })}
                className={`px-3 py-2 rounded text-sm ${
                  toolSettings.arrowStyle === 'dashed'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                점선
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">색상</label>
            <div className="grid grid-cols-4 gap-2">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => updateToolSettings({ color: color.value })}
                  className={`w-10 h-10 rounded border-2 ${
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

          <div>
            <label className="block text-sm text-gray-400 mb-2">굵기</label>
            <div className="space-y-1">
              {THICKNESS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateToolSettings({ thickness: option.value })}
                  className={`w-full px-3 py-2 rounded text-sm text-left ${
                    toolSettings.thickness === option.value
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pen Settings */}
      {activeTool === 'pen' && (
        <div className="space-y-5 pt-5 border-t border-gray-200">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">색상</label>
            <div className="grid grid-cols-4 gap-2">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => updateToolSettings({ color: color.value })}
                  className={`w-10 h-10 rounded border-2 ${
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

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              펜 굵기: <span className="text-blue-600">{toolSettings.penThickness}</span>
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={toolSettings.penThickness}
              onChange={(e) => updateToolSettings({ penThickness: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>
      )}

      {/* Angle Settings */}
      {activeTool === 'angle' && (
        <div className="space-y-5 pt-5 border-t border-gray-200">
          <div className="bg-blue-50 p-4 rounded-xl">
            <p className="text-sm font-semibold text-gray-700 mb-2">3개의 점을 클릭하세요</p>
            <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
              <li>첫 번째 점 (시작)</li>
              <li>두 번째 점 (꼭지점)</li>
              <li>세 번째 점 (끝)</li>
            </ol>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">색상</label>
            <div className="grid grid-cols-4 gap-2">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => updateToolSettings({ color: color.value })}
                  className={`w-10 h-10 rounded border-2 ${
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
        </div>
      )}
    </div>
  );
};

export default ToolPanel;
