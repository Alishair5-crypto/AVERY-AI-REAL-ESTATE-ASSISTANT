import { NextRequest, NextResponse } from "next/server";
import { getConversation, getLead, listMessages, listNotesForLead, getPropertiesByIds, addConversationNote } from "@/lib/avery/tools";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const conversation = await getConversation(Number(id));
  if (!conversation) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  const [lead, messages] = await Promise.all([getLead(conversation.leadId), listMessages(conversation.id)]);
  const notes = lead ? await listNotesForLead(lead.id) : [];

  const propertyIds = new Set<number>();
  for (const m of messages) {
    const meta = m.metadata as Record<string, unknown> | null;
    if (meta && Array.isArray(meta.propertyIds)) {
      for (const pid of meta.propertyIds as number[]) propertyIds.add(pid);
    }
  }
  if (lead?.propertyInterest) propertyIds.add(lead.propertyInterest);
  const properties = await getPropertiesByIds(Array.from(propertyIds));

  return NextResponse.json({ conversation, lead, messages, notes, properties });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const conversation = await getConversation(Number(id));
  if (!conversation) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  if (!body.content) return NextResponse.json({ error: "content is required" }, { status: 400 });
  const note = await addConversationNote(conversation.leadId, body.content, conversation.id, body.author ?? "Agent");
  return NextResponse.json({ note }, { status: 201 });
}
