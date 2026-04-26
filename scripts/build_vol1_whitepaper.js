const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageBreak, LevelFormat,
  TabStopType, TabStopPosition, PageNumberElement
} = require('docx');
const fs = require('fs');

// Brand colors
const NAVY = "1B3A5C";
const ACCENT = "2E75B6";
const LIGHT_BLUE = "D5E8F0";
const MID_GRAY = "F2F2F2";
const DARK_GRAY = "404040";
const WHITE = "FFFFFF";
const RULE_COLOR = "2E75B6";

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function rule(color = RULE_COLOR, size = 12) {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size, color, space: 1 } },
    spacing: { before: 0, after: 200 },
    children: []
  });
}

function spacer(before = 0, after = 160) {
  return new Paragraph({ spacing: { before, after }, children: [] });
}

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 480, after: 120 },
    children: [new TextRun({ text, font: "Arial", size: 36, bold: true, color: NAVY })]
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 320, after: 100 },
    children: [new TextRun({ text, font: "Arial", size: 26, bold: true, color: ACCENT })]
  });
}

function h3(text) {
  return new Paragraph({
    spacing: { before: 240, after: 80 },
    children: [new TextRun({ text, font: "Arial", size: 22, bold: true, color: NAVY })]
  });
}

function body(text, options = {}) {
  return new Paragraph({
    spacing: { before: 60, after: 120 },
    children: [new TextRun({ text, font: "Arial", size: 22, color: DARK_GRAY, ...options })]
  });
}

function pullQuote(text) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [280, 9080],
    rows: [new TableRow({
      children: [
        new TableCell({
          borders: noBorders,
          width: { size: 280, type: WidthType.DXA },
          shading: { fill: ACCENT, type: ShadingType.CLEAR },
          margins: { top: 0, bottom: 0, left: 0, right: 0 },
          children: [new Paragraph({ children: [] })]
        }),
        new TableCell({
          borders: noBorders,
          width: { size: 9080, type: WidthType.DXA },
          shading: { fill: LIGHT_BLUE, type: ShadingType.CLEAR },
          margins: { top: 160, bottom: 160, left: 280, right: 280 },
          children: [new Paragraph({
            spacing: { before: 0, after: 0 },
            children: [new TextRun({ text, font: "Arial", size: 24, italics: true, color: NAVY, bold: true })]
          })]
        })
      ]
    })]
  });
}

function bullet(text, bold_prefix = null) {
  const runs = [];
  if (bold_prefix) {
    runs.push(new TextRun({ text: bold_prefix + " ", font: "Arial", size: 22, bold: true, color: NAVY }));
    runs.push(new TextRun({ text, font: "Arial", size: 22, color: DARK_GRAY }));
  } else {
    runs.push(new TextRun({ text, font: "Arial", size: 22, color: DARK_GRAY }));
  }
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { before: 40, after: 80 },
    children: runs
  });
}

function twoColRow(left, right, header = false) {
  const bgLeft = header ? NAVY : MID_GRAY;
  const bgRight = header ? NAVY : WHITE;
  const colorLeft = header ? WHITE : DARK_GRAY;
  const colorRight = header ? WHITE : DARK_GRAY;
  return new TableRow({
    children: [
      new TableCell({
        borders,
        width: { size: 2800, type: WidthType.DXA },
        shading: { fill: bgLeft, type: ShadingType.CLEAR },
        margins: { top: 100, bottom: 100, left: 140, right: 140 },
        children: [new Paragraph({
          children: [new TextRun({ text: left, font: "Arial", size: 20, bold: header, color: colorLeft })]
        })]
      }),
      new TableCell({
        borders,
        width: { size: 6560, type: WidthType.DXA },
        shading: { fill: bgRight, type: ShadingType.CLEAR },
        margins: { top: 100, bottom: 100, left: 140, right: 140 },
        children: [new Paragraph({
          children: [new TextRun({ text: right, font: "Arial", size: 20, bold: header, color: colorRight })]
        })]
      })
    ]
  });
}

function phaseTable(rows) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [2800, 6560],
    rows
  });
}

