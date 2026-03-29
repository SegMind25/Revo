import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('fileName');
    if (!fileName) {
      return NextResponse.json({error: "Missing fileName"}, {status: 400});
    }

    const fileBuffer = await request.arrayBuffer();
    const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);
    
    await writeFile(filePath, Buffer.from(fileBuffer));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Local upload error:", error);
    return NextResponse.json({ error: 'Failed to upload locally', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
