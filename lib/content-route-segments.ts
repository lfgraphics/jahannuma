export type ContentRouteType = "ashaar" | "ghazlen" | "nazmen" | "rubai" | "ebooks";

const CONTENT_ROUTE_SEGMENTS: Record<ContentRouteType, string> = {
  ashaar: "Ashaar",
  ghazlen: "Ghazlen",
  nazmen: "Nazmen",
  rubai: "Rubai",
  ebooks: "E-Books",
};

export function getContentRouteSegment(contentType: ContentRouteType): string {
  return CONTENT_ROUTE_SEGMENTS[contentType];
}

export function normalizeContentRouteSegment(segment: string): string | null {
  const normalized = segment.toLowerCase().replace(/-/g, "");

  switch (normalized) {
    case "ashaar":
      return CONTENT_ROUTE_SEGMENTS.ashaar;
    case "ghazlen":
      return CONTENT_ROUTE_SEGMENTS.ghazlen;
    case "nazmen":
      return CONTENT_ROUTE_SEGMENTS.nazmen;
    case "rubai":
      return CONTENT_ROUTE_SEGMENTS.rubai;
    case "ebooks":
      return CONTENT_ROUTE_SEGMENTS.ebooks;
    default:
      return null;
  }
}
