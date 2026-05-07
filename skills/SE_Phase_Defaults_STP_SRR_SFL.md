# SE_DEFAULTS_STP_SRR_SFL v1.2

---
# STP — Phase 4 | Test
gate: Any required test fail→release blocked

## INTERVENTION_TRIGGERS — STP SPECIFIC
Stop and ask whenever:
- SRD failure mode list has not been confirmed final (cannot test against a moving target)
- A failure mode cannot be triggered in the test environment and no alternative is proposed
- Log output reviewed but correlation ID or entity ID is missing and reviewer is uncertain
- An alert fired but routing destination has not been verified end-to-end
- A runbook walkthrough was not completed by someone unfamiliar with the feature
- Tabletop simulation was skipped or abbreviated without documented justification
- Any test result is marked Pass without evidence
- Overall recommendation is unclear

INTERVENTION_FORMAT: "STOP — [test/scenario] cannot be confirmed complete: [specific question]. Please clarify before I record a result."

## FAILURE_INJECTION_DEFAULTS
Each SRD failure mode must be triggered deliberately. Pass=all 4 true.
|Dimension|Pass Criteria|Fail Trigger|
|---|---|---|
|Detected|Alert fires <5min of injection|No alert|wrong destination|wrong severity|
|Logged correctly|Correlation ID present|correct level|entity ID included|Missing ID|wrong level|no context|
|Alert fires|Correct severity+routing|Misfired|wrong team|no alert|
|Result assigned|Explicit pass or fail per mode|Partial=fail|
INTERVENTION: if a failure mode cannot be triggered in the test environment → ask: "How will [failure mode] be tested if it cannot be triggered in the test environment? An alternative must be documented or the test is incomplete."
INTERVENTION: if a result is Partial → ask: "Partial is a Fail. What specifically failed and what is the remediation plan before release?"
OVERRIDE: adjust detection window to feature SLA

## LOG_QUALITY_DEFAULTS
|Criterion|Pass Standard|
|---|---|
|Transaction boundary coverage|Log at every entry AND exit|
|Log level accuracy|Zero errors at INFO; zero debug in prod path|
|PII absence|Zero PII fields across all test scenarios|
|Searchability|Findable by customer_id AND correlation_id|
|Noise level|<10 lines per normal transaction (excl. debug)|
|Full trace|Correlation ID query returns complete end-to-end path|
INTERVENTION: if log review was not performed against actual test output → ask: "Has actual log output been reviewed, or is this based on code inspection only? These are not equivalent. Confirm which."
INTERVENTION: if PII absence has not been verified in test output → ask: "Has log output been checked for PII in the test environment? Code review is not sufficient — test output must be checked."

## ALERT_VALIDATION_DEFAULTS
|Point|Requirement|
|---|---|
|Every SRD-defined alert fires|Required. Zero untested alerts to production.|
|Severity matches BI|BI-1=Critical|BI-2=High|BI-3=Medium|BI-4=Low|
|Routes correctly|Support=BI-3/4|Eng=BI-2|VP=BI-1|
|Context sufficient|component|entity_id|correlation_id|description|
|No false positives|Zero alerts during healthy operation test|
INTERVENTION: if any alert has not been end-to-end tested in the test environment → ask: "Alert [X] has not been fired and confirmed received. This must be tested before release. When will this be completed?"
INTERVENTION: if routing destination is assumed but not verified → ask: "Has the alert routing for [alert] been confirmed with the recipient? Assumption is not sufficient."

## RUNBOOK_WALKTHROUGH_DEFAULTS
|Standard|Default|
|---|---|
|Tester|Support engineer who did NOT write runbook|
|Available tools|Logs+alerts+dashboards only (production equivalent)|
|Engineering contact|Unavailable during walkthrough|
|Pass threshold|Independently diagnosed+correct escalation identified|
|Time threshold|BI-3/4: <30min|BI-1/2: <15min|
|Gap action|Every gap found→required action before release|
INTERVENTION: if walkthrough was performed by the runbook author → flag: "The walkthrough must be performed by someone who did not write the runbook. This result is invalid. Reassign and re-run."
INTERVENTION: if engineering was available during the walkthrough → flag: "Engineering contact availability during walkthrough invalidates the test. Re-run with engineering unavailable."
INTERVENTION: if a gap was found but no action is documented → ask: "Gap found in runbook for [failure mode]. What is the remediation action and who owns it? Release is blocked until this is resolved."

## TABLETOP_DEFAULTS
|Element|Default|
|---|---|
|Scenario|BI-2 incident|
|Duration|60min|
|Participants|Support lead+on-call engineer+1 junior support|
|Escalation path|Must be invoked correctly without coaching|
|Customer comms|Template selected+sent within 30min|
|PIR|Must be triggered during simulation|
INTERVENTION: if tabletop was skipped → ask: "Tabletop simulation is required. What is the justification for skipping it? This must be documented and approved before release."
INTERVENTION: if escalation path was not invoked correctly during simulation → ask: "Escalation path was not correctly followed. What corrective action will be taken before release?"
OVERRIDE: add BI-1 scenario for revenue-critical features

