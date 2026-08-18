import { config } from "dotenv";
config({ path: ".env.local" });

import { getLatestBrief } from "@/lib/briefs";
import { getEarningsForWeek } from "@/lib/calendar";
import { formatBriefDate, formatShortDate } from "@/lib/format-date";
import {
  anticipatedEarningsByDate,
  groupByTimeSlot,
  type TieredEarningsEvent,
  type TimeSlot,
} from "@/lib/earnings";
import { fetchRedditSentiment } from "@/lib/pipeline/sources/reddit";
import { normalizeBulletText } from "@/lib/normalize-bullets";
import { sendWhatsAppBrief } from "@/lib/pipeline/whatsapp";

const MAX_BODY_LEN = 4000; // WhatsApp/Twilio body limit is 4096 chars; leave headroom.

/** WhatsApp doesn't render markdown lists — swap "- " bullets for a plain unicode bullet. */
function formatBulletsForPlainText(text: string): string {
  return normalizeBulletText(text)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => (line.startsWith("- ") ? `• ${line.slice(2)}` : line))
    .join("\n");
}

const SLOT_LABEL: Record<TimeSlot, string> = {
  bmo: "Before open",
  amc: "After close",
  unspecified: "Time TBD",
};
const SLOT_ORDER: TimeSlot[] = ["bmo", "amc", "unspecified"];

function formatTicker(item: TieredEarningsEvent): string {
  return item.tier === "large-cap" ? `${item.symbol} (${item.name})` : `🔥${item.symbol}`;
}

function formatEarningsSection(byDate: Map<string, TieredEarningsEvent[]>): string {
  const prominentByDate = Array.from(byDate.entries())
    .map(([date, items]) => [date, items.filter((i) => i.tier !== "other")] as const)
    .filter(([, items]) => items.length > 0);
  if (prominentByDate.length === 0) return "";

  const lines = ["📅 *This Week's Earnings*"];
  for (const [date, items] of prominentByDate) {
    const dateLabel = formatShortDate(date, "en");
    lines.push(`${dateLabel}:`);
    const slots = groupByTimeSlot(items);
    for (const slot of SLOT_ORDER) {
      if (slots[slot].length === 0) continue;
      lines.push(`  ${SLOT_LABEL[slot]}: ${slots[slot].map(formatTicker).join(", ")}`);
    }
  }
  return lines.join("\n");
}

async function main() {
  const brief = await getLatestBrief();
  if (!brief) {
    console.log("No brief found — nothing to send.");
    return;
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://example.com").replace(/\/$/, "");
  const dateLabel = formatBriefDate(brief.date, "en");
  const footer = `Full brief: ${siteUrl}/en`;

  const [weekEarnings, redditPosts] = await Promise.all([
    getEarningsForWeek(),
    fetchRedditSentiment(),
  ]);
  const earningsSection = formatEarningsSection(
    anticipatedEarningsByDate(weekEarnings, redditPosts),
  );

  const sections = [
    `📈 *Streetcode — Market Brief*`,
    dateLabel,
    "",
    `*Market Updates*`,
    formatBulletsForPlainText(brief.brief_en),
  ];
  if (earningsSection) sections.push("", earningsSection);

  let message = [...sections, "", footer].join("\n");

  if (message.length > MAX_BODY_LEN) {
    const budget = MAX_BODY_LEN - footer.length - 10;
    const body = [...sections].join("\n");
    message = `${body.slice(0, budget).trimEnd()}…\n\n${footer}`;
    console.warn(`Message was ${sections.join("\n").length} chars over budget — trimmed to fit.`);
  }

  const mediaUrl = `${siteUrl}/api/heatmap-image`;

  console.log(`Sending brief for ${brief.date} (${message.length} chars, image: ${mediaUrl})...`);
  const results = await sendWhatsAppBrief(message, mediaUrl);

  if (results.length === 0) {
    console.log("No recipients configured (WHATSAPP_RECIPIENTS unset) — nothing sent.");
    return;
  }

  for (const r of results) {
    if (r.sid) {
      console.log(`  ✓ ${r.to} — sid ${r.sid}`);
    } else {
      console.log(`  ✗ ${r.to} — ${r.error}`);
    }
  }

  const failed = results.filter((r) => r.error);
  if (failed.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error("WhatsApp send failed:", err);
  process.exit(1);
});
