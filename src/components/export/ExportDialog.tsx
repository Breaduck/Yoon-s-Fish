import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useVideo } from '../../context/VideoContext';
import { useAnnotations } from '../../context/AnnotationContext';
import { useTool } from '../../context/ToolContext';
import { DrawingEngine } from '../../services/drawingEngine';
import ExportProgress from './ExportProgress';
import { ExportProgress as ExportProgressType } from '../../types/export';

const ExportDialog: React.FC = () => {
  const { videoRef, videoRef2, videoState, secondVideoSource } = useVideo();
  const { annotations } = useAnnotations();
  const { isComparisonMode } = useTool();
  const [progress, setProgress] = useState<ExportProgressType | null>(null);

  const handleDownload = async () => {
    const video = videoRef.current;
    if (!video || !videoState.source) {
      alert('영상을 먼저 업로드해주세요.');
      return;
    }

    try {
      setProgress({ status: 'preparing', progress: 0, message: '준비 중...' });

      let mimeType = 'video/mp4;codecs=h264';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp9';
      }
      const fileExtension = mimeType.includes('mp4') ? 'mp4' : 'webm';
      const fileName = `aquaflux-video-${Date.now()}.${fileExtension}`;

      const canvas = document.createElement('canvas');
      const video2 = videoRef2.current;
      const isComparison = isComparisonMode && video2 && secondVideoSource;

      if (isComparison) {
        canvas.width = 1920 * 2;
        canvas.height = 1080;
      } else {
        canvas.width = 1920;
        canvas.height = 1080;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const drawingEngine = new DrawingEngine(canvas);
      const stream = canvas.captureStream(30);

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 10000000
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setProgress({ status: 'complete', progress: 100, message: '다운로드 완료!' });
        setTimeout(() => setProgress(null), 3000);
      };

      setProgress({ status: 'encoding', progress: 10, message: '녹화 중...' });

      // 비디오 준비
      video.pause();
      video.currentTime = 0;
      video.playbackRate = 3.0;
      video.muted = true;

      if (isComparison && video2) {
        video2.pause();
        video2.currentTime = 0;
        video2.playbackRate = 3.0;
        video2.muted = true;
      }

      const renderFrame = () => {
        const isVideo1Ended = video.ended;
        const isVideo2Ended = isComparison && video2 ? video2.ended : true;

        if (isVideo1Ended && isVideo2Ended) {
          video.playbackRate = 1.0;
          video.muted = false;
          if (isComparison && video2) {
            video2.playbackRate = 1.0;
            video2.muted = false;
          }
          if (mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
          }
          return;
        }

        if (video.paused) return;

        // 비교 모드: 두 영상을 side-by-side로 렌더링
        if (isComparison && video2) {
          ctx.drawImage(video, 0, 0, 1920, 1080);
          ctx.drawImage(video2, 1920, 0, 1920, 1080);

          // Before/After 라벨
          ctx.save();
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.fillRect(20, 20, 150, 60);
          ctx.fillRect(1940, 20, 150, 60);
          ctx.fillStyle = '#1e40af';
          ctx.font = 'bold 32px sans-serif';
          ctx.fillText('Before', 40, 62);
          ctx.fillText('After', 1960, 62);
          ctx.restore();
        } else {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }

        const currentTime = Math.floor(video.currentTime * 1000);

        if (annotations.referenceLines.length > 0) {
          drawingEngine.drawReferenceLines(annotations.referenceLines);
        }

        const currentArrows = annotations.arrows.filter(a => a.timestamp <= currentTime);
        const currentDrawings = annotations.freeDrawings.filter(d => d.timestamp <= currentTime);
        const currentAngles = annotations.angles.filter(a => a.timestamp <= currentTime);

        if (isComparison) {
          // 비교 모드: videoIndex에 따라 좌표 변환
          const beforeArrows = currentArrows.filter(a => !a.videoIndex || a.videoIndex === 0);
          const afterArrows = currentArrows.filter(a => a.videoIndex === 1).map(a => ({
            ...a,
            start: { x: a.start.x + 1920, y: a.start.y },
            end: { x: a.end.x + 1920, y: a.end.y }
          }));

          const beforeDrawings = currentDrawings.filter(d => !d.videoIndex || d.videoIndex === 0);
          const afterDrawings = currentDrawings.filter(d => d.videoIndex === 1).map(d => ({
            ...d,
            points: d.points.map(p => ({ x: p.x + 1920, y: p.y }))
          }));

          const beforeAngles = currentAngles.filter(a => !a.videoIndex || a.videoIndex === 0);
          const afterAngles = currentAngles.filter(a => a.videoIndex === 1).map(a => ({
            ...a,
            points: a.points.map(p => ({ x: p.x + 1920, y: p.y })) as [any, any, any]
          }));

          drawingEngine.drawArrows([...beforeArrows, ...afterArrows]);
          drawingEngine.drawFreeDrawings([...beforeDrawings, ...afterDrawings]);
          drawingEngine.drawAngles([...beforeAngles, ...afterAngles]);
        } else {
          drawingEngine.drawArrows(currentArrows);
          drawingEngine.drawFreeDrawings(currentDrawings);
          drawingEngine.drawAngles(currentAngles);
        }

        if (video.duration) {
          const prog = Math.min(90, 10 + (video.currentTime / video.duration) * 80);
          setProgress({ status: 'encoding', progress: prog, message: '녹화 중...' });
        }

        requestAnimationFrame(renderFrame);
      };

      const startRecording = async () => {
        try {
          mediaRecorder.start(100);
          const playPromise = video.play();
          if (playPromise !== undefined) {
            await playPromise;
          }
          if (isComparison && video2) {
            const playPromise2 = video2.play();
            if (playPromise2 !== undefined) {
              await playPromise2;
            }
          }
          requestAnimationFrame(renderFrame);
        } catch (err) {
          console.error('Play failed:', err);
          video.playbackRate = 1.0;
          video.muted = false;
          if (isComparison && video2) {
            video2.playbackRate = 1.0;
            video2.muted = false;
          }
          setProgress({ status: 'error', progress: 0, message: '재생 실패', error: String(err) });
          setTimeout(() => setProgress(null), 5000);
        }
      };

      video.load();

      if (video.readyState >= 2) {
        startRecording();
      } else {
        video.addEventListener('loadeddata', startRecording, { once: true });
      }
    } catch (error) {
      console.error('Download error:', error);
      setProgress({ status: 'error', progress: 0, message: '오류 발생', error: String(error) });
      setTimeout(() => setProgress(null), 5000);
    }
  };

  return (
    <>
      <button
        onClick={handleDownload}
        disabled={!!progress}
        className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white rounded-xl font-semibold transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        영상 다운로드
      </button>

      {progress && ReactDOM.createPortal(
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 999999,
            width: '256px'
          }}
          className="bg-white rounded-3xl shadow-xl p-4"
        >
          <ExportProgress progress={progress} />
        </div>,
        document.body
      )}
    </>
  );
};

export default ExportDialog;
