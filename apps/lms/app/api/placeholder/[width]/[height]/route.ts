import { type NextRequest, NextResponse } from "next/server";
import type { RouteContext } from "@/types";

type PlaceholderParams = { width: string; height: string };

/**
 * Serves a simple placeholder image (gray circle) for next/image.
 * GET /api/placeholder/40/40 or /api/placeholder/60/60 etc.
 */
export async function GET(
  _request: NextRequest,
  { params }: RouteContext<PlaceholderParams>
) {
  const { width: w, height: h } = (await params) || {};
  const width = Math.min(Number(w) || 40, 400);
  const height = Math.min(Number(h) || 40, 400);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><circle cx="${width / 2}" cy="${height / 2}" r="${Math.min(width, height) / 2}" fill="#9ca3af"/></svg>`;

  return new NextResponse(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
