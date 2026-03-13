// ── Fallback: deterministic mock coach content ───────────────────────────────
// Used when NEXT_PUBLIC_USE_LLM is not "true" or when LLM errors out.
import type { Service } from "./types";
import type { Idea } from "./ideas";
import type { Lang } from "./i18n";

export function generateCoachContent(idea: Idea, name: string, wijk: string, lang: Lang) {
  const n = name || "You";
  const biz = lang === "sa" ? idea.nameSA : idea.name;

  const bio = lang === "sa"
    ? `Hallo! My naam is ${n} van ${wijk}. Ek bied ${biz.toLowerCase()} aan wat kwaliteit en betroubaarheid kombineer. Kontak my op WhatsApp om te bespreek!`
    : `Hi! I'm ${n} from ${wijk}. I offer ${biz.toLowerCase()} that combines quality and reliability. Hit me up on WhatsApp to book!`;

  const plan = lang === "sa"
    ? [
        `Maak 'n WhatsApp Business-profiel met jou ${biz.toLowerCase()} dienste en pryse`,
        `Deel jou profiel in 3 plaaslike ${wijk} WhatsApp-groepe en vra jou eerste klant`,
        `Lewer jou eerste diens en vra vir 'n review om jou reputasie te bou`,
      ]
    : [
        `Set up a WhatsApp Business profile with your ${biz.toLowerCase()} services and prices`,
        `Share your profile in 3 local ${wijk} WhatsApp groups and ask for your first client`,
        `Deliver your first service and ask for a review to build your reputation`,
      ];

  const services: Service[] = lang === "sa"
    ? [
        { name: `Basiese ${biz}`, price: "R50", description: `Standaard ${biz.toLowerCase()} diens — vinnig en betroubaar` },
        { name: `Premium ${biz}`, price: "R120", description: `Volledige ${biz.toLowerCase()} met ekstra aandag aan detail` },
        { name: `Spesiale pakket`, price: "R200", description: `Alles ingesluit — perfek vir gereelde klante` },
      ]
    : [
        { name: `Basic ${biz}`, price: "R50", description: `Standard ${biz.toLowerCase()} service — fast and reliable` },
        { name: `Premium ${biz}`, price: "R120", description: `Full ${biz.toLowerCase()} with extra attention to detail` },
        { name: `Special package`, price: "R200", description: `Everything included — perfect for regular clients` },
      ];

  const tagline = lang === "sa"
    ? `${biz} in ${wijk} — kwaliteit wat jy kan vertrou`
    : `${biz} in ${wijk} — quality you can trust`;

  const problem = lang === "sa"
    ? `Mense in ${wijk} het nie maklike toegang tot bekostigbare ${biz.toLowerCase()} nie.`
    : `People in ${wijk} don't have easy access to affordable ${biz.toLowerCase()}.`;

  const targetCustomers = lang === "sa"
    ? ["Plaaslike inwoners", "Studente", "Klein besighede"]
    : ["Local residents", "Students", "Small businesses"];

  const marketing = {
    hook: lang === "sa"
      ? `Bekostigbare ${biz.toLowerCase()} reg by jou voordeur!`
      : `Affordable ${biz.toLowerCase()} right at your doorstep!`,
    platform: "WhatsApp",
    wordOfMouth: lang === "sa"
      ? "Vra elke klant om jou aan 2 vriende voor te stel"
      : "Ask every customer to refer you to 2 friends",
  };

  const startingCosts = {
    items: lang === "sa"
      ? [{ name: "Basiese voorrade", cost: "R50" }, { name: "Advertensie", cost: "R0" }]
      : [{ name: "Basic supplies", cost: "R50" }, { name: "Advertising", cost: "R0" }],
    total: "R50",
  };

  const mvp = lang === "sa"
    ? `Bied vandag jou eerste ${biz.toLowerCase()} diens aan vir iemand wat jy ken — gratis of teen kosprys.`
    : `Offer your first ${biz.toLowerCase()} service today to someone you know — free or at cost.`;

  return { bio, plan, services, tagline, problem, targetCustomers, marketing, startingCosts, mvp };
}
