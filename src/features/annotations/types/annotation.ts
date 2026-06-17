export type AnnotationTool = "pen";

export type StrokePoint = {
  x: number;
  y: number;
  pressure?: number;
  t?: number;
};

export type AnnotationStroke = {
  id: string;
  tool: AnnotationTool;
  color: string;
  width: number;
  opacity: number;
  points: StrokePoint[];
  createdAt: string;
};

export type AnnotationStrokesByPage = Record<number, AnnotationStroke[]>;

export type LocalAnnotationStore = {
  version: 1;
  pdfId: string;
  pages: AnnotationStrokesByPage;
  updatedAt: string;
};
