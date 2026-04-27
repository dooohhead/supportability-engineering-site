const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageBreak, LevelFormat,
  TabStopType, TabStopPosition
} = require('docx');
const fs = require('fs');

const NAVY   = "0f2340";
const NAVY2  = "1b3a5c";
const PURPLE = "4c1d95";
const PURPLE2= "7c3aed";
const PURPLELITE="ede9fe";
const PURPLEBG ="f5f3ff";
const GOLD   = "c9993a";
const MGRAY  = "F4F6F9";
const DGRAY  = "2d3748";
const WHITE  = "FFFFFF";
const REDDARK= "7f1d1d";
const REDBG  = "fff5f5";

const bd = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: bd, bottom: bd, left: bd, right: bd };
const nb = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: nb, bottom: nb, left: nb, right: nb };

const sp = (before=0, after=120) => new Paragraph({ spacing:{before,after}, children:[] });
const pb = () => new Paragraph({ children:[new PageBreak()] });

const rule = (color=PURPLE2) => new Paragraph({
  border:{ bottom:{ style:BorderStyle.SINGLE, size:10, color, space:1 } },
  spacing:{ before:0, after:200 }, children:[]
});

const phaseHeader = (num, name, abbr, desc) => [
  new Paragraph({ spacing:{before:0,after:60}, children:[new TextRun({text:`PHASE ${num}  \u2014  ${name.toUpperCase()}`, font:"Arial",size:18,bold:true,color:PURPLE2,characterSpacing:150})] }),
  new Paragraph({ spacing:{before:0,after:80}, children:[new TextRun({text:abbr, font:"Arial",size:40,bold:true,color:NAVY})] }),
  new Paragraph({ spacing:{before:0,after:120}, children:[new TextRun({text:desc, font:"Arial",size:22,color:DGRAY,italics:true})] }),
  rule(),
];

const sectionLabel = (text) => new Paragraph({
  spacing:{before:320,after:80},
  children:[new TextRun({text,font:"Arial",size:20,bold:true,color:PURPLE2,characterSpacing:100})]
});

const body = (text) => new Paragraph({
  spacing:{before:40,after:100},
  children:[new TextRun({text,font:"Arial",size:20,color:DGRAY})]
});

const noteBox = (text, bg=PURPLELITE, tc=PURPLE) => new Table({
  width:{size:9360,type:WidthType.DXA}, columnWidths:[9360],
  rows:[new TableRow({children:[new TableCell({
    borders, shading:{fill:bg,type:ShadingType.CLEAR}, margins:{top:120,bottom:120,left:160,right:160},
    children:[new Paragraph({children:[new TextRun({text,font:"Arial",size:19,italics:true,color:tc})]})]
  })]})]
});

const metaRow = (label, value="") => new TableRow({children:[
  new TableCell({ borders, width:{size:2800,type:WidthType.DXA}, shading:{fill:NAVY2,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:140,right:140}, children:[new Paragraph({children:[new TextRun({text:label,font:"Arial",size:19,bold:true,color:WHITE})]})] }),
  new TableCell({ borders, width:{size:6560,type:WidthType.DXA}, shading:{fill:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:140,right:140}, children:[new Paragraph({children:[new TextRun({text:value,font:"Arial",size:19,color:DGRAY})]})] }),
]});

const metaTable = (rows) => new Table({
  width:{size:9360,type:WidthType.DXA}, columnWidths:[2800,6560],
  rows:rows.map(([l,v]) => metaRow(l,v))
});

const checkRow = (text, req="Required") => new TableRow({children:[
  new TableCell({ borders, width:{size:480,type:WidthType.DXA}, shading:{fill:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:120,right:120}, children:[new Paragraph({alignment:AlignmentType.CENTER, children:[new TextRun({text:"\u25A1",font:"Arial",size:22,color:PURPLE2})]})]}),
  new TableCell({ borders, width:{size:7680,type:WidthType.DXA}, shading:{fill:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:120,right:120}, children:[new Paragraph({children:[new TextRun({text,font:"Arial",size:19,color:DGRAY})]})]}),
  new TableCell({ borders, width:{size:1200,type:WidthType.DXA}, shading:{fill:req==="Required"?PURPLELITE:REDBG,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({alignment:AlignmentType.CENTER, children:[new TextRun({text:req,font:"Arial",size:17,bold:true,color:req==="Required"?PURPLE2:REDDARK})]})]}),
]});

const checkHeader = (title) => new TableRow({children:[
  new TableCell({ borders, columnSpan:3, shading:{fill:PURPLE2,type:ShadingType.CLEAR}, margins:{top:100,bottom:100,left:120,right:120}, children:[new Paragraph({children:[new TextRun({text:title,font:"Arial",size:19,bold:true,color:WHITE})]})] })
]});

