import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ dimensions: string }> }
) {
  const { dimensions } = await params;
  const [width, height] = dimensions.split("x").map(Number);

  const w = Math.min(width || 400, 2000);
  const h = Math.min(height || 300, 2000);

  // Generate a simple SVG placeholder
  const svg = `
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f5f5f5"/>
      <rect x="10%" y="10%" width="80%" height="80%" fill="#e5e5e5" rx="8"/>
      <text x="50%" y="50%" font-family="system-ui, sans-serif" font-size="16" fill="#a3a3a3" text-anchor="middle" dy=".3em">
        ${w} × ${h}
      </text>
    </svg>
  `;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
