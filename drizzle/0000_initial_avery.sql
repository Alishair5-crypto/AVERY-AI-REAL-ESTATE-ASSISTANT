CREATE TABLE IF NOT EXISTS "agents" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL,
  "phone" text NOT NULL,
  "title" text DEFAULT 'Realtor' NOT NULL,
  "specialties" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "service_areas" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "availability" text DEFAULT 'Mon–Sat, 9am–7pm' NOT NULL,
  "status" text DEFAULT 'Active' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "properties" (
  "id" serial PRIMARY KEY NOT NULL,
  "address" text NOT NULL,
  "city" text NOT NULL,
  "state" text DEFAULT 'TX' NOT NULL,
  "zip" text NOT NULL,
  "neighborhood" text NOT NULL,
  "price" integer NOT NULL,
  "listing_type" text NOT NULL,
  "property_type" text NOT NULL,
  "bedrooms" integer NOT NULL,
  "bathrooms" numeric(3, 1) NOT NULL,
  "sqft" integer NOT NULL,
  "lot_size" text,
  "description" text NOT NULL,
  "features" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "images" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "availability" text DEFAULT 'Active' NOT NULL,
  "showing_availability" text DEFAULT 'Weekdays 10am–6pm, weekends by appointment' NOT NULL,
  "assigned_agent_id" integer,
  "demo_status" text DEFAULT 'DEMO PROPERTY DATA' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "leads" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" text,
  "phone" text,
  "email" text,
  "channel" text DEFAULT 'Website Chat' NOT NULL,
  "intent" text DEFAULT 'General' NOT NULL,
  "status" text DEFAULT 'New' NOT NULL,
  "priority" text DEFAULT 'Low' NOT NULL,
  "location_preference" text,
  "budget_min" integer,
  "budget_max" integer,
  "property_type" text,
  "bedrooms" integer,
  "bathrooms" numeric(3, 1),
  "timeline" text,
  "financing" text,
  "move_in_date" text,
  "pets" text,
  "seller_address" text,
  "property_interest" integer,
  "assigned_agent_id" integer,
  "showing_status" text,
  "last_message" text,
  "handoff_at" timestamp,
  "is_demo" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "conversations" (
  "id" serial PRIMARY KEY NOT NULL,
  "lead_id" integer NOT NULL,
  "channel" text DEFAULT 'Website Chat' NOT NULL,
  "status" text DEFAULT 'active' NOT NULL,
  "state" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "messages" (
  "id" serial PRIMARY KEY NOT NULL,
  "conversation_id" integer NOT NULL,
  "sender" text NOT NULL,
  "content" text NOT NULL,
  "metadata" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "showings" (
  "id" serial PRIMARY KEY NOT NULL,
  "lead_id" integer NOT NULL,
  "property_id" integer NOT NULL,
  "preferred_date" text NOT NULL,
  "preferred_time" text NOT NULL,
  "status" text DEFAULT 'Pending Confirmation' NOT NULL,
  "assigned_agent_id" integer,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "followups" (
  "id" serial PRIMARY KEY NOT NULL,
  "lead_id" integer NOT NULL,
  "scheduled_at" timestamp NOT NULL,
  "message" text NOT NULL,
  "status" text DEFAULT 'Scheduled' NOT NULL,
  "attempt_number" integer DEFAULT 1 NOT NULL,
  "stop_reason" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "notes" (
  "id" serial PRIMARY KEY NOT NULL,
  "lead_id" integer NOT NULL,
  "conversation_id" integer,
  "author" text DEFAULT 'Avery' NOT NULL,
  "content" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "settings" (
  "id" serial PRIMARY KEY NOT NULL,
  "business_name" text DEFAULT 'Lonestar Realty Group' NOT NULL,
  "agent_team_name" text DEFAULT 'The Lonestar Team' NOT NULL,
  "service_areas" jsonb DEFAULT '["Houston", "Katy", "Sugar Land", "The Woodlands", "Cypress", "Spring", "Pearland"]'::jsonb NOT NULL,
  "assistant_name" text DEFAULT 'Avery' NOT NULL,
  "greeting" text DEFAULT 'Hi! I''m Avery, your AI real estate assistant. How can I help you today?' NOT NULL,
  "tone" text DEFAULT 'Professional' NOT NULL,
  "handoff_enabled" boolean DEFAULT true NOT NULL,
  "followup_enabled" boolean DEFAULT true NOT NULL,
  "max_followup_attempts" integer DEFAULT 3 NOT NULL,
  "followup_delay_minutes" integer DEFAULT 60 NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

DO $$ BEGIN
 ALTER TABLE "properties" ADD CONSTRAINT "properties_assigned_agent_id_agents_id_fk" FOREIGN KEY ("assigned_agent_id") REFERENCES "agents"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
 ALTER TABLE "leads" ADD CONSTRAINT "leads_property_interest_properties_id_fk" FOREIGN KEY ("property_interest") REFERENCES "properties"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
 ALTER TABLE "leads" ADD CONSTRAINT "leads_assigned_agent_id_agents_id_fk" FOREIGN KEY ("assigned_agent_id") REFERENCES "agents"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
 ALTER TABLE "conversations" ADD CONSTRAINT "conversations_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
 ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
 ALTER TABLE "showings" ADD CONSTRAINT "showings_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
 ALTER TABLE "showings" ADD CONSTRAINT "showings_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
 ALTER TABLE "showings" ADD CONSTRAINT "showings_assigned_agent_id_agents_id_fk" FOREIGN KEY ("assigned_agent_id") REFERENCES "agents"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
 ALTER TABLE "followups" ADD CONSTRAINT "followups_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
 ALTER TABLE "notes" ADD CONSTRAINT "notes_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
 ALTER TABLE "notes" ADD CONSTRAINT "notes_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
