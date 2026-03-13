"use client";

import { useChat, type UIMessage } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import type { ProfileData, Service, CoachSuggestion } from "@/lib/types";
import { EMPTY_PROFILE } from "@/lib/types";
import type { Lang } from "@/lib/i18n";
import type { Idea } from "@/lib/ideas";

const STORAGE_KEY_CHAT = "sph-chat-history";
const STORAGE_KEY_PROFILE = "sph-profile";

interface UseKasiCoachOptions {
  lang: Lang;
  idea: Idea | null;
  path: "a" | "b" | "c";
  greetingText?: string;
}

function loadChatHistory(): UIMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CHAT);
    if (!raw) return [];
    return JSON.parse(raw) as UIMessage[];
  } catch {
    return [];
  }
}

function loadProfile(): ProfileData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (!raw) return null;
    const saved = JSON.parse(raw) as Partial<ProfileData>;
    // Merge with EMPTY_PROFILE so old localStorage profiles get defaults for new fields
    return { ...EMPTY_PROFILE, ...saved } as ProfileData;
  } catch {
    return null;
  }
}

export function useKasiCoach({ lang, idea, path, greetingText }: UseKasiCoachOptions) {
  const [profile, setProfile] = useState<ProfileData>(() => {
    const saved = loadProfile();
    if (saved) return saved;
    return { ...EMPTY_PROFILE, idea };
  });
  const [suggestions, setSuggestions] = useState<CoachSuggestion[]>([]);
  const [activeWidget, setActiveWidget] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [returningUser, setReturningUser] = useState(false);
  const [lastVisit, setLastVisit] = useState<string | undefined>();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [isInitialized, setIsInitialized] = useState(false);

  // Track profile ref for body callback
  const profileRef = useRef(profile);
  profileRef.current = profile;
  const returningUserRef = useRef(returningUser);
  returningUserRef.current = returningUser;
  const lastVisitRef = useRef(lastVisit);
  lastVisitRef.current = lastVisit;

  // Load chat history on mount
  useEffect(() => {
    const history = loadChatHistory();
    if (history.length > 0) {
      setReturningUser(true);
      try {
        const lv = localStorage.getItem("sph-last-visit");
        if (lv) setLastVisit(lv);
      } catch {}
    }
    try {
      localStorage.setItem("sph-last-visit", new Date().toISOString());
    } catch {}
    setIsInitialized(true);
  }, []);

  // Update profile idea when it changes
  useEffect(() => {
    if (idea && !profile.idea) {
      setProfile(p => ({ ...p, idea }));
    }
  }, [idea, profile.idea]);

  const ideaName = profile.idea
    ? lang === "sa" ? profile.idea.nameSA : profile.idea.name
    : "";

  const ideaDescription = profile.idea
    ? lang === "sa" ? profile.idea.descriptionSA : profile.idea.description
    : "";

  const transport = useMemo(() => new DefaultChatTransport({
    api: "/api/chat",
    body: () => ({
      lang,
      idea: ideaName,
      ideaDescription,
      currentProfile: profileRef.current,
      path,
      returningUser: returningUserRef.current,
      lastVisit: lastVisitRef.current,
    }),
  }), [lang, ideaName, ideaDescription, path]);

  const initialMessages = useMemo(() => {
    const history = loadChatHistory();
    if (history.length > 0) return history;
    // No history — inject the greeting as an assistant message so it shows instantly
    if (greetingText) {
      return [{
        id: "greeting-0",
        role: "assistant" as const,
        parts: [{ type: "text" as const, text: greetingText }],
        createdAt: new Date(),
      }];
    }
    return [];
  }, [greetingText]);

  const chat = useChat({
    transport,
    messages: initialMessages.length > 0 ? initialMessages : undefined,
    onToolCall: async ({ toolCall }) => {
      const { toolName, input } = toolCall as unknown as { toolName: string; input: Record<string, unknown> };

      if (toolName === "updateProfile") {
        const { field, value } = input as { field: string; value: string };
        setProfile(p => ({ ...p, [field]: value }));
      }

      if (toolName === "updateServices") {
        const { services } = input as { services: Service[] };
        setProfile(p => ({ ...p, services }));
      }

      if (toolName === "updateTargetCustomers") {
        const { customers } = input as { customers: string[] };
        setProfile(p => ({ ...p, targetCustomers: customers }));
      }

      if (toolName === "updateStartingCosts") {
        const { items, total } = input as { items: { name: string; cost: string }[]; total: string };
        setProfile(p => ({ ...p, startingCosts: { items, total } }));
      }

      if (toolName === "updateMarketing") {
        const { hook, platform, wordOfMouth } = input as { hook: string; platform: string; wordOfMouth: string };
        setProfile(p => ({ ...p, marketing: { hook, platform, wordOfMouth } }));
      }

      if (toolName === "generateProfile") {
        const { tagline, plan } = input as {
          tagline: string; plan: string[];
        };
        // Only sets tagline + plan — never overwrites existing fields
        setProfile(p => ({
          ...p,
          tagline: tagline || p.tagline,
          plan: plan || p.plan,
        }));
      }

      if (toolName === "requestWidget") {
        const { type } = input as { type: string };
        setActiveWidget(type);
      }

      if (toolName === "suggestNextStep") {
        const { suggestions: s } = input as { suggestions: CoachSuggestion[] };
        setSuggestions(s);
      }
    },
  });

  // Save chat history (debounced 1s)
  useEffect(() => {
    if (chat.messages.length === 0) return;
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY_CHAT, JSON.stringify(chat.messages));
      } catch {}
    }, 1000);
    return () => clearTimeout(saveTimerRef.current);
  }, [chat.messages]);

  // Save profile whenever it changes
  useEffect(() => {
    if (!profile.idea && !profile.name) return;
    try {
      const saveData = {
        ...profile,
        idea: profile.idea ? {
          id: profile.idea.id,
          emoji: profile.idea.emoji,
          name: profile.idea.name,
          nameSA: profile.idea.nameSA,
          category: profile.idea.category,
          earning: profile.idea.earning,
          description: profile.idea.description,
          descriptionSA: profile.idea.descriptionSA,
        } : null,
      };
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(saveData));
    } catch {}
  }, [profile]);

  // Submit widget result as a user message
  const submitWidgetResult = useCallback((type: string, value: string | Service[]) => {
    setActiveWidget(null);
    if (type === "township" && typeof value === "string") {
      setProfile(p => ({ ...p, wijk: value }));
      chat.sendMessage({ text: `My township is ${value}` });
    } else if (type === "services" && Array.isArray(value)) {
      setProfile(p => ({ ...p, services: value }));
      const summary = (value as Service[]).map(s => `${s.name} — ${s.price}`).join(", ");
      chat.sendMessage({ text: `My services: ${summary}` });
    } else if (type === "availability" && typeof value === "string") {
      setProfile(p => ({ ...p, availability: value }));
      chat.sendMessage({ text: `I'm available: ${value}` });
    } else if (type === "promise" && typeof value === "string") {
      setProfile(p => ({ ...p, promise: value }));
      chat.sendMessage({ text: `My promise: ${value}` });
    }
  }, [chat]);

  // Submit suggestion as user message
  const submitSuggestion = useCallback((prompt: string) => {
    setSuggestions([]);
    chat.sendMessage({ text: prompt });
  }, [chat]);

  // Completion percentage — business plan sections
  const completion = (() => {
    let c = 0;
    if (profile.idea) c += 5;
    if (profile.name) c += 10;
    if (profile.wijk) c += 10;
    if (profile.problem) c += 10;
    if (profile.bio) c += 10;
    if (profile.targetCustomers?.length > 0) c += 10;
    if (profile.services.length > 0) c += 10;
    if (profile.startingCosts?.items?.length > 0) c += 10;
    if (profile.marketing?.hook || profile.marketing?.platform || profile.marketing?.wordOfMouth) c += 10;
    if (profile.mvp) c += 10;
    if (profile.tagline) c += 5;
    return Math.min(c, 100);
  })();

  // Save profile and get slug
  const saveAndPublish = useCallback(() => {
    const slug = (profile.name || "my")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      + "-" + (profile.idea?.name || "biz").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 20);
    const finalProfile = { ...profile, slug };
    setProfile(finalProfile);
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify({
        ...finalProfile,
        idea: finalProfile.idea ? {
          id: finalProfile.idea.id,
          emoji: finalProfile.idea.emoji,
          name: finalProfile.idea.name,
          nameSA: finalProfile.idea.nameSA,
          category: finalProfile.idea.category,
          earning: finalProfile.idea.earning,
          description: finalProfile.idea.description,
          descriptionSA: finalProfile.idea.descriptionSA,
        } : null,
      }));
      localStorage.setItem("sph-lang", lang);
    } catch {}
    return slug;
  }, [profile, lang]);

  const clearHistory = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY_CHAT);
      localStorage.removeItem("sph-last-visit");
    } catch {}
  }, []);

  // handleSubmit for the form
  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    chat.sendMessage({ text });
  }, [input, chat]);

  return {
    messages: chat.messages,
    input,
    setInput,
    handleSubmit,
    sendMessage: chat.sendMessage,
    isLoading: chat.status === "streaming" || chat.status === "submitted",
    status: chat.status,

    profile,
    setProfile,
    completion,

    suggestions,
    activeWidget,
    setActiveWidget,
    submitWidgetResult,
    submitSuggestion,
    saveAndPublish,
    clearHistory,

    returningUser,
    isInitialized,
  };
}
