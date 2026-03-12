// ── Township / Wijk data ─────────────────────────────────────────────────────
// Structured list — NOT free text. Grouped by region for the dropdown.

export interface WijkGroup {
  region: string;
  regionSA: string;
  townships: string[];
}

export const WIJK_GROUPS: WijkGroup[] = [
  {
    region: "Cape Town",
    regionSA: "Kaapstad",
    townships: ["Khayelitsha", "Mitchells Plain", "Gugulethu", "Langa", "Delft", "Nyanga", "Manenberg", "Athlone", "Bishop Lavis", "Hanover Park"],
  },
  {
    region: "Johannesburg",
    regionSA: "Johannesburg",
    townships: ["Soweto", "Alexandra", "Diepsloot", "Tembisa", "Kagiso", "Thokoza", "Kathlehong", "Orange Farm"],
  },
  {
    region: "Pretoria",
    regionSA: "Pretoria",
    townships: ["Mamelodi", "Soshanguve", "Atteridgeville", "Mabopane"],
  },
  {
    region: "Eastern Cape",
    regionSA: "Oos-Kaap",
    townships: ["Mdantsane", "KwaZakele", "New Brighton", "Motherwell"],
  },
  {
    region: "KwaZulu-Natal",
    regionSA: "KwaZulu-Natal",
    townships: ["Umlazi", "KwaMashu", "Inanda", "Ntuzuma"],
  },
];

export const ALL_TOWNSHIPS = WIJK_GROUPS.flatMap((g) => g.townships);
