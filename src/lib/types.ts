// Shared types for the Avery demo application.

export type Intent = "Buyer" | "Renter" | "Seller" | "General";

export type LeadStatus =
  | "New"
  | "Contacted"
  | "Qualified"
  | "Property Matched"
  | "Showing Requested"
  | "Human Handoff"
  | "Follow-up Due"
  | "Closed";

export type Priority = "High" | "Medium" | "Low";

export type Channel =
  | "Website Chat"
  | "Instagram"
  | "Facebook Messenger"
  | "WhatsApp"
  | "Lead Form";

export const CHANNELS: Channel[] = [
  "Website Chat",
  "Instagram",
  "Facebook Messenger",
  "WhatsApp",
  "Lead Form",
];

export type ShowingStatus =
  | "Requested"
  | "Pending Confirmation"
  | "Confirmed"
  | "Cancelled"
  | "Completed";

export type FollowupStatus = "Scheduled" | "Sent" | "Stopped";

export type MessageSender = "customer" | "avery" | "agent" | "system";

export interface PropertyCardMeta {
  [key: string]: unknown;
  type: "property_results";
  propertyIds: number[];
  note?: string;
}

export interface ShowingCardMeta {
  [key: string]: unknown;
  type: "showing_summary";
  showingId: number;
  propertyId: number;
}

export interface HandoffMeta {
  [key: string]: unknown;
  type: "handoff";
  agentId: number;
}

export type MessageMetadata = PropertyCardMeta | ShowingCardMeta | HandoffMeta | Record<string, unknown>;

export const SERVICE_CITIES = [
  "Houston",
  "Katy",
  "Sugar Land",
  "The Woodlands",
  "Cypress",
  "Spring",
  "Pearland",
];

export const PROPERTY_TYPES = [
  "Single Family",
  "Condo",
  "Townhouse",
  "Apartment",
  "Rental",
  "Luxury Home",
];
