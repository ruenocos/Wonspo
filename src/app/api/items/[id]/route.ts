import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteFile } from "@/lib/upload";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const allowed = ["title", "note", "posX", "posY", "width", "height", "zIndex"];
  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) data[key] = body[key];
  }

  const item = await prisma.item.update({
    where: { id },
    data,
    include: { tags: { include: { tag: true } } },
  });

  return NextResponse.json(item);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const item = await prisma.item.findUnique({ where: { id } });
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Delete associated files
  if (item.type === "image" || item.type === "file" || item.type === "video") {
    if (item.content.startsWith("/uploads/")) {
      await deleteFile(item.content);
    }
    if (item.thumbnailPath?.startsWith("/uploads/")) {
      await deleteFile(item.thumbnailPath);
    }
  }

  await prisma.item.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
