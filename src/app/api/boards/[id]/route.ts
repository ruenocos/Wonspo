import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const allowed = ["name", "backgroundColor"];
  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) data[key] = body[key];
  }

  const board = await prisma.board.update({ where: { id }, data });
  return NextResponse.json(board);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (id === "default-board") {
    return NextResponse.json(
      { error: "Cannot delete the default board" },
      { status: 400 }
    );
  }

  await prisma.board.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
