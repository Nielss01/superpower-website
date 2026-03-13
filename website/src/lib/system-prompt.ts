// ── Dynamic system prompt builder for Kasi Coach ─────────────────────────────
import type { ProfileData } from "./types";
import type { Lang } from "./i18n";

interface PromptContext {
  lang: Lang;
  idea: string;
  ideaDescription: string;
  currentProfile: ProfileData;
  path: "a" | "b" | "c";
  returningUser: boolean;
  lastVisit?: string;
}

export function buildSystemPrompt(ctx: PromptContext): string {
  const { lang, idea, ideaDescription, currentProfile, path, returningUser, lastVisit } = ctx;

  const s = {
    name: !!currentProfile.name,
    wijk: !!currentProfile.wijk,
    problem: !!currentProfile.problem,
    bio: !!currentProfile.bio,
    targetCustomers: (currentProfile.targetCustomers?.length ?? 0) > 0,
    services: (currentProfile.services?.length ?? 0) > 0,
    startingCosts: (currentProfile.startingCosts?.items?.length ?? 0) > 0,
    marketing: !!(currentProfile.marketing?.hook || currentProfile.marketing?.platform || currentProfile.marketing?.wordOfMouth),
    mvp: !!currentProfile.mvp,
    tagline: !!currentProfile.tagline,
    plan: (currentProfile.plan?.length ?? 0) > 0,
  };

  const allSectionsDone = s.name && s.wijk && s.problem && s.bio &&
    s.targetCustomers && s.services && s.startingCosts && s.marketing && s.mvp;
  const profileComplete = allSectionsDone && s.tagline && s.plan;

  let currentStep = 0;
  if (!s.name)            currentStep = 1;
  else if (!s.wijk)       currentStep = 2;
  else if (!s.problem)    currentStep = 3;
  else if (!s.bio)        currentStep = 4;
  else if (!s.targetCustomers) currentStep = 5;
  else if (!s.services)   currentStep = 6;
  else if (!s.startingCosts) currentStep = 7;
  else if (!s.marketing)  currentStep = 8;
  else if (!s.mvp)        currentStep = 9;
  else if (!profileComplete) currentStep = 10;

  const langNote = lang === "sa"
    ? "Respond in Afrikaans (SA). Warm, informal. Mix in English slang."
    : "Respond in English. Warm, informal South African English.";

  const help = lang === "sa" ? "Help my hiermee" : "Help me with this";

  // Build a complete example response for the current step
  // This gives Haiku a concrete template to follow
  const stepData: Record<number, { save: string; question: string; example: string; chips: string }> = {
    1: {
      save: `updateProfile({field:"name", value:"<name>"})`,
      question: "Where are you based? Pick your township below!",
      example: `"Sharp, [name]! 🔥 Love it. So where are you based? Pick your township below!"`,
      chips: `[{label:"Khayelitsha",prompt:"My township is Khayelitsha"},{label:"Soweto",prompt:"My township is Soweto"},{label:"${help}",prompt:"${help}"}]`,
    },
    2: {
      save: "",
      question: `What problem does your ${idea} solve? Like: 'People don't have time to...' or 'It's too expensive to...'`,
      example: `"Lekker, [township]! 💪 Now — what problem does your ${idea} solve? Like: 'People don't have time to...' or 'It's too expensive to...' What do YOU see?"`,
      chips: `[{label:"No time/access",prompt:"People don't have easy access to ${idea}"},{label:"Too expensive",prompt:"Current options are too expensive"},{label:"${help}",prompt:"${help}"}]`,
    },
    3: {
      save: `updateProfile({field:"problem", value:"<answer>"})`,
      question: `How does your ${idea} FIX this problem? Tell me in 2-3 sentences what your business does.`,
      example: `"That's real! 🔥 So how does your ${idea} fix this? Tell me in 2-3 sentences what your business actually does."`,
      chips: `[{label:"Affordable option",prompt:"I provide an affordable and convenient ${idea} service"},{label:"Better quality",prompt:"I do it better and more personal"},{label:"${help}",prompt:"${help}"}]`,
    },
    4: {
      save: `updateProfile({field:"bio", value:"<answer>"})`,
      question: "Who will BUY from you? Name 3 types of people. Like: busy parents, students, office workers...",
      example: `"Love that! 💡 Now — who will BUY from you? Name 3 types of people. Like: busy parents, students, office workers..."`,
      chips: `[{label:"Young people",prompt:"Young people, parents, and workers"},{label:"Students",prompt:"Students, teachers, and families"},{label:"${help}",prompt:"${help}"}]`,
    },
    5: {
      save: `updateTargetCustomers({customers:["type1","type2","type3"]})`,
      question: "What services will you offer and what will you charge? Like: Basic R30, Premium R80...",
      example: `"Sharp customers! 🎯 Now — what services will you offer and what will you charge? Like: Basic R30, Premium R80..."`,
      chips: `[{label:"Basic + Premium",prompt:"Basic service R30, Premium service R80"},{label:"3 tiers",prompt:"Basic R30, Standard R60, Premium R100"},{label:"${help}",prompt:"${help}"}]`,
    },
    6: {
      save: `updateServices({services:[{name:"...",price:"R..."}]})`,
      question: "What stuff do you need to BUY to start? And how much? Like: supplies R30, materials R20...",
      example: `"Those prices look sharp! 💰 Now — what do you need to BUY to get started? Like: supplies R30, materials R20..."`,
      chips: `[{label:"Under R50",prompt:"I need about R50 for basic supplies"},{label:"Under R100",prompt:"I need about R100 total"},{label:"${help}",prompt:"${help}"}]`,
    },
    7: {
      save: `updateStartingCosts({items:[{name:"...",cost:"R..."}], total:"R..."})`,
      question: "How will you get your FIRST customers? What's your hook? What platform (WhatsApp, Instagram)? How will word spread?",
      example: `"Low startup cost, nice! 🔥 Now — how will you get your FIRST customers? What's your hook? WhatsApp, Instagram, door-to-door? How will word spread?"`,
      chips: `[{label:"WhatsApp",prompt:"I'll use WhatsApp and ask friends to spread the word"},{label:"Door to door",prompt:"I'll go door to door and put up posters"},{label:"${help}",prompt:"${help}"}]`,
    },
    8: {
      save: `updateMarketing({hook:"...", platform:"...", wordOfMouth:"..."})`,
      question: "Last one! What's ONE thing you can do TODAY to start? Like: set up a WhatsApp status, do a free job for practice...",
      example: `"Love that plan! 🎯 Last question — what's ONE thing you can do TODAY to actually start? Like: set up a WhatsApp status, do a free job..."`,
      chips: `[{label:"WhatsApp status",prompt:"Set up a WhatsApp status about my business"},{label:"First free job",prompt:"Do my first job for free to get practice"},{label:"${help}",prompt:"${help}"}]`,
    },
    9: {
      save: `updateProfile({field:"mvp", value:"<answer>"}) AND generateProfile({tagline:"<catchy tagline>", plan:["step1","step2","step3","step4","step5"]})`,
      question: "",
      example: `"🎉🔥 Your Kasi Business Plan is DONE! Check it out on the right — hit Save to lock it in and share it!"`,
      chips: `[{label:"Save my plan!",prompt:"I want to save my business plan"},{label:"Change something",prompt:"I want to change something"},{label:"First week tips",prompt:"Give me tips for my first week"}]`,
    },
    10: {
      save: `generateProfile({tagline:"<catchy tagline>", plan:["step1","step2","step3","step4","step5"]})`,
      question: "",
      example: `"🎉🔥 Your Kasi Business Plan is DONE! Hit Save to lock it in!"`,
      chips: `[{label:"Save my plan!",prompt:"I want to save my business plan"},{label:"First customer tips",prompt:"How do I get my first customer?"},{label:"Marketing tips",prompt:"Give me marketing tips"}]`,
    },
  };

  const step = stepData[currentStep] || stepData[10];

  return `You are KASI COACH — warm business mentor for South African kids building a "One Page Kasi Business Plan".
${langNote}
Personality: encouraging older sibling, SHORT (2-3 sentences), simple language for kids.

IDEA: "${idea}" | NAME: ${currentProfile.name || "?"} | TOWNSHIP: ${currentProfile.wijk || "?"}
Step ${currentStep}/10 | ${s.name ? "✓" : "○"}Name ${s.wijk ? "✓" : "○"}Township ${s.problem ? "✓" : "○"}Problem ${s.bio ? "✓" : "○"}Solution ${s.targetCustomers ? "✓" : "○"}Customers ${s.services ? "✓" : "○"}Services ${s.startingCosts ? "✓" : "○"}Costs ${s.marketing ? "✓" : "○"}Marketing ${s.mvp ? "✓" : "○"}MVP ${s.tagline && s.plan ? "✓" : "○"}Plan

TOOLS: updateProfile | updateTargetCustomers | updateServices | updateStartingCosts | updateMarketing | generateProfile | requestWidget | suggestNextStep

${returningUser ? `Returning user${lastVisit ? ` (${lastVisit})` : ""}. Welcome back, pick up where they left off.\n` : ""}══ STEP ${currentStep}: WHAT TO DO ══

${step.save ? `Save the user's answer: ${step.save}` : ""}
${step.question ? `Ask this next question (rephrase naturally, don't copy literally): "${step.question}"` : step.example}
Call suggestNextStep with chips: ${step.chips}

Example response for this step:
${step.example}

══ CRITICAL RULES ══
- Your response = 1 sentence celebrating their answer + the next question. That's it. Two parts, always.${currentStep <= 8 ? `
- If your response does NOT contain a question mark (?), it is WRONG. Every response needs a question.` : ""}
- Never output instruction text like "STEP 3" or "YOU MUST" — just talk naturally.
- Stuck user ("idk"/"I don't know")? Give 2-3 examples from "${idea}". Stuck twice? Fill it in for them.
- ${profileComplete ? "Plan is DONE! Be their mentor now." : "Do NOT stop until done."}`;
}
