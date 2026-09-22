import { db } from "@/db";
import { agents, properties, settings } from "@/db/schema";
import { AGENTS_SEED } from "./agents-seed";
import { PROPERTIES_SEED, seedImages } from "./properties-seed";

// Ensures the demo property/agent inventory exists exactly once per server
// process. Safe to call from any request path — cheap no-op after first run.

const globalForSeed = globalThis as typeof globalThis & {
  __averySeedPromise?: Promise<void>;
};

async function doSeed() {
  const existing = await db.select().from(properties).limit(1);
  if (existing.length > 0) return;

  const insertedAgents = await db.insert(agents).values(AGENTS_SEED).returning();

  const propertyRows = PROPERTIES_SEED.map((p, idx) => {
    const { agentIndex, ...rest } = p;
    return {
      ...rest,
      images: seedImages(p.propertyType, idx),
      assignedAgentId: insertedAgents[agentIndex]?.id ?? insertedAgents[0]?.id,
    };
  });

  await db.insert(properties).values(propertyRows);

  const existingSettings = await db.select().from(settings).limit(1);
  if (existingSettings.length === 0) {
    await db.insert(settings).values({});
  }
}

export function ensureSeeded(): Promise<void> {
  if (!globalForSeed.__averySeedPromise) {
    globalForSeed.__averySeedPromise = doSeed().catch((err) => {
      globalForSeed.__averySeedPromise = undefined;
      throw err;
    });
  }
  return globalForSeed.__averySeedPromise;
}
