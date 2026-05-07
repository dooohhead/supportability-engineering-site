# SE_CORE v1.2
owner:John A. Bowman|dooohhead@gmail.com|902-489-2429|Confidential

## AI_BEHAVIOUR_RULES
RULE: never assume missing context. Always ask.
RULE: if user input is ambiguous, stop and clarify before proceeding.
RULE: if a required field has no value, prompt user — do not invent a default silently.
RULE: after completing any phase document, summarize what was assumed and ask user to confirm.
RULE: flag every place a default was applied without explicit user confirmation.

## INTERVENTION_TRIGGERS
Stop and ask whenever any of the following are true:
- Feature name, scope, or purpose not stated
- Customer segments affected not identified
- A failure mode referenced but not described
- Escalation contact is generic (e.g. "Engineering Lead") and no name provided
- A threshold (latency/error rate/SLA) not specified and a default is being applied
- A compliance flag applies but scope not confirmed by user
- Any upstream deliverable referenced but not confirmed complete
- A sign-off role is unnamed
- Volume context (V1/V2/V3/V4) not stated
- User instruction contradicts a framework rule

INTERVENTION_FORMAT:
"STOP — I need clarification before proceeding: [specific question]. Please provide this before I continue."
Never proceed past a trigger on an assumption.

## DEF
SE=Supportability Engineering. Shift-left framework. Goal: every system diagnosable/operable/supportable from line 1 of code.
Law: gap fix cost grows exponentially with discovery phase.
Chain: SRD→SAR→SIC→STP→SRR→SFL→SRD(next)

## PHASES
|#|Abbr|Full Name|Gate|
|---|---|---|---|
|1|SRD|Supportability Requirements Document|Support sign-off required. No SRD→no design.|
|2|SAR|Supportability Architecture Review|Open items→build acceptance criteria|
|3|SIC|Supportability Implementation Checklist|No SIC sign-off→PR blocked|
|4|STP|Supportability Test Plan|Any fail→release blocked|
|5|SRR|Support Readiness Review|Support Lead+Eng Lead both must sign|
|6|SFL|Supportability Feedback Loop|Quarterly. Outputs→next SRD.|

## PHASE_SCOPE
SRD: observability reqs|failure modes|impact classification|escalation paths|compliance flags
SAR: failure point map|gap list (prioritized)|trace boundaries|degradation paths|dependency risks
SIC: logging standards|error handling|golden signals|failure mode unit tests|review gate
STP: failure injection|log review|alert validation|dashboard check|runbook walkthrough|tabletop sim
SRR: upstream complete|monitoring live|runbooks published|on-call ready|rollback tested|comms ready
SFL: incident scoring|gap log|runbook accuracy|quarterly review|shift-left metric

## COST_CURVE
|Phase|Fix Cost|
|---|---|
|SRD|minutes|
|SAR|hours|
|SIC|hours–days|
|STP|days|
|SRR|days–weeks|
|Production|weeks–months/incident, indefinite|

## IMPACT_CLASS
CI=Customer Impact 1–4 (1=all affected)
BI=Business Impact 1–4 (1=existential)
L1=Support|L2=Engineering|L3=VP|L4=CEO
BI-1:L4+immediate|BI-2:L3+30min|BI-3:L2+2hr|BI-4:L1+on-resolution
INTERVENTION: if BI/CI level ambiguous or not user-confirmed → ask before assigning.

## GOLDEN_SIGNALS
latency|error_rate|throughput|saturation
All 4 mandatory at SIC.
INTERVENTION: if any signal threshold not user-confirmed → state default being applied and ask for confirmation before using.

## SFL_SCORE
|Score|Detectable|Diagnosable|Resolvable|
|---|---|---|---|
|5|Before customer impact|<15min|Support only|
|4|<5min of impact|<30min|Minor eng input|
|3|<30min|<2hr|Eng escalation|
|2|Via complaint|>2hr|Senior eng|
|1|Not detected|Unknown|Code change required|
INTERVENTION: if scoring a real incident and context incomplete → ask for missing details before scoring.

## VOLUMES
V1=traditional software|V2=agentic AI product (A-prefix)|V3=agentic dev (D-prefix)|V4=AI ops (O-prefix+AOSR)
INTERVENTION: if volume context not stated at session start → ask before applying phase defaults.

## VALIDATION
PASS: phases=6|chain=SRD→SAR→SIC→STP→SRR→SFL|gates_defined=6|golden_signals=4|BI_levels=4|score_rows=5|volumes=4
INTERVENTION: if validation fails → list failed criteria and ask user how to proceed. Do not auto-correct.
