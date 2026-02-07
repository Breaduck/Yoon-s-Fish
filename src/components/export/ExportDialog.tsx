import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { useVideo } from '../../context/VideoContext';
import { useAnnotations } from '../../context/AnnotationContext';
import { useTool } from '../../context/ToolContext';
import { DrawingEngine } from '../../services/drawingEngine';
import ExportProgress from './ExportProgress';
import { ExportProgress as ExportProgressType } from '../../types/export';

// Helper functions for rounded rectangles
const drawRoundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
};

const clipRoundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
  drawRoundedRect(ctx, x, y, width, height, radius);
  ctx.clip();
};

const ExportDialog: React.FC = () => {
  const { videoRef, videoRef2, videoState, secondVideoSource } = useVideo();
  const { annotations } = useAnnotations();
  const { isComparisonMode } = useTool();
  const [progress, setProgress] = useState<ExportProgressType | null>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const handleCancel = () => {
    // Stop media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    // Cancel animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Reset video playback
    const video = videoRef.current;
    const video2 = videoRef2.current;
    if (video) {
      video.playbackRate = 1.0;
      video.muted = false;
      video.pause();
    }
    if (isComparisonMode && video2) {
      video2.playbackRate = 1.0;
      video2.muted = false;
      video2.pause();
    }

    setProgress(null);
  };

  const handleDownload = async () => {
    const video = videoRef.current;
    if (!video || !videoState.source) {
      alert('영상을 먼저 업로드해주세요.');
      return;
    }

    try {
      setProgress({ status: 'preparing', progress: 0, message: '준비 중...' });

      // Initialize FFmpeg if needed
      if (!ffmpegRef.current) {
        ffmpegRef.current = new FFmpeg();
        await ffmpegRef.current.load();
      }

      const mimeType = 'video/webm;codecs=vp9';
      const fileName = `aquaflux-video-${Date.now()}.mp4`;

      const canvas = document.createElement('canvas');
      const video2 = videoRef2.current;
      const isComparison = isComparisonMode && video2 && secondVideoSource;

      if (isComparison) {
        // 비교 모드: 전체 레이아웃 포함 (aspect-video with gap and padding)
        canvas.width = 1920;
        canvas.height = 1080;
      } else {
        canvas.width = 1920;
        canvas.height = 1080;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const drawingEngine = new DrawingEngine(canvas);
      const stream = canvas.captureStream(30);

      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 10000000
      });
      mediaRecorderRef.current = recorder;

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);

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
          if (recorder.state !== 'inactive') {
            recorder.stop();
          }
          return;
        }

        if (video.paused) return;

        // 비교 모드: 현재 UI 레이아웃 그대로
        if (isComparison && video2) {
          // 흰색 배경
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // 패딩과 간격 계산 (p-3 = 12px, gap-3 = 12px)
          const padding = 30;
          const gap = 30;
          const videoWidth = (canvas.width - padding * 2 - gap) / 2;
          const videoHeight = canvas.height - padding * 2;
          const cornerRadius = 20;

          // 검은색 배경 (Before - 좌측)
          ctx.fillStyle = '#000000';
          drawRoundedRect(ctx, padding, padding, videoWidth, videoHeight, cornerRadius);
          ctx.fill();

          // Before 비디오
          ctx.save();
          clipRoundedRect(ctx, padding, padding, videoWidth, videoHeight, cornerRadius);
          ctx.drawImage(video, padding, padding, videoWidth, videoHeight);
          ctx.restore();

          // 검은색 배경 (After - 우측)
          ctx.fillStyle = '#000000';
          drawRoundedRect(ctx, padding + videoWidth + gap, padding, videoWidth, videoHeight, cornerRadius);
          ctx.fill();

          // After 비디오
          ctx.save();
          clipRoundedRect(ctx, padding + videoWidth + gap, padding, videoWidth, videoHeight, cornerRadius);
          ctx.drawImage(video2, padding + videoWidth + gap, padding, videoWidth, videoHeight);
          ctx.restore();

          // Before 라벨 (둥근 네모)
          ctx.save();
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          drawRoundedRect(ctx, padding + 20, padding + 20, 120, 50, 12);
          ctx.fill();
          ctx.fillStyle = '#083985';
          ctx.font = 'bold 24px sans-serif';
          ctx.fillText('Before', padding + 40, padding + 50);
          ctx.restore();

          // After 라벨 (둥근 네모)
          ctx.save();
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          drawRoundedRect(ctx, padding + videoWidth + gap + 20, padding + 20, 120, 50, 12);
          ctx.fill();
          ctx.fillStyle = '#083985';
          ctx.font = 'bold 24px sans-serif';
          ctx.fillText('After', padding + videoWidth + gap + 40, padding + 50);
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
          // 원본 비디오 해상도 대비 렌더링 크기로 스케일 계산
          const sourceWidth = video.videoWidth || 1920;
          const sourceHeight = video.videoHeight || 1080;
          const scaleX = videoWidth / sourceWidth;
          const scaleY = videoHeight / sourceHeight;

          // Before 비디오 주석 (좌측)
          const beforeArrows = currentArrows.filter(a => !a.videoIndex || a.videoIndex === 0).map(a => ({
            ...a,
            start: { x: a.start.x * scaleX + padding, y: a.start.y * scaleY + padding },
            end: { x: a.end.x * scaleX + padding, y: a.end.y * scaleY + padding }
          }));

          // After 비디오 주석 (우측)
          const afterArrows = currentArrows.filter(a => a.videoIndex === 1).map(a => ({
            ...a,
            start: { x: a.start.x * scaleX + padding + videoWidth + gap, y: a.start.y * scaleY + padding },
            end: { x: a.end.x * scaleX + padding + videoWidth + gap, y: a.end.y * scaleY + padding }
          }));

          const beforeDrawings = currentDrawings.filter(d => !d.videoIndex || d.videoIndex === 0).map(d => ({
            ...d,
            points: d.points.map(p => ({ x: p.x * scaleX + padding, y: p.y * scaleY + padding }))
          }));

          const afterDrawings = currentDrawings.filter(d => d.videoIndex === 1).map(d => ({
            ...d,
            points: d.points.map(p => ({ x: p.x * scaleX + padding + videoWidth + gap, y: p.y * scaleY + padding }))
          }));

          const beforeAngles = currentAngles.filter(a => !a.videoIndex || a.videoIndex === 0).map(a => ({
            ...a,
            points: a.points.map(p => ({ x: p.x * scaleX + padding, y: p.y * scaleY + padding })) as [any, any, any]
          }));

          const afterAngles = currentAngles.filter(a => a.videoIndex === 1).map(a => ({
            ...a,
            points: a.points.map(p => ({ x: p.x * scaleX + padding + videoWidth + gap, y: p.y * scaleY + padding })) as [any, any, any]
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

        animationFrameRef.current = requestAnimationFrame(renderFrame);
      };

      const startRecording = async () => {
        try {
          recorder.start(100);
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

      // 녹화 완료 후 속도 복원 핸들러
      recorder.onstop = async () => {
        try {
          const webmBlob = new Blob(chunks, { type: mimeType });

          // Convert WebM to MP4 using FFmpeg
          setProgress({ status: 'encoding', progress: 90, message: 'MP4로 변환 중...' });

          const ffmpeg = ffmpegRef.current!;
          await ffmpeg.writeFile('input.webm', await fetchFile(webmBlob));

          await ffmpeg.exec(['-i', 'input.webm', '-c:v', 'libx264', '-preset', 'fast', '-crf', '22', 'output.mp4']);

          const data = await ffmpeg.readFile('output.mp4');
          const mp4Blob = new Blob([data], { type: 'video/mp4' });

          // Download MP4
          const url = URL.createObjectURL(mp4Blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          // Clean up FFmpeg files
          await ffmpeg.deleteFile('input.webm');
          await ffmpeg.deleteFile('output.mp4');

          // 속도 복원
          video.playbackRate = 1.0;
          video.muted = false;
          if (isComparison && video2) {
            video2.playbackRate = 1.0;
            video2.muted = false;
          }

          setProgress({ status: 'complete', progress: 100, message: '다운로드 완료!' });
          setTimeout(() => setProgress(null), 3000);
        } catch (error) {
          console.error('MP4 conversion error:', error);
          setProgress({ status: 'error', progress: 0, message: 'MP4 변환 실패', error: String(error) });
          setTimeout(() => setProgress(null), 5000);
        }
      };

      video.load();
      if (isComparison && video2) {
        video2.load();
      }

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
          <ExportProgress progress={progress} onCancel={handleCancel} />
        </div>,
        document.body
      )}
    </>
  );
};

export default ExportDialog;
