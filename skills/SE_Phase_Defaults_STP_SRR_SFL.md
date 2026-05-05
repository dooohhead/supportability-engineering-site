# SE PHASE DEFAULTS — STP / SRR / SFL
**Phases:** 4 — Test | 5 — Release | 6 — Operate

---

# STP — SUPPORTABILITY TEST PLAN
**Gate:** Release blocked if any required test fails

## PURPOSE
Validate in test environment that every failure mode can be detected, diagnosed, and escalated correctly by support — without engineering involvement. Simulate 2am before it happens.

---

## STP DEFAULT VALUES — OVERRIDE AS NEEDED

### Failure Injection Testing — Default Pass Criteria
Each failure mode from the SRD must be triggered deliberately. Default pass = all four columns true:

| Test Dimension | Default Pass Criteria | Default Fail Trigger |
|----------------|----------------------|--------------------|
| Detected | Alert fires within 5 min of injection | No alert, wrong destination, wrong severity |
| Logged correctly | Correlation ID present, correct level, entity ID included | Missing ID, wrong level, no context |
| Alert fires | Correct severity, correct routing | Misfired, wrong team, no alert |
| Pass/Fail assigned | Explicit pass or fail per failure mode | Partial = fail |

**Override:** Adjust detection window for features with different SLA thresholds.

---

### Log Quality Review — Default Criteria
| Criterion | Default Pass Standard |
|-----------|----------------------|
| Transaction boundary coverage | Log entry at every entry AND exit point |
| Log level accuracy | Zero errors logged at INFO; zero debug in production path |
| PII absence | Zero PII fields in any log output across all test scenarios |
| Searchability | Every log findable by customer ID and by correlation ID |
| Noise level | <10 log lines per normal transaction (not including debug) |
| Full trace reconstructable | Correlation ID query returns complete transaction path end-to-end |

**Override:** Adjust noise threshold for high-frequency/low-complexity transactions (e.g., health checks excluded).

---

### Alert Validation — Default Criteria
| Validation Point | Default Requirement |
|-----------------|---------------------|
| Every SRD-defined alert fires | Required — zero untested alerts may reach production |
| Severity matches BI classification | BI-1 → Critical; BI-2 → High; BI-3 → Medium; BI-4 → Low |
| Routes to correct team | Support for BI-3/4; Engineering for BI-2; VP for BI-1 |
| Alert context sufficient | Includes: component, customer/entity ID if available, correlation ID, brief description |
| No false positives in normal operation | Zero alerts fired during healthy operation test scenarios |

**Override:** Add vendor/platform-specific alert routing rules.

---

### Runbook Walkthrough — Default Standards
Run with a support engineer who did NOT write the runbook. Default pass criteria:

| Standard | Default |
|----------|---------|
| Tester profile | Support engineer unfamiliar with feature |
| Tools available | Only logs, alerts, dashboards available in production |
| Engineering contact | Not available during walkthrough |
| Pass threshold per failure mode | Independently diagnosed and correct escalation path identified |
| Time threshold | Diagnosis in <30 min for BI-3/4; <15 min for BI-1/2 |
| Gap documentation | Every gap found → action required before release |

**Override:** Adjust time thresholds for feature-specific SLAs.

---

### On-Call Simulation — Default Scenario Structure
| Element | Default |
|---------|---------|
| Scenario | BI-2 incident (VP-level) — most common enterprise escalation scenario |
| Duration | 60 minutes |
| Participants | Support lead, on-call engineer, one junior support tester |
| Escalation path | Must be invoked correctly without coaching |
| Customer comms | Template must be selected and sent within 30 min |
| PIR initiation | Must be triggered during simulation |

**Override:** Run additional scenarios for BI-1 (existential incidents) and feature-specific failure types.

---

## STP SIGN-OFF REQUIREMENT
Required signatories: QA Lead, Support Lead, Engineering Lead.
**Overall recommendation must be APPROVED FOR RELEASE before any signature is collected.**

---
---

# SRR — SUPPORT READINESS REVIEW
**Gate:** Both Support Lead + Engineering Lead must sign. Release does not proceed without both.

## PURPOSE
Final gate before production. Confirm all upstream deliverables are complete and support can operate the feature independently from minute one of production.

---

## SRR DEFAULT VALUES — OVERRIDE AS NEEDED

### Upstream Deliverable Defaults
Default expectation: all four deliverables complete and signed before SRR begins.

| Deliverable | Default Status Required | Acceptable Exception |
|-------------|------------------------|---------------------|
| SRD | Signed | None |
| SAR | Signed, all High gaps closed | None |
| SIC | Signed, all required items checked | None |
| STP | Signed, overall result = PASS | None |

**No exceptions.** Open items carried forward → BLOCKED release decision.

---

### Production Monitoring Defaults
| Requirement | Default Standard |
|-------------|-----------------|
| Dashboards live | Verified against known good state before SRR |
| Baseline established | Minimum 24 hours of pre-production load test data |
| All alerts active | End-to-end routing test completed in production config |
| On-call chain tested | Test alert sent; delivery confirmed to correct person |

---

