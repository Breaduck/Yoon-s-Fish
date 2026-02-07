import React from 'react';
import { useVideo } from '../../context/VideoContext';
import { useAnnotations } from '../../context/AnnotationContext';
import { DrawingEngine } from '../../services/drawingEngine';

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
      const canvas = document.createElement('canvas');
      canvas.width = 1920;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const drawingEngine = new DrawingEngine(canvas);
      const stream = canvas.captureStream(30);

      let mimeType = 'video/mp4;codecs=h264';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp9';
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 10000000
      });

      const chunks: Blob[] = [];
      const fileExtension = mimeType.includes('mp4') ? 'mp4' : 'webm';
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aquaflux-video-${Date.now()}.${fileExtension}`;
        a.click();
        URL.revokeObjectURL(url);
      };

      mediaRecorder.start();
      video.currentTime = 0;

      const renderFrame = () => {
        if (video.ended || video.paused) {
          return;
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const currentTime = Math.floor(video.currentTime * 1000);

        if (annotations.referenceLines.length > 0) {
          drawingEngine.drawReferenceLines(annotations.referenceLines);
        }

        const currentArrows = annotations.arrows.filter(a => a.timestamp <= currentTime);
        const currentDrawings = annotations.freeDrawings.filter(d => d.timestamp <= currentTime);
        const currentAngles = annotations.angles.filter(a => a.timestamp <= currentTime);

        drawingEngine.drawArrows(currentArrows);
        drawingEngine.drawFreeDrawings(currentDrawings);
        drawingEngine.drawAngles(currentAngles);

        requestAnimationFrame(renderFrame);
      };

      video.onended = () => {
        if (mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }
      };

      if (video.readyState >= 2) {
        video.play();
        requestAnimationFrame(renderFrame);
      } else {
        video.addEventListener('loadeddata', () => {
          video.play();
          requestAnimationFrame(renderFrame);
        }, { once: true });
      }
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
