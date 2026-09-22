import { NextRequest, NextResponse } from "next/server";
import { updateShowing } from "@/lib/avery/tools";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const patch: Record<string, unknown> = {};
  if (body.status) patch.status = body.status;
  const showing = await updateShowing(Number(id), patch);
  return NextResponse.json({ showing });
}
