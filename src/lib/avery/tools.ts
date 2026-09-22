import { db } from "@/db";
import { agents, conversations, followups, leads, messages, notes, properties, showings } from "@/db/schema";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import type { MessageMetadata, MessageSender } from "@/lib/types";

// ---------------------------------------------------------------------------
// Server-side "tool" functions used by Avery's dialogue engine. These are the
// only way the assistant reads or writes business data — it never invents
// property, lead, or showing information on its own.
// ---------------------------------------------------------------------------

export interface PropertySearchCriteria {
  city?: string;
  neighborhood?: string;
  propertyType?: string;
  listingType?: "For Sale" | "For Rent";
  budgetMin?: number;
  budgetMax?: number;
  bedrooms?: number;
  bathrooms?: number;
  limit?: number;
}

export async function searchProperties(criteria: PropertySearchCriteria) {
  const rows = await db.select().from(properties).where(eq(properties.availability, "Active"));

  const scored = rows.map((p) => {
    let score = 0;
    if (criteria.city && p.city.toLowerCase() === criteria.city.toLowerCase()) score += 3;
    if (
      criteria.neighborhood &&
      p.neighborhood.toLowerCase().includes(criteria.neighborhood.toLowerCase())
    )
      score += 2;
    if (criteria.listingType && p.listingType === criteria.listingType) score += 2;
    if (criteria.propertyType && p.propertyType === criteria.propertyType) score += 2;
    if (criteria.bedrooms && p.bedrooms >= criteria.bedrooms) score += 1;
    if (criteria.bedrooms && p.bedrooms === criteria.bedrooms) score += 1;
    if (criteria.bathrooms && Number(p.bathrooms) >= criteria.bathrooms) score += 0.5;
    if (criteria.budgetMax) {
      if (p.price <= criteria.budgetMax) score += 3;
      else {
        const over = (p.price - criteria.budgetMax) / criteria.budgetMax;
        if (over <= 0.1) score += 1; // close enough to still surface
        else score -= 2;
      }
    }
    if (criteria.budgetMin && p.price >= criteria.budgetMin) score += 1;
    return { property: p, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const limit = criteria.limit ?? 3;
  const exactMatches = scored.filter((s) => s.score >= 4);
  const result = (exactMatches.length > 0 ? exactMatches : scored).slice(0, limit);
  return {
    exact: exactMatches.length > 0,
    results: result.map((r) => r.property),
  };
}

export async function getProperty(id: number) {
  const rows = await db.select().from(properties).where(eq(properties.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getPropertiesByIds(ids: number[]) {
  if (ids.length === 0) return [];
  const rows = await db.select().from(properties);
  return ids.map((id) => rows.find((r) => r.id === id)).filter((r): r is typeof rows[number] => Boolean(r));
}

export async function listProperties() {
  return db.select().from(properties).orderBy(desc(properties.createdAt));
}

export interface CreateLeadInput {
  channel: string;
  intent?: string;
  name?: string;
  phone?: string;
  email?: string;
}

export async function createLead(input: CreateLeadInput) {
  const [lead] = await db
    .insert(leads)
    .values({
      channel: input.channel,
      intent: input.intent ?? "General",
      name: input.name,
      phone: input.phone,
      email: input.email,
      status: "New",
      priority: "Low",
    })
    .returning();
  return lead;
}

export async function getLead(id: number) {
  const rows = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function updateLead(id: number, patch: Partial<typeof leads.$inferInsert>) {
  const [lead] = await db
    .update(leads)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(leads.id, id))
    .returning();
  return lead;
}

export async function listLeads() {
  return db.select().from(leads).orderBy(desc(leads.updatedAt));
}

export async function createConversation(leadId: number, channel: string) {
  const [conversation] = await db
    .insert(conversations)
    .values({ leadId, channel, state: {} })
    .returning();
  return conversation;
}

export async function getConversation(id: number) {
  const rows = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function updateConversation(id: number, patch: Partial<typeof conversations.$inferInsert>) {
  const [conversation] = await db
    .update(conversations)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(conversations.id, id))
    .returning();
  return conversation;
}

export async function listConversations() {
  return db
    .select()
    .from(conversations)
    .orderBy(desc(conversations.updatedAt));
}

export async function addMessage(
  conversationId: number,
  sender: MessageSender,
  content: string,
  metadata?: MessageMetadata | null,
) {
  const [message] = await db
    .insert(messages)
    .values({ conversationId, sender, content, metadata: metadata ?? null })
    .returning();
  return message;
}

export async function listMessages(conversationId: number) {
  return db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.createdAt);
}

export interface CreateShowingInput {
  leadId: number;
  propertyId: number;
  preferredDate: string;
  preferredTime: string;
}

export async function createShowingRequest(input: CreateShowingInput) {
  const property = await getProperty(input.propertyId);
  const [showing] = await db
    .insert(showings)
    .values({
      leadId: input.leadId,
      propertyId: input.propertyId,
      preferredDate: input.preferredDate,
      preferredTime: input.preferredTime,
      status: "Pending Confirmation",
      assignedAgentId: property?.assignedAgentId ?? null,
    })
    .returning();
  return showing;
}

export async function listShowings() {
  return db.select().from(showings).orderBy(desc(showings.createdAt));
}

export async function updateShowing(id: number, patch: Partial<typeof showings.$inferInsert>) {
  const [showing] = await db.update(showings).set(patch).where(eq(showings.id, id)).returning();
  return showing;
}

export function getShowingAvailability(property: { showingAvailability: string }) {
  return property.showingAvailability;
}

export interface CreateFollowupInput {
  leadId: number;
  message: string;
  scheduledAt?: Date;
  attemptNumber?: number;
}

export async function createFollowup(input: CreateFollowupInput) {
  const [followup] = await db
    .insert(followups)
    .values({
      leadId: input.leadId,
      message: input.message,
      scheduledAt: input.scheduledAt ?? new Date(),
      attemptNumber: input.attemptNumber ?? 1,
      status: "Scheduled",
    })
    .returning();
  return followup;
}

export async function listFollowups() {
  return db.select().from(followups).orderBy(desc(followups.createdAt));
}

export async function updateFollowup(id: number, patch: Partial<typeof followups.$inferInsert>) {
  const [followup] = await db.update(followups).set(patch).where(eq(followups.id, id)).returning();
  return followup;
}

export async function stopFollowupsForLead(leadId: number, reason: string) {
  await db
    .update(followups)
    .set({ status: "Stopped", stopReason: reason })
    .where(and(eq(followups.leadId, leadId), eq(followups.status, "Scheduled")));
}

export async function listAgents() {
  return db.select().from(agents);
}

export async function pickAgentForLead(criteria: { city?: string; propertyType?: string }) {
  const all = await listAgents();
  if (all.length === 0) return null;
  const match = all.find(
    (a) =>
      (criteria.city && (a.serviceAreas as string[]).some((s) => s.toLowerCase() === criteria.city!.toLowerCase())) ||
      (criteria.propertyType && (a.specialties as string[]).includes(criteria.propertyType)),
  );
  return match ?? all[0];
}

export async function handoffToAgent(leadId: number, conversationId: number, criteria: { city?: string; propertyType?: string }) {
  const agent = await pickAgentForLead(criteria);
  const lead = await updateLead(leadId, {
    status: "Human Handoff",
    assignedAgentId: agent?.id ?? null,
    handoffAt: new Date(),
  });
  await updateConversation(conversationId, { status: "handoff" });
  await stopFollowupsForLead(leadId, "human_takeover");
  return { lead, agent };
}

export async function addConversationNote(leadId: number, content: string, conversationId?: number, author = "Avery") {
  const [note] = await db
    .insert(notes)
    .values({ leadId, conversationId, author, content })
    .returning();
  return note;
}

export async function listNotesForLead(leadId: number) {
  return db.select().from(notes).where(eq(notes.leadId, leadId)).orderBy(desc(notes.createdAt));
}
