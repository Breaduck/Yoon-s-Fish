export interface Point {
  x: number;
  y: number;
}

export type ArrowStyle = 'solid' | 'dash-short' | 'dash-long' | 'dot' | 'dash-dot' | 'dash-dot-dot';

export interface Arrow {
  id: string;
  start: Point;
  end: Point;
  color: string;
  thickness: number;
  timestamp: number; // milliseconds
  style: ArrowStyle;
  videoIndex?: number; // 0 for Before, 1 for After (optional for backward compatibility)
  createdAt: number; // timestamp when created
}

export interface FreeDraw {
  id: string;
  points: Point[];
  color: string;
  thickness: number;
  timestamp: number; // milliseconds
  videoIndex?: number; // 0 for Before, 1 for After (optional for backward compatibility)
  createdAt: number; // timestamp when created
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
  videoIndex?: number; // 0 for Before, 1 for After (optional for backward compatibility)
  createdAt: number; // timestamp when created
}

export interface AnnotationData {
  arrows: Arrow[];
  freeDrawings: FreeDraw[];
  referenceLines: ReferenceLine[];
  angles: AngleMeasurement[];
}
