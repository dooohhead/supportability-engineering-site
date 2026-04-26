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
const MGRAY  = "F4F6F9";
const DGRAY  = "2d3748";
const WHITE  = "FFFFFF";
const AMBER  = "451a03";
const AMBERBG= "fffbeb";
const REDDARK= "7f1d1d";
const REDBG  = "fff5f5";

const bd  = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: bd, bottom: bd, left: bd, right: bd };
const nb  = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: nb, bottom: nb, left: nb, right: nb };

const sp = (before=0, after=120) => new Paragraph({ spacing:{before,after}, children:[] });
const pageBreak = () => new Paragraph({ children:[new PageBreak()] });

const rule = (color=ACCENT) => new Paragraph({
  border:{ bottom:{ style:BorderStyle.SINGLE, size:10, color, space:1 } },
  spacing:{ before:0, after:200 }, children:[]
});

const phaseHeader = (num, name, abbr, desc, color=ACCENT) => [
  new Paragraph({
    spacing:{ before:0, after:60 },
    children:[new TextRun({ text:`PHASE ${num}  \u2014  ${name.toUpperCase()}`, font:"Arial", size:18, bold:true, color, characterSpacing:150 })]
  }),
  new Paragraph({
    spacing:{ before:0, after:80 },
    children:[new TextRun({ text:abbr, font:"Arial", size:40, bold:true, color:NAVY })]
  }),
  new Paragraph({
    spacing:{ before:0, after:120 },
    children:[new TextRun({ text:desc, font:"Arial", size:22, color:DGRAY, italics:true })]
  }),
  rule(color),
];

const sectionLabel = (text, color=ACCENT) => new Paragraph({
  spacing:{ before:320, after:80 },
  children:[new TextRun({ text, font:"Arial", size:20, bold:true, color, characterSpacing:100 })]
});

const body = (text) => new Paragraph({
  spacing:{ before:40, after:100 },
  children:[new TextRun({ text, font:"Arial", size:20, color:DGRAY })]
});

const fieldRow = (label, span=1, height=400) => new TableRow({
  children:[
    new TableCell({
      borders, columnSpan:span,
      width:{ size:9360, type:WidthType.DXA },
      margins:{ top:80, bottom:80, left:160, right:160 },
      shading:{ fill:MGRAY, type:ShadingType.CLEAR },
      children:[
        new Paragraph({ spacing:{before:0,after:40}, children:[new TextRun({text:label,font:"Arial",size:18,bold:true,color:NAVY2})]}),
        new Paragraph({ spacing:{before:0,after:0}, children:[new TextRun({text:" ",font:"Arial",size:18,color:WHITE})]})
      ]
    })
  ]
});

const metaRow = (label, value="") => new TableRow({
  children:[
    new TableCell({ borders, width:{size:2800,type:WidthType.DXA}, shading:{fill:NAVY2,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:140,right:140}, children:[new Paragraph({children:[new TextRun({text:label,font:"Arial",size:19,bold:true,color:WHITE})]})] }),
    new TableCell({ borders, width:{size:6560,type:WidthType.DXA}, shading:{fill:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:140,right:140}, children:[new Paragraph({children:[new TextRun({text:value,font:"Arial",size:19,color:DGRAY})]})] }),
  ]
});

const metaTable = (rows) => new Table({
  width:{size:9360,type:WidthType.DXA}, columnWidths:[2800,6560],
  rows: rows.map(([l,v]) => metaRow(l,v))
});

const checkRow = (text, req="Required") => new TableRow({
  children:[
    new TableCell({ borders, width:{size:480,type:WidthType.DXA}, shading:{fill:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:120,right:120}, children:[new Paragraph({alignment:AlignmentType.CENTER, children:[new TextRun({text:"\u25A1",font:"Arial",size:22,color:ACCENT})]})] }),
    new TableCell({ borders, width:{size:7680,type:WidthType.DXA}, shading:{fill:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:120,right:120}, children:[new Paragraph({children:[new TextRun({text,font:"Arial",size:19,color:DGRAY})]})] }),
    new TableCell({ borders, width:{size:1200,type:WidthType.DXA}, shading:{fill:req==="Required"?LIGHT:AMBERBG,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({alignment:AlignmentType.CENTER, children:[new TextRun({text:req,font:"Arial",size:17,bold:true,color:req==="Required"?ACCENT:AMBER})]})] }),
  ]
});

const checkHeader = (title) => new TableRow({
  children:[
    new TableCell({ borders, columnSpan:3, width:{size:9360,type:WidthType.DXA}, shading:{fill:NAVY,type:ShadingType.CLEAR}, margins:{top:100,bottom:100,left:120,right:120}, children:[new Paragraph({children:[new TextRun({text:title,font:"Arial",size:19,bold:true,color:WHITE})]})] })
  ]
});

const gridTable = (headers, widths, emptyRows=5, color=NAVY) => {
  const hRow = new TableRow({ children: headers.map((h,i) => new TableCell({
    borders, width:{size:widths[i],type:WidthType.DXA}, shading:{fill:color,type:ShadingType.CLEAR},
    margins:{top:80,bottom:80,left:100,right:100},
    children:[new Paragraph({children:[new TextRun({text:h,font:"Arial",size:18,bold:true,color:WHITE})]})]
  }))});
  const dataRows = Array(emptyRows).fill(null).map((_,ri) => new TableRow({ children: headers.map((_,i) => new TableCell({
    borders, width:{size:widths[i],type:WidthType.DXA}, shading:{fill:ri%2===0?MGRAY:WHITE,type:ShadingType.CLEAR},
    margins:{top:120,bottom:120,left:100,right:100},
    children:[new Paragraph({children:[new TextRun({text:" ",font:"Arial",size:19})]})]
  }))}));
  return new Table({ width:{size:9360,type:WidthType.DXA}, columnWidths:widths, rows:[hRow,...dataRows] });
};

