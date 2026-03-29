import { NextRequest, NextResponse } from "next/server";

interface PresignRequest {
  userId: string;
  fileNames: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: PresignRequest = await request.json();
    const { userId, fileNames } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    if (!fileNames || !Array.isArray(fileNames) || fileNames.length === 0) {
      return NextResponse.json({ error: "fileNames array is required and must not be empty" }, { status: 400 });
    }

    // Mock the external presigned URLs by pointing them to our local upload handler
    const uploads = fileNames.map(name => {
      const extMatch = name.match(/\.([^.]+)$/);
      const ext = extMatch ? `.${extMatch[1]}` : "";
      const baseName = extMatch ? name.slice(0, -ext.length) : name;
      const uniqueId = crypto.randomUUID().split('-')[0];
      const safeName = `${baseName.replace(/[^a-zA-Z0-9]/g, '_')}_${uniqueId}${ext}`;
      
      let contentType = "application/octet-stream";
      if (ext === ".mp4") contentType = "video/mp4";
      else if (ext === ".png") contentType = "image/png";
      else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
      else if (ext === ".mp3") contentType = "audio/mpeg";

      return {
        fileName: safeName,
        filePath: `uploads/${safeName}`, 
        contentType,
        presignedUrl: `/api/uploads/local?fileName=${encodeURIComponent(safeName)}`,
        url: `/uploads/${encodeURIComponent(safeName)}`
      };
    });

    return NextResponse.json({
      success: true,
      uploads
    });
  } catch (error) {
    console.error("Error in presign route:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
