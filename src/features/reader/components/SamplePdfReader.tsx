"use client";

import { usePdfPageRenderer } from "../hooks/usePdfPageRenderer";

type SamplePdfReaderProps = {
  pdfUrl?: string;
};

export function SamplePdfReader({
  pdfUrl = "/sample.pdf",
}: SamplePdfReaderProps) {
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

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
            Phase 1
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
            <canvas
              ref={canvasRef}
              aria-label="Rendered sample PDF page"
              className="h-auto max-w-full bg-white shadow"
            />
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
          <span>
            {status === "loading"
              ? "Loading PDF..."
              : "Sample PDF rendered locally."}
          </span>
          {pageSize ? (
            <span>
              {Math.round(pageSize.width)} x {Math.round(pageSize.height)} px
            </span>
          ) : null}
        </div>
      </div>
    </section>
  );
}
