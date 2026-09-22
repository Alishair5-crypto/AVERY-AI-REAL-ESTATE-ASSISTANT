import { SERVICE_CITIES, type Intent } from "@/lib/types";

export interface ExtractedSlots {
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
  features?: string[];
  name?: string;
  phone?: string;
  email?: string;
  sellerAddress?: string;
  wantsHuman?: boolean;
}

const PROPERTY_TYPE_KEYWORDS: Record<string, string> = {
  "single family": "Single Family",
  "single-family": "Single Family",
  house: "Single Family",
  home: "Single Family",
  condo: "Condo",
  condominium: "Condo",
  townhouse: "Townhouse",
  "town house": "Townhouse",
  "town-house": "Townhouse",
  apartment: "Apartment",
  apt: "Apartment",
  rental: "Rental",
  luxury: "Luxury Home",
  mansion: "Luxury Home",
  estate: "Luxury Home",
};

const NEIGHBORHOODS = [
  "midtown", "montrose", "the heights", "heights", "downtown", "energy corridor",
  "cinco ranch", "cross creek ranch", "grand lakes", "telfair", "first colony",
  "riverstone", "new territory", "creekside park", "sterling ridge", "grogans mill",
  "bridgeland", "fairfield", "towne lake", "klein", "augusta pines", "spring trails",
  "shadow creek ranch", "silverlake", "southdown", "rice military", "sharpstown",
];

function normalize(text: string) {
  return text.toLowerCase();
}

function extractBudget(text: string): { min?: number; max?: number } {
  const t = text.replace(/,/g, "");
  // patterns like $400k, 400k, $400,000, 2200/mo, $2,200 a month
  const kMatch = t.match(/\$?\s?(\d{2,4})\s?k\b/i);
  if (kMatch) {
    const val = parseInt(kMatch[1], 10) * 1000;
    if (/under|below|less than|max|up to/i.test(t)) return { max: val };
    if (/over|above|at least|min/i.test(t)) return { min: val };
    return { max: val };
  }
  const dollarMatch = t.match(/\$\s?(\d{3,7})(?!\d)/);
  if (dollarMatch) {
    const val = parseInt(dollarMatch[1], 10);
    if (val < 20000) {
      // likely a monthly rent figure
      if (/under|below|less than|max|up to/i.test(t)) return { max: val };
      return { max: val };
    }
    if (/under|below|less than|max|up to/i.test(t)) return { max: val };
    if (/over|above|at least|min/i.test(t)) return { min: val };
    return { max: val };
  }
  const plainNumber = t.match(/budget.*?(\d{3,7})/i);
  if (plainNumber) {
    return { max: parseInt(plainNumber[1], 10) };
  }
  return {};
}

function extractBedrooms(text: string): number | undefined {
  const m = text.match(/(\d+)\s?(?:-|\s)?(?:bed(?:room)?s?|br\b)/i);
  if (m) return parseInt(m[1], 10);
  return undefined;
}

function extractBathrooms(text: string): number | undefined {
  const m = text.match(/(\d+(?:\.\d)?)\s?(?:-|\s)?(?:bath(?:room)?s?|ba\b)/i);
  if (m) return parseFloat(m[1]);
  return undefined;
}

function extractCity(text: string): string | undefined {
  const t = normalize(text);
  for (const city of SERVICE_CITIES) {
    if (t.includes(city.toLowerCase())) return city;
  }
  return undefined;
}

function extractNeighborhood(text: string): string | undefined {
  const t = normalize(text);
  for (const n of NEIGHBORHOODS) {
    if (t.includes(n)) {
      return n.replace(/\b\w/g, (c) => c.toUpperCase());
    }
  }
  return undefined;
}

function extractPropertyType(text: string): string | undefined {
  const t = normalize(text);
  for (const key of Object.keys(PROPERTY_TYPE_KEYWORDS)) {
    if (t.includes(key)) return PROPERTY_TYPE_KEYWORDS[key];
  }
  return undefined;
}

function extractIntent(text: string): Intent | undefined {
  const t = normalize(text);
  if (/\bsell(ing)?\b|\blist(ing)? my\b|\bwant to sell\b/.test(t)) return "Seller";
  if (/\brent(ing)?\b|\blease\b|\btenant\b|\bapartment\b/.test(t) && !/\bbuy\b/.test(t)) return "Renter";
  if (/\bbuy(ing)?\b|\bpurchase\b|\blooking for a house\b|\bhome\b/.test(t)) return "Buyer";
  return undefined;
}

