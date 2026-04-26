const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageBreak, LevelFormat,
  TabStopType, TabStopPosition
} = require('docx');
const fs = require('fs');

const NAVY   = "0f2340";
const NAVY2  = "1b3a5c";
const TEAL   = "0d7377";
const TEAL2  = "e0f7f7";
const TEAL3  = "ccf5f5";
const GOLD   = "c9993a";
const MGRAY  = "F4F6F9";
const DGRAY  = "2d3748";
const WHITE  = "FFFFFF";
const AMBER  = "451a03";
const AMBERBG= "fffbeb";
const REDDARK= "7f1d1d";

const bd = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: bd, bottom: bd, left: bd, right: bd };
const nb = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: nb, bottom: nb, left: nb, right: nb };

const sp = (before=0, after=120) => new Paragraph({ spacing:{before,after}, children:[] });
const pageBreak = () => new Paragraph({ children:[new PageBreak()] });

const rule = (color=TEAL) => new Paragraph({
  border:{ bottom:{ style:BorderStyle.SINGLE, size:10, color, space:1 } },
  spacing:{ before:0, after:200 }, children:[]
});

const phaseHeader = (num, name, abbr, desc) => [
  new Paragraph({
    spacing:{before:0,after:60},
    children:[new TextRun({text:`PHASE ${num}  \u2014  ${name.toUpperCase()}`, font:"Arial", size:18, bold:true, color:TEAL, characterSpacing:150})]
  }),
  new Paragraph({
    spacing:{before:0,after:80},
    children:[new TextRun({text:abbr, font:"Arial", size:40, bold:true, color:NAVY})]
  }),
  new Paragraph({
    spacing:{before:0,after:120},
    children:[new TextRun({text:desc, font:"Arial", size:22, color:DGRAY, italics:true})]
  }),
  rule(),
];

const sectionLabel = (text) => new Paragraph({
  spacing:{before:320,after:80},
  children:[new TextRun({text, font:"Arial", size:20, bold:true, color:TEAL, characterSpacing:100})]
});

const body = (text) => new Paragraph({
  spacing:{before:40,after:100},
  children:[new TextRun({text, font:"Arial", size:20, color:DGRAY})]
});

const noteBox = (text, bg=TEAL2, textColor=NAVY2) => new Table({
  width:{size:9360,type:WidthType.DXA}, columnWidths:[9360],
  rows:[new TableRow({children:[new TableCell({
    borders, shading:{fill:bg,type:ShadingType.CLEAR}, margins:{top:120,bottom:120,left:160,right:160},
    children:[new Paragraph({children:[new TextRun({text,font:"Arial",size:19,italics:true,color:textColor})]})]
  })]})]
});

const warningBox = (text) => noteBox(text, "fff5f5", REDDARK);

const metaRow = (label, value="") => new TableRow({ children:[
  new TableCell({ borders, width:{size:2800,type:WidthType.DXA}, shading:{fill:NAVY2,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:140,right:140}, children:[new Paragraph({children:[new TextRun({text:label,font:"Arial",size:19,bold:true,color:WHITE})]})] }),
  new TableCell({ borders, width:{size:6560,type:WidthType.DXA}, shading:{fill:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:140,right:140}, children:[new Paragraph({children:[new TextRun({text:value,font:"Arial",size:19,color:DGRAY})]})] }),
]});

const metaTable = (rows) => new Table({
  width:{size:9360,type:WidthType.DXA}, columnWidths:[2800,6560],
  rows: rows.map(([l,v]) => metaRow(l,v))
});

const checkRow = (text, req="Required") => new TableRow({ children:[
  new TableCell({ borders, width:{size:480,type:WidthType.DXA}, shading:{fill:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:120,right:120}, children:[new Paragraph({alignment:AlignmentType.CENTER, children:[new TextRun({text:"\u25A1",font:"Arial",size:22,color:TEAL})]})] }),
  new TableCell({ borders, width:{size:7680,type:WidthType.DXA}, shading:{fill:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:120,right:120}, children:[new Paragraph({children:[new TextRun({text,font:"Arial",size:19,color:DGRAY})]})] }),
  new TableCell({ borders, width:{size:1200,type:WidthType.DXA}, shading:{fill:req==="Required"?TEAL2:AMBERBG,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({alignment:AlignmentType.CENTER, children:[new TextRun({text:req,font:"Arial",size:17,bold:true,color:req==="Required"?TEAL:AMBER})]})] }),
]});

const checkHeader = (title) => new TableRow({ children:[
  new TableCell({ borders, columnSpan:3, width:{size:9360,type:WidthType.DXA}, shading:{fill:TEAL,type:ShadingType.CLEAR}, margins:{top:100,bottom:100,left:120,right:120}, children:[new Paragraph({children:[new TextRun({text:title,font:"Arial",size:19,bold:true,color:WHITE})]})] })
]});

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
      borders, shading:{fill:TEAL,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:120,right:120},
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

