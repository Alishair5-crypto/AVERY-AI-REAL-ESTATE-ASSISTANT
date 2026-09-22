import { db } from "@/db";
import { settings } from "@/db/schema";

export async function getSettings() {
  const rows = await db.select().from(settings).limit(1);
  if (rows[0]) return rows[0];
  const [created] = await db.insert(settings).values({}).returning();
  return created;
}
