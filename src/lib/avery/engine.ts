import { extractSlots, looksLikeName } from "./nlu";
import * as tools from "./tools";
import type { Intent } from "@/lib/types";

// ---------------------------------------------------------------------------
// Avery Dialogue Engine
// Deterministic, rule-based conversation manager. It intentionally does not
// call an external LLM: every fact it states comes from the demo database via
// the tool functions in tools.ts, which keeps the assistant fast, safe, and
// free of fabricated real-estate information (see compliance rules).
// ---------------------------------------------------------------------------

export interface ConversationState {
  intent?: Intent;
  city?: string;
  neighborhood?: string;
  propertyType?: string;
  budgetMin?: number;
  budgetMax?: number;
  bedrooms?: number;
  bathrooms?: number;
  timeline?: string;
  financing?: string;
  moveInDate?: string;
  pets?: string;
  sellerAddress?: string;
  name?: string;
  phone?: string;
  email?: string;
  hasSearched?: boolean;
  lastResultIds?: number[];
  awaiting?: string | null; // name | phone | email | showing_date | showing_time | none
  showingFlow?: {
    propertyId: number;
    step: "date" | "time" | "name" | "phone" | "email" | "done";
  } | null;
  askedFinancingOnce?: boolean;
  turns?: number;
  propertyInterestId?: number;
  showingDate?: string;
  showingTime?: string;
}

const DISCRIMINATION_PATTERN =
  /\b(only (white|black|christian|muslim|jewish)\b|no (section 8|kids|children|families)|race|ethnicity|religion of (the )?(neighbors|neighborhood)|whites only|all white neighborhood)\b/i;

const SCHOOL_SAFETY_PATTERN = /\b(school rating|crime rate|is it safe|safest neighborhood|best schools)\b/i;

function fmtMoney(n?: number | null) {
  if (!n) return "";
  return `$${n.toLocaleString("en-US")}`;
}

function mergeSlots(state: ConversationState, extracted: ReturnType<typeof extractSlots>): ConversationState {
  const next: ConversationState = { ...state };
  if (extracted.intent && !next.intent) next.intent = extracted.intent;
  if (extracted.city) next.city = extracted.city;
  if (extracted.neighborhood) next.neighborhood = extracted.neighborhood;
  if (extracted.propertyType) next.propertyType = extracted.propertyType;
  if (extracted.budgetMax) next.budgetMax = extracted.budgetMax;
  if (extracted.budgetMin) next.budgetMin = extracted.budgetMin;
  if (extracted.bedrooms) next.bedrooms = extracted.bedrooms;
  if (extracted.bathrooms) next.bathrooms = extracted.bathrooms;
  if (extracted.timeline) next.timeline = extracted.timeline;
  if (extracted.financing) next.financing = extracted.financing;
  if (extracted.moveInDate) next.moveInDate = extracted.moveInDate;
  if (extracted.pets) next.pets = extracted.pets;
  if (extracted.sellerAddress) next.sellerAddress = extracted.sellerAddress;
  if (extracted.phone) next.phone = extracted.phone;
  if (extracted.email) next.email = extracted.email;
  return next;
}

function computePriority(state: ConversationState): "High" | "Medium" | "Low" {
  let score = 0;
  if (state.city) score += 1;
  if (state.budgetMax || state.budgetMin) score += 1;
  if (state.bedrooms) score += 1;
  if (state.propertyType) score += 1;
  if (state.timeline === "ASAP" || state.timeline === "Within a month") score += 2;
  if (state.financing === "Pre-approved" || state.financing === "Cash buyer") score += 2;
  if (state.showingFlow) score += 2;
  if (state.phone || state.email) score += 1;
  if (score >= 6) return "High";
  if (score >= 3) return "Medium";
  return "Low";
}

function computeStatus(state: ConversationState, hasShowing: boolean, handoff: boolean): string {
  if (handoff) return "Human Handoff";
  if (hasShowing) return "Showing Requested";
  if (state.hasSearched) return "Property Matched";
  const qualified = Boolean(state.city && (state.budgetMax || state.bedrooms || state.propertyType));
  if (qualified) return "Qualified";
  if (state.intent) return "Contacted";
  return "New";
}

