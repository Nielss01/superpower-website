// ── Marketplace dummy data ────────────────────────────────────────────────────

export const CAPE_TOWN_TOWNSHIPS = [
  "Khayelitsha",
  "Mitchells Plain",
  "Gugulethu",
  "Langa",
  "Nyanga",
  "Manenberg",
  "Philippi",
  "Hanover Park",
  "Bonteheuwel",
  "Delft",
  "Bellville South",
  "Kraaifontein",
  "Blue Downs",
  "Atlantis",
] as const;

export type CapeFlatsArea = (typeof CAPE_TOWN_TOWNSHIPS)[number];

export type MarketplaceReview = {
  id: string;
  reviewerName: string;
  rating: number;
  title: string;
  body: string;
  date: string;
};

export type MarketplaceListing = {
  id: string;
  businessName: string;
  tagline: string;
  description: string;
  services: string;
  location: string[];
  website: string | null;
  whatsappNumber: string;
  category: MarketplaceCategory;
  profilePhotoUrl: string;
  servicePhotoUrls: string[];
  reviews: MarketplaceReview[];
  isVerified?: boolean;
  responseTime?: string | null;
};

export type MarketplaceCategory =
  | "Creative"
  | "Tech"
  | "Education"
  | "Food & Beverage"
  | "Beauty & Wellness"
  | "Services";

export const MARKETPLACE_CATEGORY_META: Record<
  MarketplaceCategory,
  { color: string; wash: string; emoji: string }
> = {
  Creative:          { color: "#D4497A", wash: "#FFF0F7", emoji: "🎨" },
  Tech:              { color: "#2B8FCC", wash: "#EFF9FF", emoji: "💻" },
  Education:         { color: "#F59E0B", wash: "#FFFBF0", emoji: "📚" },
  "Food & Beverage": { color: "#D4763C", wash: "#FFFBF0", emoji: "🍱" },
  "Beauty & Wellness":{ color: "#F472B6", wash: "#FFF0F7", emoji: "💇" },
  Services:          { color: "#22A06B", wash: "#EDF8F2", emoji: "🛵" },
};

