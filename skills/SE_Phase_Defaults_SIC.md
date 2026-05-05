# SE PHASE DEFAULTS — SIC (Supportability Implementation Checklist)
**Phase:** 3 — Build | **Gate:** PR cannot merge without SIC completed and signed off by reviewer

---

## PURPOSE
Verify supportability standards are implemented during build. Attached to every PR. Developer completes. Reviewer independently verifies. Not a post-build audit — a build-time standard.

---

## DEFAULT VALUES — OVERRIDE AS NEEDED

### Logging Standards — Default Requirements
Every log entry MUST include by default:

| Field | Default Requirement | Override If |
|-------|--------------------|-----------  |
| Correlation ID | Required on every log line | Never — no exceptions |
| Customer / Entity ID | Required at entry and exit | Internal-only features with no customer surface |
| Component name | Required | Never |
| Log level (correct) | Required | Never |
| Timestamp | Required (auto by platform) | Never |
| Error code | Required on all error logs | Never |
| Action description | Required — what happened, not just that something did | Never |

**Default log level conventions:**
- DEBUG → trace-level detail for dev environments only (never in production paths)
- INFO → normal state change (feature used, transaction completed)
- WARN → recoverable issue (retry triggered, fallback activated)
- ERROR → failure state (operation failed, will impact user)
- FATAL → unrecoverable (service cannot continue)

**Default log format:** Structured JSON. Never free-form text strings.

**Default PII prohibition:** No PII, credentials, tokens, or financial data in any log output. Default assumption = PII is present until explicitly assessed otherwise.

**Override:** Add feature-specific required fields (e.g., order ID, payment reference, session type).

---

### Error Handling Standards — Defaults
| Error Category | Default Behaviour | Default Log Level |
|----------------|------------------|-------------------|
| Transient (retryable) | Retry with exponential backoff; log WARN on each attempt; log ERROR on exhaustion | WARN per attempt, ERROR on exhaustion |
| Permanent (non-retryable) | Reject immediately with meaningful error code; log ERROR | ERROR |
| External dependency timeout | Treat as transient up to threshold; circuit breaker | WARN |
| External dependency error (4xx) | Treat as permanent; do not retry | ERROR |
| External dependency error (5xx) | Treat as transient | WARN |
| Validation failure | Reject immediately; log INFO with rejected field (no value if PII) | WARN |
| Auth failure | Reject; log WARN with auth type and failure reason (no credentials) | WARN |
| Unrecoverable failure | Alert immediately; trigger escalation path | FATAL |

**Override:** Adjust retry thresholds (default: 3 retries, backoff: 1s/2s/4s). Adjust circuit breaker threshold (default: 50% error rate over 30 seconds opens circuit).

---

### Four Golden Signals — Default Instrumentation
All four are REQUIRED for every feature component. No exceptions.

| Signal | Default Metric Name Pattern | Default Threshold (alert) |
|--------|---------------------------|--------------------------|
| Latency | `{service}.{operation}.duration_ms` | p95 > 2× baseline |
| Error Rate | `{service}.{operation}.error_rate` | >1% sustained 5 min |
| Throughput | `{service}.{operation}.requests_per_sec` | <50% of baseline (drop alert) |
| Saturation | `{service}.cpu_pct`, `{service}.memory_pct`, `{service}.queue_depth` | CPU >80%, memory >85%, queue >1000 |

**Override:** Adjust thresholds for feature-specific SLAs. Add custom business metrics defined in SRD Section 1.4.

---

### Unit Test Coverage — Default Requirements
Every failure mode listed in the SRD Failure Mode Inventory MUST have:

| Test Type | Default Requirement |
|-----------|---------------------|
| Failure mode triggered | Test must deliberately cause the failure mode |
| Correct error returned | Test must assert the error code and message match the standard |
| Correct log output | Test must verify log entry contains required fields at correct level |
| Metric emitted | Test must verify counter/gauge increments on failure |
| No PII in logs | Test must assert no sensitive fields appear in log output |

**Override:** Add integration tests for cross-service failure scenarios (required when feature touches >2 services).

---

### Code Review Supportability Gate — Default Checklist
Reviewer signs off on all of the following independently (not developer self-certification):

| Gate Item | Default: Required or If Applicable |
|-----------|-----------------------------------|
| Logging completeness verified (not just functional correctness) | Required |
| Correlation ID propagation confirmed across all service calls | Required |
| No sensitive data in any log output confirmed | Required |
| All SRD failure modes handled in code | Required |
| Metric instrumentation complete and matches SRD | Required |
| Error messages actionable (not stack traces) | Required |
| Circuit breaker implemented for external calls | If applicable |
| Retry logic with backoff present for transient errors | If applicable |
| Unit test exists for every SRD failure mode | Required |

**Override:** Add language/platform-specific gate items (e.g., structured logging library used, no console.log in production paths, OpenTelemetry spans created).

---

## SIGN-OFF REQUIREMENT
Required signatories: Developer, Code Reviewer, Support Representative.
**Required items must all be checked. If applicable items marked N/A must include brief justification.**

---

## WHAT TO OVERRIDE IN A SESSION
- Required log fields → add feature-specific IDs
- Error handling → adjust retry counts and backoff for feature SLA
- Golden signal thresholds → replace defaults with feature-specific SLA numbers
- Test requirements → add integration test scenarios for cross-service paths
- Review gate → add language/framework-specific items
