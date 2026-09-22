import { NextRequest, NextResponse } from "next/server";
import * as engine from "@/lib/avery/engine";
import * as tools from "@/lib/avery/tools";
import { getSettings } from "@/lib/demo/settings";
import { ensureSeeded } from "@/lib/demo/seed";

export const dynamic = "force-dynamic";

const SCENARIO_MESSAGES: Record<string, { channel: string; text: string }> = {
  buyer: { channel: "Website Chat", text: "I'm looking for a 3 bedroom house in Houston under $400k." },
  renter: { channel: "Instagram", text: "I need a 2 bedroom apartment near downtown Houston under $2,200." },
  seller: { channel: "Facebook Messenger", text: "I want to sell my house in Houston." },
  abandoned: { channel: "WhatsApp", text: "Hi, I'm looking for a 3 bedroom home in Houston, budget around $380k." },
  handoff: { channel: "Website Chat", text: "I'd like to speak with an agent." },
};

export async function POST(req: NextRequest) {
  await ensureSeeded();
  const body = await req.json();
  const type = body.type as string;
  const scenario = SCENARIO_MESSAGES[type];
  if (!scenario) {
    return NextResponse.json({ error: "Unknown scenario type" }, { status: 400 });
  }

  const { lead, conversation } = await engine.startConversation(scenario.channel);
  const settings = await getSettings();
  await tools.addMessage(conversation.id, "avery", settings.greeting);

  await engine.processCustomerMessage(conversation.id, lead.id, scenario.text);

  if (type === "abandoned") {
    const followupMessage =
      "Hi! Just checking in — if you're still looking for a home in Houston, I can help narrow down a few options based on your budget and preferred area.";
    await tools.createFollowup({ leadId: lead.id, message: followupMessage });
    await tools.updateLead(lead.id, { status: "Follow-up Due" });
    await tools.addMessage(conversation.id, "system", "Lead went quiet after qualification started. Follow-up scheduled.");
  }

  const finalLead = await tools.getLead(lead.id);
  const finalMessages = await tools.listMessages(conversation.id);

  return NextResponse.json({
    conversationId: conversation.id,
    leadId: lead.id,
    lead: finalLead,
    messages: finalMessages,
  });
}
