import React, { useRef, useEffect } from 'react';
import { useVideo } from '../../context/VideoContext';
import { useAnnotations } from '../../context/AnnotationContext';
import { DrawingEngine } from '../../services/drawingEngine';
import { drawAngleMeasurement } from '../../utils/canvas';

const VideoCanvas2: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { videoRef2, videoState } = useVideo();
  const { annotations, getAnnotationsForTime } = useAnnotations();
  const drawingEngineRef = useRef<DrawingEngine | null>(null);

  // Initialize canvas size
  useEffect(() => {
    const video = videoRef2.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const updateCanvasSize = () => {
      canvas.width = video.videoWidth || video.clientWidth;
      canvas.height = video.videoHeight || video.clientHeight;

      if (!drawingEngineRef.current) {
        drawingEngineRef.current = new DrawingEngine(canvas);
      } else {
        drawingEngineRef.current.resize(canvas.width, canvas.height);
      }
    };

    video.addEventListener('loadedmetadata', updateCanvasSize);
    updateCanvasSize();

    return () => {
      video.removeEventListener('loadedmetadata', updateCanvasSize);
    };
  }, [videoRef2]);

  // Render loop - same annotations as first video
  useEffect(() => {
    const canvas = canvasRef.current;
    const drawingEngine = drawingEngineRef.current;
    if (!canvas || !drawingEngine) return;

    let animationFrameId: number;

    const render = () => {
      const ctx = drawingEngine.getContext();
      drawingEngine.clear();

      // Draw reference lines
      if (annotations.referenceLines.length > 0) {
        drawingEngine.drawReferenceLines(annotations.referenceLines);
      }

      // Draw saved annotations for current timestamp
      const currentTimestamp = Math.floor(videoState.currentTime * 1000);
      const currentAnnotations = getAnnotationsForTime(currentTimestamp);
      drawingEngine.drawArrows(currentAnnotations.arrows);
      drawingEngine.drawFreeDrawings(currentAnnotations.freeDrawings);

      // Draw angle measurements
      currentAnnotations.angles.forEach((angle) => {
        drawAngleMeasurement(
          ctx,
          angle.points[0],
          angle.points[1],
          angle.points[2],
          angle.angle,
          angle.color
        );
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [videoState.currentTime, annotations, getAnnotationsForTime]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
    />
  );
};

export default VideoCanvas2;
