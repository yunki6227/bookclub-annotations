import type {
  AnnotationStroke,
  AnnotationStrokesByPage,
} from "../types/annotation";

export type MockFriendAnnotationLayer = {
  friendId: string;
  friendName: string;
  pages: AnnotationStrokesByPage;
};

export type MockFriendPageLayer = {
  friendId: string;
  friendName: string;
  strokes: AnnotationStroke[];
};

export const mockFriendAnnotationLayers: MockFriendAnnotationLayer[] = [
  {
    friendId: "maya",
    friendName: "Maya",
    pages: {
      1: [
        {
          id: "maya-page-1-margin-note",
          tool: "pen",
          color: "#dc2626",
          width: 3,
          opacity: 0.9,
          createdAt: "2026-06-17T00:00:00.000Z",
          points: [
            { x: 0.16, y: 0.22 },
            { x: 0.22, y: 0.18 },
            { x: 0.3, y: 0.2 },
            { x: 0.36, y: 0.27 },
          ],
        },
        {
          id: "maya-page-1-underline",
          tool: "pen",
          color: "#dc2626",
          width: 2,
          opacity: 0.85,
          createdAt: "2026-06-17T00:00:01.000Z",
          points: [
            { x: 0.12, y: 0.36 },
            { x: 0.27, y: 0.36 },
            { x: 0.43, y: 0.37 },
          ],
        },
      ],
    },
  },
  {
    friendId: "jordan",
    friendName: "Jordan",
    pages: {
      1: [
        {
          id: "jordan-page-1-callout",
          tool: "pen",
          color: "#059669",
          width: 3,
          opacity: 0.85,
          createdAt: "2026-06-17T00:01:00.000Z",
          points: [
            { x: 0.62, y: 0.18 },
            { x: 0.7, y: 0.2 },
            { x: 0.75, y: 0.28 },
            { x: 0.72, y: 0.36 },
            { x: 0.64, y: 0.38 },
            { x: 0.58, y: 0.31 },
            { x: 0.6, y: 0.22 },
            { x: 0.62, y: 0.18 },
          ],
        },
      ],
    },
  },
];

export function getMockFriendLayersForPage(
  pageNumber: number,
): MockFriendPageLayer[] {
  return mockFriendAnnotationLayers
    .map((layer) => ({
      friendId: layer.friendId,
      friendName: layer.friendName,
      strokes: layer.pages[pageNumber] ?? [],
    }))
    .filter((layer) => layer.strokes.length > 0);
}
