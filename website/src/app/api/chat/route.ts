// ── Kasi Coach streaming API route ──────────────────────────────────────────
import { streamText, tool, zodSchema } from "ai";
import type { ModelMessage } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { buildSystemPrompt } from "@/lib/system-prompt";
import type { ProfileData } from "@/lib/types";
import type { Lang } from "@/lib/i18n";

export const runtime = "edge";

// Manually convert UIMessages to ModelMessages — avoids issues with
// convertToModelMessages choking on incomplete tool invocations.
function toModelMessages(rawMessages: Record<string, unknown>[]): ModelMessage[] {
  const result: ModelMessage[] = [];

  for (const msg of rawMessages) {
    const role = msg.role as string;
    const parts = (msg.parts || []) as { type: string; text?: string; toolInvocation?: Record<string, unknown>; toolName?: string; args?: Record<string, unknown> }[];

    // Extract text content
    const textParts = parts
      .filter(p => p.type === "text" && p.text?.trim())
      .map(p => p.text!.trim());

    // For assistant messages: also summarize tool calls so the model knows what it did
    if (role === "assistant") {
      const toolSummaries: string[] = [];
      for (const p of parts) {
        // AI SDK v6: tool parts are typed as "tool-{toolName}" (e.g. "tool-updateProfile")
        // Also support legacy "tool-invocation" format from older localStorage data
        const isToolPart = p.type === "tool-invocation" || (p.type.startsWith("tool-") && p.type !== "text");
        if (isToolPart) {
          // Extract tool name: from the type (v6) or from nested properties (legacy)
          const inv = p.toolInvocation || p;
          const name = p.type.startsWith("tool-") && p.type !== "tool-invocation"
            ? p.type.replace("tool-", "")
            : (inv.toolName || (inv as Record<string,unknown>).toolCallId || "tool") as string;
          const args = inv.args || (p as Record<string, unknown>).args || {};
          if (name === "updateProfile") toolSummaries.push(`[Saved ${(args as Record<string,string>).field}]`);
          else if (name === "updateServices") toolSummaries.push("[Saved services]");
          else if (name === "updateTargetCustomers") toolSummaries.push("[Saved target customers]");
          else if (name === "updateStartingCosts") toolSummaries.push("[Saved starting costs]");
          else if (name === "updateMarketing") toolSummaries.push("[Saved marketing plan]");
          else if (name === "generateProfile") toolSummaries.push("[Generated tagline and plan]");
          else if (name === "suggestNextStep") {}
          else if (name === "requestWidget") {}
        }
      }

      const content = [...textParts, ...toolSummaries].join("\n");
      if (!content) continue;

      const last = result[result.length - 1];
      if (last && last.role === "assistant") {
        last.content = (last.content as string) + "\n" + content;
      } else {
        result.push({ role: "assistant", content });
      }
    } else if (role === "user") {
      if (textParts.length === 0) continue;
      const content = textParts.join("\n");
      const last = result[result.length - 1];
      if (last && last.role === "user") {
        last.content = (last.content as string) + "\n" + content;
      } else {
        result.push({ role: "user", content });
      }
    }
  }

  return result;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      messages: rawMessages,
      lang = "en",
      idea = "",
      ideaDescription = "",
      currentProfile,
      path = "b",
      returningUser = false,
      lastVisit,
    } = body as {
      messages: Record<string, unknown>[];
      lang: Lang;
      idea: string;
      ideaDescription: string;
      currentProfile: ProfileData;
      path: "a" | "b" | "c";
      returningUser: boolean;
      lastVisit?: string;
    };

    const messages = toModelMessages(rawMessages || []);

    const systemPrompt = buildSystemPrompt({
      lang,
      idea,
      ideaDescription,
      currentProfile: currentProfile || {
        idea: null, name: "", wijk: "", services: [], bio: "", plan: [],
        photoUrl: null, tagline: "", story: "", availability: "", promise: "", slug: "",
        problem: "", targetCustomers: [], marketing: { hook: "", platform: "", wordOfMouth: "" },
        startingCosts: { items: [], total: "" }, mvp: "",
      },
      path,
      returningUser,
      lastVisit,
    });

    const result = streamText({
      model: anthropic("claude-haiku-4-5-20251001"),
      system: systemPrompt,
      messages,
      maxOutputTokens: 4096,
      tools: {
        updateProfile: tool({
          description: "Update a single profile field. Call this when the user provides info for a specific field.",
          inputSchema: zodSchema(z.object({
            field: z.enum(["name", "wijk", "story", "availability", "promise", "tagline", "bio", "problem", "mvp"]),
            value: z.string().describe("The value for this field"),
          })),
        }),
        updateServices: tool({
          description: "Update the services array with names, prices, and optional descriptions.",
          inputSchema: zodSchema(z.object({
            services: z.array(z.object({
              name: z.string(),
              price: z.string(),
              description: z.string().optional(),
            })).min(1).max(10),
          })),
        }),
        updateTargetCustomers: tool({
          description: "Update the target customers list. Call when the user describes who their customers are.",
          inputSchema: zodSchema(z.object({
            customers: z.array(z.string()).min(1).max(5).describe("List of target customer types"),
          })),
        }),
        updateStartingCosts: tool({
          description: "Update the starting costs breakdown. Call when the user describes what they need to buy to start.",
          inputSchema: zodSchema(z.object({
            items: z.array(z.object({
              name: z.string().describe("Item name"),
              cost: z.string().describe("Cost in Rands, e.g. R30"),
            })).min(1).max(10),
            total: z.string().describe("Total starting cost, e.g. R110"),
          })),
        }),
        updateMarketing: tool({
          description: "Update the marketing & sales plan. Call when the user describes how they will get customers.",
          inputSchema: zodSchema(z.object({
            hook: z.string().describe("Their marketing hook or pitch line"),
            platform: z.string().describe("Main platform they will use (e.g. WhatsApp, Instagram)"),
            wordOfMouth: z.string().describe("Their word-of-mouth strategy"),
          })),
        }),
        generateProfile: tool({
          description: "Generate the final tagline and first-week action plan. Call ONLY after all 9 business plan sections are complete. Do NOT overwrite existing fields — this only sets tagline and plan.",
          inputSchema: zodSchema(z.object({
            tagline: z.string().describe("A catchy, short tagline for their business"),
            plan: z.array(z.string()).min(3).max(5).describe("5 concrete action steps for the first week"),
          })),
        }),
        requestWidget: tool({
          description: "Request the UI to show a rich input widget for structured data collection.",
          inputSchema: zodSchema(z.object({
            type: z.enum(["township", "services", "availability", "promise"]),
          })),
        }),
        suggestNextStep: tool({
          description: "Show suggestion chips to guide the user. Call this alongside your text response — always pair chips with a text message.",
          inputSchema: zodSchema(z.object({
            suggestions: z.array(z.object({
              label: z.string().describe("Button label (short, 2-5 words)"),
              prompt: z.string().describe("Message sent when user clicks this"),
            })).min(1).max(3),
          })),
        }),
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
