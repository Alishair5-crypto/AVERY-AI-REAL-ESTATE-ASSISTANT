import { NextResponse } from "next/server";
import { listConversations, listLeads } from "@/lib/avery/tools";
import { ensureSeeded } from "@/lib/demo/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureSeeded();
  const [conversations, leads] = await Promise.all([listConversations(), listLeads()]);
  const leadMap = new Map(leads.map((l) => [l.id, l]));
  const enriched = conversations.map((c) => ({ ...c, lead: leadMap.get(c.leadId) ?? null }));
  return NextResponse.json({ conversations: enriched });
}