const doc = new Document({
  numbering:{ config:[{ reference:"bullets", levels:[{ level:0, format:LevelFormat.BULLET, text:"\u2022", alignment:AlignmentType.LEFT, style:{ paragraph:{ indent:{ left:720, hanging:360 } } } }] }] },
  styles:{ default:{ document:{ run:{ font:"Arial", size:20 } } } },
  sections:[{
    properties:{ page:{ size:{ width:12240, height:15840 }, margin:{ top:1440, right:1440, bottom:1440, left:1440 } } },
    headers:{ default: new Header({ children:[
      new Paragraph({
        tabStops:[{ type:TabStopType.RIGHT, position:9360 }],
        border:{ bottom:{ style:BorderStyle.SINGLE, size:6, color:TEAL, space:1 } },
        spacing:{ before:0, after:160 },
        children:[
          new TextRun({text:"SUPPORTABILITY ENGINEERING FOR AGENTIC DEVELOPMENT  \u2014  TEMPLATE PACK", font:"Arial", size:17, bold:true, color:NAVY}),
          new TextRun({text:"\tVol. 3  |  John A. Bowman  |  2026", font:"Arial", size:17, color:"888888"})
        ]
      })
    ]})},
    footers:{ default: new Footer({ children:[
      new Paragraph({
        tabStops:[{ type:TabStopType.RIGHT, position:9360 }],
        border:{ top:{ style:BorderStyle.SINGLE, size:6, color:TEAL, space:1 } },
        spacing:{ before:160, after:0 },
        children:[
          new TextRun({text:"Confidential \u2014 Consulting IP  |  dooohhead@gmail.com  |  902-489-2429", font:"Arial", size:16, color:"888888"}),
          new TextRun({text:"\tCompanion to Vol. 3: When the Builder Can\u2019t Sign Off", font:"Arial", size:16, color:"888888"})
        ]
      })
    ]})},

    children:[

      // ── COVER ──
      sp(2000,0),
      new Paragraph({spacing:{before:0,after:60}, children:[new TextRun({text:"TEMPLATE PACK  \u00B7  VOLUME 3", font:"Arial",size:20,bold:true,color:TEAL,characterSpacing:200})]}),
      new Paragraph({spacing:{before:0,after:40}, children:[new TextRun({text:"Supportability Engineering", font:"Arial",size:60,bold:true,color:NAVY})]}),
      new Paragraph({spacing:{before:0,after:40}, children:[new TextRun({text:"for Agentic Development", font:"Arial",size:60,bold:true,color:TEAL})]}),
      new Paragraph({spacing:{before:0,after:320}, children:[new TextRun({text:"Six-Phase Deliverable Templates  \u2014  When the Builder is an Agent", font:"Arial",size:36,color:NAVY2})]}),
      new Paragraph({border:{bottom:{style:BorderStyle.SINGLE,size:16,color:TEAL,space:1}}, spacing:{before:0,after:240}, children:[]}),
      body("This template pack extends the six-phase Supportability Engineering framework for teams using agentic development workflows — Copilot, Cursor, Claude Code, or fully autonomous coding agents. Each template adds the governance, verification, and accountability mechanisms required when the code being produced was generated rather than authored: supportability context blocks, structural gate configurations, architecture observation records, generation-aware test cases, agentic accountability declarations, and agent context update procedures."),
      sp(160,0),
      new Paragraph({spacing:{before:0,after:60}, children:[new TextRun({text:"John A. Bowman", font:"Arial",size:22,bold:true,color:NAVY})]}),
      new Paragraph({spacing:{before:0,after:60}, children:[new TextRun({text:"dooohhead@gmail.com  \u2022  902-489-2429", font:"Arial",size:20,color:DGRAY})]}),
      new Paragraph({spacing:{before:0,after:0},  children:[new TextRun({text:"2026", font:"Arial",size:20,color:DGRAY})]}),

      // ── INDEX ──
      pageBreak(),
      new Paragraph({spacing:{before:0,after:120}, children:[new TextRun({text:"Template Index", font:"Arial",size:36,bold:true,color:NAVY})]}),
      rule(),
      new Table({
        width:{size:9360,type:WidthType.DXA}, columnWidths:[480,2400,3000,3480],
        rows:[
          new TableRow({children:["#","Template","Phase","Agentic Dev Focus"].map(h => new TableCell({borders, shading:{fill:NAVY,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({children:[new TextRun({text:h,font:"Arial",size:18,bold:true,color:WHITE})]})]}))})  ,
          ...[
            ["1","D-SRD","Phase 1 \u2014 Requirements","Supportability context block for agent injection, sensitive data exclusion list, dependency pre-registration"],
            ["2","D-SAR","Phase 2 \u2014 Design","Post-session architecture extraction record, dependency emergence log, human review threshold tracking"],
            ["3","D-SIC","Phase 3 \u2014 Build","Structural gate configuration, automated check results, narrowed human review scope"],
            ["4","D-STP","Phase 4 \u2014 Test","Generation-aware test cases, edge case inventory, pattern-matched failure mode testing"],
            ["5","D-SRR","Phase 5 \u2014 Release","Agentic accountability declaration, generated code percentage disclosure, structural verification attestation"],
            ["6","D-SFL","Phase 6 \u2014 Operate","Agent context block update log, generation gap tracking, context block version history"],
          ].map(([n,t,p,f],i) => new TableRow({children:[
            new TableCell({borders, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({alignment:AlignmentType.CENTER, children:[new TextRun({text:n,font:"Arial",size:19,bold:true,color:NAVY})]})]}),
            new TableCell({borders, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({children:[new TextRun({text:t,font:"Arial",size:19,bold:true,color:TEAL})]})]}),
            new TableCell({borders, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({children:[new TextRun({text:p,font:"Arial",size:19,color:DGRAY})]})]}),
            new TableCell({borders, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({children:[new TextRun({text:f,font:"Arial",size:18,color:DGRAY})]})]})
          ]}))
        ]
      }),
      sp(160),
      noteBox("Each template in this pack is an extension to the corresponding template in the original Vol. 1 framework. Use alongside — not instead of — the original SRD, SAR, SIC, STP, SRR, and SFL templates. The D- prefix denotes the agentic Development variant of each template."),

      // ══════════════════════════════════════════
      // TEMPLATE 1: D-SRD
      // ══════════════════════════════════════════
      pageBreak(),
      ...phaseHeader("1","Requirements","D-SRD — Agentic Development Supportability Requirements Document","Extends the SRD to produce a machine-readable supportability context block that is injected into every agent development session for this feature."),

      sectionLabel("D1.1  Document Metadata"),
      metaTable([["Feature / Service Name",""],["Parent SRD Reference",""],["Primary Development Tool","Copilot  /  Cursor  /  Claude Code  /  Other: "],["D-SRD Author",""],["Support Representative",""],["Date Created",""],["Context Block Version","1.0"]]),

      sectionLabel("D1.2  Supportability Context Block"),
      noteBox("This is the primary deliverable of the D-SRD. It is injected verbatim into every agent session working on this feature. It is a hard constraint — not advisory guidance. Complete every field before any agent session begins."),
      new Table({ width:{size:9360,type:WidthType.DXA}, columnWidths:[9360], rows:[
        new TableRow({children:[new TableCell({borders, shading:{fill:TEAL,type:ShadingType.CLEAR}, margins:{top:100,bottom:100,left:160,right:160}, children:[new Paragraph({children:[new TextRun({text:"SUPPORTABILITY CONTEXT BLOCK  \u2014  INJECT INTO EVERY AGENT SESSION",font:"Arial",size:19,bold:true,color:WHITE})]})]})]}),
        ...[
          ["Failure modes this session must handle:","[List from failure mode inventory — Section D1.3]"],
          ["Logging requirements:","Every transaction boundary must emit a structured log entry containing: correlation ID, customer ID, component name, and a meaningful description of the state change. Generic or message-only log entries are not acceptable."],
          ["Sensitive data exclusion list:","The following fields MUST NEVER appear in log output: [list from Section D1.4]"],
          ["Dependency registration requirement:","Every external dependency introduced in this session must be added to the dependency inventory in Section D1.5. New dependencies must include: timeout handling, fallback behavior, and a circuit breaker pattern."],
          ["Error message standard:","Every error state must return a message a support engineer can act on without engineering escalation. Generic 500 errors, NullPointerExceptions, and stack traces without context are not acceptable."],
          ["Observability requirement:","The four golden signals (latency, error rate, throughput, saturation) must be instrumented for every new component introduced in this session."],
          ["Correlation ID propagation:","Every inbound request context carries a correlation ID. It must appear in every outbound call and every log statement within the same transaction boundary."],
          ["Compliance:","This session must not produce code that logs the fields listed in the sensitive data exclusion list under any code path, including error paths."],
        ].map(([label,val],i) => new TableRow({children:[new TableCell({borders, shading:{fill:i%2===0?TEAL3:WHITE,type:ShadingType.CLEAR}, margins:{top:100,bottom:100,left:160,right:160}, children:[
          new Paragraph({spacing:{before:0,after:40}, children:[new TextRun({text:label,font:"Arial",size:19,bold:true,color:TEAL})]}),
          new Paragraph({spacing:{before:0,after:0}, children:[new TextRun({text:val,font:"Arial",size:19,color:DGRAY})]})
        ]})]}))
      ]}),

      sectionLabel("D1.3  Failure Mode Inventory (for Context Block)"),
      noteBox("List every failure mode this feature must handle. These become the 'failure modes this session must handle' list in the context block above. Be specific — the agent needs enough detail to generate correct handling code."),
      gridTable(
        ["Failure Mode","Type","Expected Handling","Log Output Required","Alert Required?"],
        [2400,1400,2200,2000,1360], 7, NAVY
      ),

      sectionLabel("D1.4  Sensitive Data Exclusion List (for Context Block)"),
      noteBox("Every field that must never appear in log output. This list is injected into the agent context block and becomes the basis for the structural log content scan in the D-SIC."),
      new Table({ width:{size:9360,type:WidthType.DXA}, columnWidths:[2400,2400,2400,2160], rows:[
        new TableRow({children:["Field Name / Pattern","Data Classification","System / Component","Notes"].map(h => new TableCell({borders, shading:{fill:TEAL,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({children:[new TextRun({text:h,font:"Arial",size:18,bold:true,color:WHITE})]})]}))})  ,
        ...Array(7).fill(null).map((_,i) => new TableRow({children:Array(4).fill(null).map(() => new TableCell({borders, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:100,bottom:100,left:100,right:100}, children:[new Paragraph({children:[new TextRun({text:" ",font:"Arial",size:19})]})]}))}))
      ]}),

      sectionLabel("D1.5  Pre-Session Dependency Registry"),
      noteBox("Every dependency known before the agent session begins. New dependencies discovered during sessions are added here via the D-SAR emergence log. Unregistered dependencies block the PR in the D-SIC dependency check."),
      gridTable(
        ["Dependency Name","Type (API/DB/Service)","Owner / Provider","Timeout Handling Required","Fallback Behavior Required","Circuit Breaker Required"],
        [1600,1400,1600,1680,1680,1400], 6, NAVY2
      ),

      sectionLabel("D1.6  Context Block Version History"),
      gridTable(["Version","Date Updated","Updated By","Change Description","Reason for Update"],[800,1000,1600,3760,2200], 5, TEAL),

      sectionLabel("D1.7  Sign-Off"),
      noteBox("Sign-off confirms the context block is complete, the sensitive data exclusion list is accurate, and the failure mode inventory is sufficient for injection into agent sessions."),
      signoffTable(["Product Owner","Engineering Lead","Support Lead","Security / Compliance"]),

      // ══════════════════════════════════════════
      // TEMPLATE 2: D-SAR
      // ══════════════════════════════════════════
      pageBreak(),
      ...phaseHeader("2","Design","D-SAR — Agentic Development Architecture Review","Post-session architecture observation record. Runs after every significant agent session, not as a pre-build gate. Gap alerts block the next session until reviewed."),

      sectionLabel("D2.1  Document Metadata"),
      metaTable([["Feature / Service Name",""],["D-SRD Reference",""],["Session Reference / PR Range",""],["Architecture Observer",""],["Review Date",""],["Session Date Range",""],["Architecture Version (post-session)",""]]),

      sectionLabel("D2.2  Architecture Extraction Summary"),
      noteBox("Summarize what the architecture extraction tool found after this session. Attach the full extraction report. Annotate status: (OK) = covered by SRD and SAR  |  (NEW) = new component not in original design  |  (GAP) = blind spot identified."),
      gridTable(
        ["Component / Service","Status (OK/NEW/GAP)","New Since Last Review?","Observability Status","Gap Description"],
        [2400,1400,1400,1760,2400], 7, NAVY
      ),

      sectionLabel("D2.3  Dependency Emergence Log"),
      noteBox("Every new dependency the agent introduced that was not in the pre-session dependency registry. Each entry triggers an immediate D-SRD update and a PR block until the dependency is registered and assessed."),
      gridTable(
        ["Dependency Introduced","Session / PR","Registered in D-SRD?","Fallback Behavior Present?","Circuit Breaker Present?","Risk Assessment","PR Blocked?"],
        [1600,960,1280,1480,1480,1360,800], 5, TEAL
      ),
      sp(80),
      warningBox("Any unregistered dependency found here must trigger an immediate D-SRD \u00a7D1.5 update and a PR block. Release is not permitted until all dependencies in this log are registered and assessed."),

      sectionLabel("D2.4  Sensitive Data Scan Results"),
      noteBox("Results of the automated sensitive data scan run against this session\u2019s code. Any match against the D-SRD exclusion list blocks the PR."),
      gridTable(
        ["File / Component","Field / Pattern Found","Log Path","SRD Exclusion Match?","PR Blocked?","Resolved?"],
        [2000,1800,1600,1560,960,1440], 5, NAVY2
      ),

      sectionLabel("D2.5  Human Architecture Review Threshold"),
      noteBox("Track cumulative generated code percentage. At or above the threshold defined in governance policy, a mandatory human point-in-time architecture review is triggered before the next session begins."),
      new Table({ width:{size:9360,type:WidthType.DXA}, columnWidths:[3120,1800,1800,2640], rows:[
        new TableRow({children:["Metric","Current Value","Threshold","Action Required"].map(h => new TableCell({borders, shading:{fill:TEAL,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:120,right:120}, children:[new Paragraph({children:[new TextRun({text:h,font:"Arial",size:18,bold:true,color:WHITE})]})]}))})  ,
        ...["Cumulative % of codebase that is agent-generated","New blind spots introduced this session (count)","Open HIGH gaps from previous sessions (count)","Sessions since last human architecture review (count)"].map((m,i) => new TableRow({children:[
          new TableCell({borders, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:120,right:120}, children:[new Paragraph({children:[new TextRun({text:m,font:"Arial",size:18,color:DGRAY})]})]}),
          new TableCell({borders, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:120,right:120}, children:[new Paragraph({children:[new TextRun({text:" ",font:"Arial",size:18})]})]}),
          new TableCell({borders, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:120,right:120}, children:[new Paragraph({children:[new TextRun({text:" ",font:"Arial",size:18})]})]}),
          new TableCell({borders, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:120,right:120}, children:[new Paragraph({children:[new TextRun({text:" ",font:"Arial",size:18})]})]})
        ]}))
      ]}),

      sectionLabel("D2.6  Gap Alerts — Block Next Session Until Cleared"),
      gridTable(["#","Gap Description","Priority (H/M/L)","Blocking Next Session?","Owner","Cleared?","Date Cleared"],[480,2800,1000,1480,1200,800,1600], 5, NAVY),

      sectionLabel("D2.7  Sign-Off"),
      noteBox("Sign-off confirms the architecture extraction has been reviewed, all new dependencies are registered, all sensitive data scan findings are resolved, and the human review threshold has been checked."),
      signoffTable(["Architecture Observer","Support Lead","Engineering Lead"]),

      // ══════════════════════════════════════════
      // TEMPLATE 3: D-SIC
      // ══════════════════════════════════════════
      pageBreak(),
      ...phaseHeader("3","Build","D-SIC — Agentic Development Supportability Implementation Checklist","Structural gate verification record for agent-generated code. Automated checks must pass before human review begins. Human review scope is narrowed to items that cannot be verified structurally."),

      sectionLabel("D3.1  Document Metadata"),
      metaTable([["Feature / Service Name",""],["D-SRD Reference",""],["D-SAR Reference",""],["PR / Ticket Number",""],["% Agent-Generated Code in this PR","____  %"],["Structural Gates Run Date",""],["Human Reviewer",""],["Date of Human Review",""]]),

      sectionLabel("D3.2  Structural Gate Results"),
      noteBox("All structural gates must pass before the PR is eligible for human review. A gate failure blocks the PR. The developer must resolve the finding and re-run the gate before the PR proceeds."),
      new Table({ width:{size:9360,type:WidthType.DXA}, columnWidths:[480,5480,1600,1800], rows:[
        new TableRow({children:["","Gate","Result","Finding / Resolution"].map(h => new TableCell({borders, shading:{fill:TEAL,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({children:[new TextRun({text:h,font:"Arial",size:18,bold:true,color:WHITE})]})]}))})  ,
        ...[
          ["Correlation ID propagation scan","Pass / Fail / N/A"],
          ["Log content analysis — sensitive data exclusion list match","Pass / Fail"],
          ["Failure mode coverage check — all SRD failure modes have tests","Pass / Fail"],
          ["Dependency registry check — all dependencies are registered","Pass / Fail"],
          ["Golden signal instrumentation check — latency, errors, throughput, saturation","Pass / Fail"],
          ["Error message quality scan — no generic 500s or raw stack traces in responses","Pass / Fail"],
          ["Log format validation — structured JSON, required fields present","Pass / Fail"],
        ].map(([g,r],i) => new TableRow({children:[
          new TableCell({borders, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({alignment:AlignmentType.CENTER, children:[new TextRun({text:i%2===0?"\u25CF":"\u25CB",font:"Arial",size:18,color:TEAL})]})]}),
          new TableCell({borders, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({children:[new TextRun({text:g,font:"Arial",size:19,color:DGRAY})]})]}),
          new TableCell({borders, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({children:[new TextRun({text:r,font:"Arial",size:18,color:"888888"})]})]}),
          new TableCell({borders, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({children:[new TextRun({text:" ",font:"Arial",size:19})]})]})
        ]}))
      ]}),

      sectionLabel("D3.3  Human Review Checklist (Narrowed Scope)"),
      noteBox("By the time a human reviewer reaches this section, all structural checks above have passed. The human reviewer\u2019s scope is narrowed to the items that cannot be verified automatically: meaning, judgment, and business logic."),
      new Table({ width:{size:9360,type:WidthType.DXA}, columnWidths:[480,7680,1200], rows:[
        checkHeader("SEMANTIC QUALITY \u2014 HUMAN JUDGMENT REQUIRED"),
        checkRow("Error messages are meaningful to a support engineer who did not build this component","Required"),
        checkRow("Failure handling logic correctly reflects the business intent, not just the technical pattern","Required"),
        checkRow("Graceful degradation behaviour matches the SRD degradation path documentation","Required"),
        checkRow("Any edge case the agent may have handled literally rather than logically has been identified and reviewed","Required"),
        checkHeader("GENERATION REVIEW"),
        checkRow("No unregistered dependencies were introduced that the dependency gate may have missed","Required"),
        checkRow("Agent has not introduced an architectural pattern that conflicts with the existing system design","Required"),
        checkRow("No TODO, placeholder, or stub code was left in by the agent that appears functional but is incomplete","Required"),
        checkHeader("CONTEXT BLOCK COMPLIANCE CONFIRMATION"),
        checkRow("Code produced in this PR is consistent with the D-SRD Supportability Context Block","Required"),
        checkRow("No code in this PR would produce log output that contradicts the context block logging requirements","Required"),
      ]}),

      sectionLabel("D3.4  Outstanding Items"),
      gridTable(["#","Item Not Completed — Reason / Justification","Owner","Resolution Target"],[480,5280,1800,1800], 4, TEAL),

      sectionLabel("D3.5  Sign-Off"),
      noteBox("Structural gates must all pass before human sign-off. Human reviewer confirms narrowed scope items are complete."),
      signoffTable(["Developer","Human Reviewer","Support Representative"]),

      // ══════════════════════════════════════════
      // TEMPLATE 4: D-STP
      // ══════════════════════════════════════════
      pageBreak(),
      ...phaseHeader("4","Test","D-STP — Agentic Development Supportability Test Plan","Extends standard STP with generation-aware test cases that target the specific weaknesses of pattern-matched code generation. Release is blocked if any required test fails."),

      sectionLabel("D4.1  Document Metadata"),
      metaTable([["Feature / Service Name",""],["D-SRD Reference",""],["% Agent-Generated Code in this Release","____  %"],["Test Environment",""],["D-STP Author",""],["Support Tester",""],["Test Execution Date",""],["Overall Test Result","Pass / Fail / Partial"]]),

      sectionLabel("D4.2  Generation-Aware Failure Mode Testing"),
      noteBox("These test cases target the failure modes most commonly produced by pattern-matched code generation. They are in addition to the standard failure injection tests in the Vol. 1 STP."),
      gridTable(
        ["Test Case","What It Targets","Triggered?","Detected?","Logged Correctly?","Pass / Fail"],
        [2200,2200,960,960,1280,760], 8, NAVY
      ),
      sp(80),
      new Table({ width:{size:9360,type:WidthType.DXA}, columnWidths:[9360], rows:[
        new TableRow({children:[new TableCell({borders, shading:{fill:TEAL,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:160,right:160}, children:[new Paragraph({children:[new TextRun({text:"Generation-Aware Test Case Reference",font:"Arial",size:18,bold:true,color:WHITE})]})]})]})  ,
        ...["Failure modes in the SRD that were not in the context block — verify they are handled anyway or confirm they are unhandled and update the SRD",
            "Edge cases the agent may have handled literally: boundary values, empty inputs, null responses from dependencies",
            "Dependency failure when the dependency was introduced by the agent and not pre-registered — verify fallback behavior exists",
            "Log output on every error path including paths the agent may have generated without human review of the error content",
            "Sensitive data in logs on unusual code paths: error handlers, retry loops, timeout handlers generated by the agent",
            "Generic error messages on any path where the agent used a template error pattern without customization"
        ].map((t,i) => new TableRow({children:[new TableCell({borders, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:160,right:160}, children:[new Paragraph({children:[new TextRun({text:t,font:"Arial",size:18,color:DGRAY})]})]})]}))
      ]}),

      sectionLabel("D4.3  Sensitive Data Log Scan"),
      noteBox("Run representative scenarios including all error paths. Scan every log line produced against the D-SRD sensitive data exclusion list. Agent-generated error handlers are the highest-risk path."),
      gridTable(
        ["Scenario / Code Path","Log Lines Reviewed","Exclusion List Match Found?","Field / Pattern","Severity","Resolved?"],
        [2200,1400,1560,1600,1000,1600], 5, NAVY2
      ),

      sectionLabel("D4.4  Error Message Quality Review"),
      noteBox("Review every error message produced by agent-generated code. Confirm each is actionable by a support engineer without engineering escalation. Mark any generic or template messages for replacement."),
      gridTable(
        ["Error State / Path","Error Message Produced","Actionable by Support?","Replacement Required?","Replacement Message"],
        [1800,2400,1400,1360,2400], 6, TEAL
      ),

      sectionLabel("D4.5  Dependency Failure Testing"),
      noteBox("Test every dependency introduced by agent sessions, including those that were added to the registry post-session. Verify fallback behavior, circuit breaker, and logging are correct."),
      gridTable(
        ["Dependency","Failure Mode Tested","Fallback Behavior Correct?","Circuit Breaker Fires?","Logged Correctly?","Pass / Fail"],
        [1600,2000,1680,1480,1400,1200], 5, NAVY
      ),

      sectionLabel("D4.6  Runbook Walkthrough — Generated Component Failures"),
      noteBox("A support engineer who did not review the agent-generated code executes the runbook for each failure mode. If they cannot complete it independently, the runbook, observability, or error messages are inadequate."),
      gridTable(
        ["Failure Mode / Runbook","Completed Independently?","Time to Diagnose","Error Messages Actionable?","Gaps Found — Action Required"],
        [2400,1400,1200,1760,2600], 5, NAVY2
      ),

      sectionLabel("D4.7  Overall Test Summary"),
      new Table({ width:{size:9360,type:WidthType.DXA}, columnWidths:[5760,3600], rows:[
        new TableRow({children:["Test Area","Result"].map(h => new TableCell({borders, shading:{fill:TEAL,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:120,right:120}, children:[new Paragraph({children:[new TextRun({text:h,font:"Arial",size:18,bold:true,color:WHITE})]})]}))})  ,
        ...["Generation-Aware Failure Mode Testing","Sensitive Data Log Scan","Error Message Quality Review","Dependency Failure Testing","Runbook Walkthrough — Generated Components","Standard STP Tests (from Vol. 1)"].map((a,i) => new TableRow({children:[
          new TableCell({borders, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:120,right:120}, children:[new Paragraph({children:[new TextRun({text:a,font:"Arial",size:19,color:DGRAY})]})]}),
          new TableCell({borders, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:120,right:120}, children:[new Paragraph({children:[new TextRun({text:"Pass / Fail / Partial",font:"Arial",size:18,color:"888888"})]})]})
        ]})),
        new TableRow({children:[
          new TableCell({borders, shading:{fill:TEAL,type:ShadingType.CLEAR}, margins:{top:100,bottom:100,left:120,right:120}, children:[new Paragraph({children:[new TextRun({text:"OVERALL RECOMMENDATION",font:"Arial",size:19,bold:true,color:WHITE})]})]}),
          new TableCell({borders, shading:{fill:TEAL,type:ShadingType.CLEAR}, margins:{top:100,bottom:100,left:120,right:120}, children:[new Paragraph({children:[new TextRun({text:"APPROVED FOR RELEASE  /  BLOCKED \u2014 REMEDIATION REQUIRED",font:"Arial",size:18,bold:true,color:GOLD})]})]}),
        ]})
      ]}),

      sectionLabel("D4.8  Sign-Off"),
      signoffTable(["QA Lead","Support Lead","Engineering Lead"]),

      // ══════════════════════════════════════════
      // TEMPLATE 5: D-SRR
      // ══════════════════════════════════════════
      pageBreak(),
      ...phaseHeader("5","Release","D-SRR — Agentic Development Support Readiness Review","Adds the Agentic Accountability Declaration to the standard SRR. Engineering lead attests to structural verification results, not to full authorship. Both signatures required."),

      sectionLabel("D5.1  Document Metadata"),
      metaTable([["Feature / Service Name",""],["Target Release Date",""],["D-SRD Reference",""],["D-SAR Reference (latest)",""],["D-SIC Reference",""],["D-STP Reference",""],["D-SRR Conducted By",""],["Date of Review",""]]),

      sectionLabel("D5.2  Agentic Development Checklist"),
      new Table({ width:{size:9360,type:WidthType.DXA}, columnWidths:[480,7680,1200], rows:[
        checkHeader("STRUCTURAL GATES — ALL MUST HAVE PASSED"),
        checkRow("Correlation ID propagation scan: PASS confirmed across all agent-generated PRs in this release","Required"),
        checkRow("Sensitive data exclusion scan: PASS confirmed — zero findings in this release","Required"),
        checkRow("Failure mode coverage check: PASS — all SRD failure modes have test coverage","Required"),
        checkRow("Dependency registry: PASS — all dependencies registered and assessed","Required"),
        checkRow("Golden signal instrumentation check: PASS — all new components instrumented","Required"),
        checkHeader("ARCHITECTURE OBSERVATION"),
        checkRow("D-SAR post-session review completed for all sessions in this release","Required"),
        checkRow("All HIGH gap alerts cleared before release","Required"),
        checkRow("Human architecture review threshold checked — mandatory review completed if threshold reached","Required"),
        checkRow("Dependency emergence log has zero unresolved entries","Required"),
        checkHeader("CONTEXT BLOCK"),
        checkRow("D-SRD context block is current and reflects the system as built","Required"),
        checkRow("Any context block updates made during this cycle are documented in D1.6 version history","Required"),
        checkHeader("STANDARD SRR ITEMS (CONFIRM ALSO COMPLETE)"),
        checkRow("Production monitoring dashboards live and verified","Required"),
        checkRow("All alerts active in production — routing confirmed end-to-end","Required"),
        checkRow("Runbooks published, reviewed, and accessible to all support staff","Required"),
        checkRow("On-call rotation updated","Required"),
        checkRow("Customer communication templates approved","Required"),
        checkRow("Rollback procedure documented and tested","Required"),
      ]}),

      sectionLabel("D5.3  Agentic Accountability Declaration"),
      noteBox("This declaration replaces the implicit assumption that the engineering lead has full authorship-level understanding of this release. It is an honest attestation of what can be verified. Both leads sign this declaration."),
      new Table({ width:{size:9360,type:WidthType.DXA}, columnWidths:[9360], rows:[
        new TableRow({children:[new TableCell({borders, shading:{fill:TEAL,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:160,right:160}, children:[new Paragraph({children:[new TextRun({text:"AGENTIC ACCOUNTABILITY DECLARATION",font:"Arial",size:19,bold:true,color:WHITE})]})]})]})  ,
        ...[
          ["Percentage of code in this release that is agent-generated","____  %"],
          ["All structural SIC gates passed","Yes  /  No  (if No — release is blocked)"],
          ["Architecture extraction review completed and all gap alerts cleared","Yes  /  No"],
          ["Sensitive data scan completed with zero findings","Yes  /  No"],
          ["All SRD failure modes covered by generation-aware test cases","Yes  /  No"],
          ["Dependency registry complete — all dependencies assessed","Yes  /  No"],
        ].map(([label,val],i) => new TableRow({children:[new TableCell({borders, shading:{fill:i%2===0?TEAL3:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:160,right:160}, children:[
          new Paragraph({spacing:{before:0,after:20}, children:[new TextRun({text:label,font:"Arial",size:18,bold:true,color:TEAL})]}),
          new Paragraph({spacing:{before:0,after:0}, children:[new TextRun({text:val,font:"Arial",size:18,color:DGRAY})]})
        ]})]})),
        new TableRow({children:[new TableCell({borders, shading:{fill:TEAL3,type:ShadingType.CLEAR}, margins:{top:120,bottom:120,left:160,right:160}, children:[
          new Paragraph({spacing:{before:0,after:40}, children:[new TextRun({text:"Engineering Lead Attestation:",font:"Arial",size:18,bold:true,color:TEAL})]}),
          new Paragraph({spacing:{before:0,after:80}, children:[new TextRun({text:"I have reviewed the structural verification results, the architecture gap report, and the generation-aware test results for this release. I attest that the supportability requirements from the SRD are met to the degree that can be verified through structural analysis, automated gate results, and test coverage.",font:"Arial",size:18,italics:true,color:DGRAY})]}),
          new Paragraph({spacing:{before:0,after:40}, children:[new TextRun({text:"Support Lead Attestation:",font:"Arial",size:18,bold:true,color:TEAL})]}),
          new Paragraph({spacing:{before:0,after:0}, children:[new TextRun({text:"I have reviewed the runbook walkthrough results, the alert validation results, and the error message quality review. I attest that support can operate this feature independently at 2am using only the documentation and tooling available in production.",font:"Arial",size:18,italics:true,color:DGRAY})]})
        ]})]}),
      ]}),

      sectionLabel("D5.4  Outstanding Items"),
      noteBox("This table must be empty for release to be approved."),
      gridTable(["#","Outstanding Item","Owner","Resolution Required By"],[480,5280,1800,1800], 4, TEAL),

      sectionLabel("D5.5  Release Decision"),
      new Table({ width:{size:9360,type:WidthType.DXA}, columnWidths:[9360], rows:[
        new TableRow({children:[new TableCell({borders, shading:{fill:WHITE,type:ShadingType.CLEAR}, margins:{top:160,bottom:160,left:200,right:200}, children:[
          new Paragraph({spacing:{before:0,after:120}, children:[new TextRun({text:"\u25A1  APPROVED FOR RELEASE \u2014 All gates passed, accountability declaration complete, no outstanding items.",font:"Arial",size:20,bold:true,color:"1a5c1a"})]}),
          new Paragraph({spacing:{before:0,after:120}, children:[new TextRun({text:"\u25A1  CONDITIONAL APPROVAL \u2014 Released with the following accepted risks (document below):",font:"Arial",size:20,bold:true,color:AMBER})]}),
          new Paragraph({spacing:{before:0,after:0},  children:[new TextRun({text:"\u25A1  BLOCKED \u2014 Structural gates failed or outstanding items unresolved. Release does not proceed.",font:"Arial",size:20,bold:true,color:REDDARK})]})
        ]})]})
      ]}),

      sectionLabel("D5.6  Sign-Off"),
      noteBox("Both Support Lead and Engineering Lead must sign the accountability declaration and this sign-off. Release does not proceed without both."),
      signoffTable(["Support Lead","Engineering Lead","Product Owner","Release Manager"]),

      // ══════════════════════════════════════════
      // TEMPLATE 6: D-SFL
      // ══════════════════════════════════════════
      pageBreak(),
      ...phaseHeader("6","Operate","D-SFL — Agentic Development Supportability Feedback Loop","Converts operational experience into agent context block updates. Every gap found in production becomes a specific, versioned addition to the context block injected into future sessions."),

      sectionLabel("D6.1  Document Metadata"),
      metaTable([["Feature / Service Name",""],["Review Period",""],["D-SFL Author",""],["Support Representative",""],["Engineering Representative",""],["Quarterly Review Date",""],["Current Context Block Version",""]]),

      sectionLabel("D6.2  Generation Gap Log"),
      noteBox("A living record of every supportability issue in production that is traceable to a gap in the agent-generated code \u2014 missing handling, pattern-matched logging, invisible dependency, or sensitive data exposure. Every entry triggers a context block update."),
      gridTable(
        ["#","Date Found","Incident Ref","Gap Description","Generation Root Cause","Context Block Update Required","Priority (H/M/L)","Backlog #"],
        [360,760,960,2200,1600,1400,800,1280], 7, NAVY
      ),
      sp(80),
      new Table({ width:{size:9360,type:WidthType.DXA}, columnWidths:[9360], rows:[
        new TableRow({children:[new TableCell({borders, shading:{fill:TEAL,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:160,right:160}, children:[new Paragraph({children:[new TextRun({text:"Generation Root Cause Reference",font:"Arial",size:18,bold:true,color:WHITE})]})]})]})  ,
        ...["Missing handling — failure mode not in context block at time of session",
            "Pattern-matched logging — agent used a template pattern without the required fields",
            "Invisible dependency — agent introduced a dependency without registering it",
            "Sensitive data exposure — agent logged a field not in the exclusion list because it was not classified at session time",
            "Generic error message — agent used a template error pattern on a path that needed a custom message",
            "Edge case literal handling — agent handled an edge case correctly by its training pattern but incorrectly for this business context"
        ].map((t,i) => new TableRow({children:[new TableCell({borders, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:160,right:160}, children:[new Paragraph({children:[new TextRun({text:t,font:"Arial",size:18,color:DGRAY})]})]})]}))
      ]}),

      sectionLabel("D6.3  Context Block Update Log"),
      noteBox("Every update to the D-SRD Supportability Context Block driven by operational experience. This is the mechanism by which production incidents improve future agent sessions. Each entry references the generation gap that triggered it."),
      new Table({ width:{size:9360,type:WidthType.DXA}, columnWidths:[760,1000,800,2400,2400,1200,800], rows:[
        new TableRow({children:["Version","Date","Gap Log #","Previous Context Block Text","Updated Context Block Text","Reason","Owner"].map(h => new TableCell({borders, shading:{fill:TEAL,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:80,right:80}, children:[new Paragraph({children:[new TextRun({text:h,font:"Arial",size:17,bold:true,color:WHITE})]})]}))})  ,
        ...Array(7).fill(null).map((_,i) => new TableRow({children:Array(7).fill(null).map(() => new TableCell({borders, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:80,right:80}, children:[new Paragraph({children:[new TextRun({text:" ",font:"Arial",size:18})]})]}))}))
      ]}),

      sectionLabel("D6.4  Structural Gate Effectiveness Tracking"),
      noteBox("Track whether each structural gate is catching the issues it was designed to catch. Gates that consistently miss a class of issue need to be reconfigured."),
      gridTable(
        ["Gate Name","Issues Caught This Period","Issues Missed (found in prod)","Gate Effectiveness %","Reconfiguration Required?"],
        [2200,1680,2000,1480,2000], 5, NAVY2
      ),

      sectionLabel("D6.5  Quarterly Agentic Development Review"),
      metaTable([
        ["Review Date",""],["Attendees",""],
        ["% of codebase that is agent-generated (end of period)",""],
        ["# Generation gaps logged this period",""],
        ["# Generation gaps resolved",""],
        ["# Context block updates made",""],
        ["# Structural gate reconfigurations",""],
        ["Top generation gap pattern",""],
        ["Top context block improvement for next cycle",""],
      ]),
      sp(80),
      sectionLabel("Generation Gap Root Category Analysis"),
      gridTable(
        ["Root Category","# Incidents","Context Block Update Made?","Next Cycle Action"],
        [2800,1200,2000,3360], 6, TEAL
      ),

      sectionLabel("D6.6  Shift Left Effectiveness — Agentic Development"),
      noteBox("Tracks what percentage of production incidents from agent-generated code could have been prevented by a more complete context block or additional structural gate."),
      new Table({ width:{size:9360,type:WidthType.DXA}, columnWidths:[5000,2000,2360], rows:[
        new TableRow({children:["Metric","Value","Notes"].map(h => new TableCell({borders, shading:{fill:TEAL,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:120,right:120}, children:[new Paragraph({children:[new TextRun({text:h,font:"Arial",size:18,bold:true,color:WHITE})]})]}))})  ,
        ...["Total incidents this period","Incidents traceable to a context block gap","Incidents traceable to a missing structural gate","Incidents traceable to an unregistered dependency","% of incidents preventable by context block improvement","Estimated cost of preventable incidents (eng hours + cust. impact)"].map((m,i) => new TableRow({children:[
          new TableCell({borders, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:120,right:120}, children:[new Paragraph({children:[new TextRun({text:m,font:"Arial",size:18,color:DGRAY})]})]}),
          new TableCell({borders, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:120,right:120}, children:[new Paragraph({children:[new TextRun({text:" ",font:"Arial",size:18})]})]}),
          new TableCell({borders, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:120,right:120}, children:[new Paragraph({children:[new TextRun({text:" ",font:"Arial",size:18})]})]})
        ]}))
      ]}),

      sectionLabel("D6.7  Backlog Items Generated This Period"),
      gridTable(["#","Backlog Item Description","Source","Priority (H/M/L)","Assigned To / Target Sprint"],[480,3680,1600,1200,2400], 6, NAVY2),

      sectionLabel("D6.8  Quarterly Sign-Off"),
      noteBox("Sign-off confirms the quarterly review occurred, context block updates have been made for all High priority generation gaps, and structural gates have been reviewed for effectiveness."),
      signoffTable(["Support Lead","Engineering Lead","Product Owner"]),

      // ── CLOSING ──
      sp(480),
      new Paragraph({border:{bottom:{style:BorderStyle.SINGLE,size:6,color:TEAL,space:1}}, spacing:{before:0,after:120}, children:[]}),
      new Paragraph({alignment:AlignmentType.CENTER, spacing:{before:120,after:60},
        children:[new TextRun({text:"D-SRD  \u2192  D-SAR  \u2192  D-SIC  \u2192  D-STP  \u2192  D-SRR  \u2192  D-SFL  \u2192  D-SRD (next cycle)", font:"Arial",size:20,bold:true,color:NAVY})]
      }),
      new Paragraph({alignment:AlignmentType.CENTER, spacing:{before:0,after:0},
        children:[new TextRun({text:"Confidential \u2014 Consulting IP  |  John A. Bowman  |  Supportability Engineering  |  2026", font:"Arial",size:17,color:"888888",italics:true})]
      }),
    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('/home/claude/SE_AgenticDev_Templates.docx', buf);
  console.log('Done Vol 3 templates');
});