## STP_SIGN-OFF
Required: QA Lead|Support Lead|Engineering Lead
Rule: overall=PASS before any signature collected
INTERVENTION: if overall recommendation is not clearly PASS → ask: "The overall result is not confirmed PASS. Release is blocked. What items remain and who owns resolution?"

## STP_VALIDATION
PASS: all_SRD_failure_modes_injection_tested=true|log_quality_all_pass=true|all_alerts_validated_end_to_end=true|runbook_walkthroughs_by_non_author=true|tabletop_completed=true|overall=PASS
INTERVENTION: if any criterion false → list failures, ask user for resolution plan. Release blocked until all pass.

---
# SRR — Phase 5 | Release
gate: Support Lead+Eng Lead both sign. Neither alone sufficient.

## INTERVENTION_TRIGGERS — SRR SPECIFIC
Stop and ask whenever:
- Any upstream deliverable (SRD/SAR/SIC/STP) is not confirmed signed
- Open items are being carried forward from any upstream phase
- Monitoring dashboards have not been verified in the production environment
- Baseline metrics are not established (pre-production or load test data missing)
- A runbook has not been independently reviewed
- On-call rotation has not been updated with a named owner for this feature
- Rollback has not been tested in a pre-production environment
- Communication templates have not been approved
- Either Support Lead or Engineering Lead has not confirmed availability to sign
- Release date is imminent and items remain open

INTERVENTION_FORMAT: "STOP — [item] is not confirmed complete. Release cannot proceed: [specific question]. Please resolve before I record this as ready."

## UPSTREAM_DEFAULTS
All 4 required before SRR begins. No exceptions.
|Deliverable|Required Status|
|---|---|
|SRD|Signed|
|SAR|Signed+all H gaps closed|
|SIC|Signed+all R items checked|
|STP|Signed+overall=PASS|
INTERVENTION: if any deliverable is not confirmed signed → ask: "Deliverable [X] is not confirmed signed. SRR cannot begin until all four upstream deliverables are complete. What is the status?"
INTERVENTION: if open items are being carried forward → flag: "Open items cannot be carried into production. Each item must be resolved or the release is BLOCKED. List all open items and their resolution plan."

## MONITORING_DEFAULTS
|Requirement|Standard|
|---|---|
|Dashboards live|Verified against known good state in production|
|Baseline established|Min 24hr pre-prod load test data|
|All alerts active|End-to-end routing test in prod config|
|On-call chain tested|Test alert sent; delivery confirmed to correct person|
INTERVENTION: if dashboards have only been verified in a non-production environment → ask: "Production monitoring must be verified in production, not a staging environment. Has this been confirmed?"
INTERVENTION: if baseline data is less than 24 hours → ask: "Baseline data is less than 24 hours. Is there a justification for proceeding? This must be explicitly accepted as a risk."

## COMMS_TEMPLATE_DEFAULTS
|BI|Requirement|Approvers|
|---|---|---|
|BI-1|Immediate notification+executive flash|Support Lead+Account Mgmt Lead|
|BI-2|Customer update within 30min+internal escalation|Support Lead+Account Mgmt Lead|
|BI-3|Customer update within 2hr|Support Lead|
|BI-4|Resolution summary only|Support Lead|
INTERVENTION: if templates have been drafted but not approved → ask: "Templates must be approved before release, not after. Who needs to approve and has that happened?"
INTERVENTION: if BI-1 or BI-2 templates have not been reviewed by Account Management → flag: "BI-1 and BI-2 templates require Account Management approval. This has not been confirmed."

## RELEASE_DECISION
APPROVED: all items complete, no outstanding
CONDITIONAL: documented accepted risk+VP sign-off (rare)
BLOCKED: outstanding items→resolve→re-run SRR
INTERVENTION: if CONDITIONAL is being proposed → ask: "What specific risk is being accepted and who is authorizing it? VP sign-off is required. This must be documented before release proceeds."

## SRR_SIGN-OFF
Required: Support Lead|Engineering Lead|Product Owner|Release Manager
INTERVENTION: if either Support Lead or Engineering Lead is unavailable to sign → ask: "Both Support Lead and Engineering Lead must sign. Neither can delegate. When will [unavailable signatory] be available?"

## SRR_VALIDATION
PASS: all_upstream_signed=true|no_open_items_carried=true|monitoring_live_in_prod=true|baseline_established=true|runbooks_independently_reviewed=true|on-call_named_owner=true|rollback_tested=true|comms_approved=true|both_leads_signed=true
INTERVENTION: if any criterion false → list failures. Release does not proceed. Ask user for resolution plan and timeline for each outstanding item.

---
# SFL — Phase 6 | Operate
gate: Quarterly. Sign-off confirms review+backlog items created for all H gaps.

