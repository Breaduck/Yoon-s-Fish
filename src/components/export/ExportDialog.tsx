import React, { useState } from 'react';
import { ExportOptions } from '../../types/export';
import { useExport } from '../../hooks/useExport';
import ExportProgress from './ExportProgress';

const ExportDialog: React.FC = () => {
  const { progress, exportVideo } = useExport();
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ExportOptions>({
    format: 'webm',
    quality: 'high',
    includeAnnotations: true,
    includePose: true,
  });

  const handleExport = () => {
    exportVideo(options);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg text-white rounded-xl font-semibold transition-all shadow-md shadow-purple-500/30"
      >
        영상 내보내기
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center" style={{ zIndex: 9999 }}>
      <div className="bg-white rounded-3xl p-8 w-96 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">영상 내보내기</h2>

        {progress.status === 'idle' ? (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">형식</label>
              <select
                value={options.format}
                onChange={(e) => setOptions({ ...options, format: e.target.value as 'webm' | 'mp4' })}
                className="w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-xl border-2 border-gray-200 font-medium focus:border-blue-500 focus:outline-none"
              >
                <option value="webm">WebM</option>
                <option value="mp4">MP4</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">품질</label>
              <select
                value={options.quality}
                onChange={(e) => setOptions({ ...options, quality: e.target.value as 'low' | 'medium' | 'high' })}
                className="w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-xl border-2 border-gray-200 font-medium focus:border-blue-500 focus:outline-none"
              >
                <option value="low">낮음 (2.5 Mbps)</option>
                <option value="medium">보통 (5 Mbps)</option>
                <option value="high">높음 (10 Mbps)</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 text-sm font-semibold text-gray-700 cursor-pointer bg-gray-50 p-4 rounded-xl hover:bg-gray-100 transition-all">
                <input
                  type="checkbox"
                  checked={options.includeAnnotations}
                  onChange={(e) => setOptions({ ...options, includeAnnotations: e.target.checked })}
                  className="w-5 h-5 accent-blue-500 rounded"
                />
                주석 포함 (화살표, 선)
              </label>

              <label className="flex items-center gap-3 text-sm font-semibold text-gray-700 cursor-pointer bg-gray-50 p-4 rounded-xl hover:bg-gray-100 transition-all">
                <input
                  type="checkbox"
                  checked={options.includePose}
                  onChange={(e) => setOptions({ ...options, includePose: e.target.checked })}
                  className="w-5 h-5 accent-blue-500 rounded"
                />
                자세 감지 포함
              </label>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={handleExport}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-emerald-500 hover:shadow-lg text-white rounded-xl font-bold transition-all shadow-md shadow-blue-500/30"
              >
                내보내기
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all"
              >
                취소
              </button>
            </div>
          </div>
        ) : (
          <div>
            <ExportProgress progress={progress} />
            {progress.status === 'complete' && (
              <button
                onClick={() => setIsOpen(false)}
                className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-emerald-500 hover:shadow-lg text-white rounded-xl font-bold transition-all shadow-md shadow-blue-500/30"
              >
                닫기
              </button>
            )}
            {progress.status === 'error' && (
              <button
                onClick={() => setIsOpen(false)}
                className="w-full mt-6 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all"
              >
                닫기
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportDialog;
