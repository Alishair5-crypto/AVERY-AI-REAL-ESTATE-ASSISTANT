import { NextRequest, NextResponse } from "next/server";
import { createFollowup, listFollowups } from "@/lib/avery/tools";
import { ensureSeeded } from "@/lib/demo/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureSeeded();
  const followups = await listFollowups();
  return NextResponse.json({ followups });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.leadId || !body.message) {
    return NextResponse.json({ error: "leadId and message are required" }, { status: 400 });
  }
  const followup = await createFollowup(body);
  return NextResponse.json({ followup }, { status: 201 });
}
