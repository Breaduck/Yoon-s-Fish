import { useState, useCallback } from 'react';
import { Point, Arrow } from '../types/drawing';
import { useVideo } from '../context/VideoContext';
import { useAnnotations } from '../context/AnnotationContext';
import { useTool } from '../context/ToolContext';

export const useDrawing = (canvasRef: React.RefObject<HTMLCanvasElement>, videoIndex: number = 0) => {
  const { videoState } = useVideo();
  const { addArrow } = useAnnotations();
  const { toolSettings } = useTool();

  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentPoint, setCurrentPoint] = useState<Point | null>(null);

  const getCanvasPoint = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>): Point => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    },
    [canvasRef]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const point = getCanvasPoint(e);
      setIsDrawing(true);
      setStartPoint(point);
      setCurrentPoint(point);
    },
    [getCanvasPoint]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return;
      const point = getCanvasPoint(e);
      setCurrentPoint(point);
    },
    [isDrawing, getCanvasPoint]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing || !startPoint) return;

      const endPoint = getCanvasPoint(e);

      // Only create arrow if there's meaningful distance
      const distance = Math.sqrt(
        Math.pow(endPoint.x - startPoint.x, 2) +
        Math.pow(endPoint.y - startPoint.y, 2)
      );

      if (distance > 10) {
        const arrow: Arrow = {
          id: `arrow-${Date.now()}-${Math.random()}`,
          start: startPoint,
          end: endPoint,
          color: toolSettings.color,
          thickness: toolSettings.thickness,
          timestamp: Math.floor(videoState.currentTime * 1000),
          style: toolSettings.arrowStyle,
          videoIndex,
        };
        addArrow(arrow);
      }

      setIsDrawing(false);
      setStartPoint(null);
      setCurrentPoint(null);
    },
    [isDrawing, startPoint, getCanvasPoint, videoState.currentTime, toolSettings, addArrow]
  );

  return {
    isDrawing,
    startPoint,
    currentPoint,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
};
