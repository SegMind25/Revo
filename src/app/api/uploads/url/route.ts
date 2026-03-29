import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

interface UploadUrlRequest {
  userId: string;
  urls: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: UploadUrlRequest = await request.json();
    const { userId, urls } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: "urls array is required and must not be empty" }, { status: 400 });
    }

    const uploads = [];
    
    for (const remoteUrl of urls) {
      try {
        const fetchRes = await fetch(remoteUrl);
        if (!fetchRes.ok) throw new Error(`Failed to fetch ${remoteUrl}. Status: ${fetchRes.status}`);
        
        const contentType = fetchRes.headers.get('content-type') || "application/octet-stream";
        let ext = "";
        if (contentType.includes("video/mp4")) ext = ".mp4";
        else if (contentType.includes("image/jpeg")) ext = ".jpg";
        else if (contentType.includes("image/png")) ext = ".png";
        else if (contentType.includes("audio/mpeg")) ext = ".mp3";
        else {
          const match = remoteUrl.match(/\.([a-z0-9]+)(\?|$)/i);
          if (match) ext = "." + match[1];
        }

        const uniqueId = crypto.randomUUID().split('-')[0];
        const safeName = `url_${uniqueId}${ext}`;
        const filePath = path.join(process.cwd(), 'public', 'uploads', safeName);
        
        const arrayBuffer = await fetchRes.arrayBuffer();
        await writeFile(filePath, Buffer.from(arrayBuffer));

        uploads.push({
          fileName: safeName,
          filePath: `uploads/${safeName}`,
          contentType,
          originalUrl: remoteUrl,
          url: `/uploads/${encodeURIComponent(safeName)}`
        });
      } catch (err) {
        console.error(`Failed to download URL ${remoteUrl}:`, err);
        return NextResponse.json({ error: `Failed processing remote url`, details: err instanceof Error ? err.message : String(err) }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      uploads
    });
  } catch (error) {
    console.error("Error in upload URL route:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
