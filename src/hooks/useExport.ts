import { useState } from 'react';
import { ExportService } from '../services/exportService';
import { ExportOptions, ExportProgress } from '../types/export';
import { useAnnotations } from '../context/AnnotationContext';
import { useVideo } from '../context/VideoContext';

export const useExport = () => {
  const { videoRef, videoRef2, secondVideoSource } = useVideo();
  const { annotations } = useAnnotations();
  const [progress, setProgress] = useState<ExportProgress>({
    status: 'idle',
    progress: 0,
    message: '',
  });

  const exportVideo = async (options: ExportOptions) => {
    const video = videoRef.current;

    if (!video) {
      setProgress({
        status: 'error',
        progress: 0,
        message: 'Video not available',
      });
      return;
    }

    const exportService = new ExportService();

    try {
      const blob = await exportService.exportVideo(
        video,
        annotations,
        options,
        setProgress,
        secondVideoSource ? videoRef2.current : null
      );

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `aquaflux-analysis-${timestamp}.${options.format}`;
      exportService.downloadBlob(blob, filename);
    } catch (error) {
      console.error('Export failed:', error);
      setProgress({
        status: 'error',
        progress: 0,
        message: 'Export failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  return {
    progress,
    exportVideo,
  };
};
