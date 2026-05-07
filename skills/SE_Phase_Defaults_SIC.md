# SE_DEFAULTS_SIC v1.2
phase:3|deliverable:SIC|gate:No sign-off→PR blocked

## INTERVENTION_TRIGGERS — SIC SPECIFIC
Stop and ask whenever:
- SRD or SAR reference is missing (SIC cannot be completed without both)
- A failure mode from the SRD has no corresponding unit test and no justification is provided
- A Required checklist item is unchecked with no documented reason
- Log output cannot be verified without seeing actual code or log samples
- A golden signal threshold is being applied as a default without user confirmation of the feature SLA
- PII status has not been explicitly confirmed for this feature
- The code reviewer has not been named
- An "If Applicable" item is marked N/A without a brief justification
- Developer and reviewer are the same person (flag as a process risk)

INTERVENTION_FORMAT: "STOP — [specific checklist item or field] cannot be confirmed: [specific question]. Please answer before I continue."

## LOG_FIELD_DEFAULTS
Required on every log line. No exceptions.
|Field|Required|
|---|---|
|Correlation ID|Always|
|Customer/Entity ID|Always except internal-only features|
|Component name|Always|
|Log level (correct)|Always|
|Timestamp|Always (platform auto)|
|Error code|Always on ERROR logs|
|Action description|Always|
INTERVENTION: if log output has not been reviewed → ask: "Have you reviewed actual log output for this feature? I cannot confirm logging completeness without seeing a log sample or having it confirmed by the reviewer."
INTERVENTION: if customer/entity ID field is claimed N/A → ask: "Confirm this feature has no customer-facing surface. If it does, customer/entity ID is required."
OVERRIDE: add feature-specific required fields

## LOG_LEVEL_DEFAULTS
DEBUG=trace detail, dev only, never production paths
INFO=normal state change
WARN=recoverable issue (retry/fallback)
ERROR=failure impacting user
FATAL=unrecoverable, service cannot continue
Format: structured JSON always. Free-form text: never.
PII rule: no PII|credentials|tokens|financial data in any log.
INTERVENTION: if PII status has not been explicitly confirmed → ask: "Has this feature been assessed for PII in log output? Confirm before I mark this item complete."
INTERVENTION: if log format is not confirmed as structured JSON → ask: "Confirm log output is structured JSON. Free-form text logging is a framework violation."

## ERROR_HANDLING_DEFAULTS
|Category|Behaviour|Log Level|
|---|---|---|
|Transient/retryable|Retry+exponential backoff; WARN per attempt; ERROR on exhaustion|WARN→ERROR|
|Permanent|Reject immediately+meaningful error code|ERROR|
|External timeout|Treat transient to threshold; circuit breaker|WARN|
|External 4xx|Treat permanent; no retry|ERROR|
|External 5xx|Treat transient|WARN|
|Validation failure|Reject; log field name only (no value if PII)|WARN|
|Auth failure|Reject; log auth type+reason (no credentials)|WARN|
|Unrecoverable|Alert+trigger escalation path|FATAL|
Default retry: 3 attempts|backoff: 1s/2s/4s
Default circuit breaker: opens at 50% error rate over 30s
INTERVENTION: if retry count or backoff values have not been confirmed → state default and ask: "I am applying default retry behaviour (3 attempts, 1s/2s/4s backoff). Does this match the feature SLA? Confirm or override."
INTERVENTION: if an external dependency exists and circuit breaker implementation is unclear → ask: "Has a circuit breaker been implemented for [dependency]? This is required for all external calls."

## GOLDEN_SIGNALS_DEFAULTS
All 4 required. No exceptions.
|Signal|Metric Pattern|Alert Threshold|
|---|---|---|
|Latency|{svc}.{op}.duration_ms|p95 > 2× baseline|
|Error Rate|{svc}.{op}.error_rate|>1% sustained 5min|
|Throughput|{svc}.{op}.requests_per_sec|<50% baseline (drop)|
|Saturation|{svc}.cpu_pct/{svc}.memory_pct/{svc}.queue_depth|CPU>80%|mem>85%|queue>1000|
INTERVENTION: before applying any threshold default → state it explicitly and ask: "I am using default thresholds. Does this feature have a specific SLA that requires different values? Confirm before I finalize."
INTERVENTION: if any of the 4 signals is missing from instrumentation with no justification → flag: "All 4 golden signals are required. [signal] is not instrumented. This must be resolved before the PR can merge."

## TEST_COVERAGE_DEFAULTS
Every SRD failure mode must have all of:
|Test Type|Requirement|
|---|---|
|Failure triggered|Test deliberately causes failure mode|
|Correct error|Assert error code+message match standard|
|Correct log output|Verify required fields at correct level|
|Metric emitted|Verify counter/gauge increments|
|No PII in logs|Assert no sensitive fields in output|
INTERVENTION: if any SRD failure mode has no unit test → ask: "Failure mode [X] from the SRD has no unit test. This is a Required item. Provide justification or confirm the test will be added before merge."
INTERVENTION: if SRD failure mode inventory has not been confirmed complete → ask: "Is the SRD failure mode inventory final? I cannot confirm test coverage against an incomplete list."

## REVIEW_GATE_DEFAULTS
Reviewer signs off independently. Not developer self-certification.
|Gate Item|Required|
|---|---|
|Logging completeness verified|R|
|Correlation ID propagation confirmed|R|
|No sensitive data in logs confirmed|R|
|All SRD failure modes handled in code|R|
|Metric instrumentation matches SRD|R|
|Error messages actionable (not stack traces)|R|
|Circuit breaker for external calls|IA|
|Retry logic with backoff for transient errors|IA|
|Unit test for every SRD failure mode|R|
R=Required|IA=If Applicable (N/A requires written justification)
INTERVENTION: if developer and reviewer are the same person → flag: "Developer and reviewer cannot be the same person. This is a process violation. Assign a separate reviewer before proceeding."
INTERVENTION: if any R item is unchecked → ask: "Item [X] is Required and unchecked. The PR cannot merge until this is resolved. What is the blocker?"

## SIGN-OFF
Required: Developer|Code Reviewer|Support Representative
INTERVENTION: if any signatory is unnamed → ask for names before SIC is marked complete.

## VALIDATION
PASS: SRD_ref_confirmed=true|SAR_ref_confirmed=true|all_R_items_checked=true|IA_items_checked_or_justified=true|golden_signals=4_instrumented|all_SRD_failure_modes_have_unit_test=true|PII_confirmed=true|reviewer_named_and_not_developer=true
INTERVENTION: if any PASS criterion is false → list which failed. PR merge remains blocked. Ask user how to resolve each failing item.
