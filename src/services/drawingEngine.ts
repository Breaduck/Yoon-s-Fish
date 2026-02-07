import { Arrow, FreeDraw, ReferenceLine, AngleMeasurement } from '../types/drawing';
import { drawArrow, drawDashedLine, drawFreePath, drawAngleMeasurement, clearCanvas } from '../utils/canvas';

export class DrawingEngine {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D context from canvas');
    }
    this.ctx = ctx;
    this.width = canvas.width;
    this.height = canvas.height;
  }

  clear() {
    clearCanvas(this.ctx, this.width, this.height);
  }

  drawReferenceLines(lines: ReferenceLine[]) {
    lines.forEach((line) => {
      if (line.type === 'horizontal') {
        const y = (line.position / 100) * this.height;
        drawDashedLine(this.ctx, 0, y, this.width, y, line.color, line.thickness);
      } else {
        // For vertical lines, position is a percentage too
        const x = (line.position / 100) * this.width;
        drawDashedLine(this.ctx, x, 0, x, this.height, line.color, line.thickness);
      }
    });
  }

  drawArrows(arrows: Arrow[]) {
    arrows.forEach((arrow) => {
      drawArrow(this.ctx, arrow.start, arrow.end, arrow.color, arrow.thickness, arrow.style);
    });
  }

  drawFreeDrawings(drawings: FreeDraw[]) {
    drawings.forEach((drawing) => {
      drawFreePath(this.ctx, drawing.points, drawing.color, drawing.thickness);
    });
  }

  drawAngles(angles: AngleMeasurement[]) {
    angles.forEach((angle) => {
      drawAngleMeasurement(
        this.ctx,
        angle.points[0],
        angle.points[1],
        angle.points[2],
        angle.angle,
        angle.color
      );
    });
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  getContext() {
    return this.ctx;
  }
}
