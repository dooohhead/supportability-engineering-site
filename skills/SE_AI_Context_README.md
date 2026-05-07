# SE_AI_CONTEXT_USAGE v1.2

## FILES
|File|Purpose|Include When|
|---|---|---|
|SE_AI_Context_Core.md|Framework identity, phases, scoring, classification, global intervention rules|Every session|
|SE_Phase_Defaults_SRD.md|Phase 1 defaults+interventions+validation|Requirements work|
|SE_Phase_Defaults_SAR.md|Phase 2 defaults+interventions+validation|Architecture review|
|SE_Phase_Defaults_SIC.md|Phase 3 defaults+interventions+validation|Build/PR review|
|SE_Phase_Defaults_STP_SRR_SFL.md|Phases 4/5/6 defaults+interventions+validation|Test/release/operate work|

## USAGE_PATTERNS
Full session: Core.md + relevant phase defaults file
Single phase: Core.md + that phase file only
Quick ref: Core.md only

## HOW_AI_USES_THESE_FILES
1. Parses tables as structured lookup data, not prose.
2. Applies defaults automatically unless user overrides.
3. INTERVENTION_TRIGGERS checked continuously — AI stops and asks before proceeding past any ambiguity.
4. VALIDATION block checked at phase completion — AI lists failures and asks for resolution, never auto-corrects.
5. AI_BEHAVIOUR_RULES in Core apply globally across all phases.
6. INTERVENTION_FORMAT is the standard output format when a trigger fires — specific, not generic.

## INTERVENTION_BEHAVIOUR
When a trigger fires, AI outputs: "STOP — [specific question]. Please answer before I continue."
AI does not guess. AI does not proceed. AI waits for user input.
This applies to: missing fields|ambiguous inputs|unnamed roles|unconfirmed defaults|framework rule conflicts.

## OVERRIDE_SYNTAX
Tell AI: "Override [field] with [value]"
Examples:
- "Override escalation L2 with Sarah Chen"
- "Override error rate threshold to >0.5% sustained 3min"
- "Override runbook walkthrough time to <10min"

## ARCHIVE_INSTRUCTION
Trigger: user says "archive conversation"
Action: create [ProjectName]-[ChatWindowName]-YYYY-MM-DD.docx
Example: Supportability-Engineering-HallucinationPrevention-2026-05-07.docx
Format: user prompts followed by AI responses in order, full session
Note: if chat window name is unknown, ask user before creating the file

## OWNER
John A. Bowman|dooohhead@gmail.com|902-489-2429|Confidential
