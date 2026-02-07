export interface Point {
  x: number;
  y: number;
}

export type ArrowStyle = 'solid' | 'dashed';

export interface Arrow {
  id: string;
  start: Point;
  end: Point;
  color: string;
  thickness: number;
  timestamp: number; // milliseconds
  style: ArrowStyle;
}

export interface FreeDraw {
  id: string;
  points: Point[];
  color: string;
  thickness: number;
  timestamp: number; // milliseconds
}

export interface ReferenceLine {
  id: string;
  type: 'horizontal' | 'vertical';
  position: number; // percentage (0-100) for horizontal, pixel for vertical
  color: string;
  thickness: number;
}

export interface AngleMeasurement {
  id: string;
  points: [Point, Point, Point]; // 3 points: start, vertex, end
  angle: number;
  color: string;
  timestamp: number; // milliseconds
}

export interface AnnotationData {
  arrows: Arrow[];
  freeDrawings: FreeDraw[];
  referenceLines: ReferenceLine[];
  angles: AngleMeasurement[];
}