const gridTable = (headers, widths, emptyRows=5) => {
  const hRow = new TableRow({children:headers.map((h,i) => new TableCell({ borders, width:{size:widths[i],type:WidthType.DXA}, shading:{fill:NAVY,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({children:[new TextRun({text:h,font:"Arial",size:18,bold:true,color:WHITE})]})]}))});
  const dRows = Array(emptyRows).fill(null).map((_,ri) => new TableRow({children:widths.map(w => new TableCell({ borders, width:{size:w,type:WidthType.DXA}, shading:{fill:ri%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:100,bottom:100,left:100,right:100}, children:[new Paragraph({children:[new TextRun({text:" ",font:"Arial",size:19})]})]})) }));
  return new Table({width:{size:9360,type:WidthType.DXA}, columnWidths:widths, rows:[hRow,...dRows]});
};

const signoffTable = (roles) => new Table({
  width:{size:9360,type:WidthType.DXA}, columnWidths:Array(roles.length).fill(Math.floor(9360/roles.length)),
  rows:[
    new TableRow({children:roles.map(r => new TableCell({ borders, shading:{fill:PURPLE2,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:120,right:120}, children:[new Paragraph({children:[new TextRun({text:r,font:"Arial",size:18,bold:true,color:WHITE})]})] }))}),
    new TableRow({children:roles.map(() => new TableCell({ borders, shading:{fill:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:120,right:120}, children:[
      new Paragraph({spacing:{before:0,after:40}, children:[new TextRun({text:"Name:",font:"Arial",size:18,color:DGRAY})]}),
      new Paragraph({spacing:{before:0,after:40}, children:[new TextRun({text:"Signature:",font:"Arial",size:18,color:DGRAY})]}),
      new Paragraph({spacing:{before:0,after:0}, children:[new TextRun({text:"Date:",font:"Arial",size:18,color:DGRAY})]})
    ]}))}),
  ]
});