const signoffTable = (roles) => new Table({
  width:{size:9360,type:WidthType.DXA}, columnWidths: Array(roles.length).fill(Math.floor(9360/roles.length)),
  rows:[
    new TableRow({ children: roles.map(r => new TableCell({
      borders, shading:{fill:NAVY2,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:120,right:120},
      children:[new Paragraph({children:[new TextRun({text:r,font:"Arial",size:18,bold:true,color:WHITE})]})]
    }))}),
    new TableRow({ children: roles.map(() => new TableCell({
      borders, shading:{fill:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:120,right:120},
      children:[
        new Paragraph({spacing:{before:0,after:40}, children:[new TextRun({text:"Name:",font:"Arial",size:18,color:DGRAY})]}),
        new Paragraph({spacing:{before:0,after:40}, children:[new TextRun({text:"Signature:",font:"Arial",size:18,color:DGRAY})]}),
        new Paragraph({spacing:{before:0,after:0},  children:[new TextRun({text:"Date:",font:"Arial",size:18,color:DGRAY})]})
      ]
    }))})
  ]
});

const noteBox = (text, color=LIGHT, textColor=NAVY2) => new Table({
  width:{size:9360,type:WidthType.DXA}, columnWidths:[9360],
  rows:[new TableRow({children:[new TableCell({
    borders, shading:{fill:color,type:ShadingType.CLEAR}, margins:{top:120,bottom:120,left:160,right:160},
    children:[new Paragraph({children:[new TextRun({text,font:"Arial",size:19,italics:true,color:textColor})]})]
  })]})]
});

// ── SCORING TABLE ──
const scoringTable = () => new Table({
  width:{size:9360,type:WidthType.DXA}, columnWidths:[600,1560,1560,1560,2040,2040],
  rows:[
    new TableRow({ children:[
      ...["Score","Detectable","Diagnosable","Resolvable","Reasoning Trace","Intervention Accuracy"].map(h =>
        new TableCell({ borders, shading:{fill:NAVY,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:80,right:80},
          children:[new Paragraph({alignment:AlignmentType.CENTER, children:[new TextRun({text:h,font:"Arial",size:17,bold:true,color:WHITE})]})] })
      )
    ]}),
    ...[
      ["5","Auto-detected before impact","< 15 min by support","No engineering needed","Complete trace, all steps","All triggers fired correctly"],
      ["4","Within 5 min of impact","< 30 min","Minor eng. input","Trace complete, minor gaps","Triggers fired, minor routing issues"],
      ["3","Within 30 min","< 2 hours","Eng. escalation required","Trace partial, key steps missing","Some triggers missed"],
      ["2","Via customer report","> 2 hours","Senior eng. involved","Trace minimal, reasoning unclear","Triggers frequently missed"],
      ["1","Not detected","Root cause unknown","Code change required","No trace","Triggers non-functional"],
    ].map(([s,...cells],ri) => new TableRow({ children:[
      new TableCell({ borders, shading:{fill:ri%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:60,bottom:60,left:80,right:80},
        children:[new Paragraph({alignment:AlignmentType.CENTER, children:[new TextRun({text:s,font:"Arial",size:19,bold:true,color:NAVY})]})] }),
      ...cells.map(c => new TableCell({ borders, shading:{fill:ri%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:60,bottom:60,left:80,right:80},
        children:[new Paragraph({children:[new TextRun({text:c,font:"Arial",size:17,color:DGRAY})]})] }))
    ]}))
  ]
});

