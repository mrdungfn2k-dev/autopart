import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: Request, { params }: { params: Promise<{ filename: string }> }) {
  try {
    const { filename } = await params;
    const avatarsDir = path.join(process.cwd(), "public", "vipo-assets", "avatars");
    const filePath = path.join(avatarsDir, filename);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const ext = filename.split('.').pop()?.toLowerCase();
    let contentType = "image/png";
    if (ext === "jpg" || ext === "jpeg") contentType = "image/jpeg";
    if (ext === "svg") contentType = "image/svg+xml";
    if (ext === "gif") contentType = "image/gif";
    if (ext === "webp") contentType = "image/webp";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
