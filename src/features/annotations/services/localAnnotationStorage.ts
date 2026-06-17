import type {
  AnnotationStroke,
  AnnotationStrokesByPage,
  LocalAnnotationStore,
  StrokePoint,
} from "../types/annotation";

const LOCAL_ANNOTATION_STORE_VERSION = 1;
const LOCAL_ANNOTATION_STORE_PREFIX = "bookclub-annotations:annotations:v1";

function getStorageKey(pdfId: string) {
  return `${LOCAL_ANNOTATION_STORE_PREFIX}:${encodeURIComponent(pdfId)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isNormalizedPoint(value: unknown): value is StrokePoint {
  if (!isRecord(value)) {
    return false;
  }

  const { pressure, t, x, y } = value;

  return (
    isFiniteNumber(x) &&
    x >= 0 &&
    x <= 1 &&
    isFiniteNumber(y) &&
    y >= 0 &&
    y <= 1 &&
    (pressure === undefined || isFiniteNumber(pressure)) &&
    (t === undefined || isFiniteNumber(t))
  );
}

function isAnnotationStroke(value: unknown): value is AnnotationStroke {
  if (!isRecord(value)) {
    return false;
  }

  const { color, createdAt, id, opacity, points, tool, width } = value;

  return (
    typeof id === "string" &&
    tool === "pen" &&
    typeof color === "string" &&
    isFiniteNumber(width) &&
    isFiniteNumber(opacity) &&
    typeof createdAt === "string" &&
    Array.isArray(points) &&
    points.every(isNormalizedPoint)
  );
}

function readValidPages(value: unknown): AnnotationStrokesByPage | null {
  if (!isRecord(value)) {
    return null;
  }

  const pages: AnnotationStrokesByPage = {};

  for (const [pageNumber, strokes] of Object.entries(value)) {
    const parsedPageNumber = Number(pageNumber);

    if (
      !Number.isInteger(parsedPageNumber) ||
      parsedPageNumber < 1 ||
      !Array.isArray(strokes) ||
      !strokes.every(isAnnotationStroke)
    ) {
      return null;
    }

    pages[parsedPageNumber] = strokes;
  }

  return pages;
}

function parseLocalAnnotationStore(
  value: unknown,
  pdfId: string,
): LocalAnnotationStore | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    value.version !== LOCAL_ANNOTATION_STORE_VERSION ||
    value.pdfId !== pdfId ||
    typeof value.updatedAt !== "string"
  ) {
    return null;
  }

  const pages = readValidPages(value.pages);

  if (!pages) {
    return null;
  }

  return {
    version: LOCAL_ANNOTATION_STORE_VERSION,
    pdfId,
    pages,
    updatedAt: value.updatedAt,
  };
}

export function readLocalAnnotationStore(
  storage: Storage,
  pdfId: string,
): LocalAnnotationStore | null {
  const key = getStorageKey(pdfId);

  try {
    const rawValue = storage.getItem(key);

    if (!rawValue) {
      return null;
    }

    return parseLocalAnnotationStore(JSON.parse(rawValue), pdfId);
  } catch {
    return null;
  }
}

export function writeLocalAnnotationStore(
  storage: Storage,
  pdfId: string,
  pages: AnnotationStrokesByPage,
) {
  const store: LocalAnnotationStore = {
    version: LOCAL_ANNOTATION_STORE_VERSION,
    pdfId,
    pages,
    updatedAt: new Date().toISOString(),
  };

  try {
    storage.setItem(getStorageKey(pdfId), JSON.stringify(store));
  } catch {
    return;
  }
}
