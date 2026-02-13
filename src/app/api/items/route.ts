import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveFile } from "@/lib/upload";
import { fetchOgData, isVideoUrl } from "@/lib/og";
import { findNonOverlappingPosition } from "@/lib/placement";

const DEFAULT_USER = "default-user";

export async function GET(req: NextRequest) {
  const boardId = req.nextUrl.searchParams.get("boardId") || "default-board";

  const items = await prisma.item.findMany({
    where: { boardId },
    include: { tags: { include: { tag: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";
  const boardId =
    req.nextUrl.searchParams.get("boardId") || "default-board";

  // Get existing items for placement
  const existingItems = await prisma.item.findMany({
    where: { boardId },
    select: { posX: true, posY: true, width: true, height: true },
  });

  const existingRects = existingItems.map((i) => ({
    x: i.posX,
    y: i.posY,
    width: i.width,
    height: i.height,
  }));

  // Get viewport center from query params (client sends these)
  const centerX = parseFloat(req.nextUrl.searchParams.get("cx") || "0");
  const centerY = parseFloat(req.nextUrl.searchParams.get("cy") || "0");

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { filePath, thumbnailPath, width, height } = await saveFile(
      buffer,
      file.name
    );

    const imageExts = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const isImage = imageExts.includes(`.${ext}`);
    const videoExts = ["mp4", "webm", "mov"];
    const isVideo = videoExts.includes(ext);

    const pos = findNonOverlappingPosition(
      centerX,
      centerY,
      width,
      height,
      existingRects
    );

    const item = await prisma.item.create({
      data: {
        boardId,
        userId: DEFAULT_USER,
        type: isImage ? "image" : isVideo ? "video" : "file",
        title: file.name,
        content: filePath,
        thumbnailPath,
        metadata: JSON.stringify({
          originalName: file.name,
          size: file.size,
          mimeType: file.type,
        }),
        posX: pos.x,
        posY: pos.y,
        width,
        height,
      },
      include: { tags: { include: { tag: true } } },
    });

    return NextResponse.json(item);
  }

  // JSON body: URL or text
  const body = await req.json();
  const { type, content } = body as { type: string; content: string };

  if (type === "link" || type === "video") {
    const videoCheck = isVideoUrl(content);

    if (videoCheck.isVideo) {
      const width = 320;
      const height = 180;
      const pos = findNonOverlappingPosition(
        centerX,
        centerY,
        width,
        height,
        existingRects
      );

      const item = await prisma.item.create({
        data: {
          boardId,
          userId: DEFAULT_USER,
          type: "video",
          title: content,
          content: videoCheck.embedUrl!,
          metadata: JSON.stringify({ originalUrl: content }),
          posX: pos.x,
          posY: pos.y,
          width,
          height,
        },
        include: { tags: { include: { tag: true } } },
      });

      return NextResponse.json(item);
    }

    // Regular link — fetch OG data
    const og = await fetchOgData(content);
    const width = 280;
    const height = og.image ? 240 : 120;
    const pos = findNonOverlappingPosition(
      centerX,
      centerY,
      width,
      height,
      existingRects
    );

    const item = await prisma.item.create({
      data: {
        boardId,
        userId: DEFAULT_USER,
        type: "link",
        title: og.title,
        content,
        thumbnailPath: og.image,
        metadata: JSON.stringify(og),
        posX: pos.x,
        posY: pos.y,
        width,
        height,
      },
      include: { tags: { include: { tag: true } } },
    });

    return NextResponse.json(item);
  }

  if (type === "text") {
    const width = 250;
    const height = Math.min(300, Math.max(80, content.length * 0.8));
    const pos = findNonOverlappingPosition(
      centerX,
      centerY,
      width,
      height,
      existingRects
    );

    const item = await prisma.item.create({
      data: {
        boardId,
        userId: DEFAULT_USER,
        type: "text",
        content,
        posX: pos.x,
        posY: pos.y,
        width,
        height,
      },
      include: { tags: { include: { tag: true } } },
    });

    return NextResponse.json(item);
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}
