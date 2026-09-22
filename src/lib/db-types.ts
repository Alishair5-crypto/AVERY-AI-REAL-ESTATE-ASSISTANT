import type { agents, conversations, followups, leads, messages, notes, properties, showings } from "@/db/schema";

export type Property = typeof properties.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type Agent = typeof agents.$inferSelect;
export type Showing = typeof showings.$inferSelect;
export type Followup = typeof followups.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Note = typeof notes.$inferSelect;
