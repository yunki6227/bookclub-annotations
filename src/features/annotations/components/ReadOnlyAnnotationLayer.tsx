"use client";

import { useEffect, useRef } from "react";

import type { AnnotationStroke } from "../types/annotation";
import type { PageSize } from "../utils/coordinates";
import { drawAnnotationStrokes } from "../utils/rendering";

type ReadOnlyAnnotationLayerProps = {
  ariaLabel: string;
  pageSize: PageSize;
  strokes: AnnotationStroke[];
};

export function ReadOnlyAnnotationLayer({
  ariaLabel,
  pageSize,
  strokes,
}: ReadOnlyAnnotationLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
      strokes,
    });
  }, [pageSize, strokes]);

  return (
    <canvas
      ref={canvasRef}
      aria-label={ariaLabel}
      className="pointer-events-none absolute inset-0"
    />
  );
}
