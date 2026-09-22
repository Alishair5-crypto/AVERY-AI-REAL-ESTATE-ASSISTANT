import { NextRequest, NextResponse } from "next/server";
import * as tools from "@/lib/avery/tools";
import * as engine from "@/lib/avery/engine";
import { getSettings } from "@/lib/demo/settings";
import { ensureSeeded } from "@/lib/demo/seed";
import { CHANNELS } from "@/lib/types";

export const dynamic = "force-dynamic";

interface ChatRequestBody {
  conversationId?: number;
  leadId?: number;
  channel?: string;
  message?: string;
  action?:
    | { type: "start" }
    | { type: "request_showing"; propertyId: number }
    | { type: "human_handoff" }
    | { type: "more_properties" };
}

async function buildResponse(conversationId: number, leadId: number, extra?: Record<string, unknown>) {
  const [lead, allMessages, conversation] = await Promise.all([
    tools.getLead(leadId),
    tools.listMessages(conversationId),
    tools.getConversation(conversationId),
  ]);

  const propertyIds = new Set<number>();
  for (const m of allMessages) {
    const meta = m.metadata as Record<string, unknown> | null;
    if (meta && Array.isArray(meta.propertyIds)) {
      for (const id of meta.propertyIds as number[]) propertyIds.add(id);
    }
  }
  const properties = await tools.getPropertiesByIds(Array.from(propertyIds));

  return NextResponse.json({
    conversationId,
    leadId,
    lead,
    conversation,
    messages: allMessages,
    properties,
    ...extra,
  });
}

export async function POST(req: NextRequest) {
  await ensureSeeded();
  let body: ChatRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    if (body.action?.type === "start" || (!body.conversationId && !body.action)) {
      const channel = CHANNELS.includes(body.channel as never) ? (body.channel as string) : "Website Chat";
      const { lead, conversation } = await engine.startConversation(channel);
      const settings = await getSettings();
      await tools.addMessage(conversation.id, "avery", settings.greeting);
      return buildResponse(conversation.id, lead.id);
    }

    if (!body.conversationId || !body.leadId) {
      return NextResponse.json({ error: "conversationId and leadId are required" }, { status: 400 });
    }

    if (body.action?.type === "request_showing") {
      if (typeof body.action.propertyId !== "number") {
        return NextResponse.json({ error: "propertyId is required" }, { status: 400 });
      }
      await engine.beginShowingRequest(body.conversationId, body.leadId, body.action.propertyId);
      return buildResponse(body.conversationId, body.leadId);
    }

    if (body.action?.type === "human_handoff") {
      const result = await engine.requestHumanHandoff(body.conversationId, body.leadId);
      return buildResponse(body.conversationId, body.leadId, { handoff: result.handoff });
    }

    if (body.action?.type === "more_properties") {
      const conversation = await tools.getConversation(body.conversationId);
      const state = (conversation?.state ?? {}) as Record<string, unknown>;
      const search = await tools.searchProperties({
        city: state.city as string | undefined,
        propertyType: state.propertyType as string | undefined,
        listingType: state.intent === "Renter" ? "For Rent" : "For Sale",
        budgetMax: state.budgetMax ? Number(state.budgetMax) * 1.15 : undefined,
        bedrooms: state.bedrooms as number | undefined,
        limit: 6,
      });
      await tools.addMessage(body.conversationId, "avery", "Here are a few more demo listings that could work:", {
        type: "property_results",
        propertyIds: search.results.map((p) => p.id),
      });
      return buildResponse(body.conversationId, body.leadId);
    }

    if (typeof body.message === "string" && body.message.trim().length > 0) {
      await engine.processCustomerMessage(body.conversationId, body.leadId, body.message.trim());
      return buildResponse(body.conversationId, body.leadId);
    }

    return NextResponse.json({ error: "No valid action or message provided" }, { status: 400 });
  } catch (err) {
    console.error("Avery chat error", err);
    return NextResponse.json(
      { error: "Avery is temporarily unavailable. Please try again or request a human agent." },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  await ensureSeeded();
  const conversationId = req.nextUrl.searchParams.get("conversationId");
  const leadId = req.nextUrl.searchParams.get("leadId");
  if (!conversationId || !leadId) {
    return NextResponse.json({ error: "conversationId and leadId are required" }, { status: 400 });
  }
  return buildResponse(Number(conversationId), Number(leadId));
}
