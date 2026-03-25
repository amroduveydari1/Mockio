import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import archiver from "archiver";
import { Readable } from "stream";

export async function GET(request: NextRequest) {
  const brandSetId = request.nextUrl.searchParams.get("id");
  if (!brandSetId) {
    return NextResponse.json({ error: "Missing brand set ID" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Fetch mockups for this brand set
  const { data: mockups, error } = await supabase
    .from("generated_mockups")
    .select("id, name, result_url, metadata")
    .eq("user_id", user.id)
    .contains("metadata", { brand_set_id: brandSetId })
    .order("created_at", { ascending: true });

  if (error || !mockups || mockups.length === 0) {
    return NextResponse.json({ error: "Brand set not found" }, { status: 404 });
  }

  // Create ZIP archive
  const archive = archiver("zip", { zlib: { level: 6 } });
  const chunks: Uint8Array[] = [];

  // Collect chunks from the archiver stream
  const readable = Readable.from(archive as unknown as AsyncIterable<Uint8Array>);

  const bufferPromise = new Promise<Buffer>((resolve, reject) => {
    readable.on("data", (chunk) => chunks.push(chunk));
    readable.on("end", () => resolve(Buffer.concat(chunks)));
    readable.on("error", reject);
  });

  // Add each mockup to the archive
  for (const mockup of mockups) {
    try {
      const resp = await fetch(mockup.result_url);
      if (!resp.ok) continue;
      const buffer = Buffer.from(await resp.arrayBuffer());
      const slug = (mockup.metadata as Record<string, string>)?.category_slug || "mockup";
      const filename = `${slug}-${mockup.name.replace(/[^a-zA-Z0-9-]/g, "-").toLowerCase()}.png`;
      archive.append(buffer, { name: filename });
    } catch {
      // Skip failed downloads
    }
  }

  archive.finalize();
  const zipBuffer = await bufferPromise;

  return new NextResponse(new Uint8Array(zipBuffer), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="brand-set-${brandSetId.slice(-8)}.zip"`,
    },
  });
}
