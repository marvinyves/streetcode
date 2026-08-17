# RFP: Daily Market Brief System

**Prepared for:** Marvin
**Purpose:** Build spec for Claude Code
**Status:** Draft v1 — for scoping and implementation planning

---

## 1. Overview

Build a system that produces a **daily market brief** — a short, readable summary of what's moving markets that day (economic data, earnings, commodities, currencies, sentiment) — and delivers it two ways:

1. **WhatsApp message** to a small, fixed list of recipients (≤10 people), sent automatically every day.
2. **A standalone website** showing today's brief, an archive of past briefs (calendar view), an economic calendar, and a stock/sector heat map. The site supports an English/Swedish language toggle.

The current process is manual: someone writes a Swedish-language brief daily (partially LLM-assisted, partially hand-edited). This project should replace that manual process with an automated pipeline that researches, drafts, and distributes the brief daily with minimal manual intervention — while keeping quality and tone consistent with the existing style (see sample brief in Appendix A).

### Goals
- Reduce daily manual effort to near-zero once running.
- Produce a brief that is accurate, well-sourced, and stylistically consistent with the current Swedish version, but authored in English first.
- Make history browsable — nothing gets lost or overwritten.
- Keep the whole system cheap to run (target: near-$0/month at current scale of ≤10 recipients).

### Non-goals (for now)
- No large-scale subscriber growth or multi-tenant support — build for ≤10 known recipients.
- No paid data feeds — use free-tier APIs and public sources only.
- No mobile app — WhatsApp + responsive website is sufficient.

---

## 2. Background & Current State

