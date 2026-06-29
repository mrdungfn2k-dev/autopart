import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Save to public/vipo-assets/avatars
    const publicDir = path.join(process.cwd(), "public");
    const avatarsDir = path.join(publicDir, "vipo-assets", "avatars");
    
    if (!fs.existsSync(avatarsDir)) {
      fs.mkdirSync(avatarsDir, { recursive: true });
    }

    // Use a robust standard name or a unique name. We'll use a unique timestamp 
    // just to bypass any Next.js image caching if needed.
    const ext = file.name.split('.').pop() || 'png';
    const filename = `avatar-${Date.now()}.${ext}`;
    const filePath = path.join(avatarsDir, filename);

    fs.writeFileSync(filePath, buffer);

    // Return the public URL
    const url = `/api/uploads/avatars/${filename}`;

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload avatar err:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
