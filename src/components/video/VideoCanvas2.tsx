import React, { useRef, useEffect, useCallback } from 'react';
import { useVideo } from '../../context/VideoContext';
import { useAnnotations } from '../../context/AnnotationContext';
import { useTool } from '../../context/ToolContext';
import { useDrawing } from '../../hooks/useDrawing';
import { usePenDrawing } from '../../hooks/usePenDrawing';
import { useAngleMeasurement } from '../../hooks/useAngleMeasurement';
import { DrawingEngine } from '../../services/drawingEngine';
import { drawArrow, drawFreePath, drawAngleMeasurement, getVideoDisplayArea } from '../../utils/canvas';

const VideoCanvas2: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { videoRef2, videoState } = useVideo();
  const { annotations, getAnnotationsForTime, removeArrow, removeFreeDraw, removeAngle } = useAnnotations();
  const { activeTool, toolSettings } = useTool();
  const drawingEngineRef = useRef<DrawingEngine | null>(null);
  const [hoveredAnnotation, setHoveredAnnotation] = React.useState<{ type: 'arrow' | 'drawing' | 'angle'; id: string } | null>(null);

  const arrowDrawing = useDrawing(canvasRef, 1);
  const penDrawing = usePenDrawing(canvasRef, 1);
  const angleMeasurement = useAngleMeasurement(canvasRef, 1);

  // Handle eraser click
  const handleEraserClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;
    const currentTimestamp = Math.floor(videoState.currentTime * 1000);
    const tolerance = 100;

    // Check arrows
    const clickedArrow = annotations.arrows.find((arrow) => {
      if (Math.abs(arrow.timestamp - currentTimestamp) > tolerance) return false;

      const dx = arrow.end.x - arrow.start.x;
      const dy = arrow.end.y - arrow.start.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const dotProduct = ((clickX - arrow.start.x) * dx + (clickY - arrow.start.y) * dy) / (length * length);

      if (dotProduct < 0 || dotProduct > 1) return false;

      const projX = arrow.start.x + dotProduct * dx;
      const projY = arrow.start.y + dotProduct * dy;
      const distance = Math.sqrt((clickX - projX) ** 2 + (clickY - projY) ** 2);

      return distance < 10;
    });

    if (clickedArrow) {
      removeArrow(clickedArrow.id);
      return;
    }

    // Check free drawings
    const clickedDrawing = annotations.freeDrawings.find((drawing) => {
      if (Math.abs(drawing.timestamp - currentTimestamp) > tolerance) return false;

      return drawing.points.some((point) => {
        const distance = Math.sqrt((clickX - point.x) ** 2 + (clickY - point.y) ** 2);
        return distance < 15;
      });
    });

    if (clickedDrawing) {
      removeFreeDraw(clickedDrawing.id);
      return;
    }

    // Check angles
    const clickedAngle = annotations.angles.find((angle) => {
      if (Math.abs(angle.timestamp - currentTimestamp) > tolerance) return false;

      return angle.points.some((point) => {
        const distance = Math.sqrt((clickX - point.x) ** 2 + (clickY - point.y) ** 2);
        return distance < 15;
      });
    });

    if (clickedAngle) {
      removeAngle(clickedAngle.id);
    }
  }, [videoState.currentTime, annotations, removeArrow, removeFreeDraw, removeAngle]);

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
      const video = videoRef2.current;
      drawingEngine.clear();

      // Draw reference lines within video display area only
      if (annotations.referenceLines.length > 0 && video) {
        const videoArea = getVideoDisplayArea(video, canvas.width, canvas.height);

        ctx.save();
        annotations.referenceLines.forEach((line) => {
          if (line.type === 'horizontal') {
            const y = videoArea.y + (line.position / 100) * videoArea.height;
            ctx.strokeStyle = line.color;
            ctx.lineWidth = line.thickness;
            ctx.beginPath();
            ctx.moveTo(videoArea.x, y);
            ctx.lineTo(videoArea.x + videoArea.width, y);
            ctx.stroke();
          } else {
            const x = videoArea.x + (line.position / 100) * videoArea.width;
            ctx.strokeStyle = line.color;
            ctx.lineWidth = line.thickness;
            ctx.beginPath();
            ctx.moveTo(x, videoArea.y);
            ctx.lineTo(x, videoArea.y + videoArea.height);
            ctx.stroke();
          }
        });
        ctx.restore();
      }

      // Draw saved annotations for current timestamp (only for After video - videoIndex 1)
      const currentTimestamp = Math.floor(videoState.currentTime * 1000);
      const currentAnnotations = getAnnotationsForTime(currentTimestamp);
      const afterArrows = currentAnnotations.arrows.filter(a => a.videoIndex === 1);
      const afterDrawings = currentAnnotations.freeDrawings.filter(d => d.videoIndex === 1);
      drawingEngine.drawArrows(afterArrows);
      drawingEngine.drawFreeDrawings(afterDrawings);

      // Draw angle measurements (only for After video)
      const afterAngles = currentAnnotations.angles.filter(a => a.videoIndex === 1);
      afterAngles.forEach((angle) => {
        drawAngleMeasurement(
          ctx,
          angle.points[0],
          angle.points[1],
          angle.points[2],
          angle.angle,
          angle.color
        );
      });

      // Draw preview arrow while drawing
      if (arrowDrawing.isDrawing && arrowDrawing.startPoint && arrowDrawing.currentPoint && activeTool === 'arrow') {
        drawArrow(ctx, arrowDrawing.startPoint, arrowDrawing.currentPoint, toolSettings.color, toolSettings.thickness, toolSettings.arrowStyle);
      }

      // Draw preview pen path while drawing
      if (penDrawing.isDrawing && penDrawing.currentPath.length > 1 && activeTool === 'pen') {
        drawFreePath(ctx, penDrawing.currentPath, toolSettings.color, toolSettings.penThickness);
      }

      // Draw angle measurement preview points
      if (activeTool === 'angle' && angleMeasurement.points.length > 0) {
        ctx.save();
        ctx.fillStyle = toolSettings.color;
        angleMeasurement.points.forEach((point, index) => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, index === 1 ? 6 : 4, 0, 2 * Math.PI);
          ctx.fill();
        });

        // Draw lines between points
        if (angleMeasurement.points.length >= 2) {
          ctx.strokeStyle = toolSettings.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(angleMeasurement.points[1].x, angleMeasurement.points[1].y);
          ctx.lineTo(angleMeasurement.points[0].x, angleMeasurement.points[0].y);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Highlight hovered annotation in eraser mode
      if (activeTool === 'eraser' && hoveredAnnotation) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.8)';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (hoveredAnnotation.type === 'arrow') {
          const arrow = annotations.arrows.find(a => a.id === hoveredAnnotation.id);
          if (arrow) {
            ctx.beginPath();
            ctx.moveTo(arrow.start.x, arrow.start.y);
            ctx.lineTo(arrow.end.x, arrow.end.y);
            ctx.stroke();
          }
        } else if (hoveredAnnotation.type === 'drawing') {
          const drawing = annotations.freeDrawings.find(d => d.id === hoveredAnnotation.id);
          if (drawing && drawing.points.length > 1) {
            ctx.beginPath();
            ctx.moveTo(drawing.points[0].x, drawing.points[0].y);
            for (let i = 1; i < drawing.points.length; i++) {
              ctx.lineTo(drawing.points[i].x, drawing.points[i].y);
            }
            ctx.stroke();
          }
        } else if (hoveredAnnotation.type === 'angle') {
          const angle = annotations.angles.find(a => a.id === hoveredAnnotation.id);
          if (angle) {
            // Highlight the two lines of the angle
            ctx.beginPath();
            ctx.moveTo(angle.points[1].x, angle.points[1].y);
            ctx.lineTo(angle.points[0].x, angle.points[0].y);
            ctx.moveTo(angle.points[1].x, angle.points[1].y);
            ctx.lineTo(angle.points[2].x, angle.points[2].y);
            ctx.stroke();
          }
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [
    videoState.currentTime,
    annotations,
    getAnnotationsForTime,
    arrowDrawing,
    penDrawing,
    angleMeasurement,
    activeTool,
    toolSettings,
    hoveredAnnotation,
  ]);

  // Determine cursor style based on active tool
  const getCursorStyle = () => {
    if (activeTool === 'arrow' || activeTool === 'pen' || activeTool === 'angle') return 'crosshair';
    if (activeTool === 'eraser') return 'pointer';
    return 'default';
  };

  // Handle mouse events based on active tool
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'arrow') arrowDrawing.handleMouseDown(e);
    else if (activeTool === 'pen') penDrawing.handleMouseDown(e);
    else if (activeTool === 'angle') angleMeasurement.handleClick(e);
    else if (activeTool === 'eraser') handleEraserClick(e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'arrow') arrowDrawing.handleMouseMove(e);
    else if (activeTool === 'pen') penDrawing.handleMouseMove(e);
    else if (activeTool === 'eraser') {
      // Find hovered annotation for highlight
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const clickX = (e.clientX - rect.left) * scaleX;
      const clickY = (e.clientY - rect.top) * scaleY;
      const currentTimestamp = Math.floor(videoState.currentTime * 1000);
      const tolerance = 100;

      // Check arrows
      const hoveredArrow = annotations.arrows.find((arrow) => {
        if (Math.abs(arrow.timestamp - currentTimestamp) > tolerance) return false;
        if (arrow.videoIndex !== 1) return false;

        const dx = arrow.end.x - arrow.start.x;
        const dy = arrow.end.y - arrow.start.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const dotProduct = ((clickX - arrow.start.x) * dx + (clickY - arrow.start.y) * dy) / (length * length);

        if (dotProduct < 0 || dotProduct > 1) return false;

        const projX = arrow.start.x + dotProduct * dx;
        const projY = arrow.start.y + dotProduct * dy;
        const distance = Math.sqrt((clickX - projX) ** 2 + (clickY - projY) ** 2);

        return distance < 15;
      });

      if (hoveredArrow) {
        setHoveredAnnotation({ type: 'arrow', id: hoveredArrow.id });
        return;
      }

      // Check free drawings
      const hoveredDrawing = annotations.freeDrawings.find((drawing) => {
        if (Math.abs(drawing.timestamp - currentTimestamp) > tolerance) return false;
        if (drawing.videoIndex !== 1) return false;

        return drawing.points.some((point) => {
          const distance = Math.sqrt((clickX - point.x) ** 2 + (clickY - point.y) ** 2);
          return distance < 20;
        });
      });

      if (hoveredDrawing) {
        setHoveredAnnotation({ type: 'drawing', id: hoveredDrawing.id });
        return;
      }

      // Check angles
      const hoveredAngle = annotations.angles.find((angle) => {
        if (Math.abs(angle.timestamp - currentTimestamp) > tolerance) return false;
        if (angle.videoIndex !== 1) return false;

        return angle.points.some((point) => {
          const distance = Math.sqrt((clickX - point.x) ** 2 + (clickY - point.y) ** 2);
          return distance < 20;
        });
      });

      if (hoveredAngle) {
        setHoveredAnnotation({ type: 'angle', id: hoveredAngle.id });
        return;
      }

      setHoveredAnnotation(null);
    } else {
      setHoveredAnnotation(null);
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'arrow') arrowDrawing.handleMouseUp(e);
    else if (activeTool === 'pen') penDrawing.handleMouseUp();
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full"
      style={{ cursor: getCursorStyle() }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    />
  );
};

export default VideoCanvas2;