export interface EngineTurnResult {
  replies: { sender: "avery" | "system"; content: string; metadata?: Record<string, unknown> | null }[];
  state: ConversationState;
  propertyIds?: number[];
  handoff?: boolean;
  showingId?: number;
}

function nextQuestionForBuyer(state: ConversationState): string | null {
  if (!state.city) return "Which city or area are you focused on — Houston, Katy, Sugar Land, The Woodlands, Cypress, Spring, or Pearland?";
  if (!state.propertyType && !state.bedrooms && !state.budgetMax)
    return "Are you mainly looking for a single-family home, or would you also consider a townhouse or condo?";
  if (!state.budgetMax) return "What budget range did you have in mind?";
  if (!state.bedrooms) return "How many bedrooms are you hoping for?";
  if (!state.timeline) return "What's your timeline — are you hoping to buy soon, or just exploring for now?";
  return null;
}

function nextQuestionForRenter(state: ConversationState): string | null {
  if (!state.city) return "Which area are you looking to rent in — Houston, Katy, Sugar Land, The Woodlands, Cypress, Spring, or Pearland?";
  if (!state.budgetMax) return "What's your monthly budget range?";
  if (!state.bedrooms) return "How many bedrooms do you need?";
  if (!state.moveInDate) return "Do you have a target move-in date?";
  return null;
}

function nextQuestionForSeller(state: ConversationState): string | null {
  if (!state.sellerAddress) return "What's the address of the property you're thinking of selling?";
  if (!state.propertyType) return "What type of property is it — single family, condo, or townhouse?";
  if (!state.timeline) return "What's your timeline for selling — are you looking to list soon, or just gathering information?";
  return null;
}

export async function startConversation(channel: string) {
  const lead = await tools.createLead({ channel, intent: "General" });
  const conversation = await tools.createConversation(lead.id, channel);
  return { lead, conversation };
}

async function ensureContactCollectionOrSearch(
  state: ConversationState,
): Promise<{ state: ConversationState; searchNow: boolean }> {
  const readyToSearch =
    (state.intent === "Buyer" || state.intent === "Renter") &&
    Boolean(state.city) &&
    Boolean(state.budgetMax || state.bedrooms || state.propertyType) &&
    !state.hasSearched;
  return { state, searchNow: readyToSearch };
}

