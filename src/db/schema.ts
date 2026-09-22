import {
  pgTable,
  serial,
  text,
  integer,
  numeric,
  boolean,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// AVERY — AI Real Estate Assistant
// Demo relational schema. All property/lead/agent data created through this
// schema for the demo is clearly marked as DEMO data in the application UI.
// ---------------------------------------------------------------------------

export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  title: text("title").notNull().default("Realtor"),
  specialties: jsonb("specialties").$type<string[]>().notNull().default([]),
  serviceAreas: jsonb("service_areas").$type<string[]>().notNull().default([]),
  availability: text("availability").notNull().default("Mon–Sat, 9am–7pm"),
  status: text("status").notNull().default("Active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull().default("TX"),
  zip: text("zip").notNull(),
  neighborhood: text("neighborhood").notNull(),
  price: integer("price").notNull(),
  listingType: text("listing_type").notNull(), // "For Sale" | "For Rent"
  propertyType: text("property_type").notNull(), // Single Family, Condo, Townhouse, Apartment, Rental, Luxury Home
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: numeric("bathrooms", { precision: 3, scale: 1 }).notNull(),
  sqft: integer("sqft").notNull(),
  lotSize: text("lot_size"),
  description: text("description").notNull(),
  features: jsonb("features").$type<string[]>().notNull().default([]),
  images: jsonb("images").$type<string[]>().notNull().default([]),
  availability: text("availability").notNull().default("Active"), // Active | Pending | Off Market
  showingAvailability: text("showing_availability")
    .notNull()
    .default("Weekdays 10am–6pm, weekends by appointment"),
  assignedAgentId: integer("assigned_agent_id").references(() => agents.id),
  demoStatus: text("demo_status").notNull().default("DEMO PROPERTY DATA"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: text("name"),
  phone: text("phone"),
  email: text("email"),
  channel: text("channel").notNull().default("Website Chat"),
  intent: text("intent").notNull().default("General"), // Buyer | Renter | Seller | General
  status: text("status").notNull().default("New"),
  priority: text("priority").notNull().default("Low"),
  locationPreference: text("location_preference"),
  budgetMin: integer("budget_min"),
  budgetMax: integer("budget_max"),
  propertyType: text("property_type"),
  bedrooms: integer("bedrooms"),
  bathrooms: numeric("bathrooms", { precision: 3, scale: 1 }),
  timeline: text("timeline"),
  financing: text("financing"),
  moveInDate: text("move_in_date"),
  pets: text("pets"),
  sellerAddress: text("seller_address"),
  propertyInterest: integer("property_interest").references(() => properties.id),
  assignedAgentId: integer("assigned_agent_id").references(() => agents.id),
  showingStatus: text("showing_status"),
  lastMessage: text("last_message"),
  handoffAt: timestamp("handoff_at"),
  isDemo: boolean("is_demo").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id")
    .notNull()
    .references(() => leads.id),
  channel: text("channel").notNull().default("Website Chat"),
  status: text("status").notNull().default("active"), // active | handoff | closed
  state: jsonb("state").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id")
    .notNull()
    .references(() => conversations.id),
  sender: text("sender").notNull(), // customer | avery | agent | system
  content: text("content").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown> | null>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const showings = pgTable("showings", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id")
    .notNull()
    .references(() => leads.id),
  propertyId: integer("property_id")
    .notNull()
    .references(() => properties.id),
  preferredDate: text("preferred_date").notNull(),
  preferredTime: text("preferred_time").notNull(),
  status: text("status").notNull().default("Pending Confirmation"),
  assignedAgentId: integer("assigned_agent_id").references(() => agents.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const followups = pgTable("followups", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id")
    .notNull()
    .references(() => leads.id),
  scheduledAt: timestamp("scheduled_at").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("Scheduled"), // Scheduled | Sent | Stopped
  attemptNumber: integer("attempt_number").notNull().default(1),
  stopReason: text("stop_reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id")
    .notNull()
    .references(() => leads.id),
  conversationId: integer("conversation_id").references(() => conversations.id),
  author: text("author").notNull().default("Avery"),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  businessName: text("business_name").notNull().default("Lonestar Realty Group"),
  agentTeamName: text("agent_team_name").notNull().default("The Lonestar Team"),
  serviceAreas: jsonb("service_areas")
    .$type<string[]>()
    .notNull()
    .default(["Houston", "Katy", "Sugar Land", "The Woodlands", "Cypress", "Spring", "Pearland"]),
  assistantName: text("assistant_name").notNull().default("Avery"),
  greeting: text("greeting")
    .notNull()
    .default("Hi! I'm Avery, your AI real estate assistant. How can I help you today?"),
  tone: text("tone").notNull().default("Professional"),
  handoffEnabled: boolean("handoff_enabled").notNull().default(true),
  followupEnabled: boolean("followup_enabled").notNull().default(true),
  maxFollowupAttempts: integer("max_followup_attempts").notNull().default(3),
  followupDelayMinutes: integer("followup_delay_minutes").notNull().default(60),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
