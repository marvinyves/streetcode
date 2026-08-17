import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { getSupabaseClient } from "@/lib/supabase/client";
import { getRecentBriefs } from "@/lib/briefs";

export const runtime = "nodejs";

const MODEL = "claude-haiku-4-5-20251001";
const MAX_QUESTION_LENGTH = 280;
const MAX_TOKENS = 400;
const RATE_LIMIT_PER_DAY = 10;

function getClientIp(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

async function checkAndIncrementRateLimit(ip: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: existing } = await supabase
    .from("ask_rate_limits")
    .select("id, request_count")
    .eq("ip_address", ip)
    .eq("day", today)
    .maybeSingle();

  if (!existing) {
    await supabase
      .from("ask_rate_limits")
      .insert({ ip_address: ip, day: today, request_count: 1 });
    return true;
  }

  if (existing.request_count >= RATE_LIMIT_PER_DAY) {
    return false;
  }

  await supabase
    .from("ask_rate_limits")
    .update({
      request_count: existing.request_count + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", existing.id);

  return true;
}

function buildSystemPrompt(locale: "en" | "sv", context: string) {
  if (locale === "sv") {
    return `Du är en assistent för en marknadsuppdateringswebbplats. Svara ENDAST utifrån marknadsuppdateringarna nedan. Om svaret inte finns däri, säg det tydligt istället för att gissa eller använda extern kunskap. Svara kort och konkret, på svenska.\n\n${context}`;
  }
  return `You are an assistant for a daily market brief website. Answer ONLY using the market briefs provided below. If the answer isn't covered by them, say so clearly rather than guessing or using outside knowledge. Keep answers short and concrete.\n\n${context}`;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response("Search is not configured.", { status: 500 });
  }

  const body = await req.json().catch(() => null);
  const question =
    typeof body?.question === "string" ? body.question.trim() : "";
  const locale: "en" | "sv" = body?.locale === "sv" ? "sv" : "en";

  if (!question || question.length > MAX_QUESTION_LENGTH) {
    return new Response("Invalid question.", { status: 400 });
  }

  const ip = getClientIp(req);
  const allowed = await checkAndIncrementRateLimit(ip);
  if (!allowed) {
    return new Response("Rate limit exceeded.", { status: 429 });
  }

  const briefs = await getRecentBriefs(5);
  if (briefs.length === 0) {
    return new Response(
      locale === "sv"
        ? "Inga marknadsuppdateringar är publicerade än."
        : "No briefs have been published yet.",
      { status: 200 },
    );
  }

  const context = briefs
    .map((b) => {
      const text = locale === "sv" && b.brief_sv ? b.brief_sv : b.brief_en;
      const overnight =
        locale === "sv" && b.overnight_sv ? b.overnight_sv : b.overnight_en;
      const lookingAheadItems =
        locale === "sv" && b.looking_ahead_sv.length > 0
          ? b.looking_ahead_sv
          : b.looking_ahead;
      const lookingAhead = lookingAheadItems
        .map((item) => `- ${item.label}${item.detail ? `: ${item.detail}` : ""}`)
        .join("\n");

      const parts = [`### ${b.date}`];
      if (overnight) parts.push(`Overnight & premarket:\n${overnight}`);
      parts.push(text);
      if (lookingAhead) parts.push(`Looking ahead:\n${lookingAhead}`);
      return parts.join("\n\n");
    })
    .join("\n\n");

  const anthropic = new Anthropic({ apiKey });
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const anthropicStream = anthropic.messages.stream({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          system: buildSystemPrompt(locale, context),
          messages: [{ role: "user", content: question }],
        });

        for await (const event of anthropicStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
