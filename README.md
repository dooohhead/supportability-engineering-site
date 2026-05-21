# Supportability Engineering — Site

**Author:** John A. Bowman · dooohhead@gmail.com · 902-489-2429

This repository hosts the landing pages for the Supportability Engineering five-volume white paper series. Served via GitHub Pages at [dooohhead.github.io/supportability-engineering-site](https://dooohhead.github.io/supportability-engineering-site).

---

## What Is Supportability Engineering?

Supportability Engineering is a shift-left framework that ensures software systems are designed to be diagnosed, operated, and supported from the first line of code — not after the first major incident.

The framework provides a six-phase deliverable system that carries the right knowledge forward, phase by phase, so that any support engineer can operate any feature independently at 2am without calling the engineer who built it.

> *Every gap caught at requirements costs minutes to fix. The same gap caught in production costs months — per incident, indefinitely.*

---

## The Five-Volume Series

| Volume | Title | Focus | Accent |
|--------|-------|-------|--------|
| **Vol. 1** | Why the Best Support Organizations Shift Left | Foundational six-phase framework for traditional software | Blue `#2563EB` |
| **Vol. 2** | Shifting Left When the System Can Think | Agentic AI systems as the product being built | Gold `#C9993A` |
| **Vol. 3** | When the Builder Can't Sign Off | Systems built by agentic development tools (Copilot, Cursor, Claude Code) | Teal `#0D7377` |
| **Vol. 4** | When the AI Running Your Support Needs Supporting | Governance for AI operational tools (alert triage AI, automated remediation, support bots) | Purple `#7C3AED` |
| **Vol. 5** | Compliance by Design | SE framework mapped to SOC 2, ISO 27001, GDPR, SOX, and FedRAMP | Green `#0F766E` |

---

## The Six-Phase Framework

| Phase | Deliverable | Gate |
|-------|------------|------|
| 1 — Requirements | Supportability Requirements Document (SRD) | Support signs off before design begins |
| 2 — Design | Supportability Architecture Review (SAR) | Open items become build acceptance criteria |
| 3 — Build | Supportability Implementation Checklist (SIC) | PR cannot merge without sign-off |
| 4 — Test | Supportability Test Plan (STP) | Release blocked if any failure mode fails |
| 5 — Release | Support Readiness Review (SRR) | Requires both Support Lead and Engineering Lead signatures |
| 6 — Operate | Supportability Feedback Loop (SFL) | Feeds back into current SRD immediately |

---

## Site Structure

```
index.html      — Five-volume bundle page (primary profile link)
vol1.html       — Vol. 1 campaign page
vol2.html       — Vol. 2 campaign page
vol3.html       — Vol. 3 campaign page
vol4.html       — Vol. 4 campaign page
vol5.html       — Vol. 5 campaign page
README.md       — This file
```

Each volume page links back to `index.html` for the full bundle download. Lead capture via Formspree — each form submission tags the volume that drove the lead.

---

## LinkedIn Posting Cadence

One volume per week. URL posted in the **first comment** (not the post body) to avoid algorithm suppression.

- Week 1 → `vol1.html`
- Week 2 → `vol2.html`
- Week 3 → `vol3.html`
- Week 4 → `vol4.html`
- Week 5 → `vol5.html`

---

## White Papers

PDFs live in the repo root alongside the HTML files. Convert DOCX → PDF before uploading to protect IP.

| File | Volume |
|------|--------|
| `Supportability_Engineering_WhitePaper.pdf` | Vol. 1 |
| `Supportability_Engineering_Agentic_WhitePaper.pdf` | Vol. 2 |
| `Supportability_Engineering_AgenticDev_WhitePaper.pdf` | Vol. 3 |
| `Supportability_Engineering_AIOperations_WhitePaper.pdf` | Vol. 4 |
| `Supportability_Engineering_Compliance_WhitePaper.pdf` | Vol. 5 |

---

## GitHub Pages Setup

Settings → Pages → Deploy from `main` branch root. No build step required — all files are static HTML.

---

*© 2026 John A. Bowman · Supportability Engineering · Confidential Consulting IP*
