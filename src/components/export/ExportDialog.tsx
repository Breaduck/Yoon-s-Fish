import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
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
      // Try MP4 first, fallback to WebM
      let mimeType = 'video/webm;codecs=vp9';
      let needsConversion = true;

      if (MediaRecorder.isTypeSupported('video/mp4')) {
        mimeType = 'video/mp4';
        needsConversion = false;
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=h264')) {
        mimeType = 'video/webm;codecs=h264';
        needsConversion = false;
      }

      const fileName = `aquaflux-video-${Date.now()}.mp4`;

      setProgress({ status: 'preparing', progress: 0, message: 'FFmpeg 로딩 중...' });

      // Initialize FFmpeg with proper worker URLs
      if (!ffmpegRef.current && needsConversion) {
        const ffmpeg = new FFmpeg();
        ffmpeg.on('log', ({ message }) => {
          console.log('[FFmpeg]', message);
        });
        ffmpeg.on('progress', ({ progress }) => {
          setProgress({ status: 'encoding', progress: 90 + progress * 10, message: 'MP4 변환 중...' });
        });

        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        ffmpegRef.current = ffmpeg;
      }

      setProgress({ status: 'preparing', progress: 5, message: '준비 중...' });

      const canvas = document.createElement('canvas');
      const video2 = videoRef2.current;
      const isComparison = isComparisonMode && video2 && secondVideoSource && video2.duration > 0;

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

      // 비디오 준비 - 고속 녹화
      video.pause();
      video.currentTime = 0;
      video.playbackRate = 16.0; // 16배속으로 빠르게
      video.muted = true;

      if (isComparison && video2) {
        video2.pause();
        video2.currentTime = 0;
        video2.playbackRate = 16.0;
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

        // 패딩과 간격 계산 (비교 모드용) - Tailwind p-3, gap-3 = 12px
        const padding = (12 / 1920) * canvas.width; // 12px 비율로 변환
        const gap = (12 / 1920) * canvas.width;
        const videoWidth = (canvas.width - padding * 2 - gap) / 2;
        const videoHeight = canvas.height - padding * 2;
        const cornerRadius = (16 / 1920) * canvas.width; // rounded-2xl ≈ 16px

        // 비교 모드: 현재 UI 레이아웃 그대로
        if (isComparison && video2) {
          // 흰색 배경
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // 검은색 배경 (Before - 좌측)
          ctx.fillStyle = '#000000';
          drawRoundedRect(ctx, padding, padding, videoWidth, videoHeight, cornerRadius);
          ctx.fill();

          // Before 비디오 - aspect ratio 유지
          ctx.save();
          clipRoundedRect(ctx, padding, padding, videoWidth, videoHeight, cornerRadius);
          const v1Aspect = video.videoWidth / video.videoHeight;
          const containerAspect = videoWidth / videoHeight;
          let v1DrawWidth, v1DrawHeight, v1OffsetX, v1OffsetY;
          if (v1Aspect > containerAspect) {
            v1DrawWidth = videoWidth;
            v1DrawHeight = videoWidth / v1Aspect;
            v1OffsetX = 0;
            v1OffsetY = (videoHeight - v1DrawHeight) / 2;
          } else {
            v1DrawHeight = videoHeight;
            v1DrawWidth = videoHeight * v1Aspect;
            v1OffsetX = (videoWidth - v1DrawWidth) / 2;
            v1OffsetY = 0;
          }
          ctx.drawImage(video, padding + v1OffsetX, padding + v1OffsetY, v1DrawWidth, v1DrawHeight);
          ctx.restore();

          // 검은색 배경 (After - 우측)
          ctx.fillStyle = '#000000';
          drawRoundedRect(ctx, padding + videoWidth + gap, padding, videoWidth, videoHeight, cornerRadius);
          ctx.fill();

          // After 비디오 - aspect ratio 유지
          ctx.save();
          clipRoundedRect(ctx, padding + videoWidth + gap, padding, videoWidth, videoHeight, cornerRadius);
          const v2Aspect = video2.videoWidth / video2.videoHeight;
          let v2DrawWidth, v2DrawHeight, v2OffsetX, v2OffsetY;
          if (v2Aspect > containerAspect) {
            v2DrawWidth = videoWidth;
            v2DrawHeight = videoWidth / v2Aspect;
            v2OffsetX = 0;
            v2OffsetY = (videoHeight - v2DrawHeight) / 2;
          } else {
            v2DrawHeight = videoHeight;
            v2DrawWidth = videoHeight * v2Aspect;
            v2OffsetX = (videoWidth - v2DrawWidth) / 2;
            v2OffsetY = 0;
          }
          ctx.drawImage(video2, padding + videoWidth + gap + v2OffsetX, padding + v2OffsetY, v2DrawWidth, v2DrawHeight);
          ctx.restore();

          // Before 라벨 (둥근 네모) - 중앙 정렬
          ctx.save();
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          const labelWidth = 120;
          const labelHeight = 50;
          drawRoundedRect(ctx, padding + 20, padding + 20, labelWidth, labelHeight, 12);
          ctx.fill();
          ctx.fillStyle = '#083985';
          ctx.font = 'bold 24px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('Before', padding + 20 + labelWidth / 2, padding + 20 + labelHeight / 2);
          ctx.restore();

          // After 라벨 (둥근 네모) - 중앙 정렬
          ctx.save();
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          drawRoundedRect(ctx, padding + videoWidth + gap + 20, padding + 20, labelWidth, labelHeight, 12);
          ctx.fill();
          ctx.fillStyle = '#083985';
          ctx.font = 'bold 24px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('After', padding + videoWidth + gap + 20 + labelWidth / 2, padding + 20 + labelHeight / 2);
          ctx.restore();
        } else {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }

        const currentTime = Math.floor(video.currentTime * 1000);

        // Draw reference lines within video bounds only
        if (annotations.referenceLines.length > 0) {
          ctx.save();
          annotations.referenceLines.forEach((line) => {
            if (isComparison) {
              // Draw on both videos in comparison mode
              if (line.type === 'horizontal') {
                const y = (line.position / 100) * videoHeight + padding;
                // Left video
                ctx.strokeStyle = line.color;
                ctx.lineWidth = line.thickness;
                ctx.beginPath();
                ctx.moveTo(padding, y);
                ctx.lineTo(padding + videoWidth, y);
                ctx.stroke();
                // Right video
                ctx.beginPath();
                ctx.moveTo(padding + videoWidth + gap, y);
                ctx.lineTo(padding + videoWidth + gap + videoWidth, y);
                ctx.stroke();
              } else {
                const x = (line.position / 100) * videoWidth;
                ctx.strokeStyle = line.color;
                ctx.lineWidth = line.thickness;
                // Left video
                ctx.beginPath();
                ctx.moveTo(padding + x, padding);
                ctx.lineTo(padding + x, padding + videoHeight);
                ctx.stroke();
                // Right video
                ctx.beginPath();
                ctx.moveTo(padding + videoWidth + gap + x, padding);
                ctx.lineTo(padding + videoWidth + gap + x, padding + videoHeight);
                ctx.stroke();
              }
            } else {
              // Single video mode - draw across full canvas
              if (line.type === 'horizontal') {
                const y = (line.position / 100) * canvas.height;
                ctx.strokeStyle = line.color;
                ctx.lineWidth = line.thickness;
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
              } else {
                const x = (line.position / 100) * canvas.width;
                ctx.strokeStyle = line.color;
                ctx.lineWidth = line.thickness;
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
              }
            }
          });
          ctx.restore();
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
          // Wait for both videos to be ready in comparison mode
          if (isComparison && video2) {
            if (video2.readyState < 2) {
              await new Promise<void>((resolve) => {
                video2.addEventListener('loadeddata', () => resolve(), { once: true });
              });
            }
          }

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

      // 녹화 완료 후 처리
      recorder.onstop = async () => {
        try {
          const recordedBlob = new Blob(chunks, { type: mimeType });

          if (!needsConversion) {
            // Direct download without conversion
            setProgress({ status: 'encoding', progress: 95, message: '다운로드 준비 중...' });
            const url = URL.createObjectURL(recordedBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          } else {
            // FFmpeg conversion
            try {
              setProgress({ status: 'encoding', progress: 90, message: 'MP4 변환 중...' });
              const ffmpeg = ffmpegRef.current!;

              console.log('[Export] Writing WebM file...');
              await ffmpeg.writeFile('input.webm', await fetchFile(recordedBlob));

              console.log('[Export] Starting FFmpeg conversion...');
              await ffmpeg.exec(['-i', 'input.webm', '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '23', 'output.mp4']);

              console.log('[Export] Reading output...');
              const data = await ffmpeg.readFile('output.mp4');
              const mp4Blob = new Blob([new Uint8Array(data as Uint8Array)], { type: 'video/mp4' });

              const url = URL.createObjectURL(mp4Blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = fileName;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);

              await ffmpeg.deleteFile('input.webm');
              await ffmpeg.deleteFile('output.mp4');
              console.log('[Export] Conversion complete');
            } catch (ffmpegError) {
              console.error('[Export] FFmpeg error:', ffmpegError);
              throw new Error('MP4 변환 실패: ' + String(ffmpegError));
            }
          }

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
