import { NextRequest, NextResponse } from "next/server";
import { createShowingRequest, listShowings } from "@/lib/avery/tools";
import { ensureSeeded } from "@/lib/demo/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureSeeded();
  const showings = await listShowings();
  return NextResponse.json({ showings });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.leadId || !body.propertyId || !body.preferredDate || !body.preferredTime) {
    return NextResponse.json(
      { error: "leadId, propertyId, preferredDate, and preferredTime are required" },
      { status: 400 },
    );
  }
  const showing = await createShowingRequest(body);
  return NextResponse.json({ showing }, { status: 201 });
}
