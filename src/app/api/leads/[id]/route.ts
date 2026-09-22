import { NextRequest, NextResponse } from "next/server";
import { getLead, updateLead } from "@/lib/avery/tools";

export const dynamic = "force-dynamic";

const ALLOWED_FIELDS = [
  "name",
  "phone",
  "email",
  "status",
  "priority",
  "assignedAgentId",
  "showingStatus",
] as const;

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await getLead(Number(id));
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  return NextResponse.json({ lead });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const patch: Record<string, unknown> = {};
  for (const field of ALLOWED_FIELDS) {
    if (field in body) patch[field] = body[field];
  }
  const lead = await updateLead(Number(id), patch);
  return NextResponse.json({ lead });
}
