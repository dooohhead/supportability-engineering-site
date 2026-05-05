# SE PHASE DEFAULTS — SAR (Supportability Architecture Review)
**Phase:** 2 — Design | **Gate:** Open items become mandatory build acceptance criteria

---

## PURPOSE
Review every architectural decision through a supportability lens before build begins. Produce a failure point map, observability gap list, and trace boundary definition.

---

## DEFAULT VALUES — OVERRIDE AS NEEDED

### Architecture Component Observability — Default Assessment Pattern
For each component, apply this default classification:

| Component Type | Default Observability Status | Common Gap |
|----------------|-----------------------------|-----------  |
| API Gateway / Entry Point | OK | Rarely a gap if standard tooling used |
| Business Logic Service | Partial | Custom logic often has no structured logging |
| Database Layer | Partial | Query performance visible; business context missing |
| Cache Layer | Gap | Hit/miss rates often not exposed |
| Message Queue / Event Bus | Partial | Published vs consumed counts often mismatched |
| External API / Third-Party | Gap | Dependency failures almost always blind spots |
| Auth / Identity Service | Partial | Auth failures logged; downstream impact not |
| Async Worker / Background Job | Gap | Job failure often silent |

**Override:** Replace with actual components in the architecture being reviewed. Annotate diagram: (G) = gap, (P) = partial, (OK) = fully observable.

---

### Failure Point Map — Default High-Priority Points
Every architecture should be assessed against these by default:

| Failure Point | Observable Default | Common Blind Spot |
|---------------|--------------------|-------------------|
| Service entry (request received) | Usually yes | Missing customer/entity ID in first log line |
| Service exit (response sent) | Usually yes | Error response body not logged |
| Database write | Partial | Constraint failures swallowed silently |
| Database read (empty result) | Rarely | Empty result treated same as successful result |
| External API call (slow) | Rarely | Degradation vs failure treated same |
| External API call (error) | Partial | 4xx vs 5xx often not distinguished |
| Async publish | Partial | Published ≠ consumed — gap between is blind |
| Async consume failure | Rarely | Dead-letter queue often unmonitored |
| Auth failure | Usually yes | Auth failure reason often missing |
| Retry exhaustion | Rarely | Final failure after retries often not escalated |

**Override:** Add architecture-specific failure points. Mark diagnosable by support: Yes / No.

---

### Trace Boundary Defaults
Default assumption: correlation ID must originate at the API gateway or first entry point and propagate through every service boundary.

| Boundary Type | Default Trace Requirement | Common Break Point |
|---------------|--------------------------|-------------------|
| HTTP service-to-service | Pass correlation ID in header (X-Correlation-ID) | Missing from outbound call |
| Async message publish | Embed correlation ID in message metadata | Stripped by queue middleware |
| Database calls | Include correlation ID in log context, not query | N/A (DB doesn't propagate) |
| External API call | Pass correlation ID in header if vendor supports | Vendor ignores or strips it |
| Background job trigger | Pass correlation ID as job parameter | Not passed on schedule trigger |

**Override:** Map actual service boundaries. Mark each: receives ID / propagates ID / break point.

---

### Degradation Path Defaults
Default expectation for every external dependency:

| Scenario | Default Degradation Behaviour | Support Detectable Default |
|----------|-------------------------------|---------------------------|
| Dependency slow (>2x normal) | Timeout with warning log | No (default) — must be instrumented |
| Dependency error rate elevated | Circuit breaker opens after threshold | Partial — CB open is logged, not alerted |
| Dependency fully unavailable | Graceful fallback or user-facing error | Partial — depends on fallback implementation |
| Dependency returning bad data | Input validation catches and rejects | Rarely — validation failures often silent |

**Override:** Define actual degradation behaviour and confirm support detectability for each dependency.

---

### Dependency Risk Assessment Defaults
| Dependency Type | Default Slow Response Impact | Default Unavailable Impact | Default Detection |
|----------------|------------------------------|---------------------------|-------------------|
| Payment processor | User cannot complete purchase | Feature fully down | Timeout alert |
| Email service | Notification delayed | Silent — user never notified | Queue backlog metric |
| Auth provider | All users cannot log in | Full outage | Auth failure rate alert |
| Internal microservice | Upstream degraded | Upstream down | Health check |
| CDN / Static assets | Slow page load | Broken UI | Synthetic monitor |
| Analytics / logging sink | No immediate user impact | Loss of observability | Log ingestion gap alert |

**Override:** Replace with actual dependencies. Define specific timeout thresholds and detection methods.

---

### Observability Gap Priority Defaults
| Gap Type | Default Priority | Rationale |
|----------|-----------------|-----------|
| No correlation ID at service boundary | High | Makes end-to-end tracing impossible |
| External dependency not monitored | High | Silent failures damage customers before detection |
| Error rate not instrumented as metric | High | Can't alert on what can't be measured |
| Database slow query not observable | Medium | Performance issues invisible until customer complaint |
| Async consumer failure not logged | High | Jobs silently failing is a critical gap |
| Cache miss rate not measured | Low | Helpful but rarely incident-critical |
| Background job progress not logged | Medium | Long-running jobs become black boxes |

**Override:** Adjust priority based on feature criticality and customer tier. All High gaps must be closed before build completes.

---

## SIGN-OFF REQUIREMENT
Required signatories: Engineering Lead, Support Lead, Architecture Reviewer, Security Reviewer.
**All High priority gaps must be resolved or have a documented remediation plan.**

---

## WHAT TO OVERRIDE IN A SESSION
- Component inventory → replace with actual services and technologies
- Failure point map → assess against actual architecture, not generic types
- Trace boundaries → map actual service-to-service calls
- Dependency list → replace examples with real integrations and SLAs
