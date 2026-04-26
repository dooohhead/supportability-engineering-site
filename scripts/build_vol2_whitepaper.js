const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageBreak, LevelFormat,
  TabStopType, TabStopPosition
} = require('docx');
const fs = require('fs');

const NAVY   = "0f2340";
const NAVY2  = "1b3a5c";
const ACCENT = "2563eb";
const GOLD   = "c9993a";
const LIGHT  = "dbeafe";
const MGRAY  = "F2F2F2";
const DGRAY  = "2d3748";
const WHITE  = "FFFFFF";
const RED    = "8B0000";
const GREEN  = "1A5C1A";
const AMBER  = "92400e";

const bd = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: bd, bottom: bd, left: bd, right: bd };
const nb = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: nb, bottom: nb, left: nb, right: nb };

const sp = (before=0, after=120) => new Paragraph({ spacing:{before,after}, children:[] });

const rule = () => new Paragraph({
  border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: ACCENT, space: 1 } },
  spacing: { before: 0, after: 200 }, children: []
});

const eyebrow = (text) => new Paragraph({
  spacing: { before: 480, after: 100 },
  children: [new TextRun({ text, font:"Arial", size:18, bold:true, color:GOLD, characterSpacing:200 })]
});

const h1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 60, after: 120 },
  children: [new TextRun({ text, font:"Arial", size:36, bold:true, color:NAVY })]
});

const h2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 320, after: 100 },
  children: [new TextRun({ text, font:"Arial", size:26, bold:true, color:ACCENT })]
});

const h3 = (text) => new Paragraph({
  spacing: { before: 240, after: 80 },
  children: [new TextRun({ text, font:"Arial", size:22, bold:true, color:NAVY })]
});

const body = (text) => new Paragraph({
  spacing: { before: 60, after: 120 },
  children: [new TextRun({ text, font:"Arial", size:22, color:DGRAY })]
});

const bodyRuns = (runs) => new Paragraph({
  spacing: { before: 60, after: 120 },
  children: runs
});

const bullet = (text) => new Paragraph({
  numbering: { reference:"bullets", level:0 },
  spacing: { before: 40, after: 80 },
  children: [new TextRun({ text, font:"Arial", size:22, color:DGRAY })]
});

const pullQuote = (text) => new Table({
  width: { size:9360, type:WidthType.DXA },
  columnWidths: [280, 9080],
  rows: [new TableRow({ children:[
    new TableCell({
      borders: noBorders,
      width: { size:280, type:WidthType.DXA },
      shading: { fill:ACCENT, type:ShadingType.CLEAR },
      margins: { top:0, bottom:0, left:0, right:0 },
      children: [new Paragraph({ children:[] })]
    }),
    new TableCell({
      borders: noBorders,
      width: { size:9080, type:WidthType.DXA },
      shading: { fill:LIGHT, type:ShadingType.CLEAR },
      margins: { top:160, bottom:160, left:280, right:280 },
      children: [new Paragraph({
        spacing: { before:0, after:0 },
        children: [new TextRun({ text, font:"Arial", size:24, italics:true, bold:true, color:NAVY })]
      })]
    })
  ]})]
});

const sectionBox = (title, color, textColor, rows) => new Table({
  width: { size:9360, type:WidthType.DXA },
  columnWidths: [9360],
  rows: [
    new TableRow({ children:[new TableCell({
      borders, width:{size:9360,type:WidthType.DXA},
      shading:{fill:color,type:ShadingType.CLEAR},
      margins:{top:120,bottom:120,left:160,right:160},
      children:[new Paragraph({ children:[new TextRun({text:title,font:"Arial",size:20,bold:true,color:textColor})] })]
    })]}),
    ...rows.map(r => new TableRow({ children:[new TableCell({
      borders, width:{size:9360,type:WidthType.DXA},
      shading:{fill:WHITE,type:ShadingType.CLEAR},
      margins:{top:100,bottom:100,left:160,right:160},
      children:[new Paragraph({ children:[new TextRun({text:r,font:"Arial",size:20,color:DGRAY})] })]
    })]}))
  ]
});

