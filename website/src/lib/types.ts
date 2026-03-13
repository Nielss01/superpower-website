// ── Shared types ─────────────────────────────────────────────────────────────
import type { Idea } from "./ideas";

export interface Service {
  name: string;
  price: string;
  description?: string;
}

export interface StartingCostItem {
  name: string;
  cost: string;
}

export interface MarketingData {
  hook: string;
  platform: string;
  wordOfMouth: string;
}

export interface ProfileData {
  idea: Idea | null;
  name: string;
  wijk: string;
  services: Service[];
  bio: string;
  plan: string[];
  photoUrl: string | null;
  tagline: string;
  story: string;
  availability: string;
  promise: string;
  slug: string;
  // Business plan fields
  problem: string;
  targetCustomers: string[];
  marketing: MarketingData;
  startingCosts: { items: StartingCostItem[]; total: string };
  mvp: string;
}

export interface CoachSuggestion {
  label: string;
  prompt: string;
}

export const EMPTY_PROFILE: ProfileData = {
  idea: null,
  name: "",
  wijk: "",
  services: [],
  bio: "",
  plan: [],
  photoUrl: null,
  tagline: "",
  story: "",
  availability: "",
  promise: "",
  slug: "",
  problem: "",
  targetCustomers: [],
  marketing: { hook: "", platform: "", wordOfMouth: "" },
  startingCosts: { items: [], total: "" },
  mvp: "",
};