export async function processCustomerMessage(
  conversationId: number,
  leadId: number,
  text: string,
): Promise<EngineTurnResult> {
  const conversation = await tools.getConversation(conversationId);
  const lead = await tools.getLead(leadId);
  if (!conversation || !lead) throw new Error("Conversation or lead not found");

  let state: ConversationState = { ...(conversation.state as ConversationState), turns: ((conversation.state as ConversationState)?.turns ?? 0) + 1 };

  await tools.addMessage(conversationId, "customer", text);

  const replies: EngineTurnResult["replies"] = [];

  // Fair-housing / compliance guardrail
  if (DISCRIMINATION_PATTERN.test(text)) {
    replies.push({
      sender: "avery",
      content:
        "I'm not able to filter or recommend homes based on personal or protected characteristics. I'm glad to help based on objective criteria like location, price, size, or features — what matters most to you there?",
    });
    await persistTurn(conversationId, leadId, state, replies, lead);
    return { replies, state };
  }

  if (SCHOOL_SAFETY_PATTERN.test(text)) {
    replies.push({
      sender: "avery",
      content:
        "I don't have verified school-rating or crime-statistic data to share, and I don't want to guess. I'd recommend checking independent sources or asking your assigned agent for local insight. In the meantime, I can keep searching based on location, price, and size — want me to continue?",
    });
  }

  const extracted = extractSlots(text);
  state = mergeSlots(state, extracted);

  // Human handoff request takes priority
  if (extracted.wantsHuman) {
    const { agent } = await tools.handoffToAgent(leadId, conversationId, {
      city: state.city,
      propertyType: state.propertyType,
    });
    const content = agent
      ? `Absolutely. I'll pass this conversation to ${agent.name}, ${agent.title}, so they can assist you directly. They'll reach out shortly.`
      : "Absolutely. I'll pass this conversation to a member of the team so they can assist you directly.";
    replies.push({ sender: "avery", content });
    replies.push({ sender: "system", content: "Conversation handed off to a human agent." });
    await persistTurn(conversationId, leadId, state, replies, lead, { handoff: true });
    return { replies, state, handoff: true };
  }

  // If we're in the middle of a showing request flow, route input there.
  if (state.showingFlow && state.showingFlow.step !== "done") {
    return handleShowingFlowInput(conversationId, leadId, state, text, lead, replies);
  }

  // If we were awaiting a specific field (name), try to capture it opportunistically.
  if (state.awaiting === "name" && !state.name) {
    const name = looksLikeName(text);
    if (name) state.name = name;
  }

  if (!state.intent) {
    // Ask a clarifying question about buy/rent/sell
    replies.push({
      sender: "avery",
      content:
        "Thanks for reaching out! To point you in the right direction — are you looking to buy, rent, or sell a property?",
    });
    state.awaiting = "intent";
    await persistTurn(conversationId, leadId, state, replies, lead);
    return { replies, state };
  }

  if (state.intent === "Seller") {
    const question = nextQuestionForSeller(state);
    if (question) {
      replies.push({ sender: "avery", content: acknowledge(state) + question });
      await persistTurn(conversationId, leadId, state, replies, lead);
      return { replies, state };
    }
    // Enough info — offer consultation / handoff
    replies.push({
      sender: "avery",
      content:
        "Thanks — that's really helpful. I'll have one of our listing specialists reach out to discuss a market valuation and next steps. Would you like me to connect you with a team member now?",
    });
    state.awaiting = "seller_consult";
    await persistTurn(conversationId, leadId, state, replies, lead);
    return { replies, state };
  }

  if (state.intent === "Buyer" || state.intent === "Renter") {
    const question = state.intent === "Buyer" ? nextQuestionForBuyer(state) : nextQuestionForRenter(state);

    const { searchNow } = await ensureContactCollectionOrSearch(state);

    if (question && !searchNow) {
      replies.push({ sender: "avery", content: acknowledge(state) + question });
      await persistTurn(conversationId, leadId, state, replies, lead);
      return { replies, state };
    }

    if (searchNow || (!question && !state.hasSearched)) {
      const searchResult = await tools.searchProperties({
        city: state.city,
        neighborhood: state.neighborhood,
        propertyType: state.propertyType,
        listingType: state.intent === "Renter" ? "For Rent" : "For Sale",
        budgetMax: state.budgetMax,
        budgetMin: state.budgetMin,
        bedrooms: state.bedrooms,
        limit: 3,
      });
      state.hasSearched = true;
      state.lastResultIds = searchResult.results.map((p) => p.id);

      if (searchResult.results.length === 0) {
        replies.push({
          sender: "avery",
          content:
            "I couldn't find an exact match in the current demo inventory. I can broaden the search — would you like me to expand the price range or area?",
        });
      } else {
        const introText = searchResult.exact
          ? "Here are a few options from our current demo inventory that fit what you're looking for:"
          : "I didn't find an exact match, but here are the closest available demo listings:";
        replies.push({
          sender: "avery",
          content: introText,
          metadata: { type: "property_results", propertyIds: searchResult.results.map((p) => p.id) },
        });
      }
      await persistTurn(conversationId, leadId, state, replies, lead);
      return { replies, state, propertyIds: state.lastResultIds };
    }

    // Already searched, no new question — general helpful nudge
    replies.push({
      sender: "avery",
      content:
        "Would you like to see more options, adjust your search criteria, or request a showing for one of the properties above?",
    });
    await persistTurn(conversationId, leadId, state, replies, lead);
    return { replies, state };
  }

  // General intent fallback
  replies.push({
    sender: "avery",
    content:
      "Happy to help. Are you looking to buy, rent, or sell — or do you have a general question I can try to answer?",
  });
  await persistTurn(conversationId, leadId, state, replies, lead);
  return { replies, state };
}

function acknowledge(state: ConversationState): string {
  const bits: string[] = [];
  if (state.city) bits.push(state.city);
  if (state.budgetMax) bits.push(`around ${fmtMoney(state.budgetMax)}`);
  if (state.bedrooms) bits.push(`${state.bedrooms} bed${state.bedrooms > 1 ? "s" : ""}`);
  if (bits.length === 0) return "Got it. ";
  return `Got it — ${bits.join(", ")}. `;
}