const comparisonTable = (rows) => new Table({
  width: { size:9360, type:WidthType.DXA },
  columnWidths: [1560, 3900, 3900],
  rows: [
    new TableRow({ children:[
      new TableCell({ borders, width:{size:1560,type:WidthType.DXA}, shading:{fill:NAVY,type:ShadingType.CLEAR}, margins:{top:100,bottom:100,left:120,right:120}, children:[new Paragraph({alignment:AlignmentType.CENTER, children:[new TextRun({text:"Dimension",font:"Arial",size:19,bold:true,color:WHITE})]})] }),
      new TableCell({ borders, width:{size:3900,type:WidthType.DXA}, shading:{fill:NAVY,type:ShadingType.CLEAR}, margins:{top:100,bottom:100,left:120,right:120}, children:[new Paragraph({ children:[new TextRun({text:"Traditional Software",font:"Arial",size:19,bold:true,color:WHITE})]})] }),
      new TableCell({ borders, width:{size:3900,type:WidthType.DXA}, shading:{fill:NAVY,type:ShadingType.CLEAR}, margins:{top:100,bottom:100,left:120,right:120}, children:[new Paragraph({ children:[new TextRun({text:"Agentic Workflow",font:"Arial",size:19,bold:true,color:WHITE})]})] }),
    ]}),
    ...rows.map(([dim, trad, agent], i) => new TableRow({ children:[
      new TableCell({ borders, width:{size:1560,type:WidthType.DXA}, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:100,bottom:100,left:120,right:120}, verticalAlign:VerticalAlign.CENTER, children:[new Paragraph({alignment:AlignmentType.CENTER, children:[new TextRun({text:dim,font:"Arial",size:19,bold:true,color:NAVY})]})] }),
      new TableCell({ borders, width:{size:3900,type:WidthType.DXA}, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:100,bottom:100,left:120,right:120}, children:[new Paragraph({ children:[new TextRun({text:trad,font:"Arial",size:19,color:DGRAY})]})] }),
      new TableCell({ borders, width:{size:3900,type:WidthType.DXA}, shading:{fill:i%2===0?"fef3c7":WHITE,type:ShadingType.CLEAR}, margins:{top:100,bottom:100,left:120,right:120}, children:[new Paragraph({ children:[new TextRun({text:agent,font:"Arial",size:19,color:AMBER})]})] }),
    ]}))
  ]
});

const phaseAdaptTable = (rows) => new Table({
  width: { size:9360, type:WidthType.DXA },
  columnWidths: [1400, 3580, 4380],
  rows: [
    new TableRow({ children:[
      new TableCell({ borders, width:{size:1400,type:WidthType.DXA}, shading:{fill:NAVY,type:ShadingType.CLEAR}, margins:{top:100,bottom:100,left:120,right:120}, children:[new Paragraph({children:[new TextRun({text:"Phase",font:"Arial",size:19,bold:true,color:WHITE})]})] }),
      new TableCell({ borders, width:{size:3580,type:WidthType.DXA}, shading:{fill:NAVY,type:ShadingType.CLEAR}, margins:{top:100,bottom:100,left:120,right:120}, children:[new Paragraph({children:[new TextRun({text:"Original Deliverable",font:"Arial",size:19,bold:true,color:WHITE})]})] }),
      new TableCell({ borders, width:{size:4380,type:WidthType.DXA}, shading:{fill:NAVY,type:ShadingType.CLEAR}, margins:{top:100,bottom:100,left:120,right:120}, children:[new Paragraph({children:[new TextRun({text:"Agentic Extension Required",font:"Arial",size:19,bold:true,color:WHITE})]})] }),
    ]}),
    ...rows.map(([phase, orig, ext], i) => new TableRow({ children:[
      new TableCell({ borders, width:{size:1400,type:WidthType.DXA}, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:100,bottom:100,left:120,right:120}, verticalAlign:VerticalAlign.CENTER, children:[new Paragraph({alignment:AlignmentType.CENTER, children:[new TextRun({text:phase,font:"Arial",size:18,bold:true,color:NAVY})]})] }),
      new TableCell({ borders, width:{size:3580,type:WidthType.DXA}, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:100,bottom:100,left:120,right:120}, children:[new Paragraph({children:[new TextRun({text:orig,font:"Arial",size:19,color:DGRAY})]})] }),
      new TableCell({ borders, width:{size:4380,type:WidthType.DXA}, shading:{fill:i%2===0?"eff6ff":"f0fdf4",type:ShadingType.CLEAR}, margins:{top:100,bottom:100,left:120,right:120}, children:[new Paragraph({children:[new TextRun({text:ext,font:"Arial",size:19,color:NAVY2})]})] }),
    ]}))
  ]
});

