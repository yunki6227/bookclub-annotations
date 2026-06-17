"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";

import {
  loadPdfDocument,
  renderPdfPageToCanvas,
  type PdfPageSize,
} from "../services/pdfRenderer";

type PdfRenderStatus = "loading" | "ready" | "error";

type UsePdfPageRendererOptions = {
  fileUrl: string;
  initialPage?: number;
  scale?: number;
};

type PdfPageRendererState = {
  status: PdfRenderStatus;
  errorMessage: string | null;
  pageCount: number;
  pageNumber: number;
  pageSize: PdfPageSize | null;
};

const DEFAULT_SCALE = 1.2;

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "An unknown error occurred.";
}

export function usePdfPageRenderer({
  fileUrl,
  initialPage = 1,
  scale = DEFAULT_SCALE,
}: UsePdfPageRendererOptions) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const documentRef = useRef<PDFDocumentProxy | null>(null);
  const renderRequestRef = useRef(0);
  const [documentVersion, setDocumentVersion] = useState(0);
  const [state, setState] = useState<PdfPageRendererState>({
    status: "loading",
    errorMessage: null,
    pageCount: 0,
    pageNumber: initialPage,
    pageSize: null,
  });

  useEffect(() => {
    let isCancelled = false;
    const previousDocument = documentRef.current;

    documentRef.current = null;
    if (previousDocument) {
      void previousDocument.cleanup();
    }

    void Promise.resolve()
      .then(() => {
        if (isCancelled) {
          return null;
        }

        setState({
          status: "loading",
          errorMessage: null,
          pageCount: 0,
          pageNumber: initialPage,
          pageSize: null,
        });

        return loadPdfDocument(fileUrl);
      })
      .then((pdfDocument) => {
        if (!pdfDocument) {
          return;
        }

        if (isCancelled) {
          void pdfDocument.cleanup();
          return;
        }

        documentRef.current = pdfDocument;
        setState((current) => ({
          ...current,
          pageCount: pdfDocument.numPages,
          pageNumber: Math.min(initialPage, pdfDocument.numPages),
        }));
        setDocumentVersion((version) => version + 1);
      })
      .catch((error: unknown) => {
        if (isCancelled) {
          return;
        }

        setState((current) => ({
          ...current,
          status: "error",
          errorMessage: getErrorMessage(error),
        }));
      });

    return () => {
      isCancelled = true;
      const pdfDocument = documentRef.current;
      documentRef.current = null;

      if (pdfDocument) {
        void pdfDocument.cleanup();
      }
    };
  }, [fileUrl, initialPage]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const pdfDocument = documentRef.current;

    if (!canvas || !pdfDocument) {
      return;
    }

    let isCancelled = false;
    const requestId = renderRequestRef.current + 1;
    renderRequestRef.current = requestId;

    void renderPdfPageToCanvas({
      canvas,
      pageNumber: state.pageNumber,
      pdfDocument,
      scale,
    })
      .then((result) => {
        if (isCancelled || renderRequestRef.current !== requestId) {
          return;
        }

        setState((current) => ({
          ...current,
          status: "ready",
          errorMessage: null,
          pageCount: result.pageCount,
          pageNumber: result.pageNumber,
          pageSize: result.pageSize,
        }));
      })
      .catch((error: unknown) => {
        if (isCancelled || renderRequestRef.current !== requestId) {
          return;
        }

        setState((current) => ({
          ...current,
          status: "error",
          errorMessage: getErrorMessage(error),
        }));
      });

    return () => {
      isCancelled = true;
    };
  }, [documentVersion, scale, state.pageNumber]);

  const goToPreviousPage = useCallback(() => {
    setState((current) => ({
      ...current,
      errorMessage: null,
      pageNumber: Math.max(1, current.pageNumber - 1),
      status: "loading",
    }));
  }, []);

  const goToNextPage = useCallback(() => {
    setState((current) => ({
      ...current,
      errorMessage: null,
      pageNumber: current.pageCount
        ? Math.min(current.pageCount, current.pageNumber + 1)
        : current.pageNumber,
      status: "loading",
    }));
  }, []);

  return {
    ...state,
    canvasRef,
    canGoToNextPage:
      state.status !== "loading" &&
      state.pageCount > 0 &&
      state.pageNumber < state.pageCount,
    canGoToPreviousPage: state.status !== "loading" && state.pageNumber > 1,
    goToNextPage,
    goToPreviousPage,
  };
}