function costBenefitRow(phase, cost, benefit) {
  return new TableRow({
    children: [
      new TableCell({
        borders,
        width: { size: 1560, type: WidthType.DXA },
        shading: { fill: NAVY, type: ShadingType.CLEAR },
        margins: { top: 100, bottom: 100, left: 120, right: 120 },
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: phase, font: "Arial", size: 18, bold: true, color: WHITE })]
        })]
      }),
      new TableCell({
        borders,
        width: { size: 3900, type: WidthType.DXA },
        shading: { fill: "FFF0F0", type: ShadingType.CLEAR },
        margins: { top: 100, bottom: 100, left: 120, right: 120 },
        children: [new Paragraph({
          children: [new TextRun({ text: cost, font: "Arial", size: 19, color: "8B0000" })]
        })]
      }),
      new TableCell({
        borders,
        width: { size: 3900, type: WidthType.DXA },
        shading: { fill: "F0FFF0", type: ShadingType.CLEAR },
        margins: { top: 100, bottom: 100, left: 120, right: 120 },
        children: [new Paragraph({
          children: [new TextRun({ text: benefit, font: "Arial", size: 19, color: "1A5C1A" })]
        })]
      })
    ]
  });
}

const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "\u2022",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      }
    ]
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Arial", color: NAVY },
        paragraph: { spacing: { before: 480, after: 120 }, outlineLevel: 0 }
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: ACCENT },
        paragraph: { spacing: { before: 320, after: 100 }, outlineLevel: 1 }
      }
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    headers: {
      default: new Header({
        children: [
          new Paragraph({
            tabStops: [{ type: TabStopType.RIGHT, position: 9360 }],
            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ACCENT, space: 1 } },
            spacing: { before: 0, after: 160 },
            children: [
              new TextRun({ text: "SUPPORTABILITY ENGINEERING", font: "Arial", size: 18, bold: true, color: NAVY }),
              new TextRun({ text: "\tWhite Paper  |  John A. Bowman  |  2026", font: "Arial", size: 18, color: "888888" })
            ]
          })
        ]
      })
    },
    footers: {
      default: new Footer({
        children: [
          new Paragraph({
            tabStops: [{ type: TabStopType.RIGHT, position: 9360 }],
            border: { top: { style: BorderStyle.SINGLE, size: 6, color: ACCENT, space: 1 } },
            spacing: { before: 160, after: 0 },
            children: [
              new TextRun({ text: "Confidential \u2014 Consulting IP  |  dooohhead@gmail.com  |  902-489-2429", font: "Arial", size: 16, color: "888888" }),
              new TextRun({ text: "\tPage #", font: "Arial", size: 16, color: "888888" })
            ]
          })
        ]
      })
    },
    children: [

      // ===== COVER PAGE =====
      spacer(2400, 0),
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 0, after: 80 },
        children: [new TextRun({ text: "WHITE PAPER", font: "Arial", size: 20, bold: true, color: ACCENT, characterSpacing: 200 })]
      }),
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 0, after: 40 },
        children: [new TextRun({ text: "Supportability Engineering:", font: "Arial", size: 64, bold: true, color: NAVY })]
      }),
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 0, after: 320 },
        children: [new TextRun({ text: "Why the Best Support Organizations Shift Left", font: "Arial", size: 64, bold: true, color: ACCENT })]
      }),
      rule(ACCENT, 16),
      spacer(240, 0),
      new Paragraph({
        spacing: { before: 0, after: 80 },
        children: [new TextRun({ text: "The cost of a supportability gap grows exponentially the later it is found. This paper makes the business case for designing supportability in \u2014 from the very first requirements meeting \u2014 rather than bolting it on after the first major incident.", font: "Arial", size: 24, color: DARK_GRAY, italics: true })]
      }),
      spacer(480, 0),
      new Paragraph({
        spacing: { before: 0, after: 60 },
        children: [new TextRun({ text: "John A. Bowman", font: "Arial", size: 24, bold: true, color: NAVY })]
      }),
      new Paragraph({
        spacing: { before: 0, after: 60 },
        children: [new TextRun({ text: "Supportability Engineering Practice", font: "Arial", size: 22, color: DARK_GRAY })]
      }),
      new Paragraph({
        spacing: { before: 0, after: 60 },
        children: [new TextRun({ text: "dooohhead@gmail.com  \u2022  902-489-2429", font: "Arial", size: 22, color: DARK_GRAY })]
      }),
      new Paragraph({
        spacing: { before: 0, after: 0 },
        children: [new TextRun({ text: "2026", font: "Arial", size: 22, color: DARK_GRAY })]
      }),
      new Paragraph({ children: [new PageBreak()] }),

      // ===== EXECUTIVE SUMMARY =====
      h1("Executive Summary"),
      rule(),
      body("Every organization that ships software eventually faces the same crisis: a system fails at the worst possible time, and nobody \u2014 not support, not engineering, not leadership \u2014 can answer the most basic questions. What broke? Who is affected? How bad is it? How long will it take to fix?"),
      spacer(),
      body("This is not a technology problem. It is a design problem. The system was never built to be understood when it fails."),
      spacer(),
      body("Supportability Engineering is the discipline of designing that understanding in from the beginning \u2014 before the first line of code is written. It applies a proven software quality principle called \u201cShift Left\u201d to the problem of operational support: moving the questions that support needs answered from the crisis moment (where they are catastrophically expensive) to the design and build phase (where they are trivially cheap)."),
      spacer(),
      body("The business case is straightforward. A supportability gap found at the requirements stage costs minutes to fix. The same gap found in production costs weeks \u2014 per incident, indefinitely. This paper describes the six-phase framework that eliminates that gap, phase by phase, and shows what organizations gain at each step."),
      spacer(160),

      // ===== SECTION 1 =====
      h1("1. The Problem: Support as an Afterthought"),
      rule(),
      body("Consider a scenario most engineering leaders will recognize immediately."),
      spacer(),
      pullQuote("\u201cWe spent three weeks designing the feature. Nobody once asked what a failure would look like from the customer\u2019s side. We found out the hard way.\u201d"),
      spacer(240),
      body("A feature ships on a Friday afternoon. The demo was clean. The tests passed. The engineers went home satisfied. By 11pm, one of the company\u2019s largest customers cannot access their data. The on-call engineer has no runbook, no documented failure modes, no correlation IDs in the logs \u2014 just a wall of noise and a customer escalating."),
      spacer(),
      body("By 1am, the VP of Engineering is on a bridge call. By 2am, the customer\u2019s CTO is involved. By Monday morning, an account worth $400,000 a year is receiving an apology email explaining why a three-hour technical problem took eleven hours to resolve."),
      spacer(),
      body("The technical failure was almost always secondary. The real failure was organizational: at no point in the design or build process did anyone ask what this feature looks like when it breaks \u2014 and what support needs to handle it without waking up the engineer who built it."),
      spacer(),
      h2("The Hidden Cost Structure"),
      body("Organizations typically measure the cost of an incident in engineering hours and customer impact. These are real costs, but they represent only the visible portion. The full cost includes:"),
      spacer(),
      bullet("Investigation overhead: Engineers spending the first hour of every incident establishing facts that should be in the first log line."),
      bullet("Unnecessary escalation: Support escalating to engineering not because the problem is complex, but because the observability to diagnose it independently does not exist."),
      bullet("Senior engineer burn rate: Your best engineers paged at midnight for problems that a well-documented runbook could resolve in twenty minutes."),
      bullet("Customer trust erosion: Enterprise customers who bought your SLA without either party having calculated whether it was achievable given your current system visibility."),
      bullet("Compounding recurrence: The same classes of incidents recurring because operational experience never feeds back into the design process."),
      spacer(),
      body("None of these costs appear on a dashboard. But they accumulate, quarter after quarter, until they show up in attrition, in churn, and in the quiet reputation of a team that is always firefighting."),

      // ===== SECTION 2 =====
      h1("2. The Principle: Shifting Left"),
      rule(),
      body("Software engineering has understood for decades that the cost of fixing a defect is not constant. A bug caught during code review is cheap. The same bug caught in production is expensive. The same bug caught after a customer reports it can be catastrophic."),
      spacer(),
      body("This relationship \u2014 cost of fixing a defect increases the later it is found \u2014 is the foundation of the \u201cShift Left\u201d movement in software quality. Quality assurance should not be the last step before release. It should be woven into every phase of development, as early as possible."),
      spacer(),
      body("Supportability Engineering applies this same principle to operational support. The questions that support needs answered \u2014 how does this fail, how will we detect it, who is affected, what do we do \u2014 should not be answered during an incident. They should be answered at the requirements meeting."),
      spacer(),
      pullQuote("\u201cThe single most important idea in supportability engineering: the cost of fixing a supportability gap grows exponentially the later you find it.\u201d"),
      spacer(240),
      h2("The Cost Curve in Practice"),
      body("The following table illustrates the real cost differential across phases. These are not theoretical \u2014 they are the accumulated costs that engineering and support leaders recognize from their own incident histories."),
      spacer(160),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [1800, 1800, 5760],
        rows: [
          new TableRow({
            children: [
              new TableCell({ borders, width: { size: 1800, type: WidthType.DXA }, shading: { fill: NAVY, type: ShadingType.CLEAR }, margins: { top: 100, bottom: 100, left: 140, right: 140 }, children: [new Paragraph({ children: [new TextRun({ text: "Phase", font: "Arial", size: 20, bold: true, color: WHITE })] })] }),
              new TableCell({ borders, width: { size: 1800, type: WidthType.DXA }, shading: { fill: NAVY, type: ShadingType.CLEAR }, margins: { top: 100, bottom: 100, left: 140, right: 140 }, children: [new Paragraph({ children: [new TextRun({ text: "Cost to Fix", font: "Arial", size: 20, bold: true, color: WHITE })] })] }),
              new TableCell({ borders, width: { size: 5760, type: WidthType.DXA }, shading: { fill: NAVY, type: ShadingType.CLEAR }, margins: { top: 100, bottom: 100, left: 140, right: 140 }, children: [new Paragraph({ children: [new TextRun({ text: "What That Looks Like", font: "Arial", size: 20, bold: true, color: WHITE })] })] })
            ]
          }),
          ...[
            ["Requirements", "Minutes to hours", "A conversation in a meeting. Someone asks the question, the team answers it, it gets written down."],
            ["Design", "Hours", "An architecture review comment. The engineer adjusts the design before writing a line of code."],
            ["Build", "Hours to days", "A code review finding. The developer adds the missing instrumentation before the PR merges."],
            ["Test", "Days", "A failed runbook walkthrough delays release. Better now than at 2am with a customer on hold."],
            ["Release", "Days to weeks", "A readiness check reveals missing runbooks. A delay is painful but far cheaper than a live incident."],
            ["Production", "Weeks to months\u2014per incident, forever", "Every incident takes three times longer than it should. Engineers get paged. Customers get angry. Repeat indefinitely."]
          ].map(([phase, cost, desc], i) => new TableRow({
            children: [
              new TableCell({ borders, width: { size: 1800, type: WidthType.DXA }, shading: { fill: i % 2 === 0 ? MID_GRAY : WHITE, type: ShadingType.CLEAR }, margins: { top: 100, bottom: 100, left: 140, right: 140 }, children: [new Paragraph({ children: [new TextRun({ text: phase, font: "Arial", size: 19, bold: true, color: NAVY })] })] }),
              new TableCell({ borders, width: { size: 1800, type: WidthType.DXA }, shading: { fill: i % 2 === 0 ? MID_GRAY : WHITE, type: ShadingType.CLEAR }, margins: { top: 100, bottom: 100, left: 140, right: 140 }, children: [new Paragraph({ children: [new TextRun({ text: cost, font: "Arial", size: 19, color: DARK_GRAY })] })] }),
              new TableCell({ borders, width: { size: 5760, type: WidthType.DXA }, shading: { fill: i % 2 === 0 ? MID_GRAY : WHITE, type: ShadingType.CLEAR }, margins: { top: 100, bottom: 100, left: 140, right: 140 }, children: [new Paragraph({ children: [new TextRun({ text: desc, font: "Arial", size: 19, color: DARK_GRAY })] })] })
            ]
          }))
        ]
      }),

      // ===== SECTION 3 =====
      h1("3. The Framework: Six Phases, One Connected System"),
      rule(),
      body("Supportability Engineering is not a single tool or a single document. It is a connected framework of six deliverables, one per development phase, each feeding the next. Every gap caught early saves the cost of catching it late. Every deliverable produces outputs that the next phase requires."),
      spacer(),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 160, after: 160 },
        children: [new TextRun({ text: "SRD  \u2192  SAR  \u2192  SIC  \u2192  STP  \u2192  SRR  \u2192  SFL  \u2192  SRD (next cycle)", font: "Arial", size: 22, bold: true, color: NAVY })]
      }),
      spacer(),

      h2("Phase 1 \u2014 Requirements: Supportability Requirements Document (SRD)"),
      body("The SRD answers three questions that almost nobody asks before design begins: How will we know this feature is working? How will we know it has broken? What does support need to handle it at 2am without calling the engineer who built it?"),
      spacer(),
      body("The SRD makes those answers a formal requirement \u2014 on equal footing with functional, performance, and security requirements. Support signs off before design begins. No SRD sign-off means no design phase."),
      spacer(),
      body("The SRD captures observability requirements, failure mode inventory, customer impact pre-classification, support readiness criteria, escalation path definitions, and regulatory compliance flags. It is the blueprint that every subsequent phase builds against."),
      spacer(),
      pullQuote("\u201cWhen support is in the requirements room before design begins, the first incident is not also an orientation session.\u201d"),
      spacer(240),

      h2("Phase 2 \u2014 Design: Supportability Architecture Review (SAR)"),
      body("The SAR reviews every architectural decision through a supportability lens before a single line of code is written. A reviewer with support experience examines the architecture diagram and asks the fundamental question: if this component fails at 3am, can my team figure out what happened without waking up the architect?"),
      spacer(),
      body("The SAR produces a failure point map \u2014 a marked-up architecture diagram showing every point where failure can occur and whether it is observable, partially observable, or a blind spot. Every blind spot gets a priority and a remediation plan. Every integration boundary gets a question: does a correlation ID pass through here?"),
      spacer(),
      body("Architectural decisions that create permanent blind spots get locked in fast. Once a system is built without correlation IDs propagating across service boundaries, retrofitting them is a multi-sprint engineering project that keeps being deprioritized. The SAR catches these gaps at the moment when fixing them costs hours, not sprints."),
      spacer(),

      h2("Phase 3 \u2014 Build: Supportability Implementation Checklist (SIC)"),
      body("The SIC is where supportability standards stop being intentions and start being code. It attaches to every pull request and asks the developer to confirm \u2014 and the reviewer to independently verify \u2014 that the logging is structured, errors are meaningful, the four golden signals are instrumented, and every failure mode from the SRD has a unit test."),
      spacer(),
      body("The four golden signals \u2014 latency, error rate, throughput, saturation \u2014 are not optional. Monitoring that watches servers but not services tells you your hardware is healthy while your customers are experiencing failures. The SIC makes instrumentation a merge requirement, not a nice-to-have."),
      spacer(),
      pullQuote("\u201cA PR cannot be merged without the SIC being signed off. The same standard applied to unit tests now applies to supportability.\u201d"),
      spacer(240),

      h2("Phase 4 \u2014 Test: Supportability Test Plan (STP)"),
      body("The STP answers one question with absolute certainty before any feature ships: if this breaks at 2am, can a support engineer diagnose it and escalate correctly \u2014 without calling the engineer who built it?"),
      spacer(),
      body("The STP validates this by actually trying. Every failure mode is deliberately triggered. Every log is reviewed. A support engineer who did not build the feature walks through the runbook in a test environment with nothing at stake. Every gap found in the STP is a gap that does not appear during a live incident with a customer on hold."),
      spacer(),
      body("Runbooks are not tested until the STP. Engineers write runbooks from intimate knowledge of the system. Support engineers follow runbooks from the outside. The gaps that are invisible to the author become walls to the reader. The STP surfaces these gaps before they cost three hours and a customer relationship."),
      spacer(),

      h2("Phase 5 \u2014 Release: Support Readiness Review (SRR)"),
      body("The SRR is the moment before the door opens. It is not a rubber stamp. It is a structured review where support lead and engineering lead sit together and answer a single question out loud: if this feature breaks in the next twenty-four hours, are we ready?"),
      spacer(),
      body("If either party cannot honestly answer yes, the feature does not ship. Both sign. That shared accountability changes the conversation from a handoff \u2014 \u201cengineering ships, support operates\u201d \u2014 to a joint commitment: we built this together and we operate it together."),
      spacer(),
      body("The SRR confirms that monitoring is live, runbooks are published and tested, the on-call rotation is updated, rollback procedures have been rehearsed, customer communication templates are approved, and the customer impact classification from the SRD is loaded into the incident management system."),
      spacer(),

      h2("Phase 6 \u2014 Operate: Supportability Feedback Loop (SFL)"),
      body("Every incident your organization has ever had contained information about how to prevent the next one. Most organizations throw that information away. They close the ticket, file the post-incident report, and six months later the same class of problem reappears \u2014 because nobody connected what happened in production back to the design process that caused it."),
      spacer(),
      body("The SFL is the mechanism that closes that loop. After every incident, support scores how supportable the feature was: was it detectable, diagnosable, and resolvable? Every blind spot encountered becomes a logged backlog item. Every runbook used in a real incident is reviewed and updated. Quarterly, those inputs are converted into requirements for the next development cycle."),
      spacer(),
      body("The SFL also produces the number that justifies the entire framework to leadership: the Shift Left Effectiveness Metric \u2014 what percentage of incidents could have been prevented or detected earlier by an upstream deliverable, and at what estimated cost. This is a number a CFO understands."),

      // ===== SECTION 4 =====
      h1("4. The Business Case"),
      rule(),
      body("The business case for Supportability Engineering does not require a sophisticated model. It requires two numbers from your own data: the average cost of a major incident, and how many you have had in the last twelve months."),
      spacer(),
      body("The average major incident in an enterprise SaaS organization costs between $50,000 and $500,000 in fully-loaded terms: engineering investigation, support overhead, executive escalation, customer communication, account risk, and SLA credits. A single avoided major incident typically pays for a quarter of Supportability Engineering investment."),
      spacer(),
      h2("What Changes, and When"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [1560, 3900, 3900],
        rows: [
          new TableRow({
            children: [
              new TableCell({ borders, width: { size: 1560, type: WidthType.DXA }, shading: { fill: NAVY, type: ShadingType.CLEAR }, margins: { top: 100, bottom: 100, left: 120, right: 120 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Phase", font: "Arial", size: 20, bold: true, color: WHITE })] })] }),
              new TableCell({ borders, width: { size: 3900, type: WidthType.DXA }, shading: { fill: NAVY, type: ShadingType.CLEAR }, margins: { top: 100, bottom: 100, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Without the Framework", font: "Arial", size: 20, bold: true, color: WHITE })] })] }),
              new TableCell({ borders, width: { size: 3900, type: WidthType.DXA }, shading: { fill: NAVY, type: ShadingType.CLEAR }, margins: { top: 100, bottom: 100, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "With the Framework", font: "Arial", size: 20, bold: true, color: WHITE })] })] })
            ]
          }),
          costBenefitRow("SRD", "Nobody knows what failure looks like before it happens. Escalation paths invented under pressure.", "Impact is pre-classified. Escalation is planned. Support onboards in weeks, not months."),
          costBenefitRow("SAR", "Blind spots are architectural fixtures. Finding them requires an engineering investigation every time.", "Every failure has an address. Diagnosis starts from a confirmed fact, not a hypothesis."),
          costBenefitRow("SIC", "Logs exist but say nothing useful. Errors are cryptic. Signals are unwatched.", "Logs are written for the person reading them at midnight. Every error is actionable."),
          costBenefitRow("STP", "Runbooks fail in practice. Alerts fire wrong or not at all. Nobody has rehearsed.", "Runbooks are tested by someone who didn't write them. Alerts are verified. The team has practiced."),
          costBenefitRow("SRR", "Features ship before support is ready. On-call rotation is wrong. Templates don't exist yet.", "Support is ready from minute one of production operation. Communication is ready before it is needed."),
          costBenefitRow("SFL", "Every incident is a sunk cost. Nothing structural changes. The same problems recur.", "Every incident improves the next one. Gaps feed the backlog. ROI is measurable.")
        ]
      }),
      spacer(320),

      h2("The ROI Calculation"),
      body("The framework pays for itself in three ways that can be calculated from your own data:"),
      spacer(),
      bullet("Reduction in MTTR (Mean Time to Resolve): Organizations implementing the full framework typically see a 40\u201360% reduction in MTTR within two quarters, as diagnosis time drops from hours to minutes."),
      bullet("Reduction in engineering escalation rate: When support can diagnose independently, the percentage of incidents requiring engineering involvement drops significantly \u2014 protecting the time of your highest-cost engineers."),
      bullet("Reduction in recurring incidents: The SFL\u2019s feedback mechanism typically reduces the recurrence rate of the same incident class by 30\u201350% within the first year, as operational experience flows back into design requirements."),
      spacer(),
      pullQuote("\u201cThe framework pays for itself within the first avoided major incident. Every subsequent improvement is compound return on that initial investment.\u201d"),

      // ===== SECTION 5 =====
      h1("5. What \u201cDone\u201d Means"),
      rule(),
      body("In most engineering organizations, \u201cdone\u201d means the feature works. Tests pass. It ships."),
      spacer(),
      body("In an organization practicing Supportability Engineering, \u201cdone\u201d means something more: the feature works, support can operate it independently, the runbooks have been tested by someone who didn\u2019t write them, the alerts have been verified, the on-call rotation is updated, and both the support lead and engineering lead have signed off that they are ready."),
      spacer(),
      body("That is not a higher bar. It is a more complete definition of the same bar. A feature that works in development but cannot be diagnosed in production is not done. It is a liability in waiting."),
      spacer(),
      h2("A Cultural Shift with Structural Teeth"),
      body("Supportability Engineering is sometimes described as a culture change. That is true, but culture change without structural mechanisms is aspiration without execution. The six-phase framework provides the structure:"),
      spacer(),
      bullet("Sign-off gates that require support involvement before each phase proceeds"),
      bullet("Checklists that make supportability a named responsibility in code review, not an afterthought"),
      bullet("A feedback loop that makes every incident an investment in the framework rather than a sunk cost"),
      bullet("A measurable metric that demonstrates the value of the practice to leadership in dollars and hours"),
      spacer(),
      body("The framework does not require new tooling. It does not require new headcount. It requires that the questions which should have been asked all along \u2014 how will we know this is broken, and what do we do about it \u2014 get asked at the right time, by the right people, with the right accountability to ensure the answers survive all the way to the support engineer who needs them at 2am."),

      // ===== SECTION 6 =====
      h1("6. The Question Worth Asking"),
      rule(),
      body("If your organization has had a major incident in the last twelve months that took longer to resolve than it should have \u2014 and nearly every organization has \u2014 the question worth asking is not how to respond faster next time."),
      spacer(),
      body("The question is: at which phase of development was the information that would have made this incident faster to resolve available, and why didn\u2019t it make it to production?"),
      spacer(),
      body("The answer is almost always the same. The information existed. An engineer knew the failure mode. A designer understood the blind spot. A support lead had the question but wasn\u2019t in the room. Somewhere between the idea and the release, the knowledge that would have made the incident manageable was lost \u2014 because there was no process to carry it forward."),
      spacer(),
      pullQuote("\u201cThe best support organizations don\u2019t respond faster. They designed their systems so that when something breaks, anyone on the team can pick it up and know exactly what to do.\u201d"),
      spacer(240),
      body("Supportability Engineering is that process. Not faster firefighting. A world where the fires are smaller, shorter, and increasingly rare."),
      spacer(480),

      // ===== ABOUT =====
      h1("About the Author"),
      rule(),
      body("John A. Bowman is a Supportability Engineering practitioner with experience designing and implementing shift-left supportability frameworks in enterprise software environments. His work focuses on the intersection of support operations, software design, and organizational reliability \u2014 building the structures that allow support organizations to operate complex systems independently, at speed, and under pressure."),
      spacer(),
      body("John is available for consulting engagements, staff roles in support engineering or operational readiness, and advisory work with teams seeking to build or mature their supportability practice."),
      spacer(),
      new Paragraph({
        spacing: { before: 160, after: 80 },
        children: [
          new TextRun({ text: "Contact: ", font: "Arial", size: 22, bold: true, color: NAVY }),
          new TextRun({ text: "dooohhead@gmail.com  \u2022  902-489-2429", font: "Arial", size: 22, color: DARK_GRAY })
        ]
      }),
      new Paragraph({
        spacing: { before: 0, after: 80 },
        children: [
          new TextRun({ text: "Full Framework Templates: ", font: "Arial", size: 22, bold: true, color: NAVY }),
          new TextRun({ text: "Six-phase deliverable template package available on request.", font: "Arial", size: 22, color: DARK_GRAY })
        ]
      }),
      spacer(320),
      rule(ACCENT, 6),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 120, after: 0 },
        children: [new TextRun({ text: "Confidential \u2014 Consulting IP  |  John A. Bowman  |  Supportability Engineering  |  2026", font: "Arial", size: 18, color: "888888", italics: true })]
      })
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('/home/claude/Supportability_Engineering_WhitePaper.docx', buffer);
  console.log('Done');
});
