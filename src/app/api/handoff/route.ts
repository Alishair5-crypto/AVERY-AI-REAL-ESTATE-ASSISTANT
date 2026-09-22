import { NextRequest, NextResponse } from "next/server";
import { handoffToAgent, listConversations } from "@/lib/avery/tools";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.leadId) {
    return NextResponse.json({ error: "leadId is required" }, { status: 400 });
  }
  const allConversations = await listConversations();
  const conversation = allConversations.find((c) => c.leadId === body.leadId);
  const result = await handoffToAgent(body.leadId, conversation?.id ?? 0, {
    city: body.city,
    propertyType: body.propertyType,
  });
  return NextResponse.json(result);
}
