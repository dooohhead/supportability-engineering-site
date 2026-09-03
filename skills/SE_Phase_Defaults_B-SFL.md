# SE_DEFAULTS_B-SFL v1.1
phase:B (brownfield entry)|deliverable:B-SFL|gate:No signed upstream chain found→B-SFL required before next SRD opens
changelog:v1.1 (2026-09-02) — absence-of-evidence resolved to unscored/flagged, not scored 1. Unscored phases now auto-escalate to High priority gap per UNSCORED_PHASE_ESCALATION, except SFL-equiv (no direct entry-phase mapping, does not block entry). See SE_Review_Assessment.md v1.1.

## PURPOSE
Brownfield extension of SFL. Same scoring rubric, same gap log, same backlog output as standard SFL. Different trigger: not a closed incident, but a system with no signed SRD/SAR/SIC/STP/SRR on file. Produces a current-state maturity score per phase and a prescribed entry point for the next development cycle. This is the deliverable for a Supportability Review engagement.

## TRIGGER
Use B-SFL instead of standard SFL when:
- System is already in production with no upstream SE deliverables signed
- A consulting/review engagement is assessing an existing system's supportability maturity
- A team is adopting SE mid-lifecycle rather than at a feature's requirements phase

## INTERVENTION_TRIGGERS — B-SFL SPECIFIC
Stop and ask whenever:
- System or service boundary being reviewed is not clearly named or scoped
- Access to logs, dashboards, or architecture diagrams has not been confirmed (scoring from description alone is not sufficient)
- A phase score is being assigned without at least one concrete piece of evidence (log sample, dashboard screenshot, runbook document, incident history)
- Customer segments or business impact for the system have not been identified
- Review is being conducted without a named client-side technical contact
- A gap is found but no root category from the mapping table applies (new category, not a documentation gap)
- Sign-off roles are unnamed

INTERVENTION_FORMAT: "STOP — [specific phase/component] cannot be scored without evidence: [specific question]. Please provide or confirm before I continue."

## CURRENT_STATE_INDICATORS
Evidence-based signals used to score each phase's current maturity. Absence of evidence leaves the phase unscored and flagged for follow-up, not a numeric score and not a default assumption of partial credit.
|Phase|Evidence Sought|Absence Signal|
|---|---|---|
|SRD equiv.|Any documented failure mode inventory or requirements doc|None found→unscored, flagged for follow-up|
|SAR equiv.|Architecture diagram with observability annotations|Diagram exists but unannotated→score 2|
|SIC equiv.|Structured logging, correlation IDs, golden signals present in code/logs|Logs exist but unstructured/no correlation ID→score 2|
|STP equiv.|Evidence of tested runbooks or rehearsed incident response|Runbook exists, never walked through by non-author→score 2|
|SRR equiv.|Evidence of formal release gate tied to support readiness|Release process exists, no support sign-off step→score 2|
|SFL equiv.|Evidence of a feedback loop from incidents to backlog|Postmortems exist, no systematic backlog linkage→score 2|
INTERVENTION: if no evidence exists for a phase and user proposes scoring based on description only → ask: "I have no evidence for [phase]. Score based on stated description, or defer scoring until evidence is available? State the choice explicitly, it affects report confidence."
OVERRIDE: add system-specific evidence sources

## SCORING
Reuses the standard SFL 1-5 scale (Detectable/Diagnosable/Resolvable), applied to current state rather than a specific incident.
|Score|Detectable|Diagnosable|Resolvable|
|---|---|---|---|
|5|Before customer impact|<15min|Support only|
|4|<5min of impact|<30min|Minor eng input|
|3|<30min|<2hr|Eng escalation|
|2|Via complaint|>2hr|Senior eng|
|1|Not detected|Unknown|Code change required|
For B-SFL: score against the system's demonstrated behavior in its most recent 2-3 incidents if available, or against CURRENT_STATE_INDICATORS if no incident history exists.
INTERVENTION: if neither incident history nor current-state evidence is available for a component → ask before scoring: "No basis exists to score [component]. What evidence can be provided?"

