// ── Marketplace types & helpers ───────────────────────────────────────────────
// Hardcoded seed data has been removed — categories and locations are now
// read from the `marketplace_categories` and `marketplace_locations` Supabase
// tables via src/lib/supabase/queries.ts.

export type ServiceItem = {
  name: string;
  price: string;
  description?: string;
};

export type MarketplaceReview = {
  id: string;
  reviewerId: string;
  reviewerName: string;
  rating: number;
  title: string;
  body: string;
  date: string;
};

export type MarketplaceListing = {
  id: string;
  userId: string;
  businessName: string;
  tagline: string;
  description: string;
  services: ServiceItem[];
  location: string[];           // mapped from DB `locations` column
  website: string | null;
  whatsappNumber: string;
  category: string;             // FK → marketplace_categories.key
  profilePhotoUrl: string;
  servicePhotoUrls: string[];
  reviews: MarketplaceReview[];
  isVerified?: boolean;
  responseTime?: string | null;
};

// ── Helper functions ──────────────────────────────────────────────────────────

export function avgRating(reviews: MarketplaceReview[]): number | null {
  if (reviews.length === 0) return null;
  return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
}

// Top Hustler: 20+ reviews and average ≥ 4.25/5 (= 8.5/10)
export function isTopHustler(reviews: MarketplaceReview[]): boolean {
  if (reviews.length < 20) return false;
  const avg = avgRating(reviews);
  return avg !== null && avg >= 4.25;
}

export function buildWhatsAppUrl(number: string, businessName: string): string {
  let digits = number.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = "27" + digits.slice(1);
  const msg = encodeURIComponent(
    `Hi ${businessName}, I found you on Superpower Hub and I'm interested in your services.`,
  );
  return `https://wa.me/${digits}?text=${msg}`;
}
