import { NextResponse } from "next/server";
import { getUsdToPkr } from "@/lib/fx";

export const runtime = "nodejs";

// GET /api/fx → { rate, fetchedAt, source } for USD→PKR.
export async function GET() {
  const fx = await getUsdToPkr();
  return NextResponse.json(fx, {
    headers: { "Cache-Control": "public, max-age=3600, s-maxage=21600" },
  });
}
