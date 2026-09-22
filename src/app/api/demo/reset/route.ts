import { NextResponse } from "next/server";
import { db } from "@/db";
import { conversations, followups, leads, messages, notes, showings } from "@/db/schema";
import { ensureSeeded } from "@/lib/demo/seed";

export const dynamic = "force-dynamic";

// Resets only demo-generated activity (leads, conversations, messages,
// showings, followups, notes). Base property inventory and agents are kept.
export async function POST() {
  await ensureSeeded();
  await db.delete(notes);
  await db.delete(followups);
  await db.delete(showings);
  await db.delete(messages);
  await db.delete(conversations);
  await db.delete(leads);
  return NextResponse.json({ ok: true });
}
