import React from 'react';
import { useTool } from '../../context/ToolContext';
import { useAnnotations } from '../../context/AnnotationContext';
import { useVideo } from '../../context/VideoContext';
import { COLOR_OPTIONS, THICKNESS_OPTIONS } from '../../utils/colors';
import ReferenceLines from './ReferenceLines';

const ToolPanel: React.FC = () => {
  const { activeTool, setActiveTool, toolSettings, updateToolSettings, resetSettings, isToolPanelCollapsed, setIsToolPanelCollapsed, isComparisonMode } = useTool();
  const { clearDrawings, setReferenceLines } = useAnnotations();
  const { playBoth } = useVideo();

  const handleReset = () => {
    resetSettings();
    clearDrawings();
    setReferenceLines([]);
  };

  const handleReferenceLinesToggle = () => {
    if (activeTool === 'reference-lines') {
      setActiveTool(null);
      setReferenceLines([]);
    } else {
      setActiveTool('reference-lines');
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl p-4 shadow-xl space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-gray-800">도구</h2>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-xl font-semibold transition-all"
            title="설정 및 그림 초기화"
          >
            초기화
          </button>
          <button
            onClick={() => setIsToolPanelCollapsed(!isToolPanelCollapsed)}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-xl font-semibold transition-all"
            title={isToolPanelCollapsed ? "펼치기" : "접기"}
          >
            {isToolPanelCollapsed ? '›' : '‹'}
          </button>
        </div>
      </div>

      {!isToolPanelCollapsed && (
        <>

      {/* Tool buttons */}
      <div className="space-y-2">
        <button
          onClick={handleReferenceLinesToggle}
          className={`w-full px-5 py-3.5 rounded-xl text-left font-semibold transition-all ${
            activeTool === 'reference-lines'
              ? 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow-lg shadow-blue-500/30'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
        >
          기준선
        </button>

        <button
          onClick={() => setActiveTool(activeTool === 'arrow' ? null : 'arrow')}
          className={`w-full px-5 py-3.5 rounded-xl text-left font-semibold transition-all ${
            activeTool === 'arrow'
              ? 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow-lg shadow-blue-500/30'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
        >
          화살표
        </button>

        <button
          onClick={() => setActiveTool(activeTool === 'pen' ? null : 'pen')}
          className={`w-full px-5 py-3.5 rounded-xl text-left font-semibold transition-all ${
            activeTool === 'pen'
              ? 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow-lg shadow-blue-500/30'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
        >
          그리기
        </button>

        <button
          onClick={() => setActiveTool(activeTool === 'eraser' ? null : 'eraser')}
          className={`w-full px-5 py-3.5 rounded-xl text-left font-semibold transition-all ${
            activeTool === 'eraser'
              ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/30'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
        >
          지우개
        </button>

        <button
          onClick={() => setActiveTool(activeTool === 'angle' ? null : 'angle')}
          className={`w-full px-5 py-3.5 rounded-xl text-left font-semibold transition-all ${
            activeTool === 'angle'
              ? 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow-lg shadow-blue-500/30'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
        >
          각도기
        </button>
      </div>

      {/* Reference Lines Settings */}
      {activeTool === 'reference-lines' && <ReferenceLines />}

      {/* Arrow Settings */}
      {activeTool === 'arrow' && (
        <div className="space-y-5 pt-5 border-t border-gray-200">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">스타일</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => updateToolSettings({ arrowStyle: 'solid' })}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  toolSettings.arrowStyle === 'solid'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                실선
              </button>
              <button
                onClick={() => updateToolSettings({ arrowStyle: 'dashed' })}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  toolSettings.arrowStyle === 'dashed'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                점선
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">색상</label>
            <div className="grid grid-cols-4 gap-2">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => updateToolSettings({ color: color.value })}
                  className={`w-5 h-5 rounded border-2 ${
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
            <div className="flex items-center justify-between gap-2">
              <label className="text-sm font-semibold text-gray-700">
                굵기
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateToolSettings({ thickness: Math.max(1, toolSettings.thickness - 1) })}
                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold transition-all"
                >
                  -
                </button>
                <span className="w-8 text-center text-sm font-bold text-gray-800">{toolSettings.thickness}</span>
                <button
                  onClick={() => updateToolSettings({ thickness: Math.min(10, toolSettings.thickness + 1) })}
                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold transition-all"
                >
                  +
                </button>
              </div>
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
                  className={`w-5 h-5 rounded border-2 ${
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
            <div className="flex items-center justify-between gap-2">
              <label className="text-sm font-semibold text-gray-700">
                굵기
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateToolSettings({ penThickness: Math.max(1, toolSettings.penThickness - 1) })}
                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold transition-all"
                >
                  -
                </button>
                <span className="w-8 text-center text-sm font-bold text-gray-800">{toolSettings.penThickness}</span>
                <button
                  onClick={() => updateToolSettings({ penThickness: Math.min(20, toolSettings.penThickness + 1) })}
                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold transition-all"
                >
                  +
                </button>
              </div>
            </div>
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
                  className={`w-5 h-5 rounded border-2 ${
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

      {/* Comparison Mode Play Button */}
      {isComparisonMode && (
        <div className="pt-5 border-t border-gray-200 mt-5">
          <button
            onClick={playBoth}
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white rounded-xl font-semibold transition-all shadow-md flex items-center justify-center gap-2"
          >
            <span>⏯</span>
            <span>동시 시작</span>
          </button>
        </div>
      )}
      </>
      )}
    </div>
  );
};

export default ToolPanel;
