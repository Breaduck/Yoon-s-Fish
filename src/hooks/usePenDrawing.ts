import { useState, useCallback } from 'react';
import { Point, FreeDraw } from '../types/drawing';
import { useVideo } from '../context/VideoContext';
import { useAnnotations } from '../context/AnnotationContext';
import { useTool } from '../context/ToolContext';

export const usePenDrawing = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
  const { videoState } = useVideo();
  const { addFreeDraw } = useAnnotations();
  const { toolSettings } = useTool();

  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);

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
      setCurrentPath([point]);
    },
    [getCanvasPoint]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return;
      const point = getCanvasPoint(e);
      setCurrentPath((prev) => [...prev, point]);
    },
    [isDrawing, getCanvasPoint]
  );

  const handleMouseUp = useCallback(() => {
    if (!isDrawing || currentPath.length < 2) {
      setIsDrawing(false);
      setCurrentPath([]);
      return;
    }

    const drawing: FreeDraw = {
      id: `freedraw-${Date.now()}-${Math.random()}`,
      points: currentPath,
      color: toolSettings.color,
      thickness: toolSettings.penThickness,
      timestamp: Math.floor(videoState.currentTime * 1000),
    };

    addFreeDraw(drawing);
    setIsDrawing(false);
    setCurrentPath([]);
  }, [isDrawing, currentPath, videoState.currentTime, toolSettings, addFreeDraw]);

  return {
    isDrawing,
    currentPath,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
};
