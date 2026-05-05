# SE AI CONTEXT DOCUMENTS — USAGE GUIDE

## WHAT THIS SET IS
Five markdown files optimized for AI consumption. Paste into any AI conversation to instantly orient it to the Supportability Engineering framework. Replaces build scripts. No installation required.

---

## FILES IN THIS SET

| File | Purpose | When to Include |
|------|---------|----------------|
| `SE_AI_Context_Core.md` | Full framework identity, all six phases, scoring, classification | Always — include in every session |
| `SE_Phase_Defaults_SRD.md` | Phase 1 defaults + override instructions | When working on requirements or filling an SRD |
| `SE_Phase_Defaults_SAR.md` | Phase 2 defaults + override instructions | When doing architecture review or filling a SAR |
| `SE_Phase_Defaults_SIC.md` | Phase 3 defaults + override instructions | When in build phase or doing PR review |
| `SE_Phase_Defaults_STP_SRR_SFL.md` | Phases 4/5/6 defaults + override instructions | When testing, releasing, or doing quarterly SFL review |

---

## HOW TO USE

### Option A — Full framework session
Paste: `SE_AI_Context_Core.md` + whichever phase defaults file is relevant.

### Option B — Single phase work
Paste: `SE_AI_Context_Core.md` + the specific phase defaults file only.

### Option C — Quick reference only
Paste: `SE_AI_Context_Core.md` alone.

---

## HOW TO CUSTOMIZE DEFAULTS

Every phase defaults file has a section: **WHAT TO OVERRIDE IN A SESSION**.

When starting a session for a specific feature:
1. Paste the relevant files
2. Tell the AI: "Override [specific default] with [feature-specific value]"
3. The AI will apply your override for the session

Example prompts:
- "Override the escalation contacts in SRD defaults with: L2 = Sarah Chen, L3 = Marcus Webb"
- "Override the error rate alert threshold in SIC defaults to >0.5% sustained 3 min (we have a tighter SLA)"
- "Override the runbook walkthrough time threshold to <10 min — this is a BI-1 feature"

---

## ARCHIVE INSTRUCTION
When session ends and user says "archive conversation": create a .docx file named `Supportability-Engineering-YYYY-MM-DD.docx` containing the full conversation with user prompts followed by AI responses in order.

---

## OWNERSHIP
John A. Bowman | dooohhead@gmail.com | 902-489-2429 | Confidential — Consulting IP
