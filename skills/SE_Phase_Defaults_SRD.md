# SE_DEFAULTS_SRD v1.2
phase:1|deliverable:SRD|gate:Support sign-off→design begins

## INTERVENTION_TRIGGERS — SRD SPECIFIC
Stop and ask whenever:
- Feature description is missing or too vague to map failure modes
- Customer segments not identified (cannot pre-classify impact without this)
- A failure mode type applies but user has not described the specific scenario
- BI or CI classification is being assigned without user confirming revenue at risk or customer tier
- Escalation contacts are unnamed (generic role is not sufficient for a complete SRD)
- A compliance flag is triggered but user has not confirmed scope or regulatory context
- Observability requirement is vague (e.g. "add logging" — ask: what specifically must be observable?)
- SLA value needed but not provided by user
- Sign-off role is unnamed
- Any field left blank that is marked Required

INTERVENTION_FORMAT: "STOP — [specific field/section] is unclear or missing. [specific question]. Please answer before I continue."

## OBSERVABILITY_DEFAULTS
|Observable|Method|Priority|
|---|---|---|
|Feature entry/exit events|Log|H|
|Transaction success/failure|Metric+Log|H|
|Error rate per endpoint|Metric|H|
|Latency p50/p95/p99|Metric|H|
|Customer/entity ID on all events|Log field|H|
|Correlation ID propagation|Log field|H|
|Dependency call outcomes|Log|M|
|Queue depth (async only)|Metric|M|
INTERVENTION: if user says "add logging" or similar without specifying what → ask: "What specific events, transactions, or states must be observable? List them before I populate this table."
OVERRIDE: add feature-specific business events

## FAILURE_MODES_DEFAULTS
|Type|Override With|
|---|---|
|Complete Outage|Feature total failure state|
|Partial Failure|Feature partial failure states|
|Degraded State|Feature performance thresholds|
|Data Issue|Feature data validity criteria|
|Performance|Feature SLA numbers|
|Security/Auth|Feature auth paths|
INTERVENTION: if user has not described at least one specific failure scenario → ask: "Describe how this feature can fail. I need at least one concrete failure scenario before I can populate the failure mode inventory."
Each mode requires: customer_experience|detection_method|initial_response — ask for each if not provided.

## IMPACT_DEFAULTS
|Failure Mode|CI|BI|Escalation|
|---|---|---|---|
|Complete Outage|1|1|L3|
|Partial Failure|2|2|L2|
|Degraded State|3|3|L2|
|Data Issue|2|2|L2|
|Performance|3|3|L1|
|Security/Auth|1|1|L4|
INTERVENTION: before applying any default BI/CI → ask: "Which customer tiers use this feature and what is the revenue at risk for each failure mode? I am applying defaults — confirm or override."
INTERVENTION: if enterprise customers are involved and default is CI-2 or lower → flag: "Enterprise customers may warrant a higher classification. Confirm BI/CI before proceeding."

## READINESS_DEFAULTS
|Criterion|Owner|Target Phase|
|---|---|---|
|Logging standard verified|Engineering|SIC|
|Dashboards live with baseline|Eng+Support|STP|
|Alerts configured and tested|Eng+Support|STP|
|Runbook written+reviewed+published|Support|STP|
|Impact classification in ticketing|Support|SRR|
|On-call rotation updated|Support Lead|SRR|
|Team trained on failure modes|Support Lead|SRR|
|Rollback documented and tested|Engineering|SRR|
INTERVENTION: if any owner field is unnamed → ask for the name before finalizing the SRD.
OVERRIDE: add feature-specific criteria

## ESCALATION_DEFAULTS
|Level|Trigger|Response Time|Comms|
|---|---|---|---|
|L1|BI-4|4 business hrs|On resolution|
|L2|BI-3|2hr|Within 2hr|
|L3|BI-2|30min|Within 30min|
|L4|BI-1|Immediate|Immediate|
INTERVENTION: if escalation contacts are not named → ask: "Who specifically is L1/L2/L3/L4 for this feature? Generic role titles are not sufficient for a complete SRD."
INTERVENTION: if on-call coverage hours not stated → ask before finalizing escalation path.

## COMPLIANCE_DEFAULTS
|Flag|Default|Override If|
|---|---|---|
|PII|No|User profile/email/address/payment|
|Financial data|No|Billing/payments/invoices|
|Health/medical|No|Health/wellness/insurance|
|Regulatory reporting|No|Financial/healthcare/government|
|Data residency|No|Multi-region/EU/APAC|
|Audit trail|Yes|No compliance surface|
INTERVENTION: if feature touches user data of any kind and PII flag has not been explicitly assessed → ask: "Does this feature handle, store, or transmit any user data? I cannot set compliance flags without confirmation."
INTERVENTION: if regulatory reporting flag may apply → ask: "Is this feature subject to any regulatory reporting obligations on failure? Do not assume No."

## SIGN-OFF
Required: Product Owner|Engineering Lead|Support Lead|QA Lead
Rule: no sign-off→no design phase
INTERVENTION: if any signatory is unnamed → ask for names before document is marked complete.

## VALIDATION
PASS: feature_described=true|segments_identified=true|observability_rows≥6|failure_modes=6|impact_rows=6|readiness_rows=8|escalation_levels=4|compliance_flags=6|sign-off_roles_named=4
INTERVENTION: if any PASS criterion is false → list which criteria failed, ask user to supply missing information. Do not mark SRD complete or allow design to begin until all criteria pass.
