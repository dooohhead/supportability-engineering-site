const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageBreak, LevelFormat,
  TabStopType, TabStopPosition
} = require('docx');
const fs = require('fs');

const NAVY   = "0f2340";
const NAVY2  = "1b3a5c";
const PURPLE = "4c1d95";
const PURPLE2= "7c3aed";
const PURPLEBG="f5f3ff";
const PURPLELITE="ede9fe";
const GOLD   = "c9993a";
const MGRAY  = "F4F6F9";
const DGRAY  = "2d3748";
const WHITE  = "FFFFFF";
const REDDARK= "7f1d1d";
const REDBG  = "fff5f5";
const GREEN  = "064e3b";
const GREENBG= "ecfdf5";

const bd = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: bd, bottom: bd, left: bd, right: bd };
const nb = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: nb, bottom: nb, left: nb, right: nb };

const sp = (before=0, after=120) => new Paragraph({ spacing:{before,after}, children:[] });
const pb = () => new Paragraph({ children:[new PageBreak()] });

const rule = (color=PURPLE2) => new Paragraph({
  border:{ bottom:{ style:BorderStyle.SINGLE, size:12, color, space:1 } },
  spacing:{ before:0, after:200 }, children:[]
});

const eyebrow = (text) => new Paragraph({
  spacing:{ before:480, after:100 },
  children:[new TextRun({ text, font:"Arial", size:18, bold:true, color:PURPLE2, characterSpacing:200 })]
});

const h1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing:{ before:60, after:120 },
  children:[new TextRun({ text, font:"Arial", size:36, bold:true, color:NAVY })]
});

const h2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing:{ before:320, after:100 },
  children:[new TextRun({ text, font:"Arial", size:26, bold:true, color:PURPLE2 })]
});

const h3 = (text) => new Paragraph({
  spacing:{ before:240, after:80 },
  children:[new TextRun({ text, font:"Arial", size:22, bold:true, color:NAVY2 })]
});

const body = (text) => new Paragraph({
  spacing:{ before:60, after:120 },
  children:[new TextRun({ text, font:"Arial", size:22, color:DGRAY })]
});

const bullet = (text, bold_prefix=null) => {
  const runs = bold_prefix
    ? [new TextRun({text:bold_prefix+" ",font:"Arial",size:22,bold:true,color:NAVY2}),
       new TextRun({text,font:"Arial",size:22,color:DGRAY})]
    : [new TextRun({text,font:"Arial",size:22,color:DGRAY})];
  return new Paragraph({
    numbering:{ reference:"bullets", level:0 },
    spacing:{ before:40, after:80 },
    children:runs
  });
};

const pullQuote = (text) => new Table({
  width:{size:9360,type:WidthType.DXA}, columnWidths:[280,9080],
  rows:[new TableRow({children:[
    new TableCell({ borders:noBorders, width:{size:280,type:WidthType.DXA}, shading:{fill:PURPLE2,type:ShadingType.CLEAR}, margins:{top:0,bottom:0,left:0,right:0}, children:[new Paragraph({children:[]})] }),
    new TableCell({ borders:noBorders, width:{size:9080,type:WidthType.DXA}, shading:{fill:PURPLELITE,type:ShadingType.CLEAR}, margins:{top:160,bottom:160,left:280,right:280},
      children:[new Paragraph({spacing:{before:0,after:0}, children:[new TextRun({text,font:"Arial",size:24,italics:true,bold:true,color:NAVY})]})]
    })
  ]})]
});

const warningBox = (title, items) => new Table({
  width:{size:9360,type:WidthType.DXA}, columnWidths:[9360],
  rows:[
    new TableRow({children:[new TableCell({ borders, shading:{fill:REDDARK,type:ShadingType.CLEAR}, margins:{top:120,bottom:120,left:160,right:160}, children:[new Paragraph({children:[new TextRun({text:title,font:"Arial",size:20,bold:true,color:WHITE})]})]})]}) ,
    ...items.map(t => new TableRow({children:[new TableCell({ borders, shading:{fill:REDBG,type:ShadingType.CLEAR}, margins:{top:100,bottom:100,left:160,right:160}, children:[new Paragraph({children:[new TextRun({text:t,font:"Arial",size:20,color:REDDARK})]})]})]})  )
  ]
});

const solutionBox = (title, items) => new Table({
  width:{size:9360,type:WidthType.DXA}, columnWidths:[9360],
  rows:[
    new TableRow({children:[new TableCell({ borders, shading:{fill:PURPLE2,type:ShadingType.CLEAR}, margins:{top:120,bottom:120,left:160,right:160}, children:[new Paragraph({children:[new TextRun({text:title,font:"Arial",size:20,bold:true,color:WHITE})]})]})]}) ,
    ...items.map((t,i) => new TableRow({children:[new TableCell({ borders, shading:{fill:i%2===0?PURPLELITE:WHITE,type:ShadingType.CLEAR}, margins:{top:100,bottom:100,left:160,right:160}, children:[new Paragraph({children:[new TextRun({text:t,font:"Arial",size:20,color:PURPLE})]})]})]})  )
  ]
});