const doc = new Document({
  numbering:{ config:[{ reference:"bullets", levels:[{ level:0, format:LevelFormat.BULLET, text:"\u2022", alignment:AlignmentType.LEFT, style:{ paragraph:{ indent:{ left:720, hanging:360 } } } }] }] },
  styles:{ default:{ document:{ run:{ font:"Arial", size:20 } } } },
  sections:[{
    properties:{ page:{ size:{ width:12240, height:15840 }, margin:{ top:1440, right:1440, bottom:1440, left:1440 } } },
    headers:{ default: new Header({ children:[
      new Paragraph({
        tabStops:[{type:TabStopType.RIGHT,position:9360}],
        border:{bottom:{style:BorderStyle.SINGLE,size:6,color:PURPLE2,space:1}},
        spacing:{before:0,after:160},
        children:[
          new TextRun({text:"SUPPORTABILITY ENGINEERING FOR AI OPERATIONS  \u2014  TEMPLATE PACK", font:"Arial",size:17,bold:true,color:NAVY}),
          new TextRun({text:"\tVol. 4  |  John A. Bowman  |  2026", font:"Arial",size:17,color:"888888"})
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
          new TextRun({text:"\tCompanion to Vol. 4: When the AI Running Your Support Needs Supporting", font:"Arial",size:16,color:"888888"})
        ]
      })
    ]})},

    children:[

      // ── COVER ──
      sp(2000,0),
      new Paragraph({spacing:{before:0,after:60}, children:[new TextRun({text:"TEMPLATE PACK  \u00B7  VOLUME 4", font:"Arial",size:20,bold:true,color:PURPLE2,characterSpacing:200})]}),
      new Paragraph({spacing:{before:0,after:40}, children:[new TextRun({text:"Supportability Engineering", font:"Arial",size:60,bold:true,color:NAVY})]}),
      new Paragraph({spacing:{before:0,after:40}, children:[new TextRun({text:"for AI Operations", font:"Arial",size:60,bold:true,color:PURPLE2})]}),
      new Paragraph({spacing:{before:0,after:320}, children:[new TextRun({text:"Seven-Phase Deliverable Templates  \u2014  AI Operational Tool Governance", font:"Arial",size:36,color:NAVY2})]}),
      new Paragraph({border:{bottom:{style:BorderStyle.SINGLE,size:16,color:PURPLE2,space:1}},spacing:{before:0,after:240},children:[]}),
      body("This template pack provides seven templates for governing the AI operational tools deployed in your support and operations stack: alert triage AI, predictive incident detection, automated remediation, customer-facing support AI, AI-generated PIR, AI-generated runbooks, and autonomous escalation routing. Use alongside the existing Vol. 1 framework templates."),
      sp(160,0),
      new Paragraph({spacing:{before:0,after:0}, children:[new TextRun({text:"John A. Bowman  |  dooohhead@gmail.com  \u2022  902-489-2429  |  2026", font:"Arial",size:20,color:DGRAY})]}),

      // ── INDEX ──
      pb(),
      new Paragraph({spacing:{before:0,after:120}, children:[new TextRun({text:"Template Index", font:"Arial",size:36,bold:true,color:NAVY})]}),
      rule(),
      new Table({
        width:{size:9360,type:WidthType.DXA}, columnWidths:[480,2000,2400,4480],
        rows:[
          new TableRow({children:["#","Template","Phase","Focus"].map(h => new TableCell({borders, shading:{fill:NAVY,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({children:[new TextRun({text:h,font:"Arial",size:18,bold:true,color:WHITE})]})]})) }),
          ...[
            ["1","O-SRD","Phase 1 \u2014 Requirements","AI tool failure mode inventory, authority scope, confidence thresholds, accountability assignment"],
            ["2","O-SAR","Phase 2 \u2014 Design","AI decision architecture map, authority map, blast radius definition, intervention trigger design"],
            ["3","O-SIC","Phase 3 \u2014 Build / Configure","Decision log standard, accuracy metric instrumentation, drift detection configuration"],
            ["4","O-STP","Phase 4 \u2014 Test","AI tool validation testing, adversarial scenario testing, intervention trigger verification"],
            ["5","O-SRR","Phase 5 \u2014 Release","AI operations readiness checklist, disable procedure, accountability sign-off"],
            ["6","O-SFL","Phase 6 \u2014 Operate","AI decision accuracy tracking, wrong decision log, authority scope adjustment record"],
            ["7","AOSR","Phase 7 \u2014 Govern","Quarterly AI operations governance review — accuracy, drift, authority, blast radius audit"],
          ].map(([n,t,p,f],i) => new TableRow({children:[
            new TableCell({borders, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({alignment:AlignmentType.CENTER, children:[new TextRun({text:n,font:"Arial",size:19,bold:true,color:PURPLE2})]})]}),
            new TableCell({borders, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({children:[new TextRun({text:t,font:"Arial",size:19,bold:true,color:NAVY2})]})]}),
            new TableCell({borders, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({children:[new TextRun({text:p,font:"Arial",size:19,color:DGRAY})]})]}),
            new TableCell({borders, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({children:[new TextRun({text:f,font:"Arial",size:18,color:DGRAY})]})]})
          ]}))
        ]
      }),
      sp(160),
      noteBox("The O- prefix denotes the AI Operations variant. AOSR is a new phase with no equivalent in previous volumes. Each template complements — not replaces — the corresponding Vol. 1 deliverable for the systems these AI tools are operating on."),

      // ══ TEMPLATE 1: O-SRD ══
      pb(),
      ...phaseHeader("1","Requirements","O-SRD — AI Operations Supportability Requirements Document","Captures failure modes, authority scope, confidence thresholds, and accountability assignment for every AI operational tool before deployment."),
      sectionLabel("O1.1  Document Metadata"),
      metaTable([["AI Tool Name",""],["Tool Category","Alert Triage / Predictive / Remediation / Customer-Facing / PIR / Runbook / Escalation"],["Vendor / System",""],["O-SRD Author",""],["Support Representative",""],["Engineering Lead",""],["Date Created",""],["Version","1.0"]]),

      sectionLabel("O1.2  AI Tool Description"),
      noteBox("Plain-language description of what this AI tool does, what decisions it makes, and what systems it acts on. A support engineer with no prior context must understand its role in your operations."),
      new Table({width:{size:9360,type:WidthType.DXA}, columnWidths:[9360], rows:[
        new TableRow({children:[new TableCell({borders, shading:{fill:WHITE,type:ShadingType.CLEAR}, margins:{top:200,bottom:200,left:160,right:160}, children:[new Paragraph({children:[new TextRun({text:" ",font:"Arial",size:19})]})]})]})
      ]}),

      sectionLabel("O1.3  Authority Scope Definition"),
      noteBox("Define precisely what this AI tool can do without asking a human, what requires human approval, and what it cannot do under any circumstances."),
      new Table({width:{size:9360,type:WidthType.DXA}, columnWidths:[3120,6240], rows:[
        new TableRow({children:["Authority Level","Decisions in This Category"].map(h => new TableCell({borders, shading:{fill:NAVY,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:140,right:140}, children:[new Paragraph({children:[new TextRun({text:h,font:"Arial",size:19,bold:true,color:WHITE})]})]})) }),
        ...["Autonomous (no human approval required)","Requires human approval before acting","Cannot do under any circumstances \u2014 hard stop"].map((l,i) => new TableRow({children:[
          new TableCell({borders, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:140,right:140}, children:[new Paragraph({children:[new TextRun({text:l,font:"Arial",size:18,bold:true,color:NAVY2})]})]}),
          new TableCell({borders, shading:{fill:i%2===0?PURPLELITE:WHITE,type:ShadingType.CLEAR}, margins:{top:140,bottom:140,left:140,right:140}, children:[new Paragraph({children:[new TextRun({text:" ",font:"Arial",size:19})]})]}),
        ]}))
      ]}),

      sectionLabel("O1.4  AI Failure Mode Inventory"),
      noteBox("List every way this AI tool can make a wrong decision or take a wrong action. For each: what is the detection method, what is the customer impact, and what is the intervention trigger?"),
      gridTable(["Failure Mode","Type","Customer Impact","Detection Method","Intervention Trigger","Priority (H/M/L)"],[2000,1200,1680,1680,1800,1000],7),

      sectionLabel("O1.5  Confidence Threshold Definitions"),
      gridTable(["Decision Type","Confidence Threshold for Autonomous Action","Below Threshold Action","Who Receives Escalation"],[2400,2400,2400,2160],5),

      sectionLabel("O1.6  Blast Radius Definition"),
      new Table({width:{size:9360,type:WidthType.DXA}, columnWidths:[3120,6240], rows:[
        ...[["Maximum scope of autonomous action (what systems can be affected?)",""],["Maximum scope of a wrong autonomous action (worst case impact)",""],["Containment procedure (how do you limit blast radius if AI acts wrongly?)",""],["Recovery procedure (how do you restore to known good state?)",""],["Time to disable this AI tool without an engineering deployment",""]].map(([l,v],i) => new TableRow({children:[
          new TableCell({borders, shading:{fill:i%2===0?NAVY2:NAVY,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:140,right:140}, children:[new Paragraph({children:[new TextRun({text:l,font:"Arial",size:18,bold:true,color:WHITE})]})]}),
          new TableCell({borders, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:100,bottom:100,left:140,right:140}, children:[new Paragraph({children:[new TextRun({text:v,font:"Arial",size:19,color:DGRAY})]})]}),
        ]}))
      ]}),

      sectionLabel("O1.7  Accountability Assignment"),
      metaTable([["Named owner of this AI tool\u2019s operational performance",""],["Who reviews decision accuracy?",""],["Who has authority to restrict or expand the authority scope?",""],["Who has authority to disable this tool in production?",""],["Vendor accountability contact",""],["Review cadence","Quarterly AOSR \u2014 see Template 7"]]),

      sectionLabel("O1.8  Sign-Off"),
      noteBox("All parties must sign before this AI tool is deployed. No AI operational tool enters production without a completed O-SRD."),
      signoffTable(["Support Lead","Engineering Lead","Product / Operations Owner","Security / Compliance"]),

      // ══ TEMPLATE 2: O-SAR ══
      pb(),
      ...phaseHeader("2","Design","O-SAR — AI Operations Architecture Review","Maps every decision point, authority boundary, intervention trigger, and blast radius containment boundary in the AI tool\u2019s design."),
      sectionLabel("O2.1  Document Metadata"),
      metaTable([["AI Tool Name",""],["O-SRD Reference",""],["Architecture Author",""],["O-SAR Reviewer (Support)",""],["O-SAR Reviewer (Security)",""],["Date of Review",""],["Tool Version",""]]),

      sectionLabel("O2.2  Decision Point Map"),
      noteBox("Map every point where this AI tool makes a decision. For each: is it autonomous or requires approval, is it observable, and is there a human override?"),
      gridTable(["Decision Point","Autonomous?","Observable?","Human Override Available?","Intervention Trigger Defined?","Blind Spot?"],[2200,1000,1000,1600,1760,1800],8),

      sectionLabel("O2.3  Authority Boundary Analysis"),
      noteBox("For each system this AI tool can act on, confirm the boundary is correctly defined and that actions outside the defined scope are technically impossible, not just policy-prohibited."),
      gridTable(["System / Component","Actions Permitted","Actions Blocked","Boundary Enforced By (policy/technical)","Gap?"],[2200,2000,2000,2000,1160],6),

      sectionLabel("O2.4  Intervention Trigger Design"),
      noteBox("Every autonomous action this AI takes must have a defined condition under which it stops and asks a human. Design these triggers before build, not after the first wrong action."),
      gridTable(["Trigger Condition","Action Being Taken","Who Is Notified","Response Required Within","If No Response"],[2200,1800,1600,1560,2200],6),

      sectionLabel("O2.5  Blast Radius Containment Design"),
      gridTable(["Failure Scenario","Containment Mechanism","Containment Automated?","Manual Trigger Available?","Recovery Procedure"],[2400,2200,1400,1360,2000],5),

      sectionLabel("O2.6  Open Items — Become Deployment Acceptance Criteria"),
      gridTable(["#","Open Item","Priority (H/M/L)","Owner","Must Close By"],[480,3680,1200,2000,2000],5),

      sectionLabel("O2.7  Sign-Off"),
      signoffTable(["Engineering Lead","Support Lead","Architecture Reviewer","Security Reviewer"]),

      // ══ TEMPLATE 3: O-SIC ══
      pb(),
      ...phaseHeader("3","Build / Configure","O-SIC — AI Operations Implementation Checklist","Verifies that decision logging, accuracy metrics, drift detection, and intervention triggers are correctly implemented before the AI tool is tested."),
      sectionLabel("O3.1  Document Metadata"),
      metaTable([["AI Tool Name",""],["O-SRD Reference",""],["O-SAR Reference",""],["Configured By",""],["Configuration Reviewer",""],["Date Completed",""]]),

      sectionLabel("O3.2  Implementation Checklist"),
      new Table({width:{size:9360,type:WidthType.DXA}, columnWidths:[480,7680,1200], rows:[
        checkHeader("DECISION LOGGING"),
        checkRow("Every autonomous decision logged with: timestamp, decision type, input signals, confidence score, action taken","Required"),
        checkRow("Decision outcome logged when observable (was the decision correct?)","Required"),
        checkRow("Decision log is queryable by decision type, time range, confidence range, and outcome","Required"),
        checkRow("No sensitive customer data present in any decision log entry","Required"),
        checkRow("Decision log retained for minimum 90 days","Required"),
        checkHeader("ACCURACY METRICS"),
        checkRow("True positive rate instrumented as a metric and tracked over time","Required"),
        checkRow("False positive rate instrumented as a metric and tracked over time","Required"),
        checkRow("False negative rate instrumented as a metric and tracked over time","Required"),
        checkRow("Accuracy baseline established from historical data before deployment","Required"),
        checkRow("Alert configured: accuracy drops below baseline by defined threshold","Required"),
        checkHeader("CONFIDENCE AND DRIFT DETECTION"),
        checkRow("Confidence score logged for every decision","Required"),
        checkRow("Confidence distribution tracked as a metric (histogram or p50/p95/p99)","Required"),
        checkRow("Alert configured: confidence distribution shifts from deployment baseline","Required"),
        checkRow("Model version logged with every decision batch","Required"),
        checkHeader("INTERVENTION TRIGGERS"),
        checkRow("Every intervention trigger from O-SRD \u00a7O1.4 is implemented","Required"),
        checkRow("Intervention trigger fires before action, not after","Required"),
        checkRow("Intervention trigger notification reaches the correct human within defined SLA","Required"),
        checkRow("No-response handling: defines what AI does if human does not respond in time","Required"),
        checkRow("Intervention trigger events logged with full decision context","Required"),
        checkHeader("BLAST RADIUS CONTAINMENT"),
        checkRow("Authority boundaries enforced technically, not only by policy","Required"),
        checkRow("Disable mechanism implemented and accessible without engineering deployment","Required"),
        checkRow("Blast radius alert configured: action scope approaching defined maximum","Required"),
        checkRow("Rollback / undo procedure implemented for every reversible action","If applicable"),
        checkHeader("DASHBOARD AND OBSERVABILITY"),
        checkRow("Support operations dashboard shows AI tool decision accuracy in real time","Required"),
        checkRow("Engineering dashboard shows confidence distribution and drift indicators","Required"),
        checkRow("Executive view shows false negative rate and customer impact metrics","Required"),
      ]}),

      sectionLabel("O3.3  Outstanding Items"),
      gridTable(["#","Item Not Complete — Reason / Justification","Owner","Resolution Target"],[480,5280,1800,1800],4),

      sectionLabel("O3.4  Sign-Off"),
      signoffTable(["Configuration Lead","Reviewer","Support Representative"]),

      // ══ TEMPLATE 4: O-STP ══
      pb(),
      ...phaseHeader("4","Test","O-STP — AI Operations Supportability Test Plan","Validates before deployment that the AI tool makes correct decisions, triggers correctly, and can be disabled in under 5 minutes."),
      sectionLabel("O4.1  Document Metadata"),
      metaTable([["AI Tool Name",""],["O-SRD Reference",""],["Test Environment",""],["O-STP Author",""],["Support Tester",""],["Test Execution Date",""],["Overall Test Result","Pass / Fail / Partial"]]),

      sectionLabel("O4.2  Decision Accuracy Validation"),
      noteBox("Run the AI tool against historical data where the ground truth outcome is known. Measure accuracy against the baseline thresholds defined in O-SRD \u00a7O1.5."),
      gridTable(["Decision Type","# Test Cases","# Correct","# Incorrect","Accuracy %","Threshold","Pass/Fail"],[1600,1200,1200,1200,1200,1360,1600],6),

      sectionLabel("O4.3  False Negative Testing"),
      noteBox("Deliberately inject scenarios the AI should detect, predict, or escalate. Verify it does. False negatives are the failure mode with the highest customer impact."),
      gridTable(["Scenario","Expected AI Action","Actual AI Action","False Negative?","Pass/Fail"],[2400,2000,2000,1360,1600],6),

      sectionLabel("O4.4  Intervention Trigger Testing"),
      noteBox("Trigger every intervention condition. Verify the AI pauses, the correct human is notified, and no-response handling works correctly."),
      gridTable(["Trigger Condition","Fires Before Action?","Correct Recipient?","No-Response Handling?","Logged Correctly?","Pass/Fail"],[2200,1360,1360,1560,1480,1400],6),

      sectionLabel("O4.5  Blast Radius Containment Testing"),
      noteBox("Verify that the AI tool cannot exceed its defined authority scope even if deliberately instructed to."),
      gridTable(["Boundary Test","Action Attempted","Blocked?","Containment Mechanism Fired?","Pass/Fail"],[2400,2200,1000,2360,1400],4),

      sectionLabel("O4.6  Disable Procedure Test"),
      noteBox("Disable the AI tool completely without an engineering deployment. Time it. Every AI operational tool must be disableable in under 5 minutes by a support engineer."),
      new Table({width:{size:9360,type:WidthType.DXA}, columnWidths:[3120,6240], rows:[
        ...[["Time to disable (target: < 5 minutes)",""],["Disabled by (role, not name)",""],["Engineering deployment required?","Yes / No"],["All autonomous actions halted?","Yes / No"],["Dashboard reflects disabled state?","Yes / No"],["Re-enable procedure tested?","Yes / No"]].map(([l,v],i) => new TableRow({children:[
          new TableCell({borders, shading:{fill:i%2===0?NAVY2:NAVY,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:140,right:140}, children:[new Paragraph({children:[new TextRun({text:l,font:"Arial",size:18,bold:true,color:WHITE})]})]}),
          new TableCell({borders, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:140,right:140}, children:[new Paragraph({children:[new TextRun({text:v,font:"Arial",size:19,color:DGRAY})]})]}),
        ]}))
      ]}),

      sectionLabel("O4.7  Overall Test Summary"),
      new Table({width:{size:9360,type:WidthType.DXA}, columnWidths:[5760,3600], rows:[
        new TableRow({children:["Test Area","Result"].map(h => new TableCell({borders, shading:{fill:PURPLE2,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:120,right:120}, children:[new Paragraph({children:[new TextRun({text:h,font:"Arial",size:18,bold:true,color:WHITE})]})]})) }),
        ...["Decision Accuracy Validation","False Negative Testing","Intervention Trigger Testing","Blast Radius Containment Testing","Disable Procedure Test"].map((a,i) => new TableRow({children:[
          new TableCell({borders, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:120,right:120}, children:[new Paragraph({children:[new TextRun({text:a,font:"Arial",size:19,color:DGRAY})]})]}),
          new TableCell({borders, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:120,right:120}, children:[new Paragraph({children:[new TextRun({text:"Pass / Fail / Partial",font:"Arial",size:18,color:"888888"})]})]})
        ]})),
        new TableRow({children:[
          new TableCell({borders, shading:{fill:PURPLE2,type:ShadingType.CLEAR}, margins:{top:100,bottom:100,left:120,right:120}, children:[new Paragraph({children:[new TextRun({text:"OVERALL RECOMMENDATION",font:"Arial",size:19,bold:true,color:WHITE})]})]}),
          new TableCell({borders, shading:{fill:PURPLE2,type:ShadingType.CLEAR}, margins:{top:100,bottom:100,left:120,right:120}, children:[new Paragraph({children:[new TextRun({text:"APPROVED FOR DEPLOYMENT  /  BLOCKED \u2014 REMEDIATION REQUIRED",font:"Arial",size:18,bold:true,color:GOLD})]})]}),
        ]})
      ]}),

      sectionLabel("O4.8  Sign-Off"),
      signoffTable(["QA / Test Lead","Support Lead","Engineering Lead"]),

      // ══ TEMPLATE 5: O-SRR ══
      pb(),
      ...phaseHeader("5","Release / Deploy","O-SRR — AI Operations Support Readiness Review","The final gate before an AI operational tool enters production. Both Support Lead and Engineering Lead sign. Deployment does not proceed without both."),
      sectionLabel("O5.1  Document Metadata"),
      metaTable([["AI Tool Name",""],["Target Deploy Date",""],["O-SRD Reference",""],["O-SAR Reference",""],["O-SIC Reference",""],["O-STP Reference",""],["O-SRR Conducted By",""],["Date of Review",""]]),

      sectionLabel("O5.2  AI Operations Readiness Checklist"),
      new Table({width:{size:9360,type:WidthType.DXA}, columnWidths:[480,7680,1200], rows:[
        checkHeader("INSTRUMENTATION AND OBSERVABILITY"),
        checkRow("Decision log active in production and verified — decisions are being recorded correctly","Required"),
        checkRow("Accuracy metrics live in production — true positive, false positive, false negative rates visible","Required"),
        checkRow("Confidence distribution dashboard active and baseline established","Required"),
        checkRow("Drift detection alert configured and tested end-to-end in production configuration","Required"),
        checkRow("Support operations dashboard shows AI tool status and accuracy in real time","Required"),
        checkHeader("AUTHORITY AND INTERVENTION"),
        checkRow("Authority scope confirmed — all autonomous actions within defined boundaries","Required"),
        checkRow("All intervention triggers active and tested in production configuration","Required"),
        checkRow("Human override confirmed available and tested for every autonomous decision category","Required"),
        checkRow("Blast radius alert active — fires if action scope approaches defined maximum","Required"),
        checkHeader("DISABLE AND RECOVERY"),
        checkRow("Disable procedure documented and accessible to support without engineering","Required"),
        checkRow("Disable procedure tested in production — completed in under 5 minutes","Required"),
        checkRow("Re-enable procedure documented and tested","Required"),
        checkRow("Recovery / rollback procedure documented for every reversible action type","Required"),
        checkHeader("ACCOUNTABILITY"),
        checkRow("Named owner assigned and aware they are accountable for this AI tool\u2019s operational performance","Required"),
        checkRow("Quarterly AOSR (Template 7) scheduled in calendar — first review within 90 days","Required"),
        checkRow("Vendor accountability contact documented and reachable","Required"),
        checkHeader("TEAM READINESS"),
        checkRow("Support team trained on this AI tool\u2019s behaviour, failure modes, and disable procedure","Required"),
        checkRow("Engineering on-call aware this AI tool is deploying and briefed on expected behaviour","Required"),
        checkRow("Escalation path confirmed if AI tool fails or needs to be disabled during an incident","Required"),
      ]}),

      sectionLabel("O5.3  Outstanding Items"),
      noteBox("This table must be empty for deployment to be approved."),
      gridTable(["#","Outstanding Item","Owner","Resolution Required By"],[480,5280,1800,1800],4),

      sectionLabel("O5.4  Deployment Decision"),
      new Table({width:{size:9360,type:WidthType.DXA}, columnWidths:[9360], rows:[
        new TableRow({children:[new TableCell({borders, shading:{fill:WHITE,type:ShadingType.CLEAR}, margins:{top:160,bottom:160,left:200,right:200}, children:[
          new Paragraph({spacing:{before:0,after:120}, children:[new TextRun({text:"\u25A1  APPROVED FOR DEPLOYMENT \u2014 All items complete, no outstanding issues.",font:"Arial",size:20,bold:true,color:"1a5c1a"})]}),
          new Paragraph({spacing:{before:0,after:120}, children:[new TextRun({text:"\u25A1  CONDITIONAL APPROVAL \u2014 Deployed with the following accepted risks (document below):",font:"Arial",size:20,bold:true,color:"92400e"})]}),
          new Paragraph({spacing:{before:0,after:0},  children:[new TextRun({text:"\u25A1  BLOCKED \u2014 Outstanding items must be resolved before deployment.",font:"Arial",size:20,bold:true,color:REDDARK})]})
        ]})]})
      ]}),

      sectionLabel("O5.5  Sign-Off"),
      signoffTable(["Support Lead","Engineering Lead","Operations / Product Owner","Security / Compliance"]),

      // ══ TEMPLATE 6: O-SFL ══
      pb(),
      ...phaseHeader("6","Operate","O-SFL — AI Operations Supportability Feedback Loop","Converts every wrong AI decision into an upstream improvement. Feeds decision accuracy data, wrong decision logs, and authority scope adjustments back into the governance framework."),
      sectionLabel("O6.1  Document Metadata"),
      metaTable([["AI Tool Name",""],["Review Period",""],["O-SFL Author",""],["Support Representative",""],["Engineering Representative",""],["Review Date",""],["Current Tool Version",""]]),

      sectionLabel("O6.2  Decision Accuracy Tracking"),
      noteBox("Track accuracy metrics over time. The goal is a tool that gets more accurate, not one that stays static. Declining accuracy triggers an authority scope review."),
      new Table({width:{size:9360,type:WidthType.DXA}, columnWidths:[1600,1200,1200,1200,1200,1200,1760], rows:[
        new TableRow({children:["Period","True Positive Rate","False Positive Rate","False Negative Rate","Confidence Avg","vs. Baseline","Trend"].map(h => new TableCell({borders, shading:{fill:NAVY,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:80,right:80}, children:[new Paragraph({alignment:AlignmentType.CENTER, children:[new TextRun({text:h,font:"Arial",size:17,bold:true,color:WHITE})]})]}))}),
        ...Array(6).fill(null).map((_,i) => new TableRow({children:Array(7).fill(null).map(() => new TableCell({borders, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:80,right:80}, children:[new Paragraph({children:[new TextRun({text:" ",font:"Arial",size:18})]})]})) }))
      ]}),

      sectionLabel("O6.3  Wrong Decision Log"),
      noteBox("Every wrong autonomous decision recorded here. Every entry is a backlog item. Review monthly, prioritize quarterly. High priority entries trigger an immediate authority scope review."),
      gridTable(["#","Date","Decision Type","What Was Wrong","Customer Impact","Root Cause","Authority Scope Change Required?","Priority"],[360,760,1200,1800,1400,1600,1640,600],8),

      sectionLabel("O6.4  Authority Scope Adjustment Record"),
      noteBox("Record every change to the AI tool\u2019s authority scope — expansions when accuracy improves, restrictions when wrong decisions occur. This is the governance lever that makes the framework self-correcting."),
      gridTable(["Date","Change Description","Direction (Expand/Restrict)","Trigger","Approved By","Effective Date"],[1000,2400,1400,2000,1560,1000],5),

      sectionLabel("O6.5  Runbook Accuracy Tracking (for AI-generated runbooks)"),
      noteBox("If this AI tool generates runbooks, record every time a runbook is used in a real incident and whether it was accurate. AI-generated runbooks must be treated as living documents."),
      gridTable(["#","Incident Ref","Runbook Used","Accurate?","Version After Update","Changes Made"],[480,1000,2000,1000,1600,3280],5),

      sectionLabel("O6.6  Quarterly Review Summary"),
      metaTable([["Review Date",""],["Attendees",""],["Average accuracy score (period)",""],["# Wrong decisions logged",""],["# Wrong decisions resolved",""],["# Authority scope changes made",""],["Top recurring wrong decision pattern",""],["Top improvement target for next cycle",""]]),

      sectionLabel("O6.7  Backlog Items Generated This Period"),
      gridTable(["#","Backlog Item","Source","Priority (H/M/L)","Assigned To / Sprint"],[480,3680,1600,1200,2400],6),

      sectionLabel("O6.8  Quarterly Sign-Off"),
      signoffTable(["Support Lead","Engineering Lead","Named AI Tool Owner"]),

      // ══ TEMPLATE 7: AOSR ══
      pb(),
      ...phaseHeader("7","Govern","AOSR — AI Operations Governance Review","Quarterly review of every AI operational tool deployed in your support and operations stack. Covers accuracy, authority scope, drift, blast radius, and disable readiness."),
      sectionLabel("G7.1  Document Metadata"),
      metaTable([["Review Period",""],["AOSR Author",""],["Support Lead",""],["Engineering Lead",""],["Operations / Product Owner",""],["Review Date",""]]),

      sectionLabel("G7.2  AI Tool Registry — All Tools Under Review"),
      gridTable(["AI Tool Name","Category","Current Version","Deployed Since","Named Owner","Last O-SFL Review"],[2200,1400,1200,1200,2000,1360],6),

      sectionLabel("G7.3  Per-Tool Accuracy Review"),
      noteBox("For each AI tool, review the decision accuracy trend this quarter. Declining accuracy triggers an authority scope restriction. Consistent accuracy above threshold may justify scope expansion."),
      new Table({width:{size:9360,type:WidthType.DXA}, columnWidths:[2200,1200,1200,1200,1200,2360], rows:[
        new TableRow({children:["AI Tool","Accuracy This Qtr","vs. Last Qtr","vs. Baseline","Trend","Recommendation"].map(h => new TableCell({borders, shading:{fill:NAVY,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({children:[new TextRun({text:h,font:"Arial",size:18,bold:true,color:WHITE})]})]})) }),
        ...Array(6).fill(null).map((_,i) => new TableRow({children:Array(6).fill(null).map(() => new TableCell({borders, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:100,bottom:100,left:100,right:100}, children:[new Paragraph({children:[new TextRun({text:" ",font:"Arial",size:19})]})]})) }))
      ]}),

      sectionLabel("G7.4  Drift Assessment — All Tools"),
      gridTable(["AI Tool","Confidence Distribution Shift?","Unexplained Behavior Change?","Model Version Changed?","Drift Risk (H/M/L)","Action Required"],[2000,1560,1560,1360,1080,1800],6),

      sectionLabel("G7.5  Authority Scope Review — All Tools"),
      noteBox("Review whether each tool\u2019s current authority scope is appropriate given its demonstrated accuracy this quarter. This is the governance lever that prevents scope creep."),
      new Table({width:{size:9360,type:WidthType.DXA}, columnWidths:[2200,2400,2400,2360], rows:[
        new TableRow({children:["AI Tool","Current Scope","Demonstrated Accuracy Justifies","Recommended Action"].map(h => new TableCell({borders, shading:{fill:PURPLE2,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:120,right:120}, children:[new Paragraph({children:[new TextRun({text:h,font:"Arial",size:18,bold:true,color:WHITE})]})]})) }),
        ...Array(6).fill(null).map((_,i) => new TableRow({children:Array(4).fill(null).map(() => new TableCell({borders, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:100,bottom:100,left:120,right:120}, children:[new Paragraph({children:[new TextRun({text:" ",font:"Arial",size:19})]})]})) }))
      ]}),

      sectionLabel("G7.6  Disable Readiness Test — All Tools"),
      noteBox("Test the disable procedure for every AI operational tool this quarter. Record the time. The first time you need to disable a tool should not be during the incident that requires disabling it."),
      gridTable(["AI Tool","Disable Tested This Qtr?","Time to Disable","Engineering Deployment Required?","Pass/Fail"],[2400,1600,1400,2000,1960],6),

      sectionLabel("G7.7  Quarterly Actions — All Tools"),
      gridTable(["#","Action Required","AI Tool","Owner","Target Date","Authority Scope Impact"],[480,2800,1600,1200,1280,2000],8),

      sectionLabel("G7.8  Quarterly Sign-Off"),
      noteBox("Sign-off confirms the quarterly review occurred, all AI tools were assessed, and actions have been assigned for all High priority findings."),
      signoffTable(["Support Lead","Engineering Lead","Operations / Product Owner"]),

      // ── CLOSING ──
      sp(480),
      new Paragraph({border:{bottom:{style:BorderStyle.SINGLE,size:6,color:PURPLE2,space:1}},spacing:{before:0,after:120},children:[]}),
      new Paragraph({alignment:AlignmentType.CENTER,spacing:{before:120,after:60},
        children:[new TextRun({text:"O-SRD  \u2192  O-SAR  \u2192  O-SIC  \u2192  O-STP  \u2192  O-SRR  \u2192  O-SFL  \u2192  AOSR (quarterly)",font:"Arial",size:20,bold:true,color:NAVY})]
      }),
      new Paragraph({alignment:AlignmentType.CENTER,spacing:{before:0,after:0},
        children:[new TextRun({text:"Confidential \u2014 Consulting IP  |  John A. Bowman  |  Supportability Engineering  |  2026",font:"Arial",size:17,color:"888888",italics:true})]
      }),
    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('/home/claude/SE_AIOperations_Templates.docx', buf);
  console.log('Done Vol 4 templates');
});
