import React, { useEffect, useState } from 'react';
import { useTool } from '../../context/ToolContext';
import { useAnnotations } from '../../context/AnnotationContext';
import { useVideo } from '../../context/VideoContext';
import { ReferenceLine } from '../../types/drawing';
import { COLOR_OPTIONS } from '../../utils/colors';

const ReferenceLines: React.FC = () => {
  const { toolSettings, updateToolSettings } = useTool();
  const { setReferenceLines } = useAnnotations();
  const { videoRef } = useVideo();
  const [isSettingWaterline, setIsSettingWaterline] = useState(false);

  useEffect(() => {
    const lines: ReferenceLine[] = [];

    // Generate horizontal lines with waterline as center
    if (toolSettings.showHorizontalLines && toolSettings.lineCount > 0) {
      const waterlinePos = toolSettings.waterlinePosition || 38;

      // Always include waterline as one of the lines
      lines.push({
        id: 'waterline',
        type: 'horizontal',
        position: waterlinePos,
        color: toolSettings.color,
        thickness: toolSettings.lineThickness,
      });

      // Calculate remaining lines to distribute above and below waterline
      const remainingLines = toolSettings.lineCount - 1;
      if (remainingLines > 0) {
        const linesAbove = Math.floor(remainingLines / 2);
        const linesBelow = Math.ceil(remainingLines / 2);

        // Space above waterline: 0 to waterlinePos
        const spaceAbove = waterlinePos;
        const stepAbove = spaceAbove / (linesAbove + 1);

        // Space below waterline: waterlinePos to 100
        const spaceBelow = 100 - waterlinePos;
        const stepBelow = spaceBelow / (linesBelow + 1);

        // Add lines above waterline
        for (let i = 1; i <= linesAbove; i++) {
          lines.push({
            id: `h-line-above-${i}`,
            type: 'horizontal',
            position: stepAbove * i,
            color: toolSettings.color,
            thickness: toolSettings.lineThickness,
          });
        }

        // Add lines below waterline
        for (let i = 1; i <= linesBelow; i++) {
          lines.push({
            id: `h-line-below-${i}`,
            type: 'horizontal',
            position: waterlinePos + stepBelow * i,
            color: toolSettings.color,
            thickness: toolSettings.lineThickness,
          });
        }
      }
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
  }, [toolSettings.lineCount, toolSettings.verticalLineCount, toolSettings.showHorizontalLines, toolSettings.showVerticalLines, toolSettings.color, toolSettings.lineThickness, toolSettings.waterlinePosition, setReferenceLines]);

  // Waterline adjustment functions
  const adjustWaterline = (delta: number) => {
    const currentPos = toolSettings.waterlinePosition || 34;
    const newPos = Math.max(0, Math.min(100, currentPos + delta));
    updateToolSettings({ waterlinePosition: newPos });
  };

  // Handle waterline click on video
  useEffect(() => {
    if (!isSettingWaterline) return;

    const handleClick = (e: MouseEvent) => {
      const video = videoRef.current;
      if (!video) return;

      const rect = video.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      const yPercent = Math.max(0, Math.min(100, (clickY / rect.height) * 100));

      updateToolSettings({ waterlinePosition: yPercent });

      setIsSettingWaterline(false);
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [isSettingWaterline, videoRef, updateToolSettings]);

  return (
    <div className="space-y-5 pt-5 border-t border-gray-200">
      <div>
        <div className="flex items-center justify-between gap-2">
          <label className="text-sm font-semibold text-gray-700">
            수평선 개수
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateToolSettings({ lineCount: Math.max(2, toolSettings.lineCount - 1) })}
              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold transition-all"
            >
              -
            </button>
            <span className="w-8 text-center text-sm font-bold text-gray-800">{toolSettings.lineCount}</span>
            <button
              onClick={() => updateToolSettings({ lineCount: Math.min(10, toolSettings.lineCount + 1) })}
              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold transition-all"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between gap-2">
          <label className="text-sm font-semibold text-gray-700">
            선 두께
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateToolSettings({ lineThickness: Math.max(1, toolSettings.lineThickness - 1) })}
              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold transition-all"
            >
              -
            </button>
            <span className="w-8 text-center text-sm font-bold text-gray-800">{toolSettings.lineThickness}</span>
            <button
              onClick={() => updateToolSettings({ lineThickness: Math.min(6, toolSettings.lineThickness + 1) })}
              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold transition-all"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div>
        <label className="flex items-center gap-3 text-sm font-semibold text-gray-700 cursor-pointer bg-gray-50 p-3 rounded-xl hover:bg-gray-100 transition-all">
          <input
            type="checkbox"
            checked={toolSettings.showHorizontalLines}
            onChange={(e) => updateToolSettings({ showHorizontalLines: e.target.checked })}
            className="w-5 h-5 accent-blue-500 rounded"
          />
          수평선 표시
        </label>
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
          <div className="flex items-center justify-between gap-2">
            <label className="text-sm font-semibold text-gray-700">
              수직선 개수
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateToolSettings({ verticalLineCount: Math.max(1, toolSettings.verticalLineCount - 1) })}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold transition-all"
              >
                -
              </button>
              <span className="w-8 text-center text-sm font-bold text-gray-800">{toolSettings.verticalLineCount}</span>
              <button
                onClick={() => updateToolSettings({ verticalLineCount: Math.min(10, toolSettings.verticalLineCount + 1) })}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold transition-all"
              >
                +
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Waterline Section - Default 38% with manual selection */}
      <div className="pt-3 border-t border-gray-200">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-700">수면 기준선</label>
            <button
              onClick={() => setIsSettingWaterline(true)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                isSettingWaterline
                  ? 'bg-cyan-500 text-white'
                  : 'bg-cyan-100 hover:bg-cyan-200 text-cyan-700'
              }`}
            >
              {isSettingWaterline ? '→ 영상 클릭' : '위치 선택'}
            </button>
          </div>

          <div className="bg-blue-50 p-3 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">
                위치: <span className="font-bold text-blue-600">{(toolSettings.waterlinePosition || 38).toFixed(1)}%</span>
              </span>
              <span className="text-xs text-gray-500">중심 기준선</span>
            </div>

            {/* Fine adjustment controls */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-gray-600">미세 조정 (0.1%)</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => adjustWaterline(-0.1)}
                  className="w-8 h-8 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-bold transition-all"
                  title="아래로"
                >
                  ↓
                </button>
                <button
                  onClick={() => adjustWaterline(0.1)}
                  className="w-8 h-8 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-bold transition-all"
                  title="위로"
                >
                  ↑
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">색상</label>
        <div className="grid grid-cols-4 gap-2">
          {COLOR_OPTIONS.map((color) => (
            <button
              key={color.value}
              onClick={() => updateToolSettings({ color: color.value })}
              className={`w-6 h-6 rounded-xl border-3 transition-all ${
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
