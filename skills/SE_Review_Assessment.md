# SE_REVIEW_ASSESSMENT v1.0
purpose:audit-mode operating layer for live Supportability Review engagements|invokes:B-SFL scoring+gap logic|produces:client-facing Supportability Review Report

## PURPOSE
Build-mode files (SRD/SAR/SIC/STP/SRR/SFL/B-SFL) assume the AI is producing an internal working document and can stop indefinitely until every field is confirmed. That behavior is correct for document creation and wrong for a live client conversation. This file overrides the intervention discipline for the duration of a review engagement, replaces blocking with logging, and defines the report structure the engagement produces.

## WHEN TO USE
Use SE_REVIEW_ASSESSMENT instead of standard build-mode intervention rules when:
- Conducting a live or synchronous Supportability Review with a client or stakeholder
- Gathering evidence in real time (interview, screen share, document walkthrough)
- The goal is a completed report at end of session, not a signed phase deliverable mid-conversation

Do not use for internal SRD/SAR/SIC/STP/SRR/SFL/B-SFL document creation done asynchronously with the document owner. Build-mode stop-and-ask rules remain correct there.

## OPERATING_MODE_OVERRIDE
Default build-mode behavior: "STOP — [gap]. Please answer before I continue."
Review-mode behavior: log the gap to FINDINGS_LOG, state it aloud once in one sentence, continue the review. Do not halt the conversation waiting for resolution.
Exception: CRITICAL_GAP_ESCALATION items below still stop the review immediately. These are not logged and continued past.

## INTERVENTION_OVERRIDE_RULES
Applies across all B-SFL and phase-scoring activity conducted in review mode:
|Build-Mode Trigger|Review-Mode Behavior|
|---|---|
|Required field missing|Log as finding: "Not provided during review, scored 1 by default per CURRENT_STATE_INDICATORS"|
|Evidence not available for a phase|Log as finding: "No evidence available, phase unscored, flagged for follow-up"|
|Signatory unnamed|Log as finding: "No named owner confirmed for [role/criterion]"|
|Gap does not map to a known root category|Log as finding under Uncategorized, ask one clarifying question, do not block the rest of the review on the answer|
|Compliance flag ambiguous|Log as finding, note framework(s) that may apply, recommend follow-up scoping call|
INTERVENTION: none of these override CRITICAL_GAP_ESCALATION. A finding that qualifies as critical is never merely logged.

## CRITICAL_GAP_ESCALATION
These stop the review live, regardless of review-mode override:
- Evidence of an active, unresolved security exposure (credentials in logs, unpatched known vulnerability, active data exposure)
- Evidence of a compliance violation currently in effect (PII actively logged without redaction, missing required breach notification path for a regulated data type already in production)
- Evidence a known failure mode caused customer harm and has not been disclosed to the customer
INTERVENTION_FORMAT for these: "STOP — this is a critical finding requiring immediate attention outside the scope of this review: [specific issue]. Recommend pausing the review to address this before continuing." Document the exchange, do not silently fold it into the standard findings log.

## ENGAGEMENT_FLOW
1. Scope: name the system/service under review, confirm client technical contact, confirm access to evidence sources (logs, dashboards, architecture docs, runbooks, incident history).
2. Evidence gathering: walk CURRENT_STATE_INDICATORS (B-SFL) per phase-equivalent. Ask once per item, log a finding if unanswered, move on.
3. Scoring: apply B-SFL scoring rubric per phase using whatever evidence was gathered. Unscored phases are marked explicitly, not silently defaulted.
4. Gap classification: run each logged gap through B-SFL's ROOT_CATEGORY_TO_NEXT_PHASE table.
5. Entry recommendation: apply B-SFL ENTRY_RECOMMENDATION_LOGIC to produce the phase-entry recommendation.
6. Report compilation: assemble REPORT_OUTPUT_STRUCTURE below.
INTERVENTION: if evidence access was never confirmed at Step 1 and the review proceeds anyway → flag in the report's Confidence section rather than blocking live: "Review conducted without confirmed evidence access for [source]. Scores below rely on stated description rather than direct evidence."

## FINDINGS_LOG_FORMAT
Running log kept during the review, becomes the report appendix.
|#|Phase|Finding|Evidence Basis|Priority|Root Category|
|---|---|---|---|---|---|
Evidence Basis: Direct (log/dashboard/document seen) | Stated (described, not shown) | Unconfirmed (not addressed)
Priority: H/M/L per B-SFL GAP_LOG_DEFAULTS

## REPORT_OUTPUT_STRUCTURE
Client-facing Supportability Review Report. No confidence tags or match ratings in this document, those are chat-only conventions and do not appear in client deliverables.
1. **Executive Summary**: one paragraph, plain language, no framework jargon, overall maturity picture and single most important next step.
2. **Maturity Scorecard**: per-phase score (1-5) with one-line evidence basis for each. Use the Maturity Ladder stages (Starting out/Using the baseline/Customized/Mature) from the repo README to translate the numeric score into a plain-language stage.
3. **Findings by Priority**: H items first, each with root category and recommended action.
4. **Entry Recommendation**: single line output from B-SFL ENTRY_RECOMMENDATION_LOGIC, plus one paragraph of reasoning.
5. **Suggested Path Forward**: map recommendation to Baseline Kit vs. full SRD-first cycle vs. B-SFL formal engagement, per the repo's Maturity Ladder and Where to Start guidance. This section is the natural handoff into a consulting engagement, not a hard sell, a factual next-step map.
6. **Appendix: Evidence Log**: the full FINDINGS_LOG table, unfiltered.

## SIGN-OFF
Required: Client Technical Contact|Reviewing Consultant
Rule: sign-off on a Review Report confirms findings were disclosed as presented, not that remediation has occurred.

## VALIDATION
PASS: system_scoped=true|evidence_access_confirmed_or_flagged=true|all_phases_scored_or_explicitly_unscored=true|findings_log_complete=true|no_critical_gap_unaddressed=true|entry_recommendation_issued=true|report_assembled=true
INTERVENTION: if any PASS criterion is false → do not issue final report. State which criteria are outstanding and whether a follow-up session is needed.

## OWNER
John A. Bowman|dooohhead@gmail.com|902-489-2429|Confidential
