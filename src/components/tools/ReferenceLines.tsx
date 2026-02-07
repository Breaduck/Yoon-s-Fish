import React, { useEffect } from 'react';
import { useTool } from '../../context/ToolContext';
import { useAnnotations } from '../../context/AnnotationContext';
import { ReferenceLine } from '../../types/drawing';
import { COLOR_OPTIONS } from '../../utils/colors';

const ReferenceLines: React.FC = () => {
  const { toolSettings, updateToolSettings } = useTool();
  const { setReferenceLines } = useAnnotations();

  useEffect(() => {
    const lines: ReferenceLine[] = [];

    // Generate horizontal lines
    const hStep = 100 / (toolSettings.lineCount + 1);
    for (let i = 1; i <= toolSettings.lineCount; i++) {
      lines.push({
        id: `h-line-${i}`,
        type: 'horizontal',
        position: hStep * i,
        color: toolSettings.color,
        thickness: toolSettings.lineThickness,
      });
    }

    // Generate vertical lines if enabled
    if (toolSettings.showVerticalLines) {
      const vStep = 100 / (toolSettings.verticalLineCount + 1);
      for (let i = 1; i <= toolSettings.verticalLineCount; i++) {
        lines.push({
          id: `v-line-${i}`,
          type: 'vertical',
          position: vStep * i,
          color: toolSettings.color,
          thickness: toolSettings.lineThickness,
        });
      }
    }

    setReferenceLines(lines);
  }, [toolSettings.lineCount, toolSettings.verticalLineCount, toolSettings.showVerticalLines, toolSettings.color, toolSettings.lineThickness, setReferenceLines]);

  return (
    <div className="space-y-5 pt-5 border-t border-gray-200">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          수평선 개수
        </label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => updateToolSettings({ lineCount: Math.max(2, toolSettings.lineCount - 1) })}
            className="w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold transition-all"
          >
            -
          </button>
          <input
            type="number"
            min="2"
            max="10"
            value={toolSettings.lineCount}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (!isNaN(value) && value >= 2 && value <= 10) {
                updateToolSettings({ lineCount: value });
              }
            }}
            className="flex-1 px-4 py-2 text-center bg-gray-50 text-gray-800 rounded-lg border-2 border-gray-200 font-semibold focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={() => updateToolSettings({ lineCount: Math.min(10, toolSettings.lineCount + 1) })}
            className="w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold transition-all"
          >
            +
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          선 두께
        </label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => updateToolSettings({ lineThickness: Math.max(1, toolSettings.lineThickness - 1) })}
            className="w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold transition-all"
          >
            -
          </button>
          <input
            type="number"
            min="1"
            max="6"
            value={toolSettings.lineThickness}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (!isNaN(value) && value >= 1 && value <= 6) {
                updateToolSettings({ lineThickness: value });
              }
            }}
            className="flex-1 px-4 py-2 text-center bg-gray-50 text-gray-800 rounded-lg border-2 border-gray-200 font-semibold focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={() => updateToolSettings({ lineThickness: Math.min(6, toolSettings.lineThickness + 1) })}
            className="w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold transition-all"
          >
            +
          </button>
        </div>
      </div>

      <div>
        <label className="flex items-center gap-3 text-sm font-semibold text-gray-700 cursor-pointer bg-gray-50 p-3 rounded-xl hover:bg-gray-100 transition-all">
          <input
            type="checkbox"
            checked={toolSettings.showVerticalLines}
            onChange={(e) => updateToolSettings({ showVerticalLines: e.target.checked })}
            className="w-5 h-5 accent-blue-500 rounded"
          />
          수직선 표시
        </label>
      </div>

      {toolSettings.showVerticalLines && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            수직선 개수
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateToolSettings({ verticalLineCount: Math.max(1, toolSettings.verticalLineCount - 1) })}
              className="w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold transition-all"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              max="10"
              value={toolSettings.verticalLineCount}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (!isNaN(value) && value >= 1 && value <= 10) {
                  updateToolSettings({ verticalLineCount: value });
                }
              }}
              className="flex-1 px-4 py-2 text-center bg-gray-50 text-gray-800 rounded-lg border-2 border-gray-200 font-semibold focus:border-blue-500 focus:outline-none"
            />
            <button
              onClick={() => updateToolSettings({ verticalLineCount: Math.min(10, toolSettings.verticalLineCount + 1) })}
              className="w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold transition-all"
            >
              +
            </button>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">색상</label>
        <div className="grid grid-cols-4 gap-2">
          {COLOR_OPTIONS.map((color) => (
            <button
              key={color.value}
              onClick={() => updateToolSettings({ color: color.value })}
              className={`w-12 h-12 rounded-xl border-3 transition-all ${
                toolSettings.color === color.value
                  ? 'border-gray-800 scale-110 shadow-lg'
                  : 'border-gray-200 hover:scale-105'
              }`}
              style={{ backgroundColor: color.value }}
              title={color.label}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReferenceLines;