const doc = new Document({
  numbering: {
    config: [{
      reference: "bullets",
      levels: [{ level:0, format:LevelFormat.BULLET, text:"\u2022", alignment:AlignmentType.LEFT,
        style:{ paragraph:{ indent:{ left:720, hanging:360 } } } }]
    }]
  },
  styles: {
    default: { document: { run: { font:"Arial", size:22 } } },
    paragraphStyles: [
      { id:"Heading1", name:"Heading 1", basedOn:"Normal", next:"Normal", quickFormat:true,
        run:{ size:36, bold:true, font:"Arial", color:NAVY },
        paragraph:{ spacing:{ before:480, after:120 }, outlineLevel:0 } },
      { id:"Heading2", name:"Heading 2", basedOn:"Normal", next:"Normal", quickFormat:true,
        run:{ size:26, bold:true, font:"Arial", color:ACCENT },
        paragraph:{ spacing:{ before:320, after:100 }, outlineLevel:1 } }
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width:12240, height:15840 },
        margin: { top:1440, right:1440, bottom:1440, left:1440 }
      }
    },
    headers: {
      default: new Header({ children:[
        new Paragraph({
          tabStops:[{ type:TabStopType.RIGHT, position:9360 }],
          border:{ bottom:{ style:BorderStyle.SINGLE, size:6, color:ACCENT, space:1 } },
          spacing:{ before:0, after:160 },
          children:[
            new TextRun({ text:"SUPPORTABILITY ENGINEERING FOR AGENTIC SYSTEMS", font:"Arial", size:18, bold:true, color:NAVY }),
            new TextRun({ text:"\tWhite Paper  |  John A. Bowman  |  2026", font:"Arial", size:18, color:"888888" })
          ]
        })
      ]})
    },
    footers: {
      default: new Footer({ children:[
        new Paragraph({
          tabStops:[{ type:TabStopType.RIGHT, position:9360 }],
          border:{ top:{ style:BorderStyle.SINGLE, size:6, color:ACCENT, space:1 } },
          spacing:{ before:160, after:0 },
          children:[
            new TextRun({ text:"Confidential \u2014 Consulting IP  |  dooohhead@gmail.com  |  902-489-2429", font:"Arial", size:16, color:"888888" }),
            new TextRun({ text:"\tCompanion Paper to: Supportability Engineering: Why the Best Support Organizations Shift Left", font:"Arial", size:16, color:"888888" })
          ]
        })
      ]})
    },
    children: [

      // ── COVER ──
      sp(2400, 0),
      new Paragraph({
        alignment: AlignmentType.LEFT, spacing:{before:0,after:80},
        children:[new TextRun({text:"WHITE PAPER  \u00B7  COMPANION VOLUME", font:"Arial", size:20, bold:true, color:GOLD, characterSpacing:200})]
      }),
      new Paragraph({
        alignment:AlignmentType.LEFT, spacing:{before:0,after:40},
        children:[new TextRun({text:"Supportability Engineering", font:"Arial", size:64, bold:true, color:NAVY})]
      }),
      new Paragraph({
        alignment:AlignmentType.LEFT, spacing:{before:0,after:40},
        children:[new TextRun({text:"for Agentic Systems:", font:"Arial", size:64, bold:true, color:ACCENT})]
      }),
      new Paragraph({
        alignment:AlignmentType.LEFT, spacing:{before:0,after:320},
        children:[new TextRun({text:"Shifting Left When the System Can Think", font:"Arial", size:48, bold:false, color:NAVY2})]
      }),
      new Paragraph({
        border:{ bottom:{ style:BorderStyle.SINGLE, size:16, color:ACCENT, space:1 } },
        spacing:{ before:0, after:320 }, children:[]
      }),
      new Paragraph({
        spacing:{before:0,after:80},
        children:[new TextRun({text:"In traditional software, a failure has a call stack. In an agentic workflow, a failure has a reasoning chain \u2014 and that is far harder to reconstruct after the fact. This paper extends the six-phase Supportability Engineering framework to the specific and novel challenges of agentic AI systems: non-deterministic failure, silent confident errors, mid-execution intervention, and the observability of thought.", font:"Arial", size:24, color:DGRAY, italics:true})]
      }),
      sp(480, 0),
      new Paragraph({ spacing:{before:0,after:60}, children:[new TextRun({text:"John A. Bowman", font:"Arial", size:24, bold:true, color:NAVY})] }),
      new Paragraph({ spacing:{before:0,after:60}, children:[new TextRun({text:"Supportability Engineering Practice", font:"Arial", size:22, color:DGRAY})] }),
      new Paragraph({ spacing:{before:0,after:60}, children:[new TextRun({text:"dooohhead@gmail.com  \u2022  902-489-2429", font:"Arial", size:22, color:DGRAY})] }),
      new Paragraph({ spacing:{before:0,after:0},  children:[new TextRun({text:"2026", font:"Arial", size:22, color:DGRAY})] }),
      new Paragraph({ children:[new PageBreak()] }),

      // ── EXEC SUMMARY ──
      eyebrow("EXECUTIVE SUMMARY"),
      h1("The Problem Has Changed. The Principle Hasn\u2019t."),
      rule(),
      body("The original Supportability Engineering framework \u2014 documented in the companion white paper \u201cWhy the Best Support Organizations Shift Left\u201d \u2014 addresses a well-understood challenge: software that is never designed to be understood when it fails. The six-phase framework answers that challenge by moving supportability questions earlier in the development lifecycle, where they are cheap to answer rather than catastrophically expensive."),
      sp(),
      body("Agentic systems change the nature of the problem without changing the validity of the solution. The Shift Left principle still applies. The six phases still apply. The cost curve still applies. What changes is what the questions are, what the answers look like, and what new categories of failure the framework must account for."),
      sp(),
      body("This paper defines those changes precisely. It describes the new failure modes that agentic workflows introduce, explains why traditional supportability approaches are insufficient for them, and extends each of the six framework phases with the specific adaptations required to support agentic systems in production."),
      sp(),
      body("The result is a complete supportability approach for the agentic era \u2014 built on the same Shift Left foundation, extended for a fundamentally new class of system."),
      sp(160),

      // ── SECTION 1 ──
      eyebrow("SECTION 1"),
      h1("What Is Different About Agentic Systems"),
      rule(),
      body("Before extending the framework, it is necessary to be precise about what makes agentic systems categorically different from traditional software from a supportability perspective. The differences are not cosmetic. They require genuinely new thinking."),
      sp(),
      h2("The Fundamental Shift: From Call Stacks to Reasoning Chains"),
      body("In traditional software, a failure is deterministic. Given the same inputs, the system produces the same outputs. When something goes wrong, you can replay the sequence of events, examine the call stack, and identify the precise line of code or service call that failed. The failure has an address."),
      sp(),
      body("In an agentic system, the execution path is not fixed. The agent decides \u2014 at runtime, based on context \u2014 which tools to call, in what order, with what parameters, based on what intermediate reasoning. Two identical user inputs can produce completely different execution paths depending on what the model \u201cthinks\u201d at each decision point. The failure does not have a fixed address. It has a reasoning chain that led to a decision that led to an outcome \u2014 and that chain may never be exactly reproducible."),
      sp(),
      pullQuote("In traditional software, a failure has a call stack. In an agentic workflow, a failure has a reasoning chain \u2014 and that is far harder to reconstruct after the fact."),
      sp(240),

      h2("The Six New Failure Categories"),
      body("Agentic systems introduce six categories of failure that the original framework does not directly address. Each requires specific supportability design."),
      sp(120),

      h3("1. Non-Deterministic Failure"),
      body("The same input, the same agent, the same tools \u2014 and different outcomes on different runs. A failure that appeared in production may not reproduce in a test environment. A fix that appears to work may only work probabilistically. Traditional QA assumptions break down entirely."),
      sp(),
      body("Supportability implication: You cannot validate a fix by rerunning the exact scenario. You need statistical confidence across a distribution of runs, and your logging must capture enough of the reasoning context to understand why a particular run failed even when others succeeded."),
      sp(120),

      h3("2. Silent Confident Failure"),
      body("This is the most dangerous failure mode in agentic systems and the one most likely to go undetected. The agent completes the task. It does not raise an error. The output looks plausible. It is wrong. The model was confident and incorrect, and nothing in the traditional error-detection stack \u2014 no exception, no non-200 status code, no timeout \u2014 fires."),
      sp(),
      body("Supportability implication: Traditional alerting watches for system-level failures. Agentic supportability must also watch for semantic failures \u2014 outputs that are complete but incorrect. This requires output validation strategies, confidence thresholds, and human review triggers that have no equivalent in traditional software support."),
      sp(120),

      h3("3. Mid-Execution Intervention Triggers"),
      body("An agent performing a multi-step task may reach a decision point where the correct action depends on information or judgment that should come from a human. In traditional software, the system either has the information or fails gracefully. An agent may proceed \u2014 making a reasonable-seeming decision \u2014 when it should have stopped and asked."),
      sp(),
      body("Supportability implication: The SRD failure mode inventory needs a new category: intervention triggers. For each agent task, what are the conditions under which the agent must pause and surface a decision to a human before proceeding? These triggers must be designed in, not discovered when an agent makes a consequential unilateral decision in production."),
      sp(120),

      h3("4. Context Window Drift"),
      body("Long-running agentic tasks accumulate context. As the context window fills, earlier information gets compressed, summarized, or dropped. The agent\u2019s behavior in step 40 of a task may be meaningfully different from its behavior in step 4 \u2014 not because the task changed, but because the model\u2019s effective working memory has changed."),
      sp(),
      body("Supportability implication: Support needs visibility into context composition at each reasoning step, not just at task boundaries. An incident that \u201cstarted fine and then went wrong\u201d may be a context drift incident \u2014 diagnosable only if the context state at each step was logged."),
      sp(120),

      h3("5. Tool Schema Drift"),
      body("An agent that uses ten external tools is dependent on ten external APIs remaining stable. When a tool\u2019s schema changes \u2014 a parameter renamed, a response format updated, a new required field added \u2014 the agent may fail in ways that look like reasoning failures rather than integration failures. The model may attempt to compensate for unexpected tool responses in ways that produce plausible-looking but incorrect outputs."),
      sp(),
      body("Supportability implication: Tool schema changes need to be treated as deployment events for the agentic system, with the same supportability gates applied. The SAR dependency risk assessment must specifically address schema drift, not just availability and latency."),
      sp(120),

      h3("6. Prompt Injection and Adversarial Context"),
      body("An agent that processes external content \u2014 documents, web pages, emails, database records \u2014 may encounter content that attempts to redirect its behavior. A document that contains instructions disguised as data. A web page that instructs the agent to ignore its system prompt. These are not traditional security vulnerabilities \u2014 they are a new class of failure that sits at the intersection of security and supportability."),
      sp(),
      body("Supportability implication: The SRD must include adversarial failure modes. The SIC must include input sanitization and instruction boundary verification as implementation requirements. The STP must include adversarial test cases as a standard component."),
      sp(160),

      h2("The Comparison: Traditional vs. Agentic Supportability Challenges"),
      sp(100),
      comparisonTable([
        ["Failure type", "Deterministic \u2014 same input, same failure", "Probabilistic \u2014 same input, different outcomes on different runs"],
        ["Detection method", "Error codes, exceptions, timeouts", "Semantic validation, confidence thresholds, output review"],
        ["Root cause", "Specific code path or service call", "Reasoning chain decision at an unlogged step"],
        ["Reproduction", "Reliable \u2014 replay the inputs", "Unreliable \u2014 nondeterminism means you may never see it again"],
        ["Failure visibility", "System tells you something went wrong", "System reports success; output is quietly incorrect"],
        ["Escalation trigger", "Exception, alert, SLA breach", "Output review, human-in-the-loop checkpoint, downstream effect"],
        ["Runbook validity", "Deterministic steps produce reliable results", "Steps may need judgment calls; runbook cannot cover all branches"],
        ["Compliance trace", "Reconstruct from logs", "Must log reasoning steps explicitly or trace is lost forever"],
      ]),
      sp(320),

      // ── SECTION 2 ──
      eyebrow("SECTION 2"),
      h1("Why Traditional Supportability Is Insufficient"),
      rule(),
      body("The original Supportability Engineering framework was built on one foundational assumption: that a sufficiently experienced support engineer, given good logs and a good runbook, can diagnose any failure the system can produce."),
      sp(),
      body("That assumption holds for deterministic systems. For agentic systems, it breaks in three specific ways."),
      sp(),
      h2("Logs Are No Longer Sufficient on Their Own"),
      body("In traditional software, a well-structured log line tells you: what happened, when it happened, to what entity, with what result. In an agentic system, what happened is \u201cthe model decided to call this tool with these parameters based on reasoning that was not logged.\u201d The gap between the observable inputs and the observable outputs contains the entire decision-making process of the agent \u2014 and if that process was not explicitly captured, it is gone."),
      sp(),
      body("You cannot reconstruct why an agent made a decision from the tool call alone, any more than you can reconstruct why a human made a decision by observing only their physical actions."),
      sp(),
      pullQuote("In agentic systems, the most important thing that happened \u2014 the reasoning \u2014 is the thing most likely to be missing from your logs."),
      sp(240),
      h2("Runbooks Cannot Cover Probabilistic Branches"),
      body("A traditional runbook says: if you see X, do Y. This works because the system is deterministic \u2014 X always leads to the same set of possible causes, and Y always addresses them in the same way."),
      sp(),
      body("An agentic runbook cannot make that guarantee. The same observable output \u2014 \u201cagent returned an incorrect result\u201d \u2014 might be caused by a flawed tool response, a context drift problem, a prompt injection, a schema change, or a genuine model reasoning error. Each has a different diagnosis and a different resolution. The runbook cannot branch deterministically on symptoms that look identical."),
      sp(),
      body("This means agentic runbooks must be diagnostic frameworks rather than deterministic procedures. They guide the support engineer through a structured investigation rather than a fixed sequence of steps."),
      sp(),
      h2("The Feedback Loop Has a New Signal: Reasoning Quality"),
      body("The original SFL captures three signals from every incident: supportability score, observability gap, and runbook accuracy. These are sufficient for traditional systems."),
      sp(),
      body("Agentic systems produce a fourth signal that is qualitatively different: reasoning quality data. Was the model\u2019s intermediate reasoning sound? Did it correctly interpret tool responses? Did it identify the right decision point for human intervention? This signal cannot be captured by traditional logging \u2014 it requires explicit reasoning trace capture and a review process that includes someone capable of evaluating model behavior, not just system behavior."),
      sp(160),

      // ── SECTION 3 ──
      eyebrow("SECTION 3"),
      h1("Extending the Six-Phase Framework"),
      rule(),
      body("Each of the six Supportability Engineering phases requires specific extensions to address agentic systems. The structure of each phase \u2014 its purpose, its sign-off requirements, its connection to adjacent phases \u2014 remains intact. What changes is the content of what each phase must capture and verify."),
      sp(100),
      phaseAdaptTable([
        ["SRD\nRequirements", "Observability requirements, failure mode inventory, customer impact classification, escalation paths", "Intervention trigger inventory, acceptable confidence thresholds, reasoning trace requirements, adversarial failure modes, human-in-loop classification"],
        ["SAR\nDesign", "Failure point map, blind spot list, trace boundary definition, dependency risk assessment", "Reasoning checkpoint map, tool schema change protocol, context window boundary analysis, agent decision boundary definition"],
        ["SIC\nBuild", "Logging standards, error handling, four golden signals, failure mode unit tests", "Reasoning trace logging, prompt/response capture standards, output validation implementation, confidence score instrumentation, intervention trigger implementation"],
        ["STP\nTest", "Failure injection, log quality review, alert validation, runbook walkthrough, on-call simulation", "Adversarial input testing, confidence threshold validation, intervention trigger testing, context drift simulation, non-determinism stress testing"],
        ["SRR\nRelease", "Monitoring live, runbooks published, on-call updated, rollback tested, comms templates ready", "Reasoning trace review process confirmed, output review rotation established, model version change protocol documented and tested"],
        ["SFL\nOperate", "Incident scoring, observability gap log, runbook accuracy tracking, quarterly review", "Reasoning quality review, model behavior drift tracking, tool schema change incident log, intervention trigger accuracy review"],
      ]),
      sp(320),

      h2("Phase 1 \u2014 SRD: Adding the Agentic Failure Mode Inventory"),
      body("The SRD for an agentic system must extend its failure mode inventory beyond the six standard categories (complete outage, partial failure, degraded state, data issue, performance, security/auth) to include three new categories specific to agentic behavior."),
      sp(),
      sectionBox("NEW SRD FAILURE MODE CATEGORIES FOR AGENTIC SYSTEMS", NAVY, WHITE, [
        "Reasoning Failure \u2014 The agent completes the task but the intermediate reasoning was flawed, leading to a correct-looking but incorrect output. Detection: output validation, downstream effect monitoring.",
        "Intervention Miss \u2014 The agent proceeded past a defined intervention trigger without surfacing the decision to a human. Detection: intervention trigger audit log, task completion review.",
        "Context Integrity Failure \u2014 The agent\u2019s behavior changed mid-task due to context window pressure, producing inconsistent outputs across a long-running task. Detection: step-level reasoning trace review.",
        "Adversarial Redirect \u2014 The agent\u2019s behavior was altered by content in its input that was designed to override its instructions. Detection: instruction boundary monitoring, unexpected tool call patterns.",
      ]),
      sp(240),
      body("The SRD must also define acceptable confidence thresholds for each task type. Below what confidence level should the agent surface uncertainty to a human rather than proceeding? These thresholds are business decisions, not engineering decisions \u2014 which is exactly why they belong in the requirements phase, not the build phase."),
      sp(),

      h2("Phase 2 \u2014 SAR: Mapping the Reasoning Architecture"),
      body("The SAR for an agentic system produces two artifacts in addition to the standard failure point map and observability gap list."),
      sp(),
      h3("The Reasoning Checkpoint Map"),
      body("Where in the agent\u2019s task execution can support independently verify that the reasoning is on track? A reasoning checkpoint is a point in the agent\u2019s execution where its intermediate state can be observed, evaluated, and if necessary interrupted. The SAR identifies every checkpoint \u2014 and, more critically, every gap between checkpoints where the agent is operating without observable state."),
      sp(),
      body("Long gaps between reasoning checkpoints are the architectural equivalent of a service with no logging. They are blind spots in the reasoning architecture, and they must be closed before build begins."),
      sp(),
      h3("The Tool Schema Change Protocol"),
      body("Every external tool in the agent\u2019s toolkit is a dependency. The SAR must define, for each tool, what happens when its schema changes: who is notified, what validation is run against the new schema, and whether the agent is tested against the new schema before it is used in production. This protocol does not exist in most agentic systems today. Its absence is a latent incident waiting to happen."),
      sp(),

      h2("Phase 3 \u2014 SIC: The Reasoning Trace Standard"),
      body("The most important addition to the SIC for agentic systems is a reasoning trace logging standard. This defines what must be captured at every reasoning step, not just at tool call boundaries."),
      sp(),
      sectionBox("REASONING TRACE LOGGING STANDARD \u2014 REQUIRED FIELDS PER STEP", ACCENT, WHITE, [
        "Step identifier \u2014 unique ID for this reasoning step, linked to the parent task correlation ID",
        "Input state \u2014 the context available to the model at this step (summarized, not full context dump)",
        "Reasoning summary \u2014 the model\u2019s stated reasoning for its next action (captured from chain-of-thought output where available)",
        "Action taken \u2014 tool called, parameter values, or decision made",
        "Tool response \u2014 the raw response from any tool called at this step",
        "Confidence signal \u2014 the model\u2019s expressed confidence in its action, if available",
        "Intervention triggered? \u2014 boolean: did this step trigger a human intervention checkpoint",
        "Context token count \u2014 current context window utilization as a percentage",
      ]),
      sp(240),
      body("This standard is not optional and not a nice-to-have. Without reasoning trace logging, incident investigation in agentic systems is archaeology. With it, a support engineer can reconstruct why an agent made every decision in a completed task, even if the task ran for an hour and touched thirty tools."),
      sp(),

      h2("Phase 4 \u2014 STP: Testing for Non-Determinism"),
      body("The STP for an agentic system cannot rely on deterministic test cases. Every failure mode must be tested across a distribution of runs, not a single run. This has three specific implications."),
      sp(),
      bullet("Adversarial input testing must be a standard STP component. Every agentic system that processes external content must be tested with inputs designed to redirect, confuse, or overwhelm the agent\u2019s reasoning."),
      bullet("Confidence threshold validation must be explicitly tested. Trigger the conditions under which the agent should surface uncertainty to a human. Verify that the intervention trigger fires. Verify that it routes to the correct person with sufficient context."),
      bullet("Context drift must be deliberately induced. Run the agent on tasks long enough to fill the context window past the point where drift is expected. Verify that the reasoning trace shows the drift, that an alert fires, and that the support runbook for context drift produces a correct diagnosis."),
      sp(),
      pullQuote("The first time a support engineer practices diagnosing an adversarial redirect should be in the test environment \u2014 not during a live incident at 2am."),
      sp(240),

      h2("Phase 5 \u2014 SRR: The Model Version Change Protocol"),
      body("The SRR for an agentic system has one critical addition that has no equivalent in traditional software: the model version change protocol."),
      sp(),
      body("When the underlying model is updated \u2014 even a minor version change \u2014 the agent\u2019s behavior may change in ways that are not reflected in any code diff. A prompt that worked reliably with one model version may produce different outputs with the next. The SRR must confirm that a model version change protocol exists, is documented, and has been tested."),
      sp(),
      sectionBox("MODEL VERSION CHANGE PROTOCOL \u2014 REQUIRED ELEMENTS", NAVY2, WHITE, [
        "Behavioral regression test suite \u2014 a defined set of tasks with expected output characteristics (not exact outputs) that is run against every new model version before deployment",
        "Confidence threshold re-validation \u2014 thresholds defined for one model version may not be calibrated correctly for the next; re-validation is required",
        "Reasoning trace format verification \u2014 new model versions may produce different chain-of-thought formats; logging must be verified to capture the new format correctly",
        "Rollback procedure \u2014 the ability to revert to a previous model version must be tested, documented, and accessible to support without an engineering deployment",
      ]),
      sp(240),

      h2("Phase 6 \u2014 SFL: Tracking Reasoning Quality Over Time"),
      body("The SFL for an agentic system adds a fifth dimension to the standard incident supportability scoring: reasoning quality."),
      sp(),
      new Table({
        width: { size:9360, type:WidthType.DXA },
        columnWidths: [900, 1400, 1400, 1400, 1400, 2860],
        rows: [
          new TableRow({ children:[
            ...[["Score",""], ["Detectable",""], ["Diagnosable",""], ["Resolvable",""], ["Reasoning\nTrace",""], ["Intervention\nAccuracy",""]].map(([h]) =>
              new TableCell({ borders, width:{size:h==="Score"?900:h==="Reasoning\nTrace"||h==="Intervention\nAccuracy"?2860:1400,type:WidthType.DXA}, shading:{fill:NAVY,type:ShadingType.CLEAR}, margins:{top:100,bottom:100,left:100,right:100}, children:[new Paragraph({alignment:AlignmentType.CENTER, children:[new TextRun({text:h,font:"Arial",size:18,bold:true,color:WHITE})]})] })
            )
          ]}),
          ...([
            ["5","Auto-detected before impact","< 15 min by support","No engineering needed","Complete trace, all steps","All triggers fired correctly"],
            ["4","Within 5 min of impact","< 30 min","Minor eng. input","Trace complete, minor gaps","Triggers fired, minor routing issues"],
            ["3","Within 30 min","< 2 hours","Eng. escalation required","Trace partial, key steps missing","Some triggers missed"],
            ["2","Via customer report","> 2 hours","Senior eng. involved","Trace minimal, reasoning unclear","Triggers frequently missed"],
            ["1","Not detected","Root cause unknown","Code/model change required","No trace, reasoning lost","Triggers not implemented or non-functional"],
          ]).map(([score, ...cells], i) => new TableRow({ children:[
            new TableCell({ borders, width:{size:900,type:WidthType.DXA}, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, verticalAlign:VerticalAlign.CENTER, children:[new Paragraph({alignment:AlignmentType.CENTER, children:[new TextRun({text:score,font:"Arial",size:20,bold:true,color:NAVY})]})] }),
            ...cells.map((c, ci) => new TableCell({ borders, width:{size:ci>=3?2860:1400,type:WidthType.DXA}, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({children:[new TextRun({text:c,font:"Arial",size:17,color:DGRAY})]})] }))
          ]}))
        ]
      }),
      sp(320),

      // ── SECTION 4 ──
      eyebrow("SECTION 4"),
      h1("The New Observability Stack"),
      rule(),
      body("Supporting agentic systems in production requires an observability stack that extends beyond what traditional distributed systems monitoring provides. The four golden signals \u2014 latency, error rate, throughput, saturation \u2014 remain necessary. They are no longer sufficient."),
      sp(),
      h2("Five Additional Signals for Agentic Systems"),
      sp(100),
      sectionBox("THE AGENTIC OBSERVABILITY SIGNALS", NAVY, WHITE, [
        "Reasoning step count \u2014 how many steps did this task require? Unusual step counts (too few or too many) are often the first indicator of a reasoning problem.",
        "Confidence distribution \u2014 the distribution of confidence scores across reasoning steps. A task that starts confident and becomes progressively less confident may be approaching a context drift failure.",
        "Intervention trigger rate \u2014 what percentage of tasks triggered a human intervention checkpoint? Significant changes in this rate indicate behavioral drift in the agent.",
        "Tool call anomaly rate \u2014 how often did the agent call an unexpected tool, call a tool with unexpected parameters, or receive an unexpected response? These are early indicators of schema drift or adversarial input.",
        "Context utilization at failure \u2014 when tasks fail or produce incorrect outputs, what was the context window utilization? Clustering of failures at high context utilization confirms context drift as a failure mode.",
      ]),
      sp(240),
      body("These signals do not require a new observability platform. They require that the reasoning trace logging standard defined in the SIC is implemented correctly, and that the metrics derived from that logging are surfaced in the dashboards that support engineers use during incident response."),
      sp(),
      pullQuote("An agentic system that is not logging its reasoning is not observable. And a system that is not observable cannot be supported."),
      sp(160),

      // ── SECTION 5 ──
      eyebrow("SECTION 5"),
      h1("The Business Case Remains and Strengthens"),
      rule(),
      body("The cost curve that drives the original Supportability Engineering framework \u2014 gaps caught early cost minutes, gaps caught in production cost months \u2014 applies with even greater force to agentic systems."),
      sp(),
      body("In traditional software, a production incident caused by a missing correlation ID is expensive but bounded. You investigate, you find the cause, you fix the logging, and the class of problem is resolved. The incident cost is one-time."),
      sp(),
      body("In an agentic system, a production incident caused by missing reasoning trace logging may be impossible to diagnose fully \u2014 because the evidence of what the agent decided and why is gone. You can observe the outcome. You cannot reconstruct the path. The incident cost includes not just the resolution time, but the permanent uncertainty about whether you understood the root cause, and therefore whether your fix was correct."),
      sp(),
      body("Agentic systems that are not designed for supportability from the start do not just generate expensive incidents. They generate incidents that cannot be fully closed \u2014 because the observability required to confirm the root cause was never built in."),
      sp(),
      pullQuote("In traditional software, you can reconstruct what happened. In an agentic system without reasoning trace logging, you can only observe that something went wrong. The cost of that uncertainty compounds with every subsequent incident."),
      sp(240),
      h2("The Shift Left Multiplier"),
      body("The return on Shift Left investment is higher for agentic systems than for traditional software for one specific reason: the cost of retrofitting observability into an agentic system is not just an engineering sprint. It may require fundamental changes to the agent architecture \u2014 changes that affect how the agent structures its reasoning, how it calls tools, and how it surfaces uncertainty."),
      sp(),
      body("An agentic system designed from the start with reasoning trace logging, intervention triggers, and confidence thresholds builds these capabilities into its core architecture. An agentic system that tries to add them later may find that they cannot be added without rebuilding the agent from scratch."),
      sp(),
      body("The SRD question \u2014 \u201cwhat do we need to be able to observe about this system?\u201d \u2014 is even more valuable asked before an agentic system is designed than before a traditional system is designed. The answer shapes the architecture itself."),
      sp(160),

      // ── SECTION 6 ──
      eyebrow("SECTION 6"),
      h1("A Complete Framework for the Agentic Era"),
      rule(),
      body("The Supportability Engineering framework was built on a principle that does not change with the technology: the earlier a supportability gap is found, the cheaper it is to fix. Agentic systems do not invalidate that principle. They raise the stakes on it."),
      sp(),
      body("The six-phase framework \u2014 SRD, SAR, SIC, STP, SRR, SFL \u2014 remains the right structure. What changes is what each phase must contain when the system being built can reason, can make decisions, and can fail silently in ways that look like success."),
      sp(),
      body("The extensions described in this paper are not theoretical. They are the direct result of applying the original framework\u2019s logic to a new class of system and asking the same questions the framework has always asked: how will we know this is working, how will we know it has broken, and what does support need to handle it at 2am without calling the engineer who built it?"),
      sp(),
      body("The answers are different for agentic systems. The questions are the same. That is the point."),
      sp(480),

      // ── ABOUT ──
      eyebrow("ABOUT THE AUTHOR"),
      h1("John A. Bowman"),
      rule(),
      body("John A. Bowman is a Supportability Engineering practitioner focused on the design and implementation of shift-left supportability frameworks in enterprise software environments. His work sits at the intersection of support operations, software architecture, and operational reliability."),
      sp(),
      body("This paper is a companion to \u201cSupportability Engineering: Why the Best Support Organizations Shift Left,\u201d which presents the foundational six-phase framework. The full framework template package \u2014 including all six phase templates extended for agentic systems \u2014 is available on request."),
      sp(),
      body("John is available for consulting engagements, staff roles in support engineering or operational readiness, and advisory work with teams building or maturing their supportability practice for agentic systems. He responds to every inquiry personally."),
      sp(160),
      new Paragraph({
        spacing:{before:160,after:80},
        children:[
          new TextRun({text:"Contact: ", font:"Arial",size:22,bold:true,color:NAVY}),
          new TextRun({text:"dooohhead@gmail.com  \u2022  902-489-2429", font:"Arial",size:22,color:DGRAY})
        ]
      }),
      sp(320),
      new Paragraph({
        border:{ bottom:{ style:BorderStyle.SINGLE, size:6, color:ACCENT, space:1 } },
        spacing:{before:0,after:120}, children:[]
      }),
      new Paragraph({
        alignment:AlignmentType.CENTER, spacing:{before:120,after:0},
        children:[new TextRun({text:"Confidential \u2014 Consulting IP  |  John A. Bowman  |  Supportability Engineering  |  2026", font:"Arial",size:18,color:"888888",italics:true})]
      })
    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('/home/claude/Supportability_Engineering_Agentic_WhitePaper.docx', buf);
  console.log('Done');
});
