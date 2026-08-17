import { config } from "dotenv";
config({ path: ".env.local" });

import { getLatestBrief } from "@/lib/briefs";
import { formatBriefDate } from "@/lib/format-date";
import { sendWhatsAppBrief } from "@/lib/pipeline/whatsapp";

function firstBullet(text: string): string {
  const line = text.split("\n").find((l) => l.trim());
  return (line ?? "").replace(/^[-•]\s*/, "").trim();
}

async function main() {
  const brief = await getLatestBrief();
  if (!brief) {
    console.log("No brief found — nothing to send.");
    return;
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://example.com").replace(/\/$/, "");
  const dateLabel = formatBriefDate(brief.date, "en");
  const teaser = firstBullet(brief.brief_en);

  const message = [
    `📈 Streetcode — Market Brief`,
    dateLabel,
    "",
    teaser,
    "",
    `Full brief: ${siteUrl}/en`,
  ].join("\n");

  console.log(`Sending brief for ${brief.date}...`);
  const results = await sendWhatsAppBrief(message);

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