async function handleShowingFlowInput(
  conversationId: number,
  leadId: number,
  state: ConversationState,
  text: string,
  lead: Awaited<ReturnType<typeof tools.getLead>>,
  replies: EngineTurnResult["replies"],
): Promise<EngineTurnResult> {
  const flow = state.showingFlow!;
  const extracted = extractSlots(text);

  if (flow.step === "date") {
    flow.step = "time";
    state.showingFlow = flow;
    state.showingDate = text.trim();
    replies.push({ sender: "avery", content: "Great — and what time would you prefer?" });
    await persistTurn(conversationId, leadId, state, replies, lead);
    return { replies, state };
  }

  if (flow.step === "time") {
    state.showingTime = text.trim();
    if (!state.name) {
      flow.step = "name";
      state.showingFlow = flow;
      state.awaiting = "name";
      replies.push({ sender: "avery", content: "Perfect. Can I get your name for the showing request?" });
      await persistTurn(conversationId, leadId, state, replies, lead);
      return { replies, state };
    }
    return finalizeContactOrCreateShowing(conversationId, leadId, state, lead, replies);
  }

  if (flow.step === "name") {
    const name = looksLikeName(text) ?? text.trim();
    state.name = name;
    return afterName(conversationId, leadId, state, lead, replies);
  }

  if (flow.step === "phone") {
    if (extracted.phone) state.phone = extracted.phone;
    else state.phone = state.phone ?? text.trim();
    return afterPhone(conversationId, leadId, state, lead, replies);
  }

  if (flow.step === "email") {
    if (extracted.email) state.email = extracted.email;
    return finalizeContactOrCreateShowing(conversationId, leadId, state, lead, replies);
  }

  return { replies, state };
}

async function afterName(
  conversationId: number,
  leadId: number,
  state: ConversationState,
  lead: Awaited<ReturnType<typeof tools.getLead>>,
  replies: EngineTurnResult["replies"],
): Promise<EngineTurnResult> {
  const flow = state.showingFlow!;
  if (!state.phone) {
    flow.step = "phone";
    state.showingFlow = flow;
    state.awaiting = "phone";
    replies.push({ sender: "avery", content: `Thanks, ${state.name}. What's the best phone number to reach you?` });
    await persistTurn(conversationId, leadId, state, replies, lead);
    return { replies, state };
  }
  return afterPhone(conversationId, leadId, state, lead, replies);
}

async function afterPhone(
  conversationId: number,
  leadId: number,
  state: ConversationState,
  lead: Awaited<ReturnType<typeof tools.getLead>>,
  replies: EngineTurnResult["replies"],
): Promise<EngineTurnResult> {
  const flow = state.showingFlow!;
  if (!state.email) {
    flow.step = "email";
    state.showingFlow = flow;
    state.awaiting = "email";
    replies.push({ sender: "avery", content: "And an email address so we can send confirmation details?" });
    await persistTurn(conversationId, leadId, state, replies, lead);
    return { replies, state };
  }
  return finalizeContactOrCreateShowing(conversationId, leadId, state, lead, replies);
}

async function finalizeContactOrCreateShowing(
  conversationId: number,
  leadId: number,
  state: ConversationState,
  lead: Awaited<ReturnType<typeof tools.getLead>>,
  replies: EngineTurnResult["replies"],
): Promise<EngineTurnResult> {
  const flow = state.showingFlow!;
  const dateVal = state.showingDate ?? "Flexible";
  const timeVal = state.showingTime ?? "Flexible";

  const showing = await tools.createShowingRequest({
    leadId,
    propertyId: flow.propertyId,
    preferredDate: dateVal,
    preferredTime: timeVal,
  });

  flow.step = "done";
  state.showingFlow = null;
  state.awaiting = null;

  replies.push({
    sender: "avery",
    content:
      "Your showing request has been submitted for agent confirmation. Our team will reach out to confirm the exact time — you'll see it in your inbox as Pending Confirmation.",
    metadata: { type: "showing_summary", showingId: showing.id, propertyId: flow.propertyId },
  });

  await persistTurn(conversationId, leadId, state, replies, lead, { showingId: showing.id });
  return { replies, state, showingId: showing.id };
}

