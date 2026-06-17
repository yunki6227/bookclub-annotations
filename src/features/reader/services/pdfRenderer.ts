import type { PDFDocumentProxy } from "pdfjs-dist/legacy/build/pdf.mjs";

type PdfJsModule = typeof import("pdfjs-dist/legacy/build/pdf.mjs");

export type PdfPageSize = {
  width: number;
  height: number;
};

type RenderPdfPageOptions = {
  canvas: HTMLCanvasElement;
  pageNumber: number;
  pdfDocument: PDFDocumentProxy;
  scale: number;
};

export type PdfPageRenderResult = {
  pageCount: number;
  pageNumber: number;
  pageSize: PdfPageSize;
};

let pdfjsModulePromise: Promise<PdfJsModule> | null = null;

async function getPdfjsModule() {
  if (!pdfjsModulePromise) {
    pdfjsModulePromise = import("pdfjs-dist/legacy/build/pdf.mjs").then(
      (pdfjs) => {
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/legacy/build/pdf.worker.mjs",
          import.meta.url,
        ).toString();

        return pdfjs;
      },
    );
  }

  return pdfjsModulePromise;
}

export async function loadPdfDocument(fileUrl: string) {
  const pdfjs = await getPdfjsModule();
  const loadingTask = pdfjs.getDocument({ url: fileUrl });

  return loadingTask.promise;
}

export async function renderPdfPageToCanvas({
  canvas,
  pageNumber,
  pdfDocument,
  scale,
}: RenderPdfPageOptions): Promise<PdfPageRenderResult> {
  if (pageNumber < 1 || pageNumber > pdfDocument.numPages) {
    throw new Error(`Page ${pageNumber} is outside this PDF.`);
  }

  const page = await pdfDocument.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas rendering is not available in this browser.");
  }

  const outputScale =
    typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;
  const width = Math.floor(viewport.width);
  const height = Math.floor(viewport.height);

  canvas.width = Math.floor(width * outputScale);
  canvas.height = Math.floor(height * outputScale);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, canvas.width, canvas.height);

  const renderTask = page.render({
    canvas,
    canvasContext: context,
    transform:
      outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined,
    viewport,
  });

  await renderTask.promise;

  return {
    pageCount: pdfDocument.numPages,
    pageNumber,
    pageSize: {
      height,
      width,
    },
  };
}
