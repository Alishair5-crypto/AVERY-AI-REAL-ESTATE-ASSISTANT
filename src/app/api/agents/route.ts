import { NextResponse } from "next/server";
import { listAgents } from "@/lib/avery/tools";
import { ensureSeeded } from "@/lib/demo/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureSeeded();
  const agents = await listAgents();
  return NextResponse.json({ agents });
}
