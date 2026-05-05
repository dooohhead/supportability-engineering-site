# SUPPORTABILITY ENGINEERING — AI CONTEXT DOCUMENT
**Framework:** Supportability Engineering | **Author:** John A. Bowman | **Version:** 1.0

---

## IDENTITY

Supportability Engineering (SE) is a shift-left framework. Goal: every software system is diagnosable, operable, and supportable from first line of code — not after first major incident.

**Core law:** Cost of fixing a supportability gap grows exponentially the later it is found.
- Found at Requirements → minutes to fix
- Found at Design → hours
- Found at Build → hours to days
- Found at Test → days
- Found at Release → days to weeks
- Found in Production → weeks to months, per incident, indefinitely

**Value proposition (marketing language):** "The best support organizations don't respond faster. They designed their systems so that when something breaks, anyone on the team can pick it up and know exactly what to do."

---

## FRAMEWORK STRUCTURE

Six phases. Each produces a signed deliverable. Each feeds the next. Operate feeds back to Requirements.

```
SRD → SAR → SIC → STP → SRR → SFL → SRD (next cycle)
```

| Phase | Deliverable | Full Name | Gate |
|-------|------------|-----------|------|
| 1 — Requirements | SRD | Supportability Requirements Document | Support signs off. No SRD = no design. |
| 2 — Design | SAR | Supportability Architecture Review | Open items = build acceptance criteria |
| 3 — Build | SIC | Supportability Implementation Checklist | PR cannot merge without SIC sign-off |
| 4 — Test | STP | Supportability Test Plan | Release blocked if any required test fails |
| 5 — Release | SRR | Support Readiness Review | Both Support Lead + Eng Lead must sign |
| 6 — Operate | SFL | Supportability Feedback Loop | Quarterly; feeds back to next SRD |

---

## PHASE SUMMARIES

### Phase 1 — SRD (Requirements)
Before design begins. Ask: How will we know it's working? How will we know it broke? What does support need to fix it at 2am without calling the builder?
- Captures: observability requirements, failure mode inventory, customer impact pre-classification, escalation paths, compliance flags
- Output: signed document. Support signs before design starts.
- Without it: support learns what failure looks like during an incident.

### Phase 2 — SAR (Design)
Before first line of code. Someone with support experience reviews the architecture diagram.
- Captures: failure point map, observability gap list (prioritized), trace boundary definition, degradation paths, dependency risks
- Output: annotated architecture + gap list. Open items = mandatory build acceptance criteria.
- Without it: blind spots get built in permanently.

### Phase 3 — SIC (Build)
Attaches to every PR. Developer completes, reviewer independently verifies.
- Checks: logging standards, error handling, four golden signals (latency/error rate/throughput/saturation), unit tests for every failure mode in SRD, code review supportability gate
- Output: signed checklist. PR cannot merge without it.
- Without it: logs exist but are useless; errors written for the author, not support.

### Phase 4 — STP (Test)
Before release. Run in test environment. Simulate 2am.
- Tests: failure injection, log quality review, alert validation, dashboard verification, runbook walkthrough (by someone who didn't write it), on-call tabletop simulation
- Output: pass/fail recommendation. Fail = release blocked.
- Without it: runbooks fail in practice; alerts misfire; team has never rehearsed.

### Phase 5 — SRR (Release)
Final gate before production. Not a rubber stamp.
- Confirms: all upstream deliverables complete, monitoring live, runbooks published, on-call rotation updated, rollback tested, comms templates ready, customer impact loaded in ticketing
- Output: dual sign-off (Support Lead + Engineering Lead). No signatures = no release.
- Without it: features ship before support is ready.

### Phase 6 — SFL (Operate)
Every incident generates data. Data improves the framework.
- Captures: incident supportability score (detectable/diagnosable/resolvable 1–5), observability gap log, runbook accuracy log, quarterly review, shift left effectiveness metric
- Output: backlog items fed to next SRD cycle
- Without it: every incident is a sunk cost; same problems recur indefinitely.

---

## SCORING DEFINITIONS (SFL)

| Score | Detectable | Diagnosable | Resolvable |
|-------|-----------|-------------|-----------|
| 5 | Before customer impact | <15 min | Support only |
| 4 | Within 5 min | <30 min | Minor eng input |
| 3 | Within 30 min | <2 hrs | Eng escalation required |
| 2 | Via customer complaint | >2 hrs | Senior eng required |
| 1 | Not detected — customer reported first | Could not identify | Code change required |

---

## IMPACT CLASSIFICATION

- **CI** = Customer Impact (1–4, where 1 = all customers affected)
- **BI** = Business Impact (1–4, where 1 = existential/revenue-critical)
- **Escalation:** L1 = Support | L2 = Engineering | L3 = VP | L4 = CEO/Executive
- **BI-1:** CEO + immediate comms | **BI-2:** VP + 30 min comms | **BI-3:** Engineering + 2 hr comms | **BI-4:** Support + comms on resolution

---

## FOUR GOLDEN SIGNALS (mandatory SIC instrumentation)

1. **Latency** — request/response time
2. **Error Rate** — % failed requests
3. **Throughput** — requests/sec or transactions/min
4. **Saturation** — CPU, memory, queue depth

---

## EXTENDED VOLUMES

| Volume | Scope |
|--------|-------|
| Vol. 1 | Traditional software — foundational framework |
| Vol. 2 | Agentic AI as the product (A- prefix templates) |
| Vol. 3 | Agentic development workflows (D- prefix templates) |
| Vol. 4 | AI operational tools (O- prefix templates + AOSR 7th phase) |

---

## CONTACT / OWNERSHIP

John A. Bowman | dooohhead@gmail.com | 902-489-2429 | Confidential — Consulting IP
