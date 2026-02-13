import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULT_USER = "default-user";

export async function GET() {
  const boards = await prisma.board.findMany({
    where: { userId: DEFAULT_USER },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(boards);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name } = body as { name: string };

  const board = await prisma.board.create({
    data: {
      userId: DEFAULT_USER,
      name: name || "New Board",
    },
  });

  return NextResponse.json(board);
}
