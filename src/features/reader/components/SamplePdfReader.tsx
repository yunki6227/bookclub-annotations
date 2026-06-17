"use client";

import { useCallback } from "react";

import { AnnotationCanvasOverlay } from "@/features/annotations/components/AnnotationCanvasOverlay";
import type { AnnotationStroke } from "@/features/annotations/types/annotation";
import { useLocalAnnotationPersistence } from "@/features/annotations/hooks/useLocalAnnotationPersistence";

import { usePdfPageRenderer } from "../hooks/usePdfPageRenderer";

type SamplePdfReaderProps = {
  pdfId?: string;
  pdfUrl?: string;
};

export function SamplePdfReader({
  pdfId,
  pdfUrl = "/sample.pdf",
}: SamplePdfReaderProps) {
  const resolvedPdfId = pdfId ?? pdfUrl;
  const { isHydrated, setStrokesByPage, strokesByPage } =
    useLocalAnnotationPersistence(resolvedPdfId);
  const {
    canvasRef,
    canGoToNextPage,
    canGoToPreviousPage,
    errorMessage,
    goToNextPage,
    goToPreviousPage,
    pageCount,
    pageNumber,
    pageSize,
    status,
  } = usePdfPageRenderer({ fileUrl: pdfUrl });
  const currentPageStrokes = strokesByPage[pageNumber] ?? [];

  const handleStrokeComplete = useCallback(
    (stroke: AnnotationStroke) => {
      setStrokesByPage((currentStrokesByPage) => ({
        ...currentStrokesByPage,
        [pageNumber]: [
          ...(currentStrokesByPage[pageNumber] ?? []),
          stroke,
        ],
      }));
    },
    [pageNumber, setStrokesByPage],
  );

  const clearCurrentPageStrokes = useCallback(() => {
    setStrokesByPage((currentStrokesByPage) => {
      const remainingStrokesByPage = { ...currentStrokesByPage };
      delete remainingStrokesByPage[pageNumber];

      return remainingStrokesByPage;
    });
  }, [pageNumber, setStrokesByPage]);

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
            Phase 3
          </p>
          <h1 className="text-3xl font-semibold text-slate-950 sm:text-4xl">
            BookClub Annotations MVP
          </h1>
          <p className="mt-2 text-base text-slate-600">
            Local PDF reader preview.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={!canGoToPreviousPage}
            onClick={goToPreviousPage}
          >
            Previous
          </button>
          <span className="min-w-24 text-center text-sm text-slate-600">
            Page {pageNumber}
            {pageCount ? ` of ${pageCount}` : ""}
          </span>
          <button
            type="button"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={!canGoToNextPage}
            onClick={goToNextPage}
          >
            Next
          </button>
          <button
            type="button"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={currentPageStrokes.length === 0}
            onClick={clearCurrentPageStrokes}
          >
            Clear page
          </button>
        </div>
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex min-h-[28rem] items-center justify-center overflow-auto rounded-sm bg-slate-100 p-4">
          {status === "error" ? (
            <div className="max-w-md text-center">
              <p className="text-base font-medium text-red-700">
                Could not render the PDF.
              </p>
              {errorMessage ? (
                <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
              ) : null}
            </div>
          ) : (
            <div
              className={pageSize ? "relative bg-white shadow" : "bg-white"}
              style={
                pageSize
                  ? {
                      height: `${pageSize.height}px`,
                      width: `${pageSize.width}px`,
                    }
                  : undefined
              }
            >
              <canvas
                ref={canvasRef}
                aria-label="Rendered sample PDF page"
                className={
                  pageSize
                    ? "absolute inset-0 bg-white"
                    : "h-auto bg-white shadow"
                }
              />
              {status === "ready" && pageSize ? (
                <AnnotationCanvasOverlay
                  onStrokeComplete={handleStrokeComplete}
                  pageSize={pageSize}
                  strokes={currentPageStrokes}
                />
              ) : null}
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
          <span>
            {status === "loading"
              ? "Loading PDF..."
              : "Sample PDF rendered locally."}{" "}
            {isHydrated ? "Annotations saved locally." : ""}
          </span>
          {pageSize ? (
            <span>
              {Math.round(pageSize.width)} x {Math.round(pageSize.height)} px
              {" · "}
              {currentPageStrokes.length} pen{" "}
              {currentPageStrokes.length === 1 ? "stroke" : "strokes"}
            </span>
          ) : null}
        </div>
      </div>
    </section>
  );
}