## INTERVENTION_TRIGGERS — SFL SPECIFIC
Stop and ask whenever:
- An incident is being scored without a complete incident record available
- A gap is logged but has no assigned owner or backlog reference
- A runbook was used but accuracy has not been assessed post-incident
- Quarterly review attendance is incomplete (any of the three required roles missing)
- Shift left effectiveness metric cannot be calculated due to missing data
- A H priority gap has not been converted to a backlog item
- The same root category has appeared 3+ times and no systemic fix has been proposed
- Sign-off is being requested before all H gaps have backlog items

INTERVENTION_FORMAT: "STOP — [specific SFL item] is incomplete: [specific question]. Please resolve before I record this period as reviewed."

## INCIDENT_SCORING_DEFAULTS
Score within 24hr of closure. Scorer=primary support engineer. Reviewer=support lead.
|Threshold|Action|
|---|---|
|Any dimension 1 or 2|Mandatory gap log entry|
|Avg score <3|Backlog item for next sprint|
|Avg score <2|Escalate to eng lead for architecture review|
|Consistent 1s same dimension|Trigger SRD or SAR review for affected feature|
INTERVENTION: if incident record is incomplete → ask: "I cannot score this incident without [specific missing detail]. Please provide before I assign a score."
INTERVENTION: if a score of 1 or 2 is assigned and no gap log entry exists → flag: "A score of 1 or 2 requires a mandatory gap log entry. This has not been created. Who will own this?"

## GAP_LOG_DEFAULTS
|Priority|Criteria|Resolution Target|
|---|---|---|
|H|Caused/extended BI-1 or BI-2|Next sprint|
|M|Caused unnecessary eng escalation|Within 2 sprints|
|L|No escalation impact|Quarterly review|
Rule: every gap logged=backlog item. Closed only by code change or doc update.
INTERVENTION: if a H gap has no backlog item → ask: "Gap [X] is High priority and has no backlog item. Who will create it and in which sprint? I will not mark this gap as tracked without this."
INTERVENTION: if a gap is proposed to be closed without a code change or documentation update → flag: "Gaps can only be closed by a code change or documentation update. What specifically was changed?"

## RUNBOOK_ACCURACY_DEFAULTS
|Accuracy|Action|Version|
|---|---|---|
|Accurate|Log only|No change|
|Partial|Update within 48hr of closure|Minor (x.1)|
|Inaccurate|Update same day+notify all support|Major (x.0)|
INTERVENTION: if a runbook was used in an incident but accuracy has not been assessed → ask: "Was the runbook accurate during this incident? I cannot close the incident record without a runbook accuracy assessment."
INTERVENTION: if runbook update is overdue (>48hr for Partial, >24hr for Inaccurate) → flag: "Runbook update is overdue for [runbook]. This must be completed. Who is responsible?"

## QUARTERLY_REVIEW_DEFAULTS
Required attendees: Support Lead|Engineering Lead|Product Owner
Agenda: avg score by feature|top 3 root categories|gap log opened vs closed|runbook updates|shift-left metric|backlog items for next SRD
INTERVENTION: if any required attendee is absent → ask: "Quarterly review requires Support Lead, Engineering Lead, and Product Owner. [role] is absent. The review cannot be signed off without all three present or a documented exception."
INTERVENTION: if the same root category appears in top 3 for two consecutive quarters → flag: "Root category [X] has appeared in top 3 for two consecutive quarters. A systemic fix must be proposed before this quarter's review is closed. Who owns this?"

## SHIFT_LEFT_METRIC_DEFAULTS
Target: 20% reduction in preventable incidents QoQ
|Metric|Method|
|---|---|
|Total incidents|Ticket system count|
|Traceable to SRD gap|Tagged at PIR|
|Traceable to SAR gap|Tagged at PIR|
|Traceable to SIC gap|Tagged at PIR|
|Traceable to STP gap|Tagged at PIR|
|Traceable to SRR gap|Tagged at PIR|
|% preventable|(sum phase-traceable/total)×100|
|Cost of preventable|Eng hours×burdened rate+customer impact estimate|
INTERVENTION: if PIR tags are missing for incidents → ask: "Incidents cannot be phase-traced without PIR tags. How many incidents this period are untagged? The metric cannot be calculated without this."
INTERVENTION: if metric shows 0% improvement for two consecutive quarters → flag: "No improvement in preventable incidents for two quarters. This requires a framework review. Who will lead this?"

## SFL_SIGN-OFF
Required: Support Lead|Engineering Lead|Product Owner
INTERVENTION: if any H gap has no backlog item at time of sign-off → flag: "Sign-off cannot be granted while H priority gaps are untracked. [X] gaps remain without backlog items."

## SFL_VALIDATION
PASS: all_incidents_scored=true|all_H_gaps_have_backlog_item=true|all_used_runbooks_assessed=true|quarterly_review_all_attendees_present=true|shift_left_metric_calculated=true|all_3_sign-offs_obtained=true
INTERVENTION: if any criterion false → list failures. Quarterly sign-off withheld. Ask user for resolution plan.
