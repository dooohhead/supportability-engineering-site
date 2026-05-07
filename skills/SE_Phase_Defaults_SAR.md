# SE_DEFAULTS_SAR v1.2
phase:2|deliverable:SAR|gate:Open items→mandatory build acceptance criteria

## INTERVENTION_TRIGGERS — SAR SPECIFIC
Stop and ask whenever:
- No architecture diagram or component list has been provided
- A component's technology stack is unknown
- A failure point is identified but observability status cannot be determined without more information
- A trace boundary exists but it is unclear whether correlation ID propagation is technically possible
- A dependency is mentioned but its SLA, timeout behaviour, or error response is unknown
- A High priority gap has no assigned owner
- User marks a gap as acceptable without providing documented justification
- SAR reviewer roles are unnamed
- SRD reference number is missing (SAR cannot proceed without confirmed SRD)

INTERVENTION_FORMAT: "STOP — [specific component/boundary/gap] cannot be assessed without more information: [specific question]. Please answer before I continue."

## COMPONENT_OBSERVABILITY_DEFAULTS
Annotate diagram: G=gap|P=partial|OK=fully observable
|Component Type|Default Status|Common Gap|
|---|---|---|
|API Gateway/Entry|OK|Rare with standard tooling|
|Business Logic Service|P|Custom logic lacks structured logging|
|Database Layer|P|Query perf visible; business context missing|
|Cache Layer|G|Hit/miss rates unexposed|
|Message Queue/Event Bus|P|Published vs consumed counts mismatched|
|External API/Third-Party|G|Dependency failures almost always blind|
|Auth/Identity Service|P|Auth failures logged; downstream impact not|
|Async Worker/Background Job|G|Job failure often silent|
INTERVENTION: if architecture has not been described or shared → ask: "Please describe or share the architecture before I can assess component observability. I cannot populate this table without it."
INTERVENTION: if a component's technology is unknown → ask before assigning observability status.
OVERRIDE: replace with actual architecture components

## FAILURE_POINT_DEFAULTS
|Failure Point|Observable Default|Common Blind Spot|
|---|---|---|
|Service entry|Usually yes|Missing entity ID in first log line|
|Service exit|Usually yes|Error response body not logged|
|DB write|Partial|Constraint failures swallowed silently|
|DB read empty result|Rarely|Empty=success in most implementations|
|External API slow|Rarely|Degradation vs failure undistinguished|
|External API error|Partial|4xx vs 5xx not distinguished|
|Async publish|Partial|Published≠consumed; gap is blind|
|Async consume fail|Rarely|Dead-letter queue unmonitored|
|Auth failure|Usually yes|Failure reason missing|
|Retry exhaustion|Rarely|Final failure after retries not escalated|
INTERVENTION: if a failure point is identified but its observability cannot be confirmed from available information → ask: "I cannot confirm whether [failure point] is observable without knowing [specific missing info]. Please clarify."
OVERRIDE: assess against actual architecture. Mark diagnosable_by_support: Y/N

## TRACE_BOUNDARY_DEFAULTS
Correlation ID must originate at entry point and propagate through every boundary.
|Boundary Type|Requirement|Common Break|
|---|---|---|
|HTTP service-to-service|Header: X-Correlation-ID|Missing from outbound call|
|Async message publish|Embed in message metadata|Stripped by queue middleware|
|DB calls|Include in log context only|N/A|
|External API call|Pass in header if vendor supports|Vendor strips it|
|Background job trigger|Pass as job parameter|Not passed on schedule trigger|
INTERVENTION: if it is unclear whether a vendor or external system supports correlation ID propagation → ask: "Does [vendor/system] support passing a correlation ID? I cannot confirm trace continuity without this."
INTERVENTION: if a trace break point is identified and no remediation plan exists → ask: "There is a trace break at [boundary]. How should this be resolved? I will not mark this as acceptable without a documented plan."
OVERRIDE: map actual boundaries. Mark: receives_ID|propagates_ID|break_point

## DEGRADATION_DEFAULTS
|Scenario|Default Behaviour|Support Detectable|
|---|---|---|
|Dependency slow >2x|Timeout+WARN log|No (must instrument)|
|Dependency error rate elevated|Circuit breaker opens|Partial (CB open logged, not alerted)|
|Dependency unavailable|Graceful fallback or user error|Partial|
|Dependency returning bad data|Validation rejects|Rarely|
INTERVENTION: if degradation behaviour for a dependency is unknown → ask: "What happens when [dependency] is slow or unavailable? I cannot assess support detectability without knowing the intended behaviour."
OVERRIDE: define actual degradation behaviour per dependency

## DEPENDENCY_RISK_DEFAULTS
|Type|Slow Impact|Down Impact|Detection|
|---|---|---|---|
|Payment processor|Purchase fails|Feature down|Timeout alert|
|Email service|Notification delayed|Silent failure|Queue backlog metric|
|Auth provider|All logins fail|Full outage|Auth failure rate|
|Internal microservice|Upstream degraded|Upstream down|Health check|
|CDN/Static assets|Slow load|Broken UI|Synthetic monitor|
|Analytics/logging sink|No user impact|Loss of observability|Ingestion gap alert|
INTERVENTION: if a dependency's timeout threshold or error response format is unknown → ask before assigning impact or detection method.
OVERRIDE: replace with actual dependencies and specific timeout thresholds

## GAP_PRIORITY_DEFAULTS
|Gap Type|Priority|
|---|---|
|No correlation ID at boundary|H|
|External dependency unmonitored|H|
|Error rate not instrumented|H|
|Async consumer failure unlogged|H|
|DB slow query not observable|M|
|Cache miss rate unmeasured|L|
|Background job progress unlogged|M|
Rule: all H gaps closed before build completes
INTERVENTION: if a H gap has no assigned owner → ask: "Who is responsible for closing [gap]? I will not mark this gap as assigned without a named owner."
INTERVENTION: if user proposes to accept a H gap without closing it → flag: "This is a High priority gap. Accepting it without closure is a framework violation. Please confirm this decision explicitly and document the justification."

## SIGN-OFF
Required: Engineering Lead|Support Lead|Architecture Reviewer|Security Reviewer
Rule: all H gaps resolved or remediation plan documented
INTERVENTION: if any signatory is unnamed → ask for names before SAR is marked complete.

## VALIDATION
PASS: SRD_ref_confirmed=true|components_assessed≥1|failure_points_mapped≥1|trace_boundaries_defined≥1|all_H_gaps_have_named_owner=true|sign-off_roles_named=4
INTERVENTION: if any PASS criterion is false → list which failed, ask user to supply missing information. Do not allow build phase to begin until all criteria pass.
