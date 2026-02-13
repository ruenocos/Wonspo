import { NextRequest, NextResponse } from "next/server";
import { fetchOgData } from "@/lib/og";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "url parameter required" }, { status: 400 });
  }

  const data = await fetchOgData(url);
  return NextResponse.json(data);
}
