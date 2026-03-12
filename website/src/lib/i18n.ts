export type Lang = "en" | "sa";

export const LANG = {
  en: {
    // Nav
    nav_wordmark: "Superpower Hub",

    // Hero
    hero_pre:       "For young entrepreneurs",
    hero_line1:     "Build your",
    hero_line2:     "business.",
    hero_line3:     "Today.",
    hero_sub:       "Get your free business plan in 10 minutes. No experience needed.",
    hero_cta:       "Start now",

    // Path cards
    path_a_label:   "I have an idea",
    path_a_sub:     "Tell us about your idea and we'll build it out",
    path_b_label:   "Choose from 50 ideas",
    path_b_sub:     "Browse our library of zero-cost business ideas",
    path_c_label:   "Help me choose",
    path_c_sub:     "Take a 5-question quiz and we'll match you",

    // How it works
    how_label:      "How it works",
    how_title:      "From idea to live in\u00a010 minutes",
    step1_num:      "01",
    step1_title:    "Choose your path",
    step1_body:     "Pick an idea, browse 50 options, or let the quiz match you to your best fit.",
    step2_num:      "02",
    step2_title:    "Chat with Kasi Coach",
    step2_body:     "Answer a few quick questions. Kasi Coach writes your bio, services, and action plan.",
    step3_num:      "03",
    step3_title:    "Go live",
    step3_body:     "Hit publish. Get your own link. Share on WhatsApp and get your first booking.",

    // Sample profiles
    profiles_label: "Already live",
    profiles_title: "Young entrepreneurs near you",
    profiles_sub:   "Real businesses, built in 10 minutes.",

    // Profile cards (mock)
    profile1_name:  "Sipho's Sneaker Cleaning",
    profile1_wijk:  "Khayelitsha",
    profile1_tag:   "Services",
    profile1_bio:   "Professional sneaker cleaning from R30. WhatsApp to book.",

    profile2_name:  "Amara's Braiding",
    profile2_wijk:  "Soweto",
    profile2_tag:   "Beauty",
    profile2_bio:   "Natural braiding styles. Home visits available weekends.",

    profile3_name:  "Thabo's Phone Repair",
    profile3_wijk:  "Mitchells Plain",
    profile3_tag:   "Tech",
    profile3_bio:   "Screen replacements from R150. Same-day service.",

    // CTA section
    cta_label:      "Free. Always.",
    cta_title:      "Your business starts here.",
    cta_sub:        "No registration fees. No monthly costs. Just your hustle.",
    cta_btn:        "Build my profile",

    // Footer
    footer_made:    "Made in SA",
    footer_tagline: "Helping young entrepreneurs build real businesses.",

    // Misc
    whatsapp_btn:   "Message",
    view_profile:   "View profile",
    start:          "Start",
    lang_label:     "Language",
  },

  sa: {
    // Nav
    nav_wordmark: "Superpower Hub",

    // Hero
    hero_pre:       "Vir jong entrepreneurs",
    hero_line1:     "Bou jou",
    hero_line2:     "besigheid.",
    hero_line3:     "Vandag.",
    hero_sub:       "Kry jou gratis besigheidsplan in 10 minute. Geen ondervinding nodig nie.",
    hero_cta:       "Begin nou",

    // Path cards
    path_a_label:   "Ek het 'n idee",
    path_a_sub:     "Vertel ons oor jou idee en ons bou dit saam",
    path_b_label:   "Kies uit 50 idees",
    path_b_sub:     "Browse ons biblioteek van gratis besigheidsidees",
    path_c_label:   "Help my kies",
    path_c_sub:     "Doen 'n vinnige toets en ons koppel jou aan die beste idee",

    // How it works
    how_label:      "Hoe dit werk",
    how_title:      "Van idee na live in\u00a010 minute",
    step1_num:      "01",
    step1_title:    "Kies jou pad",
    step1_body:     "Kies 'n idee, browse 50 opsies, of laat die toets jou koppel aan jou beste keuse.",
    step2_num:      "02",
    step2_title:    "Praat met Kasi Coach",
    step2_body:     "Beantwoord 'n paar vinnige vrae. Kasi Coach skryf jou bio, dienste en aksieplan.",
    step3_num:      "03",
    step3_title:    "Gaan live",
    step3_body:     "Druk publiseer. Kry jou eie skakel. Deel op WhatsApp en kry jou eerste boeking.",

    // Sample profiles
    profiles_label: "Al live",
    profiles_title: "Jong entrepreneurs naby jou",
    profiles_sub:   "Regte besighede, gebou in 10 minute.",

    // Profile cards (mock)
    profile1_name:  "Sipho se Sneaker Cleaning",
    profile1_wijk:  "Khayelitsha",
    profile1_tag:   "Dienste",
    profile1_bio:   "Professionele sneaker-reiniging vanaf R30. WhatsApp om te bespreek.",

    profile2_name:  "Amara se Braiding",
    profile2_wijk:  "Soweto",
    profile2_tag:   "Skoonheid",
    profile2_bio:   "Natuurlike vlegrystyle. Tuisbesoeke beskikbaar naweke.",

    profile3_name:  "Thabo se Foonherstel",
    profile3_wijk:  "Mitchells Plain",
    profile3_tag:   "Tegnologie",
    profile3_bio:   "Skerms vervang vanaf R150. Selfde-dag diens.",

    // CTA section
    cta_label:      "Gratis. Altyd.",
    cta_title:      "Jou besigheid begin hier.",
    cta_sub:        "Geen registrasiegelde nie. Geen maandelikse koste nie. Net jou dryfkrag.",
    cta_btn:        "Bou my profiel",

    // Footer
    footer_made:    "Gemaak in SA",
    footer_tagline: "Help jong entrepreneurs regte besighede bou.",

    // Misc
    whatsapp_btn:   "Stuur boodskap",
    view_profile:   "Sien profiel",
    start:          "Begin",
    lang_label:     "Taal",
  },
} as const satisfies Record<Lang, Record<string, string>>;

export type LangKeys = keyof (typeof LANG)["en"];