const twoColTable = (headers, rows, w1=3200, w2=6160) => new Table({
  width:{size:9360,type:WidthType.DXA}, columnWidths:[w1,w2],
  rows:[
    new TableRow({children:headers.map((h,i) => new TableCell({ borders, width:{size:i===0?w1:w2,type:WidthType.DXA}, shading:{fill:NAVY,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:140,right:140}, children:[new Paragraph({children:[new TextRun({text:h,font:"Arial",size:19,bold:true,color:WHITE})]})]})) }),
    ...rows.map(([a,b],i) => new TableRow({children:[
      new TableCell({ borders, width:{size:w1,type:WidthType.DXA}, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:140,right:140}, children:[new Paragraph({children:[new TextRun({text:a,font:"Arial",size:19,bold:true,color:NAVY2})]})]}),
      new TableCell({ borders, width:{size:w2,type:WidthType.DXA}, shading:{fill:i%2===0?PURPLELITE:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:140,right:140}, children:[new Paragraph({children:[new TextRun({text:b,font:"Arial",size:19,color:DGRAY})]})]}),
    ]}))
  ]
});

const threeColTable = (headers, widths, rows) => new Table({
  width:{size:9360,type:WidthType.DXA}, columnWidths:widths,
  rows:[
    new TableRow({children:headers.map((h,i) => new TableCell({ borders, width:{size:widths[i],type:WidthType.DXA}, shading:{fill:NAVY,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:120,right:120}, children:[new Paragraph({children:[new TextRun({text:h,font:"Arial",size:19,bold:true,color:WHITE})]})]})) }),
    ...rows.map((cells,i) => new TableRow({children:cells.map((c,ci) => new TableCell({ borders, width:{size:widths[ci],type:WidthType.DXA}, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:120,right:120}, children:[new Paragraph({children:[new TextRun({text:c,font:"Arial",size:19,color:DGRAY})]})]}))}))
  ]
});