export const MARKETPLACE_LISTINGS: MarketplaceListing[] = [
  {
    id: "zara-creative-studio",
    businessName: "Zara Creative Studio",
    tagline: "Bold African designs for bold people",
    description:
      "We are a one-woman design studio based in Woodstock, Cape Town. I create logos, brand identities, and social media kits that reflect authentic African culture with a modern twist. Whether you're launching a new hustle or refreshing an existing brand, I've got you covered.",
    services:
      "Logo design and brand identity packs\nSocial media content creation (Instagram, TikTok)\nFlyer and poster design\nMerchandise mockups",
    location: ["Langa"],
    website: null,
    whatsappNumber: "0721234501",
    category: "Creative",
    profilePhotoUrl: "https://picsum.photos/seed/zara-profile/200/200",
    servicePhotoUrls: [
      "https://picsum.photos/seed/zara-s1/600/600",
      "https://picsum.photos/seed/zara-s2/600/600",
      "https://picsum.photos/seed/zara-s3/600/600",
      "https://picsum.photos/seed/zara-s4/600/600",
    ],
    reviews: [
      {
        id: "r1",
        reviewerName: "Thabo M.",
        rating: 5,
        title: "Absolutely nailed my brand",
        body: "Zara designed my entire brand identity in under a week. The logo is clean, the colours pop, and my clients keep complimenting it. Will definitely come back.",
        date: "2026-02-20",
      },
      {
        id: "r2",
        reviewerName: "Naledi K.",
        rating: 5,
        title: "Professional and creative",
        body: "Got my flyers and Instagram templates done. She understood exactly what I wanted even when I struggled to explain it. Super fast turnaround too.",
        date: "2026-03-02",
      },
    ],
  },
  {
    id: "thabo-tech-solutions",
    businessName: "Thabo Tech Solutions",
    tagline: "Affordable websites and apps for small businesses",
    description:
      "I build clean, fast websites and mobile-friendly web apps for township entrepreneurs and small businesses across Cape Town. No corporate prices — just real solutions that help you get found online and grow your customer base.",
    services:
      "Static and dynamic websites (Next.js, WordPress)\nWhatsApp Business setup and automation\nGoogle My Business profile setup\nBasic SEO and analytics",
    location: ["Khayelitsha"],
    website: null,
    whatsappNumber: "0831234502",
    category: "Tech",
    profilePhotoUrl: "https://picsum.photos/seed/thabo-profile/200/200",
    servicePhotoUrls: [
      "https://picsum.photos/seed/thabo-s1/600/600",
      "https://picsum.photos/seed/thabo-s2/600/600",
      "https://picsum.photos/seed/thabo-s3/600/600",
    ],
    reviews: [
      {
        id: "r3",
        reviewerName: "Zara D.",
        rating: 5,
        title: "My website is finally live!",
        body: "Thabo built my portfolio site in two weeks. It loads fast, looks great on mobile, and he even set up my Google Business profile. Very patient with all my questions.",
        date: "2026-01-10",
      },
      {
        id: "r4",
        reviewerName: "Keanu B.",
        rating: 4,
        title: "Solid work, good communication",
        body: "Had a small website built for my barber bookings. Took a bit longer than expected but the end result was exactly what I needed. Would recommend.",
        date: "2026-01-25",
      },
    ],
  },
  {
    id: "naledis-kitchen",
    businessName: "Naledi's Kitchen",
    tagline: "Home-cooked meals delivered with love",
    description:
      "Naledi's Kitchen brings the taste of home to your door. I prepare fresh, daily-cooked South African meals using ingredients sourced from local markets. Popular with office workers and families in Mitchells Plain who want a hot meal without the hassle.",
    services:
      "Daily lunch specials (R45–R65)\nBulk meal prep (weekly orders)\nWeekend braai packs\nCatering for small events (up to 30 people)",
    location: ["Mitchells Plain"],
    website: null,
    whatsappNumber: "0791234503",
    category: "Food & Beverage",
    profilePhotoUrl: "https://picsum.photos/seed/naledi-profile/200/200",
    servicePhotoUrls: [
      "https://picsum.photos/seed/naledi-s1/600/600",
      "https://picsum.photos/seed/naledi-s2/600/600",
      "https://picsum.photos/seed/naledi-s3/600/600",
      "https://picsum.photos/seed/naledi-s4/600/600",
    ],
    reviews: [
      {
        id: "r5",
        reviewerName: "Ayasha N.",
        rating: 5,
        title: "Best umngqusho I've had outside my mom's kitchen",
        body: "I order the lunch special three times a week. Portions are generous, food is always hot, and delivery is reliable. Feels like a home-cooked meal every time.",
        date: "2026-03-04",
      },
      {
        id: "r6",
        reviewerName: "Sipho D.",
        rating: 4,
        title: "Great food, sometimes runs a bit late",
        body: "The food is genuinely delicious and the price is unbeatable. Delivery has been late once or twice but Naledi always communicates ahead of time.",
        date: "2026-03-07",
      },
    ],
  },
  {
    id: "keanu-cuts",
    businessName: "Keanu Cuts",
    tagline: "Fresh fades and braids — come correct",
    description:
      "Mobile barber and braid stylist serving Bellville and surrounding areas. I come to you — home, office, wherever. No waiting in queues. Specialising in skin fades, cornrows, and dreadlock maintenance for men, women, and kids.",
    services:
      "Skin fades and tapers\nCornrows and box braids\nDreadlock maintenance and retwisting\nKids' cuts",
    location: ["Bellville South"],
    website: null,
    whatsappNumber: "0721234504",
    category: "Beauty & Wellness",
    profilePhotoUrl: "https://picsum.photos/seed/keanu-profile/200/200",
    servicePhotoUrls: [
      "https://picsum.photos/seed/keanu-s1/600/600",
      "https://picsum.photos/seed/keanu-s2/600/600",
      "https://picsum.photos/seed/keanu-s3/600/600",
    ],
    reviews: [
      {
        id: "r7",
        reviewerName: "Thabo M.",
        rating: 5,
        title: "Best fade in Bellville",
        body: "Coming to you is a game changer. Booked a Sunday morning slot, he arrived on time, and the fade was clean. Worth every rand.",
        date: "2026-01-30",
      },
      {
        id: "r8",
        reviewerName: "Lebo S.",
        rating: 5,
        title: "My go-to barber now",
        body: "I hate sitting in barbershops for hours. Keanu comes to me, works fast, and never disappoints. My cornrows always get compliments.",
        date: "2026-02-18",
      },
    ],
  },
  {
    id: "ayasha-tutors",
    businessName: "Ayasha Tutors",
    tagline: "Maths and Science made simple",
    description:
      "Matric and university-level tutoring in Mathematics, Physical Science, and Accounting. I am a UCT graduate with three years of tutoring experience. Small group sessions available on weekends. I focus on building genuine understanding — not just cramming for exams.",
    services:
      "One-on-one tutoring (in-person or online)\nWeekend group sessions (max 4 learners)\nExam preparation and past paper practice\nStudy skills coaching",
    location: ["Gugulethu"],
    website: null,
    whatsappNumber: "0831234505",
    category: "Education",
    profilePhotoUrl: "https://picsum.photos/seed/ayasha-profile/200/200",
    servicePhotoUrls: [
      "https://picsum.photos/seed/ayasha-s1/600/600",
      "https://picsum.photos/seed/ayasha-s2/600/600",
    ],
    reviews: [
      {
        id: "r9",
        reviewerName: "Naledi K.",
        rating: 5,
        title: "My son passed Maths for the first time",
        body: "My son was failing Grade 11 Maths. After three months with Ayasha he passed with 68%. She is patient, explains things clearly, and actually cares about her students.",
        date: "2026-03-06",
      },
    ],
  },
  {
    id: "sipho-shoots",
    businessName: "Sipho Shoots",
    tagline: "Capturing Cape Town's real stories",
    description:
      "Freelance photographer and videographer with 5 years of experience. I shoot events, portraits, product photography, and short brand videos. My style is candid and documentary — real moments, real light, no over-edited filters.",
    services:
      "Event photography (graduations, parties, community events)\nPortrait sessions\nProduct and food photography\nShort brand videos (reels, ads)",
    location: ["Langa"],
    website: null,
    whatsappNumber: "0791234506",
    category: "Creative",
    profilePhotoUrl: "https://picsum.photos/seed/sipho-profile/200/200",
    servicePhotoUrls: [
      "https://picsum.photos/seed/sipho-s1/600/600",
      "https://picsum.photos/seed/sipho-s2/600/600",
      "https://picsum.photos/seed/sipho-s3/600/600",
      "https://picsum.photos/seed/sipho-s4/600/600",
    ],
    reviews: [
      {
        id: "r10",
        reviewerName: "Zara D.",
        rating: 5,
        title: "Captured the vibe perfectly",
        body: "Sipho shot photos for my studio launch event. He was discreet, captured everything naturally, and delivered edited photos within 48 hours. Booked him again already.",
        date: "2025-12-30",
      },
      {
        id: "r11",
        reviewerName: "Keanu B.",
        rating: 4,
        title: "Great product shots",
        body: "Needed photos for my barber kit to sell online. Sipho made the equipment look premium. Clean backgrounds, good lighting. Delivery was quick.",
        date: "2026-01-20",
      },
    ],
  },
  {
    id: "lebo-runs",
    businessName: "Lebo Runs",
    tagline: "Same-day delivery across the Cape Flats",
    description:
      "Fast, reliable courier service on a motorbike. I handle business deliveries, online order fulfilment, and personal errands across the Cape Flats and surrounding suburbs. Tracking via WhatsApp. Trusted by 12 local businesses.",
    services:
      "Same-day parcel delivery\nMonthly retainer packages for small businesses\nGrocery and errand runs\nDocument and cash-on-delivery handling",
    location: ["Gugulethu"],
    website: null,
    whatsappNumber: "0721234507",
    category: "Services",
    profilePhotoUrl: "https://picsum.photos/seed/lebo-profile/200/200",
    servicePhotoUrls: [
      "https://picsum.photos/seed/lebo-s1/600/600",
      "https://picsum.photos/seed/lebo-s2/600/600",
    ],
    reviews: [
      {
        id: "r12",
        reviewerName: "Thabo M.",
        rating: 5,
        title: "Reliable and fast",
        body: "I use Lebo for all my client deliveries now. He's always on time, sends WhatsApp updates without being asked, and handles parcels with care. Highly recommended.",
        date: "2026-03-07",
      },
    ],
  },
];

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
