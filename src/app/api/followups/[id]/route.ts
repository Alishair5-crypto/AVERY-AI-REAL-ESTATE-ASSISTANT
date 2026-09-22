import { NextRequest, NextResponse } from "next/server";
import { addMessage, updateFollowup, updateLead, listFollowups } from "@/lib/avery/tools";
import { db } from "@/db";
import { conversations } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const followupId = Number(id);

  if (body.action === "send") {
    const all = await listFollowups();
    const followup = all.find((f) => f.id === followupId);
    if (!followup) return NextResponse.json({ error: "Follow-up not found" }, { status: 404 });

    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.leadId, followup.leadId))
      .orderBy(desc(conversations.updatedAt))
      .limit(1);

    if (conversation) {
      await addMessage(conversation.id, "avery", followup.message);
    }
    const updated = await updateFollowup(followupId, { status: "Sent" });
    await updateLead(followup.leadId, { status: "Contacted" });
    return NextResponse.json({ followup: updated });
  }

  if (body.action === "stop") {
    const updated = await updateFollowup(followupId, { status: "Stopped", stopReason: body.reason ?? "manual" });
    return NextResponse.json({ followup: updated });
  }

  const patch: Record<string, unknown> = {};
  if (body.status) patch.status = body.status;
  const followup = await updateFollowup(followupId, patch);
  return NextResponse.json({ followup });
}
