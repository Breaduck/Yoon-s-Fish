import { useState, useCallback, RefObject } from 'react';
import { Point, AngleMeasurement } from '../types/drawing';
import { useAnnotations } from '../context/AnnotationContext';
import { useVideo } from '../context/VideoContext';
import { useTool } from '../context/ToolContext';

export const useAngleMeasurement = (canvasRef: RefObject<HTMLCanvasElement>, videoIndex: number = 0) => {
  const [points, setPoints] = useState<Point[]>([]);
  const { addAngle } = useAnnotations();
  const { videoState } = useVideo();
  const { toolSettings } = useTool();

  const calculateAngle = (p1: Point, p2: Point, p3: Point): number => {
    // Calculate angle at p2 (vertex)
    const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
    const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };

    const dot = v1.x * v2.x + v1.y * v2.y;
    const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
    const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);

    const angleRad = Math.acos(dot / (mag1 * mag2));
    const angleDeg = (angleRad * 180) / Math.PI;

    return Math.round(angleDeg * 10) / 10; // Round to 1 decimal place
  };

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

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const point = getCanvasPoint(e);
      const newPoints = [...points, point];

      if (newPoints.length === 3) {
        // Calculate angle and save
        const angle = calculateAngle(newPoints[0], newPoints[1], newPoints[2]);
        const angleMeasurement: AngleMeasurement = {
          id: `angle-${Date.now()}`,
          points: [newPoints[0], newPoints[1], newPoints[2]],
          angle,
          color: toolSettings.color,
          timestamp: Math.floor(videoState.currentTime * 1000),
          videoIndex,
          createdAt: Date.now(),
        };
        addAngle(angleMeasurement);
        setPoints([]); // Reset for next measurement
      } else {
        setPoints(newPoints);
      }
    },
    [points, getCanvasPoint, addAngle, videoState.currentTime, toolSettings.color]
  );

  const reset = useCallback(() => {
    setPoints([]);
  }, []);

  return {
    points,
    handleClick,
    reset,
  };
};