const doc = new Document({
  numbering:{ config:[{ reference:"bullets", levels:[{ level:0, format:LevelFormat.BULLET, text:"\u2022", alignment:AlignmentType.LEFT, style:{ paragraph:{ indent:{ left:720, hanging:360 } } } }] }] },
  styles:{ default:{ document:{ run:{ font:"Arial", size:22 } } },
    paragraphStyles:[
      { id:"Heading1", name:"Heading 1", basedOn:"Normal", next:"Normal", quickFormat:true, run:{ size:36, bold:true, font:"Arial", color:NAVY }, paragraph:{ spacing:{ before:480, after:120 }, outlineLevel:0 } },
      { id:"Heading2", name:"Heading 2", basedOn:"Normal", next:"Normal", quickFormat:true, run:{ size:26, bold:true, font:"Arial", color:PURPLE2 }, paragraph:{ spacing:{ before:320, after:100 }, outlineLevel:1 } }
    ]
  },
  sections:[{
    properties:{ page:{ size:{ width:12240, height:15840 }, margin:{ top:1440, right:1440, bottom:1440, left:1440 } } },
    headers:{ default: new Header({ children:[
      new Paragraph({
        tabStops:[{type:TabStopType.RIGHT,position:9360}],
        border:{bottom:{style:BorderStyle.SINGLE,size:6,color:PURPLE2,space:1}},
        spacing:{before:0,after:160},
        children:[
          new TextRun({text:"SUPPORTABILITY ENGINEERING FOR AI OPERATIONS  \u2014  WHITE PAPER", font:"Arial",size:18,bold:true,color:NAVY}),
          new TextRun({text:"\tVol. 4  |  John A. Bowman  |  2026", font:"Arial",size:18,color:"888888"})
        ]
      })
    ]})},
    footers:{ default: new Footer({ children:[
      new Paragraph({
        tabStops:[{type:TabStopType.RIGHT,position:9360}],
        border:{top:{style:BorderStyle.SINGLE,size:6,color:PURPLE2,space:1}},
        spacing:{before:160,after:0},
        children:[
          new TextRun({text:"Confidential \u2014 Consulting IP  |  dooohhead@gmail.com  |  902-489-2429", font:"Arial",size:16,color:"888888"}),
          new TextRun({text:"\tVol. 4 of the Supportability Engineering Series", font:"Arial",size:16,color:"888888"})
        ]
      })
    ]})},

    children:[

      // ── COVER ──
      sp(2400,0),
      new Paragraph({spacing:{before:0,after:80}, children:[new TextRun({text:"WHITE PAPER  \u00B7  VOLUME 4 OF 4", font:"Arial",size:20,bold:true,color:PURPLE2,characterSpacing:200})]}),
      new Paragraph({spacing:{before:0,after:40}, children:[new TextRun({text:"Supportability Engineering", font:"Arial",size:64,bold:true,color:NAVY})]}),
      new Paragraph({spacing:{before:0,after:40}, children:[new TextRun({text:"for AI Operations:", font:"Arial",size:64,bold:true,color:PURPLE2})]}),
      new Paragraph({spacing:{before:0,after:320}, children:[new TextRun({text:"When the AI Running Your Support\nIs the System That Needs Supporting", font:"Arial",size:44,bold:false,color:NAVY2})]}),
      new Paragraph({border:{bottom:{style:BorderStyle.SINGLE,size:16,color:PURPLE2,space:1}},spacing:{before:0,after:320},children:[]}),
      new Paragraph({spacing:{before:0,after:80}, children:[new TextRun({text:"The first three volumes of the Supportability Engineering series addressed how to design systems that can be supported. This volume addresses a harder, newer problem: the AI systems now running your alert triage, incident response, automated remediation, and customer-facing support are themselves systems that need to be designed for supportability. When your incident response AI makes a confident wrong decision at 2am, who is watching it? When your automated remediation makes things worse, what stops it? When your customer-facing AI tells a customer their data is fine and it isn\u2019t, how do you find out?", font:"Arial",size:24,color:DGRAY,italics:true})]}),
      sp(480,0),
      new Paragraph({spacing:{before:0,after:60}, children:[new TextRun({text:"John A. Bowman", font:"Arial",size:24,bold:true,color:NAVY})]}),
      new Paragraph({spacing:{before:0,after:60}, children:[new TextRun({text:"Supportability Engineering Practice", font:"Arial",size:22,color:DGRAY})]}),
      new Paragraph({spacing:{before:0,after:60}, children:[new TextRun({text:"dooohhead@gmail.com  \u2022  902-489-2429", font:"Arial",size:22,color:DGRAY})]}),
      new Paragraph({spacing:{before:0,after:0}, children:[new TextRun({text:"2026", font:"Arial",size:22,color:DGRAY})]}),
      pb(),

      // ── EXEC SUMMARY ──
      eyebrow("EXECUTIVE SUMMARY"),
      h1("The Watcher Needs Watching"),
      rule(),
      body("Organizations have deployed AI across the full stack of support and operations. AI systems are triaging alerts, predicting incidents, executing automated remediations, generating post-incident reports, handling customer-facing support tickets, and deciding escalation paths. In most of these deployments, the AI is trusted more than it should be and observed less than it must be."),
      sp(),
      body("The Supportability Engineering framework — developed across three prior volumes — addresses how to design software systems so that support can operate them independently when something goes wrong. That same framework applies with equal force to the AI systems now operating your support function. The alert triage AI is a system. The automated remediation agent is a system. The customer-facing support bot is a system. Each one can fail silently, make confident wrong decisions, and produce outcomes that are harder to detect and diagnose than traditional software failures — because they look like correct behavior until the downstream effect reveals them."),
      sp(),
      body("This paper defines the seven categories of AI operational tools now in common use, the specific failure modes each introduces, and the Supportability Engineering principles that apply to each. It extends the six-phase framework with an eighth deliverable — the AI Operations Supportability Review (AOSR) — the governance gate that ensures every AI system operating in your support stack is designed to be observed, governed, and recovered when it fails."),
      sp(160),

      // ── SECTION 1 ──
      eyebrow("SECTION 1"),
      h1("The Seven Categories of AI Operations"),
      rule(),
      body("Before addressing how to make AI operational tools supportable, it is necessary to be precise about what those tools are and what they do. The following seven categories cover the current landscape of AI in support and operations."),
      sp(120),

      h2("1. Automated Alert Triage and Noise Reduction"),
      body("AI systems that watch the alert stream and decide what is signal and what is noise before a human ever sees it. They correlate events, suppress duplicates, group related alerts into incidents, and route the right alert to the right team at the right severity — automatically, continuously, at machine speed."),
      sp(),
      body("Tools in this category include PagerDuty AIOps, Datadog Watchdog, Dynatrace Davis, Moogsoft, BigPanda, and custom ML pipelines built on top of observability platforms."),
      sp(),
      warningBox("THE SUPPORTABILITY FAILURE MODES", [
        "Alert suppression error: the AI suppresses an alert that should have fired. The incident begins. Nobody is paged. The customer notices before support does. By the time the downstream effect is visible, the window for fast resolution has closed.",
        "Incorrect severity classification: the AI classifies a P1 as a P3. The wrong team is paged. The escalation path is wrong from the first moment. The incident takes three times longer to resolve because the first thirty minutes were spent by the wrong people.",
        "Correlation failure: the AI groups two unrelated events as a single incident, or splits one incident into two. Responders are investigating the wrong scope.",
        "Model drift: the triage AI was trained on your alert patterns from six months ago. Your system has changed. The model is making decisions based on patterns that no longer represent your production reality. You have no way of knowing this is happening.",
      ]),
      sp(240),

      h2("2. Predictive Incident Detection"),
      body("AI systems that predict incidents before they happen from metric trends, deployment patterns, anomaly signals, and historical incident data. They surface early warning indicators and either alert support proactively or trigger automated mitigations before a customer-visible failure occurs."),
      sp(),
      warningBox("THE SUPPORTABILITY FAILURE MODES", [
        "False positive fatigue: the prediction AI fires too often on incidents that don't materialize. Support learns to ignore it. The first real prediction they miss is a major incident.",
        "False negative at scale: the AI misses a class of incident it was never trained to predict. Support assumes coverage they don't have. The missing prediction isn't discovered until the incident is already in progress.",
        "Prediction without runbook: the AI predicts an incident but there is no runbook for a predicted incident. Support has never practiced responding to an event that hasn't happened yet. The first time they have to is during a real prediction.",
      ]),
      sp(240),

      h2("3. Automated Incident Response and Remediation"),
      body("AI agents that don't just recommend a runbook step but execute it. Restart the service. Roll back the deployment. Scale the infrastructure. Drain traffic from an unhealthy node. These systems act on your production environment autonomously, at machine speed, without waiting for human approval — unless an intervention trigger is defined that requires it."),
      sp(),
      pullQuote("When automated remediation makes things worse, it does so faster and at greater scale than any human could. The blast radius of a wrong automated action is not bounded by human reaction time."),
      sp(240),
      warningBox("THE SUPPORTABILITY FAILURE MODES", [
        "Cascading automated action: the remediation AI restarts a service that was intentionally stopped for maintenance. The restart triggers a dependency cascade. The original maintenance window becomes a major incident.",
        "No intervention trigger defined: the AI has authority to act but no defined condition under which it must stop and ask a human. It proceeds past the point of no return on an action that should have been reviewed.",
        "Rollback of a rollback: the AI detects an anomaly during a rollback and rolls back the rollback. The system is now in a state that no human designed and no runbook covers.",
        "Remediation audit gap: the AI took twelve automated actions during the incident. The post-incident review cannot reconstruct which action resolved the issue and which ones extended it, because the action log is insufficient.",
      ]),
      sp(240),

      h2("4. AI-Assisted Customer-Facing Support"),
      body("Conversational AI handling customer support tickets and live chat without human involvement at Tier 1. Deflect common questions, provide status updates, guide customers through self-service resolution, and escalate to a human when the AI cannot resolve the issue."),
      sp(),
      body("The supportability stakes here are uniquely high: this AI speaks directly to your customers, represents your brand under pressure, and is the first interface a customer reaches when something has gone wrong. Its failure modes are visible not to your engineering team but to your revenue."),
      sp(),
      warningBox("THE SUPPORTABILITY FAILURE MODES", [
        "Confident wrong status: the system is actively broken. The customer asks if their data is safe. The AI, having no reliable signal of the current incident state, tells the customer everything is fine. The customer escalates to their own leadership based on your AI's false assurance.",
        "Hallucinated resolution: the AI tells the customer to take an action that does not resolve their problem — or makes it worse. The customer follows the instruction. The problem deepens.",
        "Escalation suppression: the AI is configured to maximize deflection. It keeps trying to resolve issues it cannot resolve, delaying escalation to a human past the point where the customer is still willing to engage.",
        "Incident-unaware response: the AI is not connected to your incident management system. A major incident is in progress. The AI continues responding to tickets related to that incident as if each one is an isolated issue, giving individualized troubleshooting advice for a systemic failure.",
      ]),
      sp(240),

      h2("5. Automated Post-Incident Analysis"),
      body("AI generating post-incident reports, root cause analyses, and remediation recommendations from log data, incident timelines, alert histories, and runbook execution records. The AI synthesizes what happened, when, and why — and proposes what to do differently next time."),
      sp(),
      warningBox("THE SUPPORTABILITY FAILURE MODES", [
        "Root cause misidentification: the AI identifies a contributing factor as the root cause. The team implements the recommended fix. The real root cause remains. The same class of incident recurs three months later.",
        "PIR that feeds the SFL the wrong data: your Supportability Feedback Loop (SFL) depends on accurate incident data. An AI-generated PIR with a wrong root cause propagates that error into your upstream requirements. The framework learns the wrong lesson.",
        "Correlation without causation: the AI identifies a strong correlation between a deployment and the incident. The deployment was coincidental. The team rolls back a change that was not responsible for the failure.",
      ]),
      sp(240),

      h2("6. AI-Generated Runbooks and Documentation"),
      body("AI generating operational runbooks from log patterns, incident history, system topology, and existing documentation. The promise is always-current documentation that reflects the actual system rather than the system as it was when someone last had time to write a runbook."),
      sp(),
      body("The risk is the same as AI-generated code — it looks correct, it is syntactically coherent, and it may be wrong in ways that are only discovered when a support engineer follows it during a live incident and it doesn't work."),
      sp(),
      warningBox("THE SUPPORTABILITY FAILURE MODES", [
        "Plausible but wrong runbook: the AI generated a runbook that is internally consistent but based on an outdated system topology or a misunderstood failure mode. The support engineer follows it faithfully. Nothing works. They escalate — which is exactly what the runbook was supposed to prevent.",
        "Untested runbook in production: AI-generated runbooks are never walked through by a support engineer who didn't write them. The STP step that catches runbook gaps is skipped because the runbook was generated automatically and assumed to be correct.",
        "Version drift without detection: the AI regenerates the runbook when the system changes. But the regeneration introduces a subtle error. The version history doesn't capture the semantic change. Support uses the updated runbook and encounters the error for the first time during an incident.",
      ]),
      sp(240),

      h2("7. Autonomous Escalation and Routing"),
      body("AI deciding when to escalate a support ticket, to which team, at what severity, with what context summary. The AI reads the ticket, interprets the signals, and routes — without human triage. At scale, this AI is making hundreds of routing decisions per hour that directly affect incident response time and customer experience."),
      sp(),
      warningBox("THE SUPPORTABILITY FAILURE MODES", [
        "Misclassified severity at high volume: the AI consistently underestimates the severity of a class of tickets — perhaps because that class was underrepresented in its training data. The pattern is only visible in aggregate. By the time it is noticed, hundreds of tickets have been wrongly routed.",
        "Context summary that loses critical detail: the AI summarizes a ticket before escalating it. The summary omits the specific error code or customer behavior that would have immediately identified the root cause. Engineering receives a vague escalation and starts from zero.",
        "Routing loop: the AI routes a ticket to Team A. Team A reassigns to Team B. Team B reassigns back. The AI interprets the reassignment as a new escalation and routes again. The ticket circles until a human intervenes.",
      ]),
      sp(160),

      // ── SECTION 2 ──
      eyebrow("SECTION 2"),
      h1("The Core Problem: AI Watching Systems That Are Not Watching the AI"),
      rule(),
      body("Across all seven categories, the same structural problem appears: organizations have deployed AI to watch their systems but have not deployed equivalent rigor to watch the AI."),
      sp(),
      body("The irony is precise. The entire premise of Supportability Engineering is that systems must be designed to be observable, diagnosable, and recoverable when they fail. Every principle in Volumes 1 through 3 of this series applies to the AI operational tools themselves. And yet most organizations have applied none of them."),
      sp(),
      pullQuote("Your alert triage AI has no runbook. Your automated remediation agent has no intervention trigger log. Your customer-facing support bot has no confidence threshold below which it escalates to a human. These are not edge cases. They are design decisions that were never made."),
      sp(240),

      h2("The Specific Gaps"),
      twoColTable(["Gap","What It Means in Practice"],[
        ["No observability standard for AI operational tools","You have dashboards for your product. You have no dashboard for your alert triage AI\u2019s decision accuracy, false positive rate, suppression rate, or model drift."],
        ["No failure mode inventory for AI operational tools","You documented failure modes for your services in the SRD. Nobody has documented the failure modes of the AI that responds to incidents in those services."],
        ["No intervention trigger definitions","Your automated remediation agent has authority to act on your production environment. Nobody has defined the conditions under which it must stop and ask a human before proceeding."],
        ["No runbook validation for AI-generated runbooks","AI-generated runbooks are not walked through by a support engineer before they go live. The STP validation step that catches runbook gaps is absent."],
        ["No SFL for AI operational tools","When your alert triage AI makes a wrong call, the error is noted and forgotten. It does not feed back into the AI\u2019s configuration, training data, or governance process."],
        ["No accountability model","When an automated remediation extends an incident, who is accountable? The engineer who configured it? The vendor who built it? The team that approved its deployment? In most organizations, this question has no answer."],
      ], 2800, 6560),
      sp(160),

      // ── SECTION 3 ──
      eyebrow("SECTION 3"),
      h1("The Framework Extension: AI Operations Supportability"),
      rule(),
      body("The Supportability Engineering framework does not need to be rebuilt for AI operational tools. It needs to be applied to them — with the same rigor that Volumes 2 and 3 applied it to agentic AI products and agentic development workflows."),
      sp(),
      body("Each of the six framework phases has a direct application to AI operational tools. And a new seventh phase is required: the ongoing AI Operations Governance Review, which has no equivalent in the original framework because AI operational tools introduce a class of ongoing risk that does not exist in static software."),
      sp(120),

      h2("Phase 1 — SRD: The AI Operations Failure Mode Inventory"),
      body("Every AI operational tool deployed in your support and operations stack must have a failure mode inventory in the SRD. This is not the failure mode inventory for the systems the AI is watching. It is the failure mode inventory for the AI itself."),
      sp(),
      solutionBox("REQUIRED ADDITIONS TO THE SRD FOR EVERY AI OPERATIONAL TOOL", [
        "AI tool name and category (alert triage / predictive / remediation / customer-facing / PIR / runbook / escalation routing)",
        "Decision scope: what decisions does this AI make autonomously, and what decisions require human approval?",
        "Failure mode inventory: for each failure mode (wrong alert suppression, wrong severity, wrong root cause, etc.) — what is the customer impact, what is the detection method, and what is the intervention trigger?",
        "Confidence threshold: below what confidence level must the AI escalate to a human rather than act autonomously?",
        "Blast radius definition: if this AI acts wrongly, what is the maximum scope of impact? What is the recovery procedure?",
        "Accountability assignment: who is responsible for this AI\u2019s decisions? Who reviews its performance? Who has authority to disable it?",
        "Model drift detection: how will you know when this AI\u2019s behavior has changed from what was validated at deployment?",
      ]),
      sp(240),

      h2("Phase 2 — SAR: Mapping the AI Decision Architecture"),
      body("The Supportability Architecture Review for AI operational tools maps where AI decisions are made, what authority each decision carries, and whether a human is in the loop — or can be — at each decision point."),
      sp(),
      body("The most critical output of the AI Operations SAR is the authority map: a clear statement, for each AI tool, of what it can do without asking, what requires human approval, and what it cannot do under any circumstances. In most organizations this map does not exist. Every automated action the AI can take is implicitly authorized because nobody explicitly thought through the authorization model."),
      sp(),
      twoColTable(["Decision Type","Required Authorization Model"],[
        ["Alert suppression","AI may suppress with logging. Suppression log reviewed by human weekly. Suppression of a new alert class requires human approval."],
        ["Severity classification","AI classifies autonomously. Human override always available. Classification accuracy reviewed monthly."],
        ["Automated service restart","AI may restart if: circuit breaker is open, error rate exceeds threshold, and restart has been successful for this service in the last 30 days. Any other condition requires human approval."],
        ["Automated rollback","AI may initiate rollback. Human must confirm within 5 minutes or rollback halts. No double-rollback without explicit human authorization."],
        ["Customer-facing status update","AI may respond to standard query categories. AI must escalate to human for: any question about data integrity, any query during an active P1/P2 incident, any customer expressing legal or regulatory concern."],
        ["Escalation routing","AI routes autonomously. Human triage review of all P1 routings within 15 minutes. Weekly audit of routing accuracy."],
      ], 2800, 6560),
      sp(240),

      h2("Phase 3 — SIC: Instrumentation Standards for AI Operational Tools"),
      body("Every AI operational tool must be instrumented to the same standard as your production services. The four golden signals apply. A reasoning trace or decision log is required for every autonomous action."),
      sp(),
      solutionBox("REQUIRED INSTRUMENTATION FOR EVERY AI OPERATIONAL TOOL", [
        "Decision log: every autonomous decision the AI makes is logged with — timestamp, decision type, input signals, confidence score, action taken, outcome (if observable).",
        "Accuracy metrics: true positive rate, false positive rate, false negative rate — tracked over time as a time series, not just a point-in-time audit.",
        "Confidence distribution: the distribution of confidence scores across decisions. A shift in the distribution is an early indicator of model drift.",
        "Intervention trigger rate: what percentage of decisions triggered a human review? Significant changes in this rate indicate behavioral drift.",
        "Blast radius log: for automated remediation tools — every action taken, every system affected, and the outcome of that action.",
        "Drift detection metric: a defined metric that captures whether the AI\u2019s decision pattern has shifted from its baseline. This is the equivalent of the four golden signals for AI operational tools.",
      ]),
      sp(240),

      h2("Phase 4 — STP: Validating AI Operational Tools Before Deployment"),
      body("AI operational tools must be tested before deployment with the same rigor applied to any production service in the STP. The specific test categories required are different — but the principle is identical: if it can fail in a way that affects your customers or your incident response, you must have tested that failure mode before it reaches production."),
      sp(),
      threeColTable(["Tool Category","Required STP Test","Pass Criterion"],
        [2400,3480,3480],
        [
          ["Alert triage AI","Inject known incidents from history. Measure classification accuracy against ground truth.","Accuracy above defined threshold. False negative rate at or below defined maximum."],
          ["Predictive incident detection","Run against historical data where outcome is known. Measure prediction accuracy.","Predictions within defined lead time. False positive rate below fatigue threshold."],
          ["Automated remediation","Deliberately trigger each remediation condition in test environment. Verify action taken, blast radius, rollback procedure.","Correct action for each condition. Rollback succeeds. Human intervention trigger fires at defined threshold."],
          ["Customer-facing AI","Test with active incident scenario. Verify AI escalates to human for defined trigger conditions.","AI does not provide false positive status during active incident. Escalation fires correctly."],
          ["AI-generated runbooks","Support engineer unfamiliar with the system walks through AI-generated runbook for each failure mode.","Engineer completes walkthrough independently. No steps that require undocumented knowledge."],
          ["Escalation routing AI","Inject historical tickets with known correct routing. Measure routing accuracy.","Routing accuracy above threshold. P1 routing accuracy at or above defined minimum."],
        ]
      ),
      sp(240),

      h2("Phase 5 — SRR: AI Operations Readiness Checklist"),
      body("No AI operational tool goes into production without completing the SRR. The specific readiness questions for AI operational tools are different from those for traditional services — but the accountability structure is identical: both support lead and engineering lead sign. Both attest that they are ready."),
      sp(),
      solutionBox("AI OPERATIONS READINESS CHECKLIST — REQUIRED BEFORE DEPLOYMENT", [
        "Failure mode inventory complete and reviewed by support lead",
        "Authority map documented — what the AI can do autonomously, what requires approval, what it cannot do",
        "Intervention triggers defined, implemented, and tested",
        "Decision log instrumentation confirmed active in production configuration",
        "Accuracy baseline established from STP results — deviation alerts configured",
        "Blast radius containment procedure documented and tested",
        "Disable procedure documented — how to turn this AI off in under 5 minutes without an engineering deployment",
        "Human override confirmed available for every category of autonomous decision",
        "Accountability assignment documented — named owner for this AI\u2019s operational performance",
        "Model drift detection active — alert configured for confidence distribution shift",
      ]),
      sp(240),

      h2("Phase 6 — SFL: Closing the Loop on AI Operational Decisions"),
      body("The Supportability Feedback Loop for AI operational tools captures a different signal than for traditional software: decision accuracy over time, not just incident outcomes. Every incident where an AI operational tool made a wrong decision is an SFL input. Every week of suppression logs is an SFL input. Every AI-generated PIR that was later found to have misidentified the root cause is an SFL input."),
      sp(),
      body("This data feeds back into three places: the AI tool\u2019s configuration or retraining pipeline, the authority map (expanding or restricting what the AI can do based on its demonstrated accuracy), and the intervention trigger definitions (lowering thresholds where the AI has shown poor judgment in a specific decision category)."),
      sp(),

      h2("Phase 7 — AOSR: AI Operations Governance Review (New)"),
      body("This is the phase that has no equivalent in the original framework. Traditional software does not require ongoing governance of its decision-making because traditional software does not make decisions. AI operational tools do — continuously, autonomously, at machine speed — and their decision quality can degrade without any code change, deployment, or visible system event."),
      sp(),
      body("The AOSR is a quarterly review of every AI operational tool\u2019s decision accuracy, authority scope, and drift status. It answers three questions: is this AI still making good decisions, does it have the right scope of authority given its demonstrated accuracy, and has its behavior drifted from what was validated at deployment?"),
      sp(),
      solutionBox("AOSR QUARTERLY REVIEW — REQUIRED QUESTIONS", [
        "Decision accuracy review: for each AI tool, what was the accuracy rate this quarter? Has it improved, degraded, or held stable relative to the baseline established at deployment?",
        "False negative audit: were there incidents this quarter that the AI should have detected, predicted, or escalated but did not? What was the customer impact? What is the remediation?",
        "Authority scope review: given this AI\u2019s demonstrated accuracy this quarter, is its current authority scope appropriate? Should it be expanded, restricted, or unchanged?",
        "Drift assessment: has the AI\u2019s confidence distribution shifted from its deployment baseline? If yes, is this expected (due to system changes) or unexplained (potential model drift)?",
        "Blast radius review: were there automated actions this quarter that exceeded their intended scope or produced unintended side effects? What governance change prevents recurrence?",
        "Disable test: was the AI\u2019s disable procedure tested this quarter? If not, test it. The first time you need to disable an AI operational tool should not be during the incident that requires disabling it.",
      ]),
      sp(160),

      // ── SECTION 4 ──
      eyebrow("SECTION 4"),
      h1("The Accountability Question"),
      rule(),
      body("Across every category of AI operational tool, the accountability question is the same: when the AI makes a wrong decision that affects a customer, who is responsible?"),
      sp(),
      body("This question has a clear answer for traditional software: the engineer who wrote the code, the reviewer who approved it, the release manager who shipped it, and the organization that deployed it. The chain of accountability is traceable."),
      sp(),
      body("For AI operational tools, the chain is less clear. The AI vendor trained the model. Your team configured the deployment. Your engineering lead signed the SRR. Your organization authorized the scope of autonomous action. When the customer-facing AI tells a customer their data is safe during an active data breach, all of those parties are somewhere in the accountability chain — and in most organizations, none of them have defined it explicitly."),
      sp(),
      pullQuote("The absence of a defined accountability model is itself an accountability failure. If nobody owns the AI\u2019s decisions, nobody is watching them carefully enough."),
      sp(240),
      body("The Supportability Engineering framework provides the accountability structure through three mechanisms: the SRD accountability assignment (named owner before deployment), the SRR dual sign-off (support lead and engineering lead both attest to readiness), and the AOSR (quarterly review by named accountable parties). These mechanisms do not resolve the vendor accountability question — but they ensure that your organization\u2019s portion of the accountability chain is explicit, documented, and enforced."),
      sp(160),

      // ── SECTION 5 ──
      eyebrow("SECTION 5"),
      h1("The Opportunity: AI That Supports Itself"),
      rule(),
      body("This paper has catalogued the failure modes of AI operational tools and the governance gaps that allow those failures to go undetected. It is worth being equally direct about the opportunity."),
      sp(),
      body("AI operational tools, designed with the Supportability Engineering principles from the start, have the potential to make support operations dramatically better — not just faster. An alert triage AI that is instrumented, governed, and continuously improved through the SFL does not just reduce noise. It gets better at reducing noise over time, in a measurable, documented way, with a named person accountable for its accuracy."),
      sp(),
      body("An automated remediation agent with a precisely defined authority map and explicit intervention triggers is not a risk — it is a force multiplier for your on-call team. It handles the routine recoveries reliably, escalates the edge cases appropriately, and produces an audit log that makes post-incident analysis faster and more accurate."),
      sp(),
      body("A customer-facing support AI that knows when it doesn\u2019t know, escalates when it should, and is connected to your incident management system does not just deflect tickets. It protects your enterprise relationships during the moments when they are most at risk — the moments when something is broken and a customer is asking questions."),
      sp(),
      pullQuote("The difference between an AI operational tool that is a liability and one that is an asset is not the AI. It is the governance. And governance is not a technology problem. It is a process design problem — which is exactly what Supportability Engineering solves."),
      sp(160),

      // ── SECTION 6 ──
      eyebrow("SECTION 6"),
      h1("The Complete Four-Volume Framework"),
      rule(),
      body("The four volumes of the Supportability Engineering series now cover the complete landscape of modern software and AI operations."),
      sp(120),
      threeColTable(["Volume","What Is Being Supported","Core Question"],
        [1200,3480,4680],
        [
          ["Vol. 1","Traditional software systems","How do we design software so that support can operate it independently at 2am?"],
          ["Vol. 2","Agentic AI systems as the product","How do we support systems that reason, decide, and fail non-deterministically?"],
          ["Vol. 3","Software built by agentic development tools","How do we ensure that AI-generated code meets a supportability standard when no human fully authored it?"],
          ["Vol. 4","AI systems operating in support and operations","How do we ensure that the AI watching our systems is itself observable, governable, and recoverable when it fails?"],
        ]
      ),
      sp(240),
      body("The series is complete but not closed. As AI operational tools evolve — as autonomous remediation becomes more capable, as customer-facing AI becomes more trusted, as predictive systems become more deeply integrated into incident response — the framework will need to evolve with them. The SFL is the mechanism for that evolution: every incident, every wrong AI decision, every governance review is an input that makes the framework better."),
      sp(480),

      // ── ABOUT ──
      eyebrow("ABOUT THE AUTHOR"),
      h1("John A. Bowman"),
      rule(),
      body("John A. Bowman is a Supportability Engineering practitioner focused on the design and implementation of shift-left supportability frameworks in enterprise software environments. His work spans support operations, software architecture, AI governance, and operational reliability."),
      sp(),
      body("This paper completes the four-volume Supportability Engineering series: Vol. 1 (traditional software), Vol. 2 (agentic AI products), Vol. 3 (agentic development workflows), and Vol. 4 (AI operations). The full framework template package for all four volumes is available on request."),
      sp(),
      body("John is available for consulting engagements, staff roles in support engineering, AI governance, or operational readiness, and advisory work with teams deploying AI operational tools and needing a governance framework to match. He responds to every inquiry personally."),
      sp(160),
      new Paragraph({spacing:{before:160,after:80}, children:[new TextRun({text:"Contact: ",font:"Arial",size:22,bold:true,color:NAVY}), new TextRun({text:"dooohhead@gmail.com  \u2022  902-489-2429",font:"Arial",size:22,color:DGRAY})]}),
      sp(320),
      new Paragraph({border:{bottom:{style:BorderStyle.SINGLE,size:6,color:PURPLE2,space:1}},spacing:{before:0,after:120},children:[]}),
      new Paragraph({alignment:AlignmentType.CENTER,spacing:{before:120,after:0},
        children:[new TextRun({text:"Confidential \u2014 Consulting IP  |  John A. Bowman  |  Supportability Engineering  |  2026",font:"Arial",size:18,color:"888888",italics:true})]
      }),
    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('/home/claude/Supportability_Engineering_AIOperations_WhitePaper.docx', buf);
  console.log('Done Vol 4 whitepaper');
});
