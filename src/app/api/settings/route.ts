import { NextRequest, NextResponse } from "next/server";
import { getSettings } from "@/lib/demo/settings";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const s = await getSettings();
  return NextResponse.json({ settings: s });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const current = await getSettings();
  const [updated] = await db
    .update(settings)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(settings.id, current.id))
    .returning();
  return NextResponse.json({ settings: updated });
}
