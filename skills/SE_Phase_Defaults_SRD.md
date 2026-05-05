# SE PHASE DEFAULTS — SRD (Supportability Requirements Document)
**Phase:** 1 — Requirements | **Gate:** Support signs off before design begins

---

## PURPOSE
Capture supportability requirements before design starts. Answer three questions for every feature:
1. How will we know it is working?
2. How will we know it broke?
3. What does support need to resolve it at 2am without calling the builder?

---

## DEFAULT VALUES — OVERRIDE AS NEEDED

### Observability Requirements
| What Must Be Observable | How | Tool | Priority |
|------------------------|-----|------|----------|
| Feature entry/exit events | Log | Centralized logging platform | H |
| Transaction success/failure | Metric + Log | APM + logging | H |
| Error rate per endpoint | Metric | APM | H |
| Latency per endpoint (p50/p95/p99) | Metric | APM | H |
| Customer/entity ID on all events | Log field | Logging | H |
| Correlation ID propagation | Log field | Logging | H |
| Dependency call outcomes | Log | Logging | M |
| Queue depth (if async) | Metric | APM | M |

**Override:** Add feature-specific business events (e.g., order completed, payment processed, login succeeded).

---

### Failure Mode Inventory — Default Categories
| Type | Default Examples | Override With |
|------|-----------------|---------------|
| Complete Outage | Service unreachable, timeout on all requests | Feature-specific total failure state |
| Partial Failure | Subset of users affected, one code path failing | Feature-specific partial states |
| Degraded State | Slow response, increased error rate below threshold | Feature-specific performance thresholds |
| Data Issue | Wrong results returned, stale data served | Feature-specific data validity criteria |
| Performance | Latency exceeds SLA, queue backlog | Feature-specific SLA numbers |
| Security / Auth | Auth failure, permission escalation, token expiry | Feature-specific auth paths |

**Override:** Replace examples with actual feature failure modes. Every item needs: customer experience, expected detection method, initial response action.

---

### Business Impact Pre-Classification — Defaults
| Failure Mode | Default CI | Default BI | Default Escalation |
|-------------|-----------|-----------|-------------------|
| Complete Outage | CI-1 | BI-1 | L3 (VP) |
| Partial Failure | CI-2 | BI-2 | L2 (Engineering) |
| Degraded State | CI-3 | BI-3 | L2 (Engineering) |
| Data Issue | CI-2 | BI-2 | L2 (Engineering) |
| Performance | CI-3 | BI-3 | L1 (Support) |
| Security / Auth | CI-1 | BI-1 | L4 (CEO) |

**Override:** Adjust based on actual customer segments affected and revenue at risk. Enterprise-only features may warrant higher BI classification even for partial failures.

---

### Support Readiness Criteria — Defaults
| Criterion | Default Owner | Default Target Phase |
|-----------|--------------|---------------------|
| Logging standard implemented and verified | Engineering | SIC (Build) |
| Monitoring dashboards live with baseline | Eng / Support | STP (Test) |
| All alerts configured and tested | Eng / Support | STP (Test) |
| Runbook written, reviewed, published | Support | STP (Test) |
| Customer impact classification in ticketing | Support | SRR (Release) |
| On-call rotation updated | Support Lead | SRR (Release) |
| Support team trained on failure modes | Support Lead | SRR (Release) |
| Rollback procedure documented and tested | Engineering | SRR (Release) |

**Override:** Add feature-specific criteria (e.g., data migration verified, external partner notified, compliance review complete).

---

### Escalation Path Defaults
| Level | Default Trigger | Default Response Time |
|-------|-----------------|-----------------------|
| L1 — Support only | BI-4 | 4 business hours |
| L2 — Engineering | BI-3 | 2 hours |
| L3 — VP | BI-2 | 30 minutes |
| L4 — CEO/Executive | BI-1 | Immediate |

**Customer communication defaults:**
- BI-1: Immediate notification
- BI-2: Within 30 min
- BI-3: Within 2 hours
- BI-4: On resolution

**Override:** Replace with actual named contacts and on-call coverage hours.

---

### Compliance Flags — Default Assessment
| Flag | Default Assumption | Override If |
|------|--------------------|-------------|
| PII involved | No | Feature handles user profile, email, name, address, payment data |
| Financial data | No | Feature involves billing, payments, pricing, invoices |
| Health/medical | No | Feature in health, wellness, insurance context |
| Regulatory reporting | No | Financial services, healthcare, government contexts |
| Data residency | No | Multi-region deployment with EU/APAC customers |
| Audit trail required | Yes (default on) | Feature has no compliance surface |

---

## SIGN-OFF REQUIREMENT
Required signatories: Product Owner, Engineering Lead, Support Lead, QA Lead.
**No SRD sign-off = design phase does not begin.**

---

## WHAT TO OVERRIDE IN A SESSION
When working on a specific feature, replace:
- Observability table → add feature-specific events
- Failure mode types → replace examples with real failure scenarios
- BI/CI classification → adjust for actual customer tier distribution
- Escalation contacts → replace generic roles with named individuals
- Compliance flags → assess for actual feature scope
