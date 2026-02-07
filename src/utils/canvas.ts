import { Point, ArrowStyle } from '../types/drawing';

/**
 * Draw an arrow on canvas
 */
export const drawArrow = (
  ctx: CanvasRenderingContext2D,
  start: Point,
  end: Point,
  color: string,
  thickness: number,
  style: ArrowStyle = 'solid'
) => {
  const headLength = 10 + thickness * 1.2;
  const angle = Math.atan2(end.y - start.y, end.x - start.x);

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = thickness;
  ctx.lineCap = 'round';

  // Set dash pattern for dashed arrows
  if (style === 'dashed') {
    ctx.setLineDash([10, 5]);
  }

  // Draw line
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();

  // Reset dash for solid elements
  ctx.setLineDash([]);

  // Draw starting point circle
  ctx.beginPath();
  ctx.arc(start.x, start.y, thickness * 0.8, 0, 2 * Math.PI);
  ctx.fill();

  // Draw arrowhead
  ctx.beginPath();
  ctx.moveTo(end.x, end.y);
  ctx.lineTo(
    end.x - headLength * Math.cos(angle - Math.PI / 6),
    end.y - headLength * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    end.x - headLength * Math.cos(angle + Math.PI / 6),
    end.y - headLength * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fill();

  ctx.restore();
};

/**
 * Draw a line on canvas (solid by default)
 */
export const drawDashedLine = (
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  thickness: number = 2,
  dashPattern: number[] = []
) => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = thickness;
  ctx.setLineDash(dashPattern);

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  ctx.restore();
};

/**
 * Draw text with background
 */
export const drawTextWithBackground = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  textColor: string = '#fff',
  backgroundColor: string = 'rgba(0, 0, 0, 0.7)',
  padding: number = 6
) => {
  ctx.save();
  ctx.font = '14px sans-serif';

  const metrics = ctx.measureText(text);
  const width = metrics.width + padding * 2;
  const height = 20 + padding * 2;

  // Draw background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(x, y - height / 2, width, height);

  // Draw text
  ctx.fillStyle = textColor;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + padding, y);

  ctx.restore();
};

/**
 * Draw a free drawing path
 */
export const drawFreePath = (
  ctx: CanvasRenderingContext2D,
  points: Point[],
  color: string,
  thickness: number
) => {
  if (points.length < 2) return;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = thickness;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }

  ctx.stroke();
  ctx.restore();
};

/**
 * Draw angle measurement
 */
export const drawAngleMeasurement = (
  ctx: CanvasRenderingContext2D,
  p1: Point,
  p2: Point,
  p3: Point,
  angle: number,
  color: string
) => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;

  // Draw lines
  ctx.beginPath();
  ctx.moveTo(p2.x, p2.y);
  ctx.lineTo(p1.x, p1.y);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(p2.x, p2.y);
  ctx.lineTo(p3.x, p3.y);
  ctx.stroke();

  // Draw points
  [p1, p2, p3].forEach((p, index) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, index === 1 ? 6 : 4, 0, 2 * Math.PI); // Vertex is larger
    ctx.fill();
  });

  // Draw arc at vertex
  const radius = 30;
  const angle1 = Math.atan2(p1.y - p2.y, p1.x - p2.x);
  const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);

  ctx.beginPath();
  ctx.arc(p2.x, p2.y, radius, angle1, angle2, angle1 > angle2);
  ctx.stroke();

  // Draw angle text
  const midAngle = (angle1 + angle2) / 2;
  const textX = p2.x + Math.cos(midAngle) * (radius + 20);
  const textY = p2.y + Math.sin(midAngle) * (radius + 20);

  drawTextWithBackground(ctx, `${angle}°`, textX, textY, '#fff', color + 'cc');

  ctx.restore();
};

/**
 * Clear canvas
 */
export const clearCanvas = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) => {
  ctx.clearRect(0, 0, width, height);
};