- A daily brief is currently produced in Swedish, distributed via text message, covering: stock market movers, notable upcoming earnings, Fed/economic policy events, currency moves, gold, and oil.
- The brief is a mix of LLM generation and manual editing today.
- An economic calendar (what's reporting/releasing each day) is desired but not currently part of the process.
- Owner wants the eventual site to toggle between Swedish and English, but is authoring new content in English first.

See **Appendix A** for a real sample of the current Swedish brief and its English translation, to be used as the style/format template.

---

## 3. Phased Scope

### Phase 1 — Daily Content Pipeline (content first)
Build the repeatable process that researches and drafts the daily brief in English.

**Must include:**
- Pull data/news on: major index futures/movement, notable macro data releases (CPI, Fed statements/minutes, GDP, etc.), currency moves (USD, JPY, etc.), gold, oil, and any other commodities worth flagging.
- Pull a list of major companies reporting earnings that week/day.
- Optional sentiment layer: pull qualitative "street" sentiment from sources like Reddit (e.g. r/stocks, r/wallstreetbets, r/investing) to complement official data with retail/contrarian sentiment.
- Draft a brief in the style/format of Appendix A — short bullet points, plain language, no jargon overload.
- Output stored in a structured, dated record (not just a text blob) — see Phase 3 data model.

**Data sources to use (free tier):**
- **FRED** (Federal Reserve Economic Data) — CPI, interest rates, employment, and other official macro data.
- **Finnhub** (free tier) — earnings calendar, market news.
- **Web search** — for qualitative narrative/context (Fed sentiment, geopolitical drivers, "why" behind moves).
- **Reddit** (via search or API) — retail sentiment, illustrative only, not a primary data source.

### Phase 2 — Economic Calendar, Earnings Calendar & Heat Map
Build the structured data layer that powers both the brief and the website's visual components.

**Must include:**
- **Economic calendar**: upcoming scheduled releases (CPI, Fed meetings, jobs reports, etc.) with dates and expected relevance.
- **Earnings calendar**: which major companies report this week, starting from today, sourced via Finnhub.
- **Stock/sector heat map**: a visual representation of market movement (e.g. by sector or index constituent), refreshed daily.
- All of the above stored so they can be queried by date (today and historical).

### Phase 3 — Standalone Website (bilingual, with archive)
Build the public-facing site.

**Must include:**
- **Today's brief** — default landing view.
- **Calendar/archive view** — click any past date, see that day's full brief (nothing is overwritten; every day is a permanent record).
- **Economic calendar** page/section.
- **Stock heat map** page/section.
- **Language toggle (EN/SV)** — all content authored in English first; Swedish version can be a translation pass (manual, LLM-assisted, or stored alongside as a second field per record — implementer's call, but both must be retrievable per day).
- **Database-backed, not static** — every day's brief, calendar data, and heat map data should be stored as records (e.g. in Supabase), queried by date, not hardcoded into pages.

**Tech constraints:**
- **Supabase** must be used as the backend/database (already connected/available).
- **GitHub** for source control — repo should be set up early so all work is version-controlled from the start.
- **Vercel** for hosting/deployment — site should be built in a framework Vercel supports natively (e.g. Next.js) to keep deployment simple (push to GitHub → auto-deploy on Vercel).

### Phase 4 — Automated Distribution (WhatsApp + cron)
Automate the daily send.

**Must include:**
- A **scheduled job (cron)** that runs once daily, triggers the Phase 1 pipeline, and on completion sends a WhatsApp message to a fixed list of ≤10 recipients.
- Message content: short summary + a link to that day's full brief on the website.
- **WhatsApp delivery via Twilio**, starting with the **Twilio WhatsApp Sandbox** (free, recipients join once via a join code, no approval wait). Note: sandbox requires messages roughly every 72 hours to stay active — a daily cron trivially satisfies this.
- Design the sending layer so it can later be swapped to a **registered/production WhatsApp sender** (requires business verification + approved message template) without rearchitecting — but this upgrade is optional/future, not required for launch.
- SMS (plain text) via Twilio is a **secondary/fallback option**, not required if WhatsApp is the primary channel. At ≤10 recipients, Twilio's free trial credit covers this indefinitely either way.

---

## 4. Data Model (guidance, not prescriptive)

Each day should produce one record containing at minimum:
- `date`
- `brief_en` (full English brief text)
- `brief_sv` (Swedish version, once translated)
- `key_events` (structured: macro releases, earnings, notable movers)
- `sentiment_notes` (optional, from Reddit/qualitative research)
- `sources` (what was pulled and from where, for traceability)

Economic calendar and earnings calendar entries should be their own queryable tables/records, linked by date, so the heat map and calendar views don't depend on parsing brief text.

---

## 5. Non-Functional Requirements

- **Reliability**: the daily job must run unattended and fail gracefully (e.g., alert/log if a data source is unavailable, rather than silently sending a broken brief).
- **Cost**: stay within free tiers (FRED, Finnhub free tier, Twilio sandbox/trial, Supabase) at current scale (≤10 recipients).
- **Consistency**: tone and structure of the brief should stay consistent day to day (style template in Appendix A).
- **Extensibility**: architecture should not block later growth (more recipients, production WhatsApp sender, paid data feeds) even though none of that is required now.

---

## 6. Suggested Milestones

1. **M1** — Manual-trigger version of Phase 1: generate one English brief on demand, in the correct style, from live data sources.
2. **M2** — Phase 2 data layer: economic calendar + earnings calendar + heat map data, stored in Supabase, queryable by date.
3. **M3** — Phase 3 website: today's brief + archive/calendar view + heat map + EN/SV toggle, reading from Supabase.
4. **M4** — Phase 4 automation: cron job wired to Phase 1 pipeline, sending via Twilio WhatsApp Sandbox to the recipient list, linking to the Phase 3 site.
5. **M5** (stretch) — Production WhatsApp sender upgrade, if/when recipient list grows beyond sandbox-appropriate scale.

---

## 7. Open Questions / Assumptions (flagged for implementer)

- **Swedish translation workflow** (manual vs. LLM-assisted vs. hybrid) is not finalized — implementer should build the data model to support either without rework.
- **Heat map scope** (which index/sector universe to visualize) is not finalized — start with a reasonable default (e.g. S&P 500 sectors) and keep configurable.
- **Reddit sentiment** is a "nice to have" enrichment, not a core requirement — should not block core pipeline if unavailable.

---

## Appendix A — Style Reference Sample

**Original (Swedish), sent 8/17:**
> Marknads Uppdateringar 17/8: [full original bullets — six items covering US futures, upcoming earnings, Fed minutes, USD/JPY, gold, and oil]

**English translation (target style/tone):**
> Market Update 8/17: [six bullets — short, plain-language, one topic per bullet, no unnecessary jargon]

*(Full text available in project conversation history — implementer should request if not already provided.)*
