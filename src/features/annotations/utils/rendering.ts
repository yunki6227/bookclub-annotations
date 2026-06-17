import type { AnnotationStroke, StrokePoint } from "../types/annotation";
import {
  normalizedPointToPagePoint,
  type PageSize,
} from "./coordinates";

type DrawAnnotationStrokesOptions = {
  context: CanvasRenderingContext2D;
  pageSize: PageSize;
  strokes: AnnotationStroke[];
};

function drawDot(
  context: CanvasRenderingContext2D,
  point: StrokePoint,
  pageSize: PageSize,
  radius: number,
) {
  const { x, y } = normalizedPointToPagePoint(point, pageSize);

  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.fill();
}

function drawStrokePath(
  context: CanvasRenderingContext2D,
  points: StrokePoint[],
  pageSize: PageSize,
) {
  const [firstPoint, ...remainingPoints] = points;

  if (!firstPoint) {
    return;
  }

  const start = normalizedPointToPagePoint(firstPoint, pageSize);
  context.beginPath();
  context.moveTo(start.x, start.y);

  for (const point of remainingPoints) {
    const next = normalizedPointToPagePoint(point, pageSize);
    context.lineTo(next.x, next.y);
  }

  context.stroke();
}

export function drawAnnotationStrokes({
  context,
  pageSize,
  strokes,
}: DrawAnnotationStrokesOptions) {
  context.clearRect(0, 0, pageSize.width, pageSize.height);

  for (const stroke of strokes) {
    if (stroke.points.length === 0) {
      continue;
    }

    context.save();
    context.globalAlpha = stroke.opacity;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = stroke.width;
    context.strokeStyle = stroke.color;
    context.fillStyle = stroke.color;

    if (stroke.points.length === 1) {
      drawDot(context, stroke.points[0], pageSize, stroke.width / 2);
    } else {
      drawStrokePath(context, stroke.points, pageSize);
    }

    context.restore();
  }
}
