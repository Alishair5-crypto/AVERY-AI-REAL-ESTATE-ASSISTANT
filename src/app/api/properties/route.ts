import { NextResponse } from "next/server";
import { listProperties } from "@/lib/avery/tools";
import { ensureSeeded } from "@/lib/demo/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureSeeded();
  const properties = await listProperties();
  return NextResponse.json({ properties });
}