function extractTimeline(text: string): string | undefined {
  const t = normalize(text);
  if (/\basap\b|\bimmediately\b|\bright away\b/.test(t)) return "ASAP";
  if (/\bthis (week|month)\b/.test(t)) return "Within a month";
  if (/\d+\s?(-|to)?\s?\d*\s?months?\b/.test(t)) return t.match(/\d+\s?(-|to)?\s?\d*\s?months?/)?.[0];
  if (/\bnext year\b/.test(t)) return "Next year";
  if (/\bno rush\b|\bjust browsing\b|\bjust looking\b/.test(t)) return "No rush / browsing";
  if (/\b(few|couple) of months\b/.test(t)) return "A few months";
  return undefined;
}

function extractFinancing(text: string): string | undefined {
  const t = normalize(text);
  if (/pre-?approved/.test(t)) return "Pre-approved";
  if (/cash buyer|paying cash/.test(t)) return "Cash buyer";
  if (/need financing|need a mortgage|not pre-?approved/.test(t)) return "Needs financing";
  return undefined;
}

function extractPets(text: string): string | undefined {
  const t = normalize(text);
  if (/no pets/.test(t)) return "No pets";
  if (/\bdog\b|\bcat\b|\bpets?\b/.test(t)) return "Has pets";
  return undefined;
}

function extractMoveInDate(text: string): string | undefined {
  const t = normalize(text);
  const m = t.match(/move[- ]?in\s?(?:date)?\s?(?:is|:)?\s?([a-z0-9,\/\- ]{3,20})/);
  if (m) return m[1].trim();
  return undefined;
}

function extractPhone(text: string): string | undefined {
  const m = text.match(/(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  return m ? m[0].trim() : undefined;
}

function extractEmail(text: string): string | undefined {
  const m = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return m ? m[0].trim() : undefined;
}

function extractSellerAddress(text: string): string | undefined {
  const m = text.match(/\d{2,6}\s+[a-zA-Z0-9.\s]{3,40}(?:st|street|ave|avenue|blvd|boulevard|dr|drive|rd|road|ln|lane|way|ct|court|pl|place)\b/i);
  return m ? m[0].trim() : undefined;
}

function detectHumanRequest(text: string): boolean {
  const t = normalize(text);
  return /\b(speak|talk) (to|with) (a |an )?(agent|person|human|someone|realtor)\b/.test(t) ||
    /\bconnect me\b|\breal person\b|\bhuman agent\b/.test(t);
}

/**
 * Extracts structured slots from a free-text customer message. This is a
 * deterministic rule-based NLU layer (no external LLM dependency) so Avery's
 * behavior stays fast, predictable, and free of fabricated information —
 * an intentional design choice for a demo that must never hallucinate.
 */
export function extractSlots(text: string): ExtractedSlots {
  const slots: ExtractedSlots = {};
  const intent = extractIntent(text);
  if (intent) slots.intent = intent;

  const city = extractCity(text);
  if (city) slots.city = city;

  const neighborhood = extractNeighborhood(text);
  if (neighborhood) slots.neighborhood = neighborhood;

  const propertyType = extractPropertyType(text);
  if (propertyType) slots.propertyType = propertyType;

  const budget = extractBudget(text);
  if (budget.min) slots.budgetMin = budget.min;
  if (budget.max) slots.budgetMax = budget.max;

  const bedrooms = extractBedrooms(text);
  if (bedrooms) slots.bedrooms = bedrooms;

  const bathrooms = extractBathrooms(text);
  if (bathrooms) slots.bathrooms = bathrooms;

  const timeline = extractTimeline(text);
  if (timeline) slots.timeline = timeline;

  const financing = extractFinancing(text);
  if (financing) slots.financing = financing;

  const pets = extractPets(text);
  if (pets) slots.pets = pets;

  const moveInDate = extractMoveInDate(text);
  if (moveInDate) slots.moveInDate = moveInDate;

  const phone = extractPhone(text);
  if (phone) slots.phone = phone;

  const email = extractEmail(text);
  if (email) slots.email = email;

  const sellerAddress = extractSellerAddress(text);
  if (sellerAddress) slots.sellerAddress = sellerAddress;

  if (detectHumanRequest(text)) slots.wantsHuman = true;

  return slots;
}

export function looksLikeName(text: string): string | undefined {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length > 40) return undefined;
  if (/[0-9@]/.test(trimmed)) return undefined;
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length < 1 || words.length > 4) return undefined;
  if (!/^[a-zA-Z'\-.\s]+$/.test(trimmed)) return undefined;
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}