const doc = new Document({
  numbering:{ config:[{ reference:"bullets", levels:[{ level:0, format:LevelFormat.BULLET, text:"\u2022", alignment:AlignmentType.LEFT, style:{ paragraph:{ indent:{ left:720, hanging:360 } } } }] }] },
  styles:{ default:{ document:{ run:{ font:"Arial", size:20 } } } },
  sections:[{
    properties:{ page:{ size:{ width:12240, height:15840 }, margin:{ top:1440, right:1440, bottom:1440, left:1440 } } },
    headers:{ default: new Header({ children:[
      new Paragraph({
        tabStops:[{ type:TabStopType.RIGHT, position:9360 }],
        border:{ bottom:{ style:BorderStyle.SINGLE, size:6, color:ACCENT, space:1 } },
        spacing:{ before:0, after:160 },
        children:[
          new TextRun({ text:"SUPPORTABILITY ENGINEERING FOR AGENTIC SYSTEMS  \u2014  TEMPLATE PACK", font:"Arial", size:17, bold:true, color:NAVY }),
          new TextRun({ text:"\tVol. 2  |  John A. Bowman  |  2026", font:"Arial", size:17, color:"888888" })
        ]
      })
    ]})},
    footers:{ default: new Footer({ children:[
      new Paragraph({
        tabStops:[{ type:TabStopType.RIGHT, position:9360 }],
        border:{ top:{ style:BorderStyle.SINGLE, size:6, color:ACCENT, space:1 } },
        spacing:{ before:160, after:0 },
        children:[
          new TextRun({ text:"Confidential \u2014 Consulting IP  |  dooohhead@gmail.com  |  902-489-2429", font:"Arial", size:16, color:"888888" }),
          new TextRun({ text:"\tCompanion to Vol. 2: Shifting Left When the System Can Think", font:"Arial", size:16, color:"888888" })
        ]
      })
    ]})},

    children:[

      // ── COVER ──
      sp(2000,0),
      new Paragraph({ spacing:{before:0,after:60}, children:[new TextRun({text:"TEMPLATE PACK  \u00B7  VOLUME 2", font:"Arial", size:20, bold:true, color:ACCENT, characterSpacing:200})] }),
      new Paragraph({ spacing:{before:0,after:40}, children:[new TextRun({text:"Supportability Engineering", font:"Arial", size:60, bold:true, color:NAVY})] }),
      new Paragraph({ spacing:{before:0,after:40}, children:[new TextRun({text:"for Agentic Systems", font:"Arial", size:60, bold:true, color:ACCENT})] }),
      new Paragraph({ spacing:{before:0,after:320}, children:[new TextRun({text:"Six-Phase Deliverable Templates  \u2014  Agentic Extensions", font:"Arial", size:36, color:NAVY2})] }),
      new Paragraph({ border:{bottom:{style:BorderStyle.SINGLE,size:16,color:ACCENT,space:1}}, spacing:{before:0,after:240}, children:[] }),
      body("This template pack extends the six-phase Supportability Engineering framework for systems where the product itself is an agentic AI workflow. Each template adds the specific sections required to capture, verify, and validate the new failure modes that agentic systems introduce: non-deterministic failure, silent confident errors, reasoning chain traceability, mid-execution intervention triggers, context window drift, and tool schema integrity."),
      sp(160,0),
      new Paragraph({ spacing:{before:0,after:60}, children:[new TextRun({text:"John A. Bowman", font:"Arial", size:22, bold:true, color:NAVY})] }),
      new Paragraph({ spacing:{before:0,after:60}, children:[new TextRun({text:"dooohhead@gmail.com  \u2022  902-489-2429", font:"Arial", size:20, color:DGRAY})] }),
      new Paragraph({ spacing:{before:0,after:0},  children:[new TextRun({text:"2026", font:"Arial", size:20, color:DGRAY})] }),

      // ── INDEX ──
      pageBreak(),
      new Paragraph({ spacing:{before:0,after:120}, children:[new TextRun({text:"Template Index", font:"Arial", size:36, bold:true, color:NAVY})] }),
      rule(),
      new Table({
        width:{size:9360,type:WidthType.DXA}, columnWidths:[480,2400,3480,3000],
        rows:[
          new TableRow({ children:[
            ...["#","Template","Phase","Agentic Extension Focus"].map(h => new TableCell({ borders, shading:{fill:NAVY,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({children:[new TextRun({text:h,font:"Arial",size:18,bold:true,color:WHITE})]})] }))
          ]}),
          ...[
            ["1","A-SRD","Phase 1 \u2014 Requirements","Intervention triggers, confidence thresholds, adversarial failure modes, reasoning trace requirements"],
            ["2","A-SAR","Phase 2 \u2014 Design","Reasoning checkpoint map, tool schema change protocol, context window boundary analysis"],
            ["3","A-SIC","Phase 3 \u2014 Build","Reasoning trace logging standard, prompt/response capture, confidence score instrumentation"],
            ["4","A-STP","Phase 4 \u2014 Test","Adversarial input testing, context drift simulation, non-determinism stress testing, confidence threshold validation"],
            ["5","A-SRR","Phase 5 \u2014 Release","Model version change protocol, output review rotation, reasoning trace review process"],
            ["6","A-SFL","Phase 6 \u2014 Operate","Reasoning quality scoring, model behavior drift tracking, tool schema change incident log"],
          ].map(([n,t,p,f],i) => new TableRow({ children:[
            new TableCell({ borders, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({alignment:AlignmentType.CENTER, children:[new TextRun({text:n,font:"Arial",size:19,bold:true,color:NAVY})]})] }),
            new TableCell({ borders, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({children:[new TextRun({text:t,font:"Arial",size:19,bold:true,color:ACCENT})]})] }),
            new TableCell({ borders, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({children:[new TextRun({text:p,font:"Arial",size:19,color:DGRAY})]})] }),
            new TableCell({ borders, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({children:[new TextRun({text:f,font:"Arial",size:18,color:DGRAY})]})] }),
          ]}))
        ]
      }),
      sp(160),
      noteBox("Each template in this pack is an extension to the corresponding template in the original Vol. 1 framework. Use alongside — not instead of — the original SRD, SAR, SIC, STP, SRR, and SFL templates."),

      // ══════════════════════════════════════════
      // TEMPLATE 1: A-SRD
      // ══════════════════════════════════════════
      pageBreak(),
      ...phaseHeader("1","Requirements","A-SRD — Agentic Supportability Requirements Document","Extends the SRD to capture the new failure categories, intervention triggers, and reasoning trace requirements specific to agentic AI systems."),

      sectionLabel("A1.1  Document Metadata"),
      metaTable([
        ["Feature / Agent Name",""],["Parent SRD Reference",""],["Agentic System Type","Conversational  /  Task Agent  /  Multi-Agent  /  Other"],
        ["A-SRD Author",""],["Support Representative",""],["Date Created",""],["Version",""],
      ]),

      sectionLabel("A1.2  Agentic System Description"),
      noteBox("Describe the agent's purpose, the tools it has access to, the tasks it performs, and the degree of autonomy it exercises. A support engineer with no prior context must understand what this agent does and what decisions it makes independently."),
      new Table({ width:{size:9360,type:WidthType.DXA}, columnWidths:[9360], rows:[
        new TableRow({children:[new TableCell({ borders, shading:{fill:WHITE,type:ShadingType.CLEAR}, margins:{top:200,bottom:200,left:160,right:160}, children:[new Paragraph({children:[new TextRun({text:" ",font:"Arial",size:19})]})] })]}),
        new TableRow({children:[new TableCell({ borders, shading:{fill:MGRAY,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:160,right:160}, children:[new Paragraph({children:[new TextRun({text:"Tools available to this agent:",font:"Arial",size:18,bold:true,color:NAVY2})]})] })]}),
        new TableRow({children:[new TableCell({ borders, shading:{fill:WHITE,type:ShadingType.CLEAR}, margins:{top:160,bottom:160,left:160,right:160}, children:[new Paragraph({children:[new TextRun({text:" ",font:"Arial",size:19})]})] })]}),
        new TableRow({children:[new TableCell({ borders, shading:{fill:MGRAY,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:160,right:160}, children:[new Paragraph({children:[new TextRun({text:"Degree of autonomy (circle): Fully autonomous  /  Human-in-loop at checkpoints  /  Human approval required for actions  /  Advisory only",font:"Arial",size:18,bold:true,color:NAVY2})]})] })]}),
        new TableRow({children:[new TableCell({ borders, shading:{fill:WHITE,type:ShadingType.CLEAR}, margins:{top:160,bottom:160,left:160,right:160}, children:[new Paragraph({children:[new TextRun({text:" ",font:"Arial",size:19})]})] })]})
      ]}),

      sectionLabel("A1.3  Agentic Failure Mode Inventory"),
      noteBox("In addition to the standard failure modes in the SRD, list every agentic-specific failure mode. For each, define what the customer experiences and how support will detect it."),
      gridTable(
        ["Failure Mode","Agentic Type","Customer Experience","Detection Method","Intervention Required?"],
        [2200,1600,1800,2200,1560], 7, NAVY
      ),
      sp(80),
      new Table({ width:{size:9360,type:WidthType.DXA}, columnWidths:[9360], rows:[
        new TableRow({children:[new TableCell({ borders, shading:{fill:NAVY2,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:160,right:160}, children:[new Paragraph({children:[new TextRun({text:"Agentic Failure Type Reference",font:"Arial",size:18,bold:true,color:WHITE})]})] })]}),
        ...["Non-Deterministic — same input, different outputs across runs",
            "Silent Confident — task completes, output looks plausible, result is wrong",
            "Intervention Miss — agent proceeded past a defined human checkpoint without surfacing the decision",
            "Context Drift — behaviour changed mid-task due to context window pressure",
            "Tool Schema Drift — external tool API changed; agent misinterpreted the response",
            "Adversarial Redirect — input content altered agent behaviour contrary to system prompt"
        ].map((t,i) => new TableRow({children:[new TableCell({ borders, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:160,right:160}, children:[new Paragraph({children:[new TextRun({text:t,font:"Arial",size:18,color:DGRAY})]})] })]}))
      ]}),

      sectionLabel("A1.4  Intervention Trigger Inventory"),
      noteBox("List every condition under which the agent must pause and surface a decision to a human before proceeding. These are business decisions — define them before build, not after the first production incident."),
      gridTable(
        ["Trigger Condition","Task Context","Escalation Target","Response Required Within","Consequence of No Response"],
        [2200,1800,1600,1560,2200], 6, NAVY2
      ),

      sectionLabel("A1.5  Confidence Threshold Definitions"),
      noteBox("Define the confidence level below which the agent must surface uncertainty to a human rather than proceeding. Different task types may have different thresholds."),
      gridTable(
        ["Task Type","Acceptable Confidence Threshold","Below Threshold Action","Who Receives the Escalation"],
        [2400,2000,2400,2560], 5, NAVY
      ),

      sectionLabel("A1.6  Reasoning Trace Requirements"),
      noteBox("Define exactly what must be captured at every reasoning step to allow post-incident reconstruction of the agent's decision path."),
      new Table({ width:{size:9360,type:WidthType.DXA}, columnWidths:[4680,4680], rows:[
        new TableRow({children:[
          new TableCell({ borders, shading:{fill:NAVY,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:140,right:140}, children:[new Paragraph({children:[new TextRun({text:"Required Trace Field",font:"Arial",size:18,bold:true,color:WHITE})]})] }),
          new TableCell({ borders, shading:{fill:NAVY,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:140,right:140}, children:[new Paragraph({children:[new TextRun({text:"Specification / Notes",font:"Arial",size:18,bold:true,color:WHITE})]})] }),
        ]}),
        ...[
          ["Step identifier","Unique ID linked to parent task correlation ID"],
          ["Input state summary","Context available at this step (summarized, not full dump)"],
          ["Reasoning summary","Model\u2019s stated reasoning for next action (from chain-of-thought)"],
          ["Action taken","Tool called, parameters used, or decision made"],
          ["Tool response","Raw response from any tool called at this step"],
          ["Confidence signal","Model\u2019s expressed confidence (if available)"],
          ["Intervention triggered?","Boolean: did this step trigger a human checkpoint"],
          ["Context token utilization","Current context window usage as a percentage"],
        ].map(([f,s],i) => new TableRow({children:[
          new TableCell({ borders, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:140,right:140}, children:[new Paragraph({children:[new TextRun({text:f,font:"Arial",size:19,bold:true,color:NAVY2})]})] }),
          new TableCell({ borders, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:140,right:140}, children:[new Paragraph({children:[new TextRun({text:s,font:"Arial",size:19,color:DGRAY})]})] }),
        ]}))
      ]}),

      sectionLabel("A1.7  Sign-Off"),
      noteBox("All parties must sign before design begins. Outstanding items must be resolved — not carried forward."),
      signoffTable(["Product Owner","Engineering Lead","Support Lead","AI/ML Lead"]),

      // ══════════════════════════════════════════
      // TEMPLATE 2: A-SAR
      // ══════════════════════════════════════════
      pageBreak(),
      ...phaseHeader("2","Design","A-SAR — Agentic Supportability Architecture Review","Maps reasoning checkpoints, tool schema dependencies, and context window boundaries before build begins. All High gaps must be closed before build completes.",ACCENT),

      sectionLabel("A2.1  Document Metadata"),
      metaTable([["Feature / Agent Name",""],["A-SRD Reference",""],["Architecture Author",""],["A-SAR Reviewer (Support)",""],["A-SAR Reviewer (AI/ML)",""],["Date of Review",""],["Architecture Version",""]]),

      sectionLabel("A2.2  Reasoning Checkpoint Map"),
      noteBox("Identify every point in the agent\u2019s task execution where intermediate state can be observed and verified. Mark gaps where the agent operates without observable state. Annotate: (C) = checkpoint  |  (G) = gap  |  (IT) = intervention trigger point."),
      gridTable(
        ["Step / Decision Point","Observable?","Checkpoint Type","Gap Description","Priority (H/M/L)"],
        [2400,1200,1600,2560,1600], 8, NAVY
      ),

      sectionLabel("A2.3  Tool Registry and Schema Risk Assessment"),
      noteBox("Every tool available to the agent is a dependency. Define what happens when its schema changes and who is responsible for detecting and managing that change."),
      gridTable(
        ["Tool Name","Owner / Provider","Schema Version","Change Detection Method","Impact of Schema Change","Notification Owner"],
        [1600,1600,1200,1800,2000,1160], 6, NAVY2
      ),

      sectionLabel("A2.4  Context Window Boundary Analysis"),
      noteBox("For long-running or complex tasks, identify the point at which context window pressure may affect agent behaviour. Define the monitoring and response approach."),
      new Table({ width:{size:9360,type:WidthType.DXA}, columnWidths:[3120,3120,3120], rows:[
        new TableRow({children:["Task Type / Scenario","Estimated Token Usage","Context Drift Risk (H/M/L)"].map(h => new TableCell({ borders, shading:{fill:NAVY,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:120,right:120}, children:[new Paragraph({children:[new TextRun({text:h,font:"Arial",size:18,bold:true,color:WHITE})]})] }))}),
        ...Array(5).fill(null).map((_,i) => new TableRow({children:Array(3).fill(null).map(() => new TableCell({ borders, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:100,bottom:100,left:120,right:120}, children:[new Paragraph({children:[new TextRun({text:" ",font:"Arial",size:19})]})] }))}))
      ]}),
      sp(80),
      new Table({ width:{size:9360,type:WidthType.DXA}, columnWidths:[4680,4680], rows:[
        new TableRow({children:["Context drift alert threshold (% of context window)","Context drift response procedure"].map(h => new TableCell({ borders, shading:{fill:NAVY2,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:140,right:140}, children:[new Paragraph({children:[new TextRun({text:h,font:"Arial",size:18,bold:true,color:WHITE})]})] }))}),
        new TableRow({children:Array(2).fill(null).map(() => new TableCell({ borders, shading:{fill:WHITE,type:ShadingType.CLEAR}, margins:{top:200,bottom:200,left:140,right:140}, children:[new Paragraph({children:[new TextRun({text:" ",font:"Arial",size:19})]})] }))})
      ]}),

      sectionLabel("A2.5  Adversarial Input Risk Assessment"),
      noteBox("Identify every input source the agent processes that could contain adversarial content. Define the detection and containment approach for each."),
      gridTable(
        ["Input Source","Content Type","Adversarial Risk (H/M/L)","Detection Approach","Containment / Response"],
        [1800,1600,1560,2200,2200], 5, NAVY
      ),

      sectionLabel("A2.6  Open Items — Become Build Acceptance Criteria"),
      gridTable(["#","Open Item","Priority (H/M/L)","Owner","Must Close By"],[480,3680,1200,2000,2000], 5, NAVY2),

      sectionLabel("A2.7  Sign-Off"),
      noteBox("All High priority gaps must be resolved or have a documented remediation plan before sign-off."),
      signoffTable(["Engineering Lead","Support Lead","AI/ML Reviewer","Security Reviewer"]),

      // ══════════════════════════════════════════
      // TEMPLATE 3: A-SIC
      // ══════════════════════════════════════════
      pageBreak(),
      ...phaseHeader("3","Build","A-SIC — Agentic Supportability Implementation Checklist","Verifies that reasoning trace logging, output validation, and intervention triggers are correctly implemented. Cannot be merged without sign-off.",ACCENT),

      sectionLabel("A3.1  Document Metadata"),
      metaTable([["Feature / Agent Name",""],["A-SRD Reference",""],["A-SAR Reference",""],["Developer",""],["PR / Ticket Number",""],["Code Reviewer",""],["Date Completed",""]]),

      sectionLabel("A3.2  Agentic Implementation Checklist"),
      new Table({ width:{size:9360,type:WidthType.DXA}, columnWidths:[480,7680,1200], rows:[
        checkHeader("REASONING TRACE LOGGING"),
        checkRow("Step identifier generated and linked to parent task correlation ID at every reasoning step","Required"),
        checkRow("Input state captured at each step (summarized — not a full context dump)","Required"),
        checkRow("Reasoning summary captured from chain-of-thought output where available","Required"),
        checkRow("Action taken (tool name, parameters, decision) logged at every step","Required"),
        checkRow("Tool response logged for every external tool call","Required"),
        checkRow("Confidence signal captured and logged where model provides it","If applicable"),
        checkRow("Context token utilization logged at each step as a percentage","Required"),
        checkRow("Intervention trigger flag logged as a boolean at every step","Required"),
        checkRow("No sensitive data present in any trace output — PII, credentials, tokens excluded","Required"),
        checkHeader("OUTPUT VALIDATION"),
        checkRow("Output validation logic implemented for each task type defined in A-SRD \u00a71.3","Required"),
        checkRow("Confidence threshold check implemented: below-threshold outputs route to human review","Required"),
        checkRow("Output validation failures logged with full step trace reference","Required"),
        checkRow("Validation failure alerts configured and routed correctly","Required"),
        checkHeader("INTERVENTION TRIGGERS"),
        checkRow("Every intervention trigger from A-SRD \u00a71.4 is implemented in code","Required"),
        checkRow("Intervention trigger fires correctly and routes to the defined escalation target","Required"),
        checkRow("Trigger fires before the agent takes the action, not after","Required"),
        checkRow("Timeout / no-response handling implemented: defines what agent does if human does not respond","Required"),
        checkRow("Intervention events logged with step reference, trigger condition, and resolution","Required"),
        checkHeader("TOOL SCHEMA INTEGRITY"),
        checkRow("Schema version check implemented for every external tool call","Required"),
        checkRow("Unexpected schema response triggers alert and routes to support, not silent failure","Required"),
        checkRow("Circuit breaker implemented for all tool calls","Required"),
        checkHeader("STANDARD SIC ITEMS (CONFIRM ALSO COMPLETE)"),
        checkRow("Structured logging at every transaction boundary (from Vol. 1 SIC)","Required"),
        checkRow("Correlation ID accepted, propagated, and present in every log and trace entry","Required"),
        checkRow("Four golden signals instrumented: latency, error rate, throughput, saturation","Required"),
        checkRow("All standard failure modes from SRD have unit tests","Required"),
        checkRow("Code reviewer has explicitly verified all above items independently","Required"),
      ]}),

      sectionLabel("A3.3  Outstanding Items"),
      gridTable(["#","Item Not Completed — Reason / Justification","Owner","Resolution Target"],[480,5280,1800,1800], 4, NAVY2),

      sectionLabel("A3.4  Sign-Off"),
      signoffTable(["Developer","Code Reviewer","Support Representative","AI/ML Lead"]),

      // ══════════════════════════════════════════
      // TEMPLATE 4: A-STP
      // ══════════════════════════════════════════
      pageBreak(),
      ...phaseHeader("4","Test","A-STP — Agentic Supportability Test Plan","Validates that every agentic failure mode can be detected, diagnosed, and escalated by support. Release is blocked if any required test fails.",ACCENT),

      sectionLabel("A4.1  Document Metadata"),
      metaTable([["Feature / Agent Name",""],["A-SRD Reference",""],["Test Environment",""],["A-STP Author",""],["Support Tester",""],["AI/ML Tester",""],["Test Execution Date",""],["Overall Test Result","Pass / Fail / Partial"]]),

      sectionLabel("A4.2  Non-Determinism Baseline Testing"),
      noteBox("Run the same input scenario a minimum of 10 times. Record output variance. Establish the baseline consistency rate before any failure injection testing."),
      gridTable(
        ["Scenario","# Runs","# Consistent Outputs","# Variant Outputs","Consistency Rate %","Acceptable?"],
        [2200,960,1800,1800,1800,800], 5, NAVY
      ),

      sectionLabel("A4.3  Adversarial Input Testing"),
      noteBox("Deliberately inject inputs designed to redirect, confuse, or override the agent\u2019s instructions. Every agent that processes external content must pass this section."),
      gridTable(
        ["Adversarial Input Type","Input Description","Expected Agent Behaviour","Actual Behaviour","Pass / Fail"],
        [1800,2200,2000,2000,1360], 6, NAVY2
      ),

      sectionLabel("A4.4  Confidence Threshold Validation"),
      noteBox("Trigger conditions where the agent\u2019s confidence should fall below the threshold defined in A-SRD \u00a71.5. Verify the intervention trigger fires and routes correctly."),
      gridTable(
        ["Task Type","Threshold","Test Condition","Trigger Fired?","Routed Correctly?","Pass / Fail"],
        [1600,1000,2200,1280,1680,1600], 5, NAVY
      ),

      sectionLabel("A4.5  Intervention Trigger Testing"),
      noteBox("Trigger every intervention condition defined in A-SRD \u00a71.4. Verify the agent pauses, the escalation reaches the correct target, and the agent handles no-response correctly."),
      gridTable(
        ["Trigger Condition","Fired Before Action?","Correct Target?","No-Response Handling Correct?","Logged Correctly?","Pass / Fail"],
        [2400,1400,1200,2000,1560,800], 6, NAVY2
      ),

      sectionLabel("A4.6  Context Drift Simulation"),
      noteBox("Run tasks long enough to reach the context drift alert threshold defined in A-SAR \u00a72.4. Verify that the alert fires and the reasoning trace shows the drift."),
      gridTable(
        ["Scenario","Context % at Start","Context % at Drift Point","Alert Fired?","Trace Shows Drift?","Pass / Fail"],
        [2000,1400,2000,1200,1560,1200], 4, NAVY
      ),

      sectionLabel("A4.7  Tool Schema Drift Simulation"),
      noteBox("Deliberately modify a tool\u2019s response schema to simulate an API change. Verify the agent detects the change, does not fail silently, and routes correctly to support."),
      gridTable(
        ["Tool","Schema Change Simulated","Agent Response","Alert Fired?","Routed Correctly?","Pass / Fail"],
        [1600,2200,1800,1160,1800,800], 4, NAVY2
      ),

      sectionLabel("A4.8  Runbook Walkthrough — Agentic Failure Modes"),
      noteBox("A support engineer unfamiliar with the agent executes the runbook for each agentic failure mode using only the trace logs, alerts, and dashboards available. If they cannot complete it independently, the runbook or observability is inadequate."),
      gridTable(
        ["Failure Mode / Runbook","Completed Independently?","Time to Diagnose","Reasoning Trace Sufficient?","Gaps Found — Action Required"],
        [2400,1400,1200,1760,2600], 6, NAVY
      ),

      sectionLabel("A4.9  Overall Test Summary"),
      new Table({ width:{size:9360,type:WidthType.DXA}, columnWidths:[5760,3600], rows:[
        new TableRow({children:["Test Area","Result"].map(h => new TableCell({ borders, shading:{fill:NAVY,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:120,right:120}, children:[new Paragraph({children:[new TextRun({text:h,font:"Arial",size:18,bold:true,color:WHITE})]})] }))}),
        ...["Non-Determinism Baseline Testing","Adversarial Input Testing","Confidence Threshold Validation","Intervention Trigger Testing","Context Drift Simulation","Tool Schema Drift Simulation","Runbook Walkthrough"].map((a,i) => new TableRow({children:[
          new TableCell({ borders, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:120,right:120}, children:[new Paragraph({children:[new TextRun({text:a,font:"Arial",size:19,color:DGRAY})]})] }),
          new TableCell({ borders, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:120,right:120}, children:[new Paragraph({children:[new TextRun({text:"Pass / Fail / Partial",font:"Arial",size:18,color:"888888"})]})] }),
        ]})),
        new TableRow({children:[
          new TableCell({ borders, shading:{fill:NAVY2,type:ShadingType.CLEAR}, margins:{top:100,bottom:100,left:120,right:120}, children:[new Paragraph({children:[new TextRun({text:"OVERALL RECOMMENDATION",font:"Arial",size:19,bold:true,color:WHITE})]})] }),
          new TableCell({ borders, shading:{fill:NAVY2,type:ShadingType.CLEAR}, margins:{top:100,bottom:100,left:120,right:120}, children:[new Paragraph({children:[new TextRun({text:"APPROVED FOR RELEASE  /  BLOCKED \u2014 REMEDIATION REQUIRED",font:"Arial",size:18,bold:true,color:GOLD})]})] }),
        ]})
      ]}),

      sectionLabel("A4.10  Sign-Off"),
      noteBox("Release is blocked if the overall recommendation is BLOCKED. All failing items must be remediated and re-tested before sign-off."),
      signoffTable(["QA Lead","Support Lead","Engineering Lead","AI/ML Lead"]),

      // ══════════════════════════════════════════
      // TEMPLATE 5: A-SRR
      // ══════════════════════════════════════════
      pageBreak(),
      ...phaseHeader("5","Release","A-SRR — Agentic Support Readiness Review","The final gate. Confirms that agentic-specific readiness is complete in addition to all standard SRR items. Both Support Lead and Engineering Lead must sign.",ACCENT),

      sectionLabel("A5.1  Document Metadata"),
      metaTable([["Feature / Agent Name",""],["Target Release Date",""],["A-SRD Reference",""],["A-SAR Reference",""],["A-SIC Reference",""],["A-STP Reference",""],["A-SRR Conducted By",""],["Date of Review",""]]),

      sectionLabel("A5.2  Agentic Production Readiness Checklist"),
      new Table({ width:{size:9360,type:WidthType.DXA}, columnWidths:[480,7680,1200], rows:[
        checkHeader("REASONING TRACE INFRASTRUCTURE"),
        checkRow("Reasoning trace logging active in production environment and verified against expected output","Required"),
        checkRow("Trace storage retention policy confirmed and compliant with data obligations","Required"),
        checkRow("Trace search and retrieval confirmed working — support can query a trace by task ID","Required"),
        checkRow("Trace dashboard available to support without engineering access","Required"),
        checkHeader("OUTPUT VALIDATION IN PRODUCTION"),
        checkRow("Output validation logic confirmed active in production configuration","Required"),
        checkRow("Below-threshold confidence routing confirmed end-to-end in production","Required"),
        checkRow("Output review rotation established — named support engineers on output review schedule","Required"),
        checkRow("Output review SLA defined: maximum time between output generation and review","Required"),
        checkHeader("INTERVENTION TRIGGER PRODUCTION CONFIRMATION"),
        checkRow("All intervention triggers confirmed active in production","Required"),
        checkRow("Escalation routing tested end-to-end with a live test trigger in production configuration","Required"),
        checkRow("Timeout / no-response procedure confirmed and tested","Required"),
        checkHeader("MODEL VERSION CHANGE PROTOCOL"),
        checkRow("Model version change protocol documented and accessible to support without engineering","Required"),
        checkRow("Behavioral regression test suite defined and executed against current model version","Required"),
        checkRow("Rollback to previous model version tested successfully in pre-production","Required"),
        checkRow("Model version pinned in production — no automatic updates without protocol execution","Required"),
        checkHeader("TOOL SCHEMA CHANGE PROTOCOL"),
        checkRow("Tool schema change notification process confirmed for every tool in the A-SAR registry","Required"),
        checkRow("Schema change response procedure documented and accessible to support","Required"),
        checkHeader("AGENTIC RUNBOOKS"),
        checkRow("Runbooks for all agentic failure modes published to support knowledge base","Required"),
        checkRow("Agentic runbooks reviewed by a support engineer who did not write them","Required"),
        checkRow("Reasoning trace navigation guide available alongside each runbook","Required"),
        checkHeader("STANDARD SRR ITEMS (CONFIRM ALSO COMPLETE)"),
        checkRow("Production monitoring dashboards live and verified (from Vol. 1 SRR)","Required"),
        checkRow("All alerts active in production — routing confirmed end-to-end","Required"),
        checkRow("On-call rotation updated and this agent assigned to a named owner","Required"),
        checkRow("Customer communication templates approved for each failure severity","Required"),
        checkRow("All support staff trained on agent behaviour and failure modes","Required"),
      ]}),

      sectionLabel("A5.3  Outstanding Items"),
      noteBox("This table must be empty for release to be approved. Any outstanding item triggers a BLOCKED decision."),
      gridTable(["#","Outstanding Item","Owner","Resolution Required By"],[480,5280,1800,1800], 4, NAVY2),

      sectionLabel("A5.4  Release Decision"),
      new Table({ width:{size:9360,type:WidthType.DXA}, columnWidths:[9360], rows:[
        new TableRow({children:[new TableCell({ borders, shading:{fill:WHITE,type:ShadingType.CLEAR}, margins:{top:160,bottom:160,left:200,right:200}, children:[
          new Paragraph({spacing:{before:0,after:120}, children:[new TextRun({text:"\u25A1  APPROVED FOR RELEASE \u2014 All items complete, no outstanding issues.",font:"Arial",size:20,bold:true,color:"1a5c1a"})]}),
          new Paragraph({spacing:{before:0,after:120}, children:[new TextRun({text:"\u25A1  CONDITIONAL APPROVAL \u2014 Released with the following accepted risks (document below):",font:"Arial",size:20,bold:true,color:AMBER})]}),
          new Paragraph({spacing:{before:0,after:0},  children:[new TextRun({text:"\u25A1  BLOCKED \u2014 Outstanding items must be resolved and re-reviewed before release.",font:"Arial",size:20,bold:true,color:REDDARK})]})
        ]})]})
      ]}),

      sectionLabel("A5.5  Sign-Off"),
      noteBox("Both Support Lead and Engineering Lead must sign. Release does not proceed without both signatures."),
      signoffTable(["Support Lead","Engineering Lead","Product Owner","AI/ML Lead"]),

      // ══════════════════════════════════════════
      // TEMPLATE 6: A-SFL
      // ══════════════════════════════════════════
      pageBreak(),
      ...phaseHeader("6","Operate","A-SFL — Agentic Supportability Feedback Loop","Converts operational experience into upstream improvements including reasoning quality data, model behavior drift tracking, and tool schema change history.",ACCENT),

      sectionLabel("A6.1  Document Metadata"),
      metaTable([["Feature / Agent Name",""],["Review Period",""],["A-SFL Author",""],["Support Representative",""],["Engineering Representative",""],["AI/ML Representative",""],["Quarterly Review Date",""]]),

      sectionLabel("A6.2  Incident Supportability Scoring (Agentic Five-Dimension)"),
      noteBox("After every incident involving this agent, score all five dimensions. Aggregate scores feed back into the next design and build cycle."),
      new Table({ width:{size:9360,type:WidthType.DXA}, columnWidths:[480,1440,960,960,960,1200,1560,1800],
        rows:[
          new TableRow({children:["#","Incident Ref","Detect\n(1-5)","Diagnose\n(1-5)","Resolve\n(1-5)","Reasoning\nTrace (1-5)","Intervention\nAccuracy (1-5)","Key Finding"].map(h => new TableCell({ borders, shading:{fill:NAVY,type:ShadingType.CLEAR}, margins:{top:60,bottom:60,left:80,right:80}, children:[new Paragraph({alignment:AlignmentType.CENTER, children:[new TextRun({text:h,font:"Arial",size:16,bold:true,color:WHITE})]})] }))}),
          ...Array(8).fill(null).map((_,i) => new TableRow({children:Array(8).fill(null).map(() => new TableCell({ borders, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:80,right:80}, children:[new Paragraph({children:[new TextRun({text:" ",font:"Arial",size:18})]})] }))}))
        ]
      }),
      sp(80),
      sectionLabel("A6.2a  Scoring Reference"),
      scoringTable(),

      sectionLabel("A6.3  Reasoning Quality Log"),
      noteBox("A living record of every reasoning quality issue encountered in production. Every entry is a backlog item for AI/ML and engineering."),
      gridTable(
        ["#","Date","Incident Ref","Reasoning Quality Issue Description","Root Step (if identifiable)","Priority (H/M/L)","Backlog #"],
        [360,760,1000,2400,1600,960,1280], 7, NAVY2
      ),

      sectionLabel("A6.4  Model Behavior Drift Tracking"),
      noteBox("Record any change in agent behavior that was not triggered by a code change. Model version updates, temperature drift, and provider-side changes all appear here."),
      gridTable(
        ["Date Detected","Change Description","Suspected Cause","Behavioral Impact","Action Taken","Resolved?"],
        [1000,2000,1600,1760,1800,1200], 5, NAVY
      ),

      sectionLabel("A6.5  Tool Schema Change Incident Log"),
      noteBox("Every incident traceable to a tool schema change is recorded here. Feeds back into the A-SAR tool registry for the next cycle."),
      gridTable(
        ["Date","Tool","Schema Change Description","Incidents Caused","Detection Method","Time to Detect","A-SAR Update Required?"],
        [760,1200,2000,1200,1400,1000,1800], 5, NAVY2
      ),

      sectionLabel("A6.6  Quarterly Agentic Supportability Review"),
      metaTable([
        ["Review Date",""],["Attendees",""],
        ["Average 5-dimension score (period)",""],
        ["# Reasoning quality issues logged",""],["# Reasoning quality issues resolved",""],
        ["# Model behavior drift events",""],["# Tool schema change incidents",""],
        ["Top recurring agentic failure pattern",""],
        ["Top improvement target for next cycle",""],
      ]),
      sp(80),
      sectionLabel("Agentic Incident Root Category Analysis"),
      gridTable(
        ["Root Category","# Incidents","Avg Score","Upstream Phase to Improve"],
        [3000,1200,1200,3960], 7, NAVY
      ),

      sectionLabel("A6.7  Backlog Items Generated This Period"),
      gridTable(["#","Backlog Item Description","Source","Priority (H/M/L)","Assigned To / Target Sprint"],[480,3680,1600,1200,2400], 6, NAVY2),

      sectionLabel("A6.8  Quarterly Sign-Off"),
      noteBox("Sign-off confirms the quarterly review occurred, findings were documented, and backlog items were created for all High priority gaps including reasoning quality and model behavior drift findings."),
      signoffTable(["Support Lead","Engineering Lead","AI/ML Lead","Product Owner"]),

      // ── CLOSING ──
      sp(480),
      new Paragraph({ border:{bottom:{style:BorderStyle.SINGLE,size:6,color:ACCENT,space:1}}, spacing:{before:0,after:120}, children:[] }),
      new Paragraph({ alignment:AlignmentType.CENTER, spacing:{before:120,after:0},
        children:[new TextRun({text:"A-SRD  \u2192  A-SAR  \u2192  A-SIC  \u2192  A-STP  \u2192  A-SRR  \u2192  A-SFL  \u2192  A-SRD (next cycle)", font:"Arial", size:20, bold:true, color:NAVY})]
      }),
      sp(80),
      new Paragraph({ alignment:AlignmentType.CENTER, spacing:{before:0,after:0},
        children:[new TextRun({text:"Confidential \u2014 Consulting IP  |  John A. Bowman  |  Supportability Engineering  |  2026", font:"Arial",size:17,color:"888888",italics:true})]
      }),
    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('/home/claude/SE_AgenticSystems_Templates.docx', buf);
  console.log('Done Vol 2 templates');
});
