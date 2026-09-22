import { NextRequest, NextResponse } from "next/server";
import { getProperty } from "@/lib/avery/tools";
import { ensureSeeded } from "@/lib/demo/seed";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await ensureSeeded();
  const { id } = await params;
  const property = await getProperty(Number(id));
  if (!property) return NextResponse.json({ error: "Property not found" }, { status: 404 });
  return NextResponse.json({ property });
}
