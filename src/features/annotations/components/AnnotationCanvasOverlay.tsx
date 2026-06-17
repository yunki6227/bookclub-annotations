"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

import type { AnnotationStroke } from "../types/annotation";
import {
  getNormalizedPointFromPointer,
  type PageSize,
} from "../utils/coordinates";
import { drawAnnotationStrokes } from "../utils/rendering";

type AnnotationCanvasOverlayProps = {
  disabled?: boolean;
  onStrokeComplete: (stroke: AnnotationStroke) => void;
  pageSize: PageSize;
  penColor?: string;
  penWidth?: number;
  strokes: AnnotationStroke[];
};

const DEFAULT_PEN_COLOR = "#2563eb";
const DEFAULT_PEN_WIDTH = 3;

function createStrokeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function AnnotationCanvasOverlay({
  disabled = false,
  onStrokeComplete,
  pageSize,
  penColor = DEFAULT_PEN_COLOR,
  penWidth = DEFAULT_PEN_WIDTH,
  strokes,
}: AnnotationCanvasOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activePointerIdRef = useRef<number | null>(null);
  const [activeStroke, setActiveStroke] = useState<AnnotationStroke | null>(
    null,
  );

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const outputScale = window.devicePixelRatio || 1;
    const context = canvas.getContext("2d");

    canvas.width = Math.floor(pageSize.width * outputScale);
    canvas.height = Math.floor(pageSize.height * outputScale);
    canvas.style.width = `${pageSize.width}px`;
    canvas.style.height = `${pageSize.height}px`;

    if (!context) {
      return;
    }

    context.setTransform(outputScale, 0, 0, outputScale, 0, 0);
    drawAnnotationStrokes({
      context,
      pageSize,
      strokes: activeStroke ? [...strokes, activeStroke] : strokes,
    });
  }, [activeStroke, pageSize, strokes]);

  const completeActiveStroke = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>) => {
      if (activePointerIdRef.current !== event.pointerId) {
        return;
      }

      const canvas = event.currentTarget;
      activePointerIdRef.current = null;
      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }

      if (activeStroke && activeStroke.points.length > 0) {
        onStrokeComplete(activeStroke);
      }

      setActiveStroke(null);
    },
    [activeStroke, onStrokeComplete],
  );

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>) => {
      if (disabled || activePointerIdRef.current !== null) {
        return;
      }

      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }

      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      activePointerIdRef.current = event.pointerId;

      const point = getNormalizedPointFromPointer(event, event.currentTarget);

      setActiveStroke({
        id: createStrokeId(),
        color: penColor,
        createdAt: new Date().toISOString(),
        opacity: 1,
        points: [point],
        tool: "pen",
        width: penWidth,
      });
    },
    [disabled, penColor, penWidth],
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>) => {
      if (disabled || activePointerIdRef.current !== event.pointerId) {
        return;
      }

      event.preventDefault();
      const point = getNormalizedPointFromPointer(event, event.currentTarget);

      setActiveStroke((currentStroke) => {
        if (!currentStroke) {
          return currentStroke;
        }

        return {
          ...currentStroke,
          points: [...currentStroke.points, point],
        };
      });
    },
    [disabled],
  );

  const handlePointerCancel = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>) => {
      if (activePointerIdRef.current !== event.pointerId) {
        return;
      }

      activePointerIdRef.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      setActiveStroke(null);
    },
    [],
  );

  return (
    <canvas
      ref={canvasRef}
      aria-label="Annotation drawing layer"
      className="absolute inset-0 cursor-crosshair touch-none"
      onPointerCancel={handlePointerCancel}
      onPointerDown={handlePointerDown}
      onPointerLeave={completeActiveStroke}
      onPointerMove={handlePointerMove}
      onPointerUp={completeActiveStroke}
    />
  );
}
