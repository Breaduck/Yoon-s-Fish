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
    <div className="space-y-4">
      <div className="text-center">
        <p className={`text-lg font-semibold ${getStatusColor()}`}>
          {progress.message}
        </p>
        {progress.error && (
          <p className="text-sm text-red-400 mt-2">{progress.error}</p>
        )}
      </div>

      <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
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

      <div className="text-center text-sm text-gray-400">
        {progress.progress}%
      </div>

      {progress.status === 'encoding' && (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
        </div>
      )}
    </div>
  );
};

export default ExportProgress;
