# Project Brief

## Overview

`bookclub-annotations` is a social PDF annotation MVP. The product helps reading groups share one PDF and see each other's page-level annotations while reading together.

The core experience is simple:

1. A user opens a PDF book.
2. The user draws or highlights directly over a page.
3. The app saves the annotation as vector stroke data.
4. A friend reading the same page can see that this user annotated the page.
5. The friend can toggle that user's annotation layer over the PDF.

## Core Product Idea

- Users join a reading group or club.
- A club reads the same shared PDF file.
- Users can annotate PDF pages with pen, highlighter, and drawing tools.
- A reader can see which friends annotated the current page.
- A reader can toggle one friend's annotation layer at a time over the PDF.
- Multiple friend layers should not be shown by default because the page can become visually cluttered.

## Important Product Constraint

Annotations must align to one exact PDF file, not just a book title.

Different editions or PDF exports of the same book may have different page counts, page sizes, margins, or text positions. For the social version, a club book should refer to one shared PDF file so everyone sees the same page layout.

## Annotation Data Model

Annotations should be stored as vector stroke data, not only transparent PNG images.

Transparent PNG exports may be useful later for previews, thumbnails, cached overlays, or sharing, but they should not be the source of truth.

Stroke points should use normalized page coordinates:

- `x` values range from `0` to `1` across the page width.
- `y` values range from `0` to `1` across the page height.
- Rendering should map normalized points to the current PDF page viewport.

This keeps annotations portable across zoom levels, screen sizes, and PDF rendering scales.

## Example Stroke Shape

```ts
type AnnotationStroke = {
  id: string;
  tool: "pen" | "highlighter" | "eraser";
  color: string;
  width: number;
  opacity: number;
  points: StrokePoint[];
  createdAt: string;
};

type StrokePoint = {
  x: number;
  y: number;
  pressure?: number;
  t?: number;
};