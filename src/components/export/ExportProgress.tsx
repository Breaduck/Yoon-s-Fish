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
    <div className="space-y-3">
      <div className="text-center">
        <div className={`text-5xl font-bold ${getStatusColor()}`}>
          {Math.round(progress.progress)}%
        </div>
        {progress.error && (
          <p className="text-sm text-red-400 mt-2">{progress.error}</p>
        )}
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
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
