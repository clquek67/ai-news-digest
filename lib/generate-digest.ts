import Anthropic from "@anthropic-ai/sdk";

export interface DigestItem {
  headline: string;
  summary: string;
  impact: string;
  suggested_take: string;
  source_url: string;
  source_name: string;
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Tune this to your actual focus areas. This is the main lever for relevance.
const FOCUS_AREAS = `
- Infrastructure operations, IT ops automation, and enterprise AI tooling (relevant to a large-scale infra ops role)
- AI tools and platforms useful for solo founders / one-person businesses (automation, content, AI agents)
- Major model releases, API/platform changes from Anthropic, OpenAI, Google, Meta, etc.
- AI regulation, export controls, or policy shifts with business impact
- Notable AI industry funding, acquisitions, or shutdowns that signal market direction
`;

export async function generateDigest(): Promise<DigestItem[]> {
  const systemPrompt = `You are a sharp AI industry analyst producing a digest for a technical founder and infrastructure operations lead. He cares about news that actually changes what he should build, use, or watch — not routine announcements.

Your job:
1. Search the web for AI industry news from the last 3-4 days.
2. Filter aggressively. Only keep stories that represent a real, material change (new capability, pricing/access change, policy shift, market signal) — not minor blog posts or opinion pieces.
3. Prioritize relevance to these focus areas:
${FOCUS_AREAS}
4. Select the TOP 5 stories, ranked by actual impact.
5. For each, write:
   - headline: short, specific, no clickbait
   - summary: 2-3 sentences, factual, no fluff
   - impact: 2-3 sentences on why this matters and who it affects
   - suggested_take: a brief, opinionated angle a sharp operator might have on this — clearly a draft take for him to edit, not a neutral summary
   - source_url: the direct article URL
   - source_name: publication name

Respond with ONLY a raw JSON array of exactly 5 objects with keys: headline, summary, impact, suggested_take, source_url, source_name. No markdown fences, no preamble, no commentary.`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 4000,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: "Find and rank this cycle's top 5 AI industry news items.",
      },
    ],
    tools: [
      {
        type: "web_search_20250305",
        name: "web_search",
      } as any,
    ],
  });

  // Collect only the text blocks (web_search tool results are separate block types)
  const textBlocks = response.content
    .filter((b: any) => b.type === "text")
    .map((b: any) => b.text)
    .join("\n");

  const cleaned = textBlocks.replace(/```json|```/g, "").trim();

  let items: DigestItem[];
  try {
    items = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(
      `Failed to parse digest JSON from Claude response: ${err}\nRaw: ${cleaned.slice(0, 500)}`
    );
  }

  return items;
}
