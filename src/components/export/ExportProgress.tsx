import React from 'react';
import { ExportProgress as ExportProgressType } from '../../types/export';

interface ExportProgressProps {
  progress: ExportProgressType;
}

const ExportProgress: React.FC<ExportProgressProps> = ({ progress }) => {
  const getStatusColor = () => {
    switch (progress.status) {
      case 'complete':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-blue-500';
    }
  };

  return (
    <div className="space-y-2">
      <div className="text-center">
        <div className={`text-4xl font-bold ${getStatusColor()}`}>
          {Math.round(progress.progress)}%
        </div>
        {progress.status === 'encoding' && (
          <p className="text-xs text-gray-500 mt-1">동영상 다운로드 중..</p>
        )}
        {progress.status === 'complete' && (
          <p className="text-sm text-green-600 font-semibold mt-1">다운로드 완료</p>
        )}
        {progress.error && (
          <p className="text-sm text-red-400 mt-1">{progress.error}</p>
        )}
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full ${
            progress.status === 'error'
              ? 'bg-red-500'
              : progress.status === 'complete'
              ? 'bg-green-500'
              : 'bg-blue-500'
          }`}
          style={{ width: `${progress.progress}%` }}
        />
      </div>
    </div>
  );
};

export default ExportProgress;
