import { NextRequest, NextResponse } from "next/server";
import { createLead, listLeads } from "@/lib/avery/tools";
import { ensureSeeded } from "@/lib/demo/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureSeeded();
  const leads = await listLeads();
  return NextResponse.json({ leads });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.channel) {
    return NextResponse.json({ error: "channel is required" }, { status: 400 });
  }
  const lead = await createLead(body);
  return NextResponse.json({ lead }, { status: 201 });
}
