import { Point } from '../types/drawing';
import { PoseLandmark } from '../types/pose';

/**
 * Calculate angle between three points (p2 is the vertex)
 * Returns angle in degrees
 */
export const calculateAngle = (
  p1: Point | PoseLandmark,
  p2: Point | PoseLandmark,
  p3: Point | PoseLandmark
): number => {
  const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
  const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };

  const dot = v1.x * v2.x + v1.y * v2.y;
  const mag1 = Math.sqrt(v1.x ** 2 + v1.y ** 2);
  const mag2 = Math.sqrt(v2.x ** 2 + v2.y ** 2);

  if (mag1 === 0 || mag2 === 0) return 0;

  const angle = Math.acos(Math.max(-1, Math.min(1, dot / (mag1 * mag2))));
  return Math.round(angle * (180 / Math.PI));
};

/**
 * Calculate distance between two points
 */
export const calculateDistance = (
  p1: Point | PoseLandmark,
  p2: Point | PoseLandmark
): number => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Get arrow angle in degrees (for rendering)
 */
export const getArrowAngle = (start: Point, end: Point): number => {
  return Math.atan2(end.y - start.y, end.x - start.x);
};

/**
 * Normalize coordinates from MediaPipe (0-1) to canvas pixels
 */
export const normalizeCoordinates = (
  landmark: PoseLandmark,
  width: number,
  height: number
): Point => {
  return {
    x: landmark.x * width,
    y: landmark.y * height,
  };
};
