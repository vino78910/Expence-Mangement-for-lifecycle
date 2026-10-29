import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

const SYSTEM_PROMPT = `You are a friendly money-saving coach for a person who tracks daily expenses in Indian Rupees (INR).
Based on the spending summary provided by the user, write exactly 4 short, practical and personalized savings tips.
Rules:
- Each tip must be 1 to 2 sentences in simple, easy English.
- Each tip must be actionable and refer to the person's real spending pattern when possible (mention the category or amount).
- Do not use emojis. Do not use markdown formatting.
- Respond with valid JSON only, no extra text, in exactly this shape: {"tips": ["tip 1", "tip 2", "tip 3", "tip 4"]}`;

const FALLBACK_TIPS = [
  "Set a fixed weekly cash limit for Eating Out and Hobbies so small spends stay under control.",
  "Review your top category this month and try to reduce it by 10-15% next month.",
  "Use UPI apps that show monthly spending reports to spot habits quickly.",
  "Before any non-essential purchase above 500, wait 24 hours - most impulse buys fade away.",
];

function parseTips(raw: string): string[] | null {
  if (!raw) return null;
  let text = raw.trim();
  // Strip markdown code fences if present
  text = text.replace(/```(?:json)?/gi, "").trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    const parsed = JSON.parse(text.slice(start, end + 1));
    const tips = parsed?.tips;
    if (Array.isArray(tips)) {
      const cleaned = tips
        .map((t: unknown) => String(t).trim())
        .filter((t: string) => t.length > 0)
        .slice(0, 5);
      if (cleaned.length > 0) return cleaned;
    }
  } catch {
    return null;
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const summary = body?.summary ?? {};

    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        { role: "assistant", content: SYSTEM_PROMPT },
        { role: "user", content: JSON.stringify(summary) },
      ],
      thinking: { type: "disabled" },
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    const tips = parseTips(raw);

    if (tips) {
      return NextResponse.json({ tips, source: "ai" });
    }
    return NextResponse.json({ tips: FALLBACK_TIPS, source: "fallback" });
  } catch (error) {
    console.error("POST /api/tips failed:", error);
    return NextResponse.json({ tips: FALLBACK_TIPS, source: "fallback" });
  }
}
