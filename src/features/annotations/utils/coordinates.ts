import type { StrokePoint } from "../types/annotation";

export type PageSize = {
  width: number;
  height: number;
};

type PointerLike = {
  clientX: number;
  clientY: number;
  pressure?: number;
  timeStamp?: number;
};

function clampNormalizedValue(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function getNormalizedPointFromPointer(
  pointer: PointerLike,
  element: Element,
): StrokePoint {
  const rect = element.getBoundingClientRect();
  const x = rect.width ? (pointer.clientX - rect.left) / rect.width : 0;
  const y = rect.height ? (pointer.clientY - rect.top) / rect.height : 0;

  return {
    x: clampNormalizedValue(x),
    y: clampNormalizedValue(y),
    pressure: pointer.pressure,
    t: pointer.timeStamp,
  };
}

export function normalizedPointToPagePoint(
  point: StrokePoint,
  pageSize: PageSize,
) {
  return {
    x: point.x * pageSize.width,
    y: point.y * pageSize.height,
  };
}