### Runbook Publication Defaults
| Requirement | Default Standard |
|-------------|-----------------|
| Published location | Support knowledge base, accessible to all support staff |
| Version control | Yes — version, date, and author on each runbook |
| Independent review | Each runbook reviewed by support engineer who did not write it |
| Reviewer documented | Reviewer name and date on runbook cover |

---

### Communication Template Defaults
| BI Level | Default Template Requirement |
|----------|------------------------------|
| BI-1 | Immediate customer notification + executive flash |
| BI-2 | Customer update within 30 min + internal escalation notice |
| BI-3 | Customer update within 2 hours |
| BI-4 | Resolution summary only |

All templates approved by: Support Lead + Account Management Lead (for BI-1 and BI-2).

---

### Release Decision Options
- **APPROVED** — all items complete, no outstanding issues
- **CONDITIONAL** — released with documented accepted risk (rare; requires VP sign-off)
- **BLOCKED** — outstanding items must be resolved and SRR re-run

**Override:** Add feature-specific readiness criteria not covered by defaults (e.g., data migration verified, external partner briefed, regulatory approval obtained).

---

## SRR SIGN-OFF REQUIREMENT
Required: Support Lead, Engineering Lead, Product Owner, Release Manager.
**Both Support Lead AND Engineering Lead must sign. Neither alone is sufficient.**

---
---

# SFL — SUPPORTABILITY FEEDBACK LOOP
**Gate:** Quarterly review. Outputs feed into next SRD cycle.

## PURPOSE
Close the loop between production incidents and upstream design. Convert operational experience into backlog items. Make every incident an investment, not just a cost.

---

## SFL DEFAULT VALUES — OVERRIDE AS NEEDED

### Incident Scoring — Defaults
Score every incident on three dimensions (1–5). See scoring table in SE_AI_Context_Core.md.

**Default scoring cadence:** Within 24 hours of incident closure.
**Default scorer:** Primary support engineer who handled the incident.
**Default reviewer:** Support lead (quarterly aggregate review).

| Score Threshold | Default Action |
|----------------|---------------|
| Any dimension scoring 1 or 2 | Mandatory observability gap log entry created |
| Average score < 3 | Backlog item created for next sprint |
| Average score < 2 | Escalated to engineering lead for architecture review |
| Consistent 1s on same dimension | SRD or SAR review triggered for affected feature |

**Override:** Adjust thresholds for feature criticality or customer tier.

---

### Observability Gap Log — Default Triage
| Priority | Default Criteria | Default Resolution Target |
|----------|-----------------|--------------------------|
| High | Caused or extended a BI-1 or BI-2 incident | Next sprint |
| Medium | Caused unnecessary escalation to engineering | Within 2 sprints |
| Low | Would have been nice to have; no escalation impact | Quarterly review |

**Default rule:** Every gap logged becomes a backlog item. Gaps are never closed without a code change or documentation update.

---

### Runbook Accuracy Defaults
| Accuracy Level | Default Action |
|----------------|---------------|
| Accurate | Note in log, no update required |
| Partial | Update within 48 hours of incident closure |
| Inaccurate | Update same day; notify all support staff |

**Default version control:** Increment minor version on partial update (1.1 → 1.2); increment major version on structural change (1.x → 2.0).

---

### Quarterly Review — Default Agenda
1. Average supportability score by feature (last 90 days)
2. Top 3 recurring incident root categories
3. Observability gaps: opened vs. closed count
4. Runbook updates: count and summary
5. Shift left effectiveness metric (% preventable incidents)
6. Backlog items proposed for next cycle

**Default attendees:** Support Lead, Engineering Lead, Product Owner.
**Default output:** Backlog items for next SRD cycle; updated framework gap list.

---

### Shift Left Effectiveness Metric — Defaults
Target: 20% reduction in preventable incidents quarter-over-quarter.

| Metric | Default Tracking Method |
|--------|------------------------|
| Total incidents | Ticket system count |
| Incidents traceable to SRD gap | Tagged at PIR |
| Incidents traceable to SAR gap | Tagged at PIR |
| Incidents traceable to SIC gap | Tagged at PIR |
| Incidents traceable to STP gap | Tagged at PIR |
| Incidents traceable to SRR gap | Tagged at PIR |
| % preventable | (sum of phase-traceable incidents) / total × 100 |
| Cost of preventable incidents | Engineering hours × burdened rate + customer impact estimate |

**Override:** Adjust targets based on current baseline. New implementations should target 20% improvement starting from first quarter of full framework adoption.

---

## SFL SIGN-OFF REQUIREMENT
Required: Support Lead, Engineering Lead, Product Owner.
**Quarterly. Sign-off confirms review occurred, findings documented, and backlog items created for all High priority gaps.**

---

## WHAT TO OVERRIDE IN A SESSION (ALL STP/SRR/SFL)
- Time thresholds → adjust for feature-specific SLAs
- Alert routing → replace generic roles with named individuals and tools
- Communication templates → draft feature-specific content
- Scoring thresholds → adjust for feature criticality tier
- Quarterly targets → set based on current baseline metrics
