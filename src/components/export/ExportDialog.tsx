import React from 'react';
import { useVideo } from '../../context/VideoContext';
import { useAnnotations } from '../../context/AnnotationContext';

const ExportDialog: React.FC = () => {
  const { videoRef, videoState } = useVideo();
  const { annotations } = useAnnotations();

  const handleDownload = async () => {
    const video = videoRef.current;
    if (!video || !videoState.source) {
      alert('영상을 먼저 업로드해주세요.');
      return;
    }

    try {
      // Create canvas for rendering
      const canvas = document.createElement('canvas');
      canvas.width = 1920;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Create video stream
      const stream = canvas.captureStream(30);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 10000000
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aquaflux-video-${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
      };

      mediaRecorder.start();

      // Record video with annotations
      video.currentTime = 0;
      const duration = video.duration;
      const fps = 30;
      const frameTime = 1000 / fps;

      for (let t = 0; t < duration; t += 1 / fps) {
        video.currentTime = t;
        await new Promise(resolve => setTimeout(resolve, frameTime));

        // Draw video frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Draw annotations for current time
        const currentTime = Math.floor(t * 1000);
        // Add annotation drawing logic here if needed
      }

      mediaRecorder.stop();
    } catch (error) {
      console.error('Download error:', error);
      alert('다운로드 중 오류가 발생했습니다.');
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg text-white rounded-xl font-semibold transition-all shadow-md shadow-purple-500/30"
    >
      영상 다운로드
    </button>
  );
};

export default ExportDialog;