## GAP_LOG_DEFAULTS
Same structure as standard SFL gap log.
|Priority|Criteria|Resolution Target|
|---|---|---|
|H|No detection or diagnosis path exists for a customer-facing failure mode, or a phase-equivalent is left unscored due to zero evidence found (see UNSCORED_PHASE_ESCALATION)|Immediate, precedes next release|
|M|Detection exists but diagnosis requires engineering escalation every time|Within next full SE cycle|
|L|Cosmetic or low-frequency gap|Quarterly review once SFL is running|
Rule: every gap logged becomes a backlog item, same as standard SFL.

## ROOT_CATEGORY_TO_NEXT_PHASE
Canonical source for this mapping as of 2026-09-01. Templates §6.5 Incident Root Category Analysis is derived from this table, not the reverse. If this mapping changes, Templates §6.5 must be updated manually to match; it does not sync automatically. This is the prescriptive engine, it converts a scored gap into a specific entry point recommendation.
|Root Category|Recommended Entry Phase|
|---|---|
|Logging/observability gap|SIC or SAR|
|Missing or inaccurate runbook|STP|
|Alert did not fire or fired too late|SIC or STP|
|Failure mode not anticipated/documented|SRD|
|Architecture blind spot|SAR|
|Support not trained on system behavior|SRR|
|Escalation path incorrect or slow|SRD or SRR|
INTERVENTION: if a gap does not map cleanly to one of these categories → ask: "This gap does not match a known root category. Describe it precisely so it can be classified before a phase recommendation is issued."

## UNSCORED_PHASE_ESCALATION
A phase-equivalent left unscored per CURRENT_STATE_INDICATORS (zero evidence found) is automatically logged as a High priority gap. Root category is the phase's own deliverable, no manual classification needed, the absence of evidence is the classification.
|Unscored Phase|Root Category|Recommended Entry Phase|
|---|---|---|
|SRD equiv.|Failure mode not anticipated/documented|SRD|
|SAR equiv.|Architecture blind spot|SAR|
|SIC equiv.|Logging/observability gap|SIC or SAR|
|STP equiv.|Missing or inaccurate runbook|STP|
|SRR equiv.|Support not trained on system behavior|SRR|
|SFL equiv.|No direct mapping, SFL is the last phase in the chain. Log as High priority finding and state explicitly in the report: "No evidence of a feedback loop from incidents to backlog. This does not block phase entry but should be established once the recommended entry phase is complete."|N/A, see note|

## ENTRY_RECOMMENDATION_LOGIC
1. Score all 6 phase-equivalents using CURRENT_STATE_INDICATORS and available incident history.
2. Log every gap found, classify by ROOT_CATEGORY_TO_NEXT_PHASE.
3. Recommended entry point = earliest phase with a High priority gap. If multiple phases carry H gaps, list all, sequence by COST_CURVE (SRD-equivalent gaps first, they compound into every downstream phase).
4. If no H gaps exist, recommended entry point = SRR-equivalent, confirm readiness and begin standard SFL cycle going forward.
5. Output is a single recommendation line: "Enter at [phase]. Reason: [root category]. Supporting gaps: [list]."
INTERVENTION: if scoring surfaces H gaps in more than 3 phases → flag: "Findings indicate systemic gaps across [N] phases, not a single entry point. Recommend a phased remediation plan rather than a single phase entry. Confirm before finalizing the report."

## SIGN-OFF
Required: Client Technical Contact|Reviewing Consultant
Rule: sign-off confirms evidence basis was disclosed for every score, not that scores were agreed as final assessments of blame.
INTERVENTION: if either signatory is unnamed → ask for names before B-SFL is marked complete.

## VALIDATION
PASS: system_scoped=true|evidence_basis_disclosed_per_phase=true|all_gaps_classified=true|H_gaps_have_entry_recommendation=true|entry_recommendation_issued=true|sign-off_roles_named=2
INTERVENTION: if any PASS criterion is false → list which failed, ask user to supply missing information. Do not issue a final Supportability Review report until all criteria pass.

## OWNER
John A. Bowman|dooohhead@gmail.com|902-489-2429|Confidential