export async function beginShowingRequest(
  conversationId: number,
  leadId: number,
  propertyId: number,
): Promise<EngineTurnResult> {
  const conversation = await tools.getConversation(conversationId);
  const lead = await tools.getLead(leadId);
  if (!conversation || !lead) throw new Error("Conversation or lead not found");
  let state: ConversationState = { ...(conversation.state as ConversationState) };
  const property = await tools.getProperty(propertyId);
  const replies: EngineTurnResult["replies"] = [];

  if (!property) {
    replies.push({ sender: "avery", content: "I couldn't locate that property in our demo inventory. Let's try another one." });
    await persistTurn(conversationId, leadId, state, replies, lead);
    return { replies, state };
  }

  state.showingFlow = { propertyId, step: "date" };
  state.propertyInterestId = propertyId;
  await tools.updateLead(leadId, { propertyInterest: propertyId });

  replies.push({
    sender: "avery",
    content: `Great choice — ${property.address} in ${property.neighborhood}. What day works best for a showing? (This is a request only — a team member will confirm the exact time.)`,
  });
  await persistTurn(conversationId, leadId, state, replies, lead);
  return { replies, state };
}

export async function requestHumanHandoff(conversationId: number, leadId: number): Promise<EngineTurnResult> {
  const conversation = await tools.getConversation(conversationId);
  const lead = await tools.getLead(leadId);
  if (!conversation || !lead) throw new Error("Conversation or lead not found");
  const state: ConversationState = { ...(conversation.state as ConversationState) };
  const { agent } = await tools.handoffToAgent(leadId, conversationId, {
    city: state.city,
    propertyType: state.propertyType,
  });
  const replies: EngineTurnResult["replies"] = [
    {
      sender: "avery",
      content: agent
        ? `Absolutely. I'll pass this conversation to ${agent.name}, ${agent.title}, so they can assist you directly. They'll reach out shortly.`
        : "Absolutely. I'll pass this conversation to a member of the team so they can assist you directly.",
    },
    { sender: "system", content: "Conversation handed off to a human agent." },
  ];
  await persistTurn(conversationId, leadId, state, replies, lead, { handoff: true });
  return { replies, state, handoff: true };
}

async function persistTurn(
  conversationId: number,
  leadId: number,
  state: ConversationState,
  replies: EngineTurnResult["replies"],
  lead: Awaited<ReturnType<typeof tools.getLead>>,
  opts: { handoff?: boolean; showingId?: number } = {},
) {
  for (const r of replies) {
    await tools.addMessage(conversationId, r.sender === "system" ? "system" : "avery", r.content, r.metadata ?? null);
  }
  await tools.updateConversation(conversationId, { state: state as Record<string, unknown> });

  const lastCustomerMessage = replies.length > 0 ? undefined : undefined;
  const priority = computePriority(state);
  const status = opts.handoff
    ? "Human Handoff"
    : computeStatus(state, Boolean(opts.showingId) || (lead?.showingStatus ?? null) === "Requested", false);

  await tools.updateLead(leadId, {
    intent: state.intent ?? lead?.intent ?? "General",
    name: state.name ?? lead?.name,
    phone: state.phone ?? lead?.phone,
    email: state.email ?? lead?.email,
    locationPreference: state.neighborhood ? `${state.neighborhood}, ${state.city ?? ""}`.trim() : state.city ?? lead?.locationPreference,
    budgetMin: state.budgetMin ?? lead?.budgetMin,
    budgetMax: state.budgetMax ?? lead?.budgetMax,
    propertyType: state.propertyType ?? lead?.propertyType,
    bedrooms: state.bedrooms ?? lead?.bedrooms,
    bathrooms: state.bathrooms ? String(state.bathrooms) : lead?.bathrooms,
    timeline: state.timeline ?? lead?.timeline,
    financing: state.financing ?? lead?.financing,
    moveInDate: state.moveInDate ?? lead?.moveInDate,
    pets: state.pets ?? lead?.pets,
    sellerAddress: state.sellerAddress ?? lead?.sellerAddress,
    priority,
    status: opts.showingId ? "Showing Requested" : status,
    showingStatus: opts.showingId ? "Requested" : lead?.showingStatus,
    lastMessage: replies.length > 0 ? replies[replies.length - 1].content : lead?.lastMessage,
  });
}
