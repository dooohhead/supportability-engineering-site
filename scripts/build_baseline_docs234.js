const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageBreak, LevelFormat,
  TabStopType, TabStopPosition
} = require('docx');
const fs = require('fs');

const NAVY   = "0f2340";
const NAVY2  = "1b3a5c";
const TEAL   = "0d7377";
const TEAL2  = "e0f7f7";
const TEAL3  = "ccf5f5";
const GREEN  = "064e3b";
const GREENBG= "ecfdf5";
const GOLD   = "c9993a";
const MGRAY  = "F4F6F9";
const DGRAY  = "2d3748";
const WHITE  = "FFFFFF";
const AMBER  = "451a03";
const AMBERBG= "fffbeb";
const REDDARK= "7f1d1d";
const REDBG  = "fff5f5";
const PURPLE = "4c1d95";
const PURPLEBG="f5f3ff";

const bd = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: bd, bottom: bd, left: bd, right: bd };
const nb = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: nb, bottom: nb, left: nb, right: nb };

const sp = (before=0, after=120) => new Paragraph({ spacing:{before,after}, children:[] });
const pb = () => new Paragraph({ children:[new PageBreak()] });

const rule = (color=TEAL) => new Paragraph({
  border:{ bottom:{ style:BorderStyle.SINGLE, size:10, color, space:1 } },
  spacing:{ before:0, after:200 }, children:[]
});

const h1 = (text, color=NAVY) => new Paragraph({
  spacing:{ before:480, after:120 },
  children:[new TextRun({ text, font:"Arial", size:36, bold:true, color })]
});

const h2 = (text, color=TEAL) => new Paragraph({
  spacing:{ before:320, after:100 },
  children:[new TextRun({ text, font:"Arial", size:26, bold:true, color })]
});

const h3 = (text, color=NAVY2) => new Paragraph({
  spacing:{ before:200, after:80 },
  children:[new TextRun({ text, font:"Arial", size:22, bold:true, color })]
});

const body = (text) => new Paragraph({
  spacing:{ before:40, after:100 },
  children:[new TextRun({ text, font:"Arial", size:20, color:DGRAY })]
});

const bullet = (text) => new Paragraph({
  numbering:{ reference:"bullets", level:0 },
  spacing:{ before:40, after:80 },
  children:[new TextRun({ text, font:"Arial", size:20, color:DGRAY })]
});

const noteBox = (text, bg=TEAL2, tc=NAVY2) => new Table({
  width:{size:9360,type:WidthType.DXA}, columnWidths:[9360],
  rows:[new TableRow({children:[new TableCell({
    borders, shading:{fill:bg,type:ShadingType.CLEAR}, margins:{top:120,bottom:120,left:160,right:160},
    children:[new Paragraph({children:[new TextRun({text,font:"Arial",size:19,italics:true,color:tc})]})]
  })]})]
});

const baselineBox = (text) => new Table({
  width:{size:9360,type:WidthType.DXA}, columnWidths:[280,9080],
  rows:[new TableRow({children:[
    new TableCell({ borders:noBorders, width:{size:280,type:WidthType.DXA}, shading:{fill:GREEN,type:ShadingType.CLEAR}, margins:{top:0,bottom:0,left:0,right:0}, children:[new Paragraph({children:[]})] }),
    new TableCell({ borders:noBorders, width:{size:9080,type:WidthType.DXA}, shading:{fill:GREENBG,type:ShadingType.CLEAR}, margins:{top:120,bottom:120,left:200,right:200}, children:[new Paragraph({children:[new TextRun({text,font:"Arial",size:19,color:GREEN})]})] })
  ]})]
});

const codeBlock = (lines, bg="1e293b", tc="e2e8f0") => new Table({
  width:{size:9360,type:WidthType.DXA}, columnWidths:[9360],
  rows:[new TableRow({children:[new TableCell({
    borders, shading:{fill:bg,type:ShadingType.CLEAR}, margins:{top:160,bottom:160,left:200,right:200},
    children: lines.map(l => new Paragraph({spacing:{before:0,after:0}, children:[new TextRun({text:l,font:"Courier New",size:18,color:tc})]}))
  })]})]
});

const twoCol = (headers, rows, w1=4680, w2=4680, hColor=NAVY) => new Table({
  width:{size:9360,type:WidthType.DXA}, columnWidths:[w1,w2],
  rows:[
    new TableRow({children: headers.map((h,i) => new TableCell({borders, width:{size:i===0?w1:w2,type:WidthType.DXA}, shading:{fill:hColor,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:140,right:140}, children:[new Paragraph({children:[new TextRun({text:h,font:"Arial",size:19,bold:true,color:WHITE})]})]})) }),
    ...rows.map(([a,b],i) => new TableRow({children:[
      new TableCell({borders, width:{size:w1,type:WidthType.DXA}, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:140,right:140}, children:[new Paragraph({children:[new TextRun({text:a,font:"Arial",size:19,bold:true,color:NAVY2})]})]}),
      new TableCell({borders, width:{size:w2,type:WidthType.DXA}, shading:{fill:i%2===0?TEAL2:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:140,right:140}, children:[new Paragraph({children:[new TextRun({text:b,font:"Arial",size:19,color:DGRAY})]})]})
    ]}))
  ]
});

const gridTable = (headers, widths, rows, hColor=TEAL) => new Table({
  width:{size:9360,type:WidthType.DXA}, columnWidths:widths,
  rows:[
    new TableRow({children: headers.map((h,i) => new TableCell({borders, width:{size:widths[i],type:WidthType.DXA}, shading:{fill:hColor,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({children:[new TextRun({text:h,font:"Arial",size:18,bold:true,color:WHITE})]})]})) }),
    ...rows.map((cells,i) => new TableRow({children: cells.map((c,ci) => new TableCell({borders, width:{size:widths[ci],type:WidthType.DXA}, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({children:[new TextRun({text:c,font:"Arial",size:18,color:DGRAY})]})]})) }))
  ]
});

const emptyGrid = (headers, widths, emptyRows=5, hColor=TEAL) => {
  const hRow = new TableRow({children: headers.map((h,i) => new TableCell({borders, width:{size:widths[i],type:WidthType.DXA}, shading:{fill:hColor,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({children:[new TextRun({text:h,font:"Arial",size:18,bold:true,color:WHITE})]})]}))});
  const dRows = Array(emptyRows).fill(null).map((_,ri) => new TableRow({children: widths.map((w) => new TableCell({borders, width:{size:w,type:WidthType.DXA}, shading:{fill:ri%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:100,bottom:100,left:100,right:100}, children:[new Paragraph({children:[new TextRun({text:" ",font:"Arial",size:18})]})]})) }));
  return new Table({width:{size:9360,type:WidthType.DXA}, columnWidths:widths, rows:[hRow,...dRows]});
};

const checkRow = (text, req="Required", color=TEAL) => new TableRow({children:[
  new TableCell({borders, width:{size:480,type:WidthType.DXA}, shading:{fill:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:120,right:120}, children:[new Paragraph({alignment:AlignmentType.CENTER, children:[new TextRun({text:"\u25A1",font:"Arial",size:22,color})]})]}),
  new TableCell({borders, width:{size:7680,type:WidthType.DXA}, shading:{fill:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:120,right:120}, children:[new Paragraph({children:[new TextRun({text,font:"Arial",size:19,color:DGRAY})]})]}),
  new TableCell({borders, width:{size:1200,type:WidthType.DXA}, shading:{fill:req==="Required"?TEAL2:AMBERBG,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({alignment:AlignmentType.CENTER, children:[new TextRun({text:req,font:"Arial",size:17,bold:true,color:req==="Required"?TEAL:AMBER})]})]}),
]});

const checkHeader = (title, color=TEAL) => new TableRow({children:[
  new TableCell({borders, columnSpan:3, width:{size:9360,type:WidthType.DXA}, shading:{fill:color,type:ShadingType.CLEAR}, margins:{top:100,bottom:100,left:120,right:120}, children:[new Paragraph({children:[new TextRun({text:title,font:"Arial",size:19,bold:true,color:WHITE})]})]})
]});

const makeHeader = (title, subtitle) => new Header({ children:[
  new Paragraph({
    tabStops:[{type:TabStopType.RIGHT,position:9360}],
    border:{bottom:{style:BorderStyle.SINGLE,size:6,color:TEAL,space:1}},
    spacing:{before:0,after:160},
    children:[
      new TextRun({text:title, font:"Arial",size:17,bold:true,color:NAVY}),
      new TextRun({text:`\t${subtitle}`, font:"Arial",size:17,color:"888888"})
    ]
  })
]});

const makeFooter = (left, right) => new Footer({ children:[
  new Paragraph({
    tabStops:[{type:TabStopType.RIGHT,position:9360}],
    border:{top:{style:BorderStyle.SINGLE,size:6,color:TEAL,space:1}},
    spacing:{before:160,after:0},
    children:[
      new TextRun({text:left, font:"Arial",size:16,color:"888888"}),
      new TextRun({text:`\t${right}`, font:"Arial",size:16,color:"888888"})
    ]
  })
]});

const closingLine = (docNum) => [
  sp(480),
  new Paragraph({border:{bottom:{style:BorderStyle.SINGLE,size:6,color:TEAL,space:1}},spacing:{before:0,after:120},children:[]}),
  new Paragraph({alignment:AlignmentType.CENTER,spacing:{before:120,after:0},
    children:[new TextRun({text:`Baseline Supportability Standard  \u2014  Document ${docNum} of 4  \u2014  Free to use and adapt  \u2014  John A. Bowman  \u2014  2026`,font:"Arial",size:17,color:"888888",italics:true})]
  }),
];

// ════════════════════════════════════════
// DOCUMENT 2 — GATE CONFIGURATION SPEC
// ════════════════════════════════════════

const doc2 = new Document({
  numbering:{ config:[{ reference:"bullets", levels:[{ level:0, format:LevelFormat.BULLET, text:"\u2022", alignment:AlignmentType.LEFT, style:{ paragraph:{ indent:{ left:720, hanging:360 } } } }] }] },
  styles:{ default:{ document:{ run:{ font:"Arial", size:20 } } } },
  sections:[{
    properties:{ page:{ size:{ width:12240, height:15840 }, margin:{ top:1440, right:1440, bottom:1440, left:1440 } } },
    headers:{ default: makeHeader("BASELINE SUPPORTABILITY STANDARD  \u2014  GATE CONFIGURATION SPEC", "Document 2 of 4  |  John A. Bowman  |  2026") },
    footers:{ default: makeFooter("Baseline Supportability Standard  |  Free to use and adapt  |  Supportability Engineering", "dooohhead@gmail.com  |  902-489-2429") },
    children:[
      sp(2000,0),
      new Paragraph({spacing:{before:0,after:60}, children:[new TextRun({text:"BASELINE SUPPORTABILITY STANDARD  \u00B7  DOCUMENT 2 OF 4", font:"Arial",size:20,bold:true,color:TEAL,characterSpacing:200})]}),
      new Paragraph({spacing:{before:0,after:40}, children:[new TextRun({text:"Gate Configuration", font:"Arial",size:64,bold:true,color:NAVY})]}),
      new Paragraph({spacing:{before:0,after:40}, children:[new TextRun({text:"Specification", font:"Arial",size:64,bold:true,color:TEAL})]}),
      new Paragraph({spacing:{before:0,after:320}, children:[new TextRun({text:"Three CI/CD pipeline gates for agent-generated code  \u2014  Add to your existing pipeline", font:"Arial",size:32,color:NAVY2})]}),
      new Paragraph({border:{bottom:{style:BorderStyle.SINGLE,size:16,color:TEAL,space:1}},spacing:{before:0,after:240},children:[]}),
      body("This document specifies the three pipeline gates to add to your existing CI/CD pipeline for agent-generated code. Each gate enforces a specific requirement from the Supportability Context Document (Document 1). All three are additive — they sit alongside your existing gates and do not replace them. Configuration examples are provided for GitHub Actions, GitLab CI, and a generic shell script that works with any pipeline tool."),
      sp(80,0),
      baselineBox("BASELINE GATES: These three gates enforce the requirements that human code reviewers are least likely to catch in agent-generated code at volume: sensitive data in logs, missing correlation ID propagation, and unregistered dependencies. They run automatically on every PR and block merge on failure."),
      sp(160,0),
      new Paragraph({spacing:{before:0,after:60}, children:[new TextRun({text:"John A. Bowman", font:"Arial",size:22,bold:true,color:NAVY})]}),
      new Paragraph({spacing:{before:0,after:0}, children:[new TextRun({text:"dooohhead@gmail.com  \u2022  902-489-2429  |  2026", font:"Arial",size:20,color:DGRAY})]}),

      pb(),
      h1("Gate Overview"),
      rule(),
      gridTable(
        ["Gate","What It Checks","Blocks PR On","Configures Against"],
        [960,3200,2400,2800],
        [
          ["Gate 1","Sensitive data in log statements","Any match against the exclusion list","Document 1, Section 1.4 + Section 7.1"],
          ["Gate 2","Correlation ID propagation","Any inbound handler or outbound call missing correlation ID","Document 1, Section 3.2"],
          ["Gate 3","Dependency registry compliance","Any external call to an unregistered dependency","Document 1, Section 4.2 + Section 7.2"],
        ]
      ),
      sp(160),
      noteBox("These gates are intentionally narrow in scope. They check the three things that are hardest to catch by eye in generated code and most likely to cause production incidents. They are not a replacement for human code review \u2014 they are a pre-filter that gives your human reviewer a clean slate to focus on meaning and business logic."),

      pb(),
      h1("Gate 1 — Sensitive Data Log Scanner"),
      rule(),
      body("Scans every log statement in agent-generated code for field names and patterns that match the sensitive data exclusion list in Document 1 Sections 1.4 and 7.1. Any match blocks the PR with a specific finding that tells the developer exactly which line and which field."),
      sp(),
      h2("What It Catches"),
      bullet("Direct field assignments to log objects: log.password = ..., logger.info({token: ...})"),
      bullet("String interpolation that includes excluded field names: `User ${email} logged in`"),
      bullet("Object spread into log output: logger.info({...userObject}) where userObject contains excluded fields"),
      bullet("Error log statements that include the full request object or response body"),
      sp(80),
      h2("Configuration — Pattern List (add your Section 7.1 fields to this list)"),
      codeBlock([
        "# sensitive-data-patterns.txt",
        "# Baseline exclusion patterns — matches field names in log statements",
        "# Add organization-specific fields below the baseline section",
        "",
        "# === BASELINE PATTERNS ===",
        "password|passwd|pwd",
        "api_key|apikey|api-key",
        "token(?!_count|_type|_bucket|_limit)",   "# excludes token_count etc",
        "secret(?!_manager)",                       "# excludes AWS Secrets Manager refs",
        "private_key|privatekey|private-key",
        "session_id|sessionid|session-id",
        "jwt|bearer",
        "card_number|cardnumber|pan|cvv|expiry",
        "ssn|national_id|passport_number",
        "date_of_birth|dob",
        "credit_card|debit_card",
        "bank_account|routing_number",
        "raw_password|plaintext",
        "",
        "# === ORGANIZATION-SPECIFIC PATTERNS (add from Document 1 Section 7.1) ===",
        "# example_internal_field",
        "# another_sensitive_field",
      ]),
      sp(120),
      h2("GitHub Actions Implementation"),
      codeBlock([
        "# .github/workflows/supportability-gates.yml",
        "name: Supportability Gates",
        "on: [pull_request]",
        "",
        "jobs:",
        "  sensitive-data-scan:",
        "    runs-on: ubuntu-latest",
        "    steps:",
        "      - uses: actions/checkout@v4",
        "        with:",
        "          fetch-depth: 0",
        "",
        "      - name: Gate 1 — Sensitive Data Log Scanner",
        "        run: |",
        "          # Get changed files in this PR",
        "          CHANGED=$(git diff --name-only origin/${{ github.base_ref }}...HEAD \\",
        "                    | grep -E '\\.(js|ts|py|java|go|cs|rb)$')",
        "",
        "          if [ -z \"$CHANGED\" ]; then exit 0; fi",
        "",
        "          # Scan log statements for sensitive field names",
        "          PATTERNS=$(cat .supportability/sensitive-data-patterns.txt \\",
        "                     | grep -v '^#' | grep -v '^$' | tr '\\n' '|' | sed 's/|$//')",
        "",
        "          FINDINGS=$(echo \"$CHANGED\" | xargs grep -n \\",
        "            -E \"(log|logger|console)\\.(debug|info|warn|error|fatal).*($PATTERNS)\" \\",
        "            || true)",
        "",
        "          if [ -n \"$FINDINGS\" ]; then",
        "            echo '::error::Gate 1 FAILED: Sensitive data in log statements'",
        "            echo \"$FINDINGS\"",
        "            exit 1",
        "          fi",
        "          echo 'Gate 1 PASSED: No sensitive data found in log statements'",
      ]),
      sp(120),
      h2("GitLab CI Implementation"),
      codeBlock([
        "# .gitlab-ci.yml (add this job to your existing pipeline)",
        "gate-1-sensitive-data:",
        "  stage: test",
        "  script:",
        "    - |",
        "      CHANGED=$(git diff --name-only origin/$CI_MERGE_REQUEST_TARGET_BRANCH_NAME \\",
        "                | grep -E '\\.(js|ts|py|java|go|cs|rb)$')",
        "      PATTERNS=$(cat .supportability/sensitive-data-patterns.txt \\",
        "                 | grep -v '^#' | grep -v '^$' | tr '\\n' '|' | sed 's/|$//')",
        "      FINDINGS=$(echo \"$CHANGED\" | xargs grep -nE \\",
        "        \"(log|logger|console)\\.(debug|info|warn|error|fatal).*($PATTERNS)\" || true)",
        "      if [ -n \"$FINDINGS\" ]; then echo \"$FINDINGS\"; exit 1; fi",
        "  rules:",
        "    - if: $CI_PIPELINE_SOURCE == 'merge_request_event'",
      ]),

      pb(),
      h1("Gate 2 — Correlation ID Propagation Check"),
      rule(),
      body("Verifies that every inbound request handler extracts a correlation ID and that every outbound call propagates it. Missing correlation ID propagation is the single most common cause of untraceable incidents in distributed systems built with agent assistance."),
      sp(),
      h2("What It Checks"),
      bullet("Every HTTP handler function extracts X-Correlation-ID (or traceparent) from inbound headers"),
      bullet("Every outbound HTTP call includes X-Correlation-ID in its headers"),
      bullet("Every database call, queue publish, and async job invocation carries the correlation ID in its context"),
      bullet("Every log statement on a request-handling code path includes the correlation_id field"),
      sp(80),
      h2("GitHub Actions Implementation"),
      codeBlock([
        "  gate-2-correlation-id:",
        "    runs-on: ubuntu-latest",
        "    steps:",
        "      - uses: actions/checkout@v4",
        "        with:",
        "          fetch-depth: 0",
        "",
        "      - name: Gate 2 — Correlation ID Propagation Check",
        "        run: |",
        "          CHANGED=$(git diff --name-only origin/${{ github.base_ref }}...HEAD \\",
        "                    | grep -E '\\.(js|ts|py|java|go|cs|rb)$')",
        "",
        "          if [ -z \"$CHANGED\" ]; then exit 0; fi",
        "",
        "          FAILURES=0",
        "",
        "          # Check: outbound HTTP calls include correlation ID header",
        "          OUTBOUND=$(echo \"$CHANGED\" | xargs grep -lE \\",
        "            '(fetch|axios|requests\\.get|requests\\.post|http\\.get|http\\.post|HttpClient)' \\",
        "            || true)",
        "",
        "          for f in $OUTBOUND; do",
        "            # If file makes outbound calls but doesn't pass correlation ID",
        "            if grep -qE '(fetch|axios|requests|http)' \"$f\" && \\",
        "               ! grep -qE 'correlation.?id|X-Correlation-ID|traceparent' \"$f\"; then",
        "              echo \"::warning file=$f::Gate 2: Outbound calls may be missing correlation ID\"",
        "              FAILURES=$((FAILURES+1))",
        "            fi",
        "          done",
        "",
        "          if [ $FAILURES -gt 0 ]; then",
        "            echo '::error::Gate 2 FAILED: Correlation ID propagation gaps found'",
        "            exit 1",
        "          fi",
        "          echo 'Gate 2 PASSED: Correlation ID propagation looks correct'",
      ]),
      sp(120),
      h2("Adapting for Your Stack"),
      twoCol(["Language / Framework","Patterns to Check For Correlation ID"],
        [
          ["Node.js / Express","req.headers['x-correlation-id'], AsyncLocalStorage, cls-hooked"],
          ["Python / FastAPI","request.headers.get('X-Correlation-ID'), contextvars.ContextVar"],
          ["Java / Spring","HttpServletRequest.getHeader(), MDC.put('correlationId', ...)"],
          ["Go","r.Header.Get('X-Correlation-ID'), context.WithValue(ctx, ...)"],
          ["C# / .NET","HttpContext.Request.Headers['X-Correlation-ID'], IHttpContextAccessor"],
          ["Ruby / Rails","request.headers['X-Correlation-ID'], Thread.current[:correlation_id]"],
        ],
        3000, 6360
      ),

      pb(),
      h1("Gate 3 — Dependency Registry Compliance"),
      rule(),
      body("Checks that every external dependency call in agent-generated code is registered in the dependency registry (Document 1, Section 7.2). Any call to an unregistered external service, API, or database blocks the PR and prompts the developer to register the dependency before merging."),
      sp(),
      h2("What It Checks"),
      bullet("HTTP calls to domains not in the approved registry"),
      bullet("Database connection strings referencing hosts not in the registry"),
      bullet("SDK or client library instantiations for services not in the registry"),
      bullet("Environment variable references suggesting a new external service (API_URL, ENDPOINT, HOST)"),
      sp(80),
      h2("Registry File Format"),
      codeBlock([
        "# .supportability/dependency-registry.yml",
        "# Every external dependency your codebase is approved to call.",
        "# Generated from Document 1, Section 7.2.",
        "# Add new dependencies here BEFORE the PR that introduces them.",
        "",
        "dependencies:",
        "  - name: stripe-api",
        "    type: external-api",
        "    domains: [api.stripe.com]",
        "    timeout_ms: 5000",
        "    circuit_breaker: required",
        "    fallback: fail-fast",
        "    owner: payments-team",
        "",
        "  - name: postgres-primary",
        "    type: database",
        "    hosts: [db-primary.internal, db-primary.prod.internal]",
        "    timeout_ms: 3000",
        "    circuit_breaker: required",
        "    fallback: read-replica-for-reads",
        "    owner: platform-team",
        "",
        "  - name: redis-cache",
        "    type: cache",
        "    hosts: [redis.internal, cache.prod.internal]",
        "    timeout_ms: 500",
        "    circuit_breaker: required",
        "    fallback: bypass-to-db",
        "    owner: platform-team",
        "",
        "  # Add new dependencies here before introducing them in code",
      ]),
      sp(120),
      h2("GitHub Actions Implementation"),
      codeBlock([
        "  gate-3-dependency-registry:",
        "    runs-on: ubuntu-latest",
        "    steps:",
        "      - uses: actions/checkout@v4",
        "        with:",
        "          fetch-depth: 0",
        "",
        "      - name: Gate 3 — Dependency Registry Compliance",
        "        run: |",
        "          CHANGED=$(git diff --name-only origin/${{ github.base_ref }}...HEAD \\",
        "                    | grep -E '\\.(js|ts|py|java|go|cs|rb)$')",
        "",
        "          # Extract approved domains from registry",
        "          APPROVED=$(grep 'domains:\\|hosts:' .supportability/dependency-registry.yml \\",
        "                     | grep -oE '[a-z0-9.-]+\\.[a-z]{2,}' | sort -u)",
        "",
        "          # Find external URL references in changed files",
        "          URLS=$(echo \"$CHANGED\" | xargs grep -hEo \\",
        "            'https?://[a-zA-Z0-9.-]+\\.[a-z]{2,}' || true | sort -u)",
        "",
        "          FAILURES=0",
        "          for url in $URLS; do",
        "            domain=$(echo $url | sed 's|https\\?://||' | cut -d'/' -f1)",
        "            # Skip internal/localhost domains",
        "            if echo $domain | grep -qE '(localhost|127\\.0\\.0\\.1|\\.internal$)'; then",
        "              continue",
        "            fi",
        "            if ! echo \"$APPROVED\" | grep -q \"$domain\"; then",
        "              echo \"::error::Gate 3: Unregistered dependency: $domain\"",
        "              echo \"Add to .supportability/dependency-registry.yml before merging.\"",
        "              FAILURES=$((FAILURES+1))",
        "            fi",
        "          done",
        "",
        "          if [ $FAILURES -gt 0 ]; then exit 1; fi",
        "          echo 'Gate 3 PASSED: All dependencies are registered'",
      ]),
      sp(120),
      h2("File Structure — Add to Your Repository"),
      codeBlock([
        "your-repo/",
        "\u251c\u2500\u2500 .supportability/",
        "\u2502   \u251c\u2500\u2500 sensitive-data-patterns.txt   # Gate 1 pattern list",
        "\u2502   \u2514\u2500\u2500 dependency-registry.yml       # Gate 3 approved dependencies",
        "\u251c\u2500\u2500 .github/workflows/",
        "\u2502   \u2514\u2500\u2500 supportability-gates.yml      # All three gates",
        "\u2514\u2500\u2500 [existing repo structure]",
      ]),
      sp(120),
      h2("Gate Failure Messages — What Developers See"),
      twoCol(["Gate Failure","Message Shown in PR"],
        [
          ["Gate 1: Sensitive data","Gate 1 FAILED: Sensitive data in log statements. File: src/auth/login.js, Line 42: logger.info({email: user.email}). Remove the excluded field or use a safe alternative (e.g. log the entity_id instead of the email address)."],
          ["Gate 2: Correlation ID","Gate 2 FAILED: Outbound calls may be missing correlation ID. File: src/payment/processor.js. Review all fetch/axios calls in this file and confirm X-Correlation-ID is included in headers."],
          ["Gate 3: Unregistered dependency","Gate 3 FAILED: Unregistered dependency: api.newservice.com. This domain is not in .supportability/dependency-registry.yml. Add the dependency entry (including timeout, circuit breaker, and fallback) before merging this PR."],
        ],
        2400, 6960
      ),
      ...closingLine("2"),
    ]
  }]
});

// ════════════════════════════════════════
// DOCUMENT 3 — PR TEMPLATE ADDITION
// ════════════════════════════════════════

const doc3 = new Document({
  numbering:{ config:[{ reference:"bullets", levels:[{ level:0, format:LevelFormat.BULLET, text:"\u2022", alignment:AlignmentType.LEFT, style:{ paragraph:{ indent:{ left:720, hanging:360 } } } }] }] },
  styles:{ default:{ document:{ run:{ font:"Arial", size:20 } } } },
  sections:[{
    properties:{ page:{ size:{ width:12240, height:15840 }, margin:{ top:1440, right:1440, bottom:1440, left:1440 } } },
    headers:{ default: makeHeader("BASELINE SUPPORTABILITY STANDARD  \u2014  PR TEMPLATE ADDITION", "Document 3 of 4  |  John A. Bowman  |  2026") },
    footers:{ default: makeFooter("Baseline Supportability Standard  |  Free to use and adapt  |  Supportability Engineering", "dooohhead@gmail.com  |  902-489-2429") },
    children:[
      sp(2000,0),
      new Paragraph({spacing:{before:0,after:60}, children:[new TextRun({text:"BASELINE SUPPORTABILITY STANDARD  \u00B7  DOCUMENT 3 OF 4", font:"Arial",size:20,bold:true,color:TEAL,characterSpacing:200})]}),
      new Paragraph({spacing:{before:0,after:40}, children:[new TextRun({text:"PR Template", font:"Arial",size:64,bold:true,color:NAVY})]}),
      new Paragraph({spacing:{before:0,after:40}, children:[new TextRun({text:"Addition", font:"Arial",size:64,bold:true,color:TEAL})]}),
      new Paragraph({spacing:{before:0,after:320}, children:[new TextRun({text:"Add to your existing PR template  \u2014  Five questions, five minutes", font:"Arial",size:32,color:NAVY2})]}),
      new Paragraph({border:{bottom:{style:BorderStyle.SINGLE,size:16,color:TEAL,space:1}},spacing:{before:0,after:240},children:[]}),
      body("This document provides the PR template addition to copy into your existing pull request template. It adds a focused section that appears when the PR is agent-generated or includes agent-generated code. The human reviewer answers five questions that the structural gates cannot check: whether the agent\u2019s error messages are meaningful, whether edge cases are handled with business logic rather than pattern matching, whether any invisible dependencies were missed by Gate 3, and whether the code\u2019s behavior matches the feature specification."),
      sp(80,0),
      baselineBox("BASELINE: Five questions. Five minutes. Narrowed to the things only a human can verify after the structural gates have passed. This is not a checklist of fifty items \u2014 it is a focused review of the judgment-dependent quality issues most common in agent-generated code."),
      sp(160,0),
      new Paragraph({spacing:{before:0,after:0}, children:[new TextRun({text:"John A. Bowman  |  dooohhead@gmail.com  \u2022  902-489-2429  |  2026", font:"Arial",size:20,color:DGRAY})]}),

      pb(),
      h1("How to Add This to Your PR Template"),
      rule(),
      body("Most version control platforms support a PR template file. Copy the markdown from the next page into your existing template file at the location shown below."),
      sp(),
      twoCol(["Platform","Template File Location"],
        [
          ["GitHub","Create or edit: .github/pull_request_template.md"],
          ["GitLab","Create or edit: .gitlab/merge_request_templates/Default.md"],
          ["Bitbucket","Create or edit: .bitbucket/pull-request-template.md"],
          ["Azure DevOps","Create or edit: .azuredevops/pull_request_template.md"],
          ["Other","Check your platform\u2019s documentation for PR template file location"],
        ],
        2800, 6560
      ),
      sp(120),
      noteBox("Add the Agent-Generated Code Review section at the end of your existing PR template. It only takes effect when the reviewer checks the 'This PR contains agent-generated code' checkbox. If unchecked, reviewers skip the section. No disruption to your existing review process for human-authored PRs."),

      pb(),
      h1("PR Template Addition — Copy This into Your Template File"),
      rule(),
      noteBox("The block below is formatted as GitHub-flavored Markdown. Copy it verbatim into your PR template file. The checkbox at the top controls whether the rest of the section applies."),
      sp(80),
      codeBlock([
        "---",
        "",
        "## \ud83e\udd16 Agent-Generated Code Review",
        "",
        "> **Check this box if this PR contains code generated by an AI coding tool**",
        "> (Copilot, Cursor, Claude Code, or any other agent-assisted generation)",
        "",
        "- [ ] This PR contains agent-generated code",
        "",
        "**If checked, the reviewer must complete all five questions below.**",
        "**If unchecked, skip this section.**",
        "",
        "All three structural gates (sensitive data scan, correlation ID check,",
        "dependency registry check) must have passed before this review begins.",
        "",
        "---",
        "",
        "### Q1 \u2014 Error Messages",
        "",
        "Review every error message produced by agent-generated code in this PR.",
        "",
        "Test: Could a support engineer receiving this error at 2am, with no other",
        "context, understand what happened and know what to do?",
        "",
        "- [ ] All error messages are specific and actionable",
        "- [ ] No generic '500 Internal Server Error' or raw exception messages",
        "- [ ] Each error message includes the component, the operation, and what failed",
        "",
        "_If any error messages failed this test, describe what was changed:_",
        "",
        "<!-- Your notes here -->",
        "",
        "---",
        "",
        "### Q2 \u2014 Edge Case Handling",
        "",
        "Agent-generated code sometimes handles edge cases 'literally' \u2014 correctly",
        "by its training pattern but incorrectly for your specific business context.",
        "",
        "Review edge cases for: empty inputs, null responses from dependencies,",
        "boundary values, unexpected data types, and concurrent access scenarios.",
        "",
        "- [ ] Edge cases are handled with business-logic-aware behavior, not just pattern matching",
        "- [ ] Empty / null / zero-value inputs produce appropriate responses (not silent failures)",
        "- [ ] Boundary values (max/min, empty collections, single items) tested mentally or in code",
        "",
        "_Describe any edge cases found and how they were addressed:_",
        "",
        "<!-- Your notes here -->",
        "",
        "---",
        "",
        "### Q3 \u2014 Invisible Dependencies",
        "",
        "Gate 3 catches URL-based dependency calls. It may miss implicit dependencies:",
        "imported libraries with network calls, SDK client instantiations, or",
        "environment variables suggesting a new external service.",
        "",
        "- [ ] No new library imports that make external network calls",
        "- [ ] No new SDK client instantiations for unregistered services",
        "- [ ] No new environment variables referencing external endpoints or APIs",
        "- [ ] If any of the above: dependency has been added to the registry",
        "",
        "_List any implicit dependencies found and their registry status:_",
        "",
        "<!-- Your notes here -->",
        "",
        "---",
        "",
        "### Q4 \u2014 Feature Specification Compliance",
        "",
        "Does the agent-generated code actually do what the feature is supposed to do",
        "for the failure modes and edge cases in the Feature Specification?",
        "",
        "- [ ] Code behavior matches the Feature Specification for all in-scope failure modes",
        "- [ ] Fallback behaviors match the specification (not the agent\u2019s default pattern)",
        "- [ ] Any deviation from the specification is documented and intentional",
        "",
        "_Note any deviations from the Feature Specification:_",
        "",
        "<!-- Your notes here -->",
        "",
        "---",
        "",
        "### Q5 \u2014 Reviewer Attestation",
        "",
        "- [ ] I have completed all four questions above",
        "- [ ] All three structural gates passed before this review",
        "- [ ] I attest that the agent-generated code in this PR meets the",
        "      Supportability Context Document standard for error handling,",
        "      edge cases, dependency registration, and feature compliance",
        "",
        "**Reviewer:** _______________________  **Date:** _______________",
        "",
        "---",
      ], "1e293b", "e2e8f0"),
      sp(120),

      h1("Reviewer Quick Reference"),
      rule(),
      body("Post this at the top of your team\u2019s PR review guidelines or link to it from the template. It tells reviewers what to look for in each question without having to re-read the full Context Document."),
      sp(80),
      new Table({
        width:{size:9360,type:WidthType.DXA}, columnWidths:[960,2400,3200,2800],
        rows:[
          new TableRow({children:["Q","Question","Most Common Failure","What Good Looks Like"].map(h => new TableCell({borders, shading:{fill:TEAL,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({children:[new TextRun({text:h,font:"Arial",size:18,bold:true,color:WHITE})]})]})) }),
          ...[
            ["Q1","Error Messages","Agent used a template error message that says what failed technically but not what a support engineer should do","'Payment gateway did not respond within 5000ms. The charge was not processed. Check PAYMENT_GATEWAY_TIMEOUT runbook.'"],
            ["Q2","Edge Cases","Agent handled null/empty inputs by returning an empty response with a 200 status, making failures invisible","Null input returns a 400 with INVALID_INPUT error code and a message describing what was missing"],
            ["Q3","Invisible Dependencies","Agent imported a library (e.g. an email SDK) that makes external calls but the library\u2019s domain wasn\u2019t caught by Gate 3","Library identified, its external domain added to dependency-registry.yml in the same PR"],
            ["Q4","Spec Compliance","Agent implemented a fallback that returns stale data silently \u2014 spec required marking the response as degraded","Response includes degraded: true and a staleness_seconds field when serving cached data"],
          ].map(([q,qu,f,g],i) => new TableRow({children:[
            new TableCell({borders, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({alignment:AlignmentType.CENTER, children:[new TextRun({text:q,font:"Arial",size:18,bold:true,color:TEAL})]})]}),
            new TableCell({borders, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({children:[new TextRun({text:qu,font:"Arial",size:18,bold:true,color:NAVY2})]})]}),
            new TableCell({borders, shading:{fill:i%2===0?"fff5f5":"fff5f5",type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({children:[new TextRun({text:f,font:"Arial",size:17,color:REDDARK})]})]}),
            new TableCell({borders, shading:{fill:i%2===0?TEAL2:TEAL2,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({children:[new TextRun({text:g,font:"Arial",size:17,color:GREEN})]})]}),
          ]}))
        ]
      }),
      ...closingLine("3"),
    ]
  }]
});

// ════════════════════════════════════════
// DOCUMENT 4 — FEATURE SPECIFICATION
// ════════════════════════════════════════

const doc4 = new Document({
  numbering:{ config:[{ reference:"bullets", levels:[{ level:0, format:LevelFormat.BULLET, text:"\u2022", alignment:AlignmentType.LEFT, style:{ paragraph:{ indent:{ left:720, hanging:360 } } } }] }] },
  styles:{ default:{ document:{ run:{ font:"Arial", size:20 } } } },
  sections:[{
    properties:{ page:{ size:{ width:12240, height:15840 }, margin:{ top:1440, right:1440, bottom:1440, left:1440 } } },
    headers:{ default: makeHeader("BASELINE SUPPORTABILITY STANDARD  \u2014  FEATURE SPECIFICATION", "Document 4 of 4  |  John A. Bowman  |  2026") },
    footers:{ default: makeFooter("Baseline Supportability Standard  |  Free to use and adapt  |  Supportability Engineering", "dooohhead@gmail.com  |  902-489-2429") },
    children:[
      sp(2000,0),
      new Paragraph({spacing:{before:0,after:60}, children:[new TextRun({text:"BASELINE SUPPORTABILITY STANDARD  \u00B7  DOCUMENT 4 OF 4", font:"Arial",size:20,bold:true,color:TEAL,characterSpacing:200})]}),
      new Paragraph({spacing:{before:0,after:40}, children:[new TextRun({text:"Feature", font:"Arial",size:64,bold:true,color:NAVY})]}),
      new Paragraph({spacing:{before:0,after:40}, children:[new TextRun({text:"Specification", font:"Arial",size:64,bold:true,color:TEAL})]}),
      new Paragraph({spacing:{before:0,after:320}, children:[new TextRun({text:"Per-feature delta  \u2014  What the Context Document can\u2019t know", font:"Arial",size:32,color:NAVY2})]}),
      new Paragraph({border:{bottom:{style:BorderStyle.SINGLE,size:16,color:TEAL,space:1}},spacing:{before:0,after:240},children:[]}),
      body("The Supportability Context Document (Document 1) covers everything that is the same for every feature. This document covers everything that is unique to one specific feature: its failure modes, the dependencies it introduces, how it affects specific customer segments, its escalation path, and the context block addition that gets appended to the baseline injection for agent sessions working on this feature."),
      sp(80,0),
      baselineBox("ONE PAGE PER FEATURE: This specification is intentionally short. If it takes more than an hour to complete, you are capturing too much. The baseline Context Document handles the standards. This document handles only what is different for this specific feature."),
      sp(160,0),
      new Paragraph({spacing:{before:0,after:0}, children:[new TextRun({text:"John A. Bowman  |  dooohhead@gmail.com  \u2022  902-489-2429  |  2026", font:"Arial",size:20,color:DGRAY})]}),

      pb(),
      h1("Feature Specification Template"),
      rule(),
      noteBox("Complete one of these per feature. File it alongside the feature ticket. Attach it to the agent session context alongside the baseline injection block. Update it when operational experience reveals gaps."),

      sp(80),
      h2("F1 — Feature Identity"),
      new Table({
        width:{size:9360,type:WidthType.DXA}, columnWidths:[2800,6560],
        rows:[
          ...["Feature Name","Feature Ticket / Reference","Engineering Owner","Support Owner","Target Release","Context Document Version (from Doc 1)"].map((l,i) => new TableRow({children:[
            new TableCell({borders, shading:{fill:NAVY2,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:140,right:140}, children:[new Paragraph({children:[new TextRun({text:l,font:"Arial",size:19,bold:true,color:WHITE})]})]}),
            new TableCell({borders, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:140,right:140}, children:[new Paragraph({children:[new TextRun({text:" ",font:"Arial",size:19})]})]}),
          ]}))
        ]
      }),

      sp(120),
      h2("F2 — Feature-Specific Failure Modes"),
      noteBox("List only the failure modes unique to this feature. Universal failure modes (timeouts, unavailability, invalid input) are already handled by the baseline Context Document. Only list what is different or additional here."),
      emptyGrid(
        ["Failure Mode","Type","Customer Experience","Expected Error Code","Retryable?"],
        [2400,1200,2000,2000,1760], 6, TEAL
      ),

      sp(120),
      h2("F3 — Feature-Specific Dependencies"),
      noteBox("List only dependencies this feature introduces that are not already in the Context Document Section 7.2 registry. Add these to the registry AND list them here."),
      emptyGrid(
        ["Dependency","Timeout","Fallback Behavior","Circuit Breaker","Owner"],
        [2000,1200,2800,1560,1800], 4, NAVY2
      ),

      sp(120),
      h2("F4 — Customer Impact Classification"),
      noteBox("Define which customer segments use this feature and what the business impact is at each failure severity. This is loaded into your incident management system so triage is automatic."),
      new Table({
        width:{size:9360,type:WidthType.DXA}, columnWidths:[2400,1600,1600,1760,2000],
        rows:[
          new TableRow({children:["Customer Segment","# Customers Affected","Contract Tier","Revenue at Risk ($)","Escalation Level"].map(h => new TableCell({borders, shading:{fill:TEAL,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({children:[new TextRun({text:h,font:"Arial",size:18,bold:true,color:WHITE})]})]})) }),
          ...["Enterprise","Mid-Market","SMB","Free / Trial"].map((s,i) => new TableRow({children:[
            new TableCell({borders, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({children:[new TextRun({text:s,font:"Arial",size:18,bold:true,color:NAVY2})]})]}),
            ...Array(4).fill(null).map(() => new TableCell({borders, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:100,bottom:100,left:100,right:100}, children:[new Paragraph({children:[new TextRun({text:" ",font:"Arial",size:18})]})]})),
          ]}))
        ]
      }),

      sp(120),
      h2("F5 — Escalation Path"),
      new Table({
        width:{size:9360,type:WidthType.DXA}, columnWidths:[2800,6560],
        rows:[
          ...["Primary support owner for this feature","Engineering escalation contact","On-call coverage required? (Yes / No)","Escalation triggers engineering at severity","Customer communication triggers at severity"].map((l,i) => new TableRow({children:[
            new TableCell({borders, shading:{fill:NAVY2,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:140,right:140}, children:[new Paragraph({children:[new TextRun({text:l,font:"Arial",size:19,bold:true,color:WHITE})]})]}),
            new TableCell({borders, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:140,right:140}, children:[new Paragraph({children:[new TextRun({text:" ",font:"Arial",size:19})]})]}),
          ]}))
        ]
      }),

      sp(120),
      h2("F6 — Context Block Addition"),
      noteBox("This is the feature-specific addition to the baseline Agent Injection Block. Append this text to the end of the baseline injection block (Document 1, Section 8) for all agent sessions working on this feature. Keep it concise \u2014 the baseline covers the standards, this covers only what is unique."),
      codeBlock([
        "=== FEATURE-SPECIFIC REQUIREMENTS: [FEATURE NAME] ===",
        "",
        "FEATURE DESCRIPTION:",
        "[One sentence: what this feature does and why it exists]",
        "",
        "FAILURE MODES TO HANDLE (in addition to universal modes):",
        "- [Failure mode 1]: Handle as [transient/permanent], error code: [CODE], message: '[message]'",
        "- [Failure mode 2]: Handle as [transient/permanent], error code: [CODE], message: '[message]'",
        "",
        "NEW DEPENDENCIES FOR THIS FEATURE:",
        "- [Dependency name]: timeout [Xms], fallback: [description], circuit breaker: required",
        "",
        "CUSTOMER IMPACT CONTEXT:",
        "- This feature affects [enterprise / mid-market / SMB] customers",
        "- Failure impacts SLA for [customer tier]",
        "",
        "FEATURE-SPECIFIC SENSITIVE DATA (in addition to baseline list):",
        "- [Any field specific to this feature that must not be logged]",
        "",
        "=== END FEATURE-SPECIFIC REQUIREMENTS ===",
      ]),

      sp(120),
      h2("F7 — Quarterly Review Record"),
      noteBox("Each quarter, review this specification against what actually happened in production. Update any section where the specification did not match reality. Increment the version and note what changed."),
      new Table({
        width:{size:9360,type:WidthType.DXA}, columnWidths:[960,1400,2000,5000],
        rows:[
          new TableRow({children:["Version","Review Date","Reviewed By","What Changed and Why"].map(h => new TableCell({borders, shading:{fill:TEAL,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({children:[new TextRun({text:h,font:"Arial",size:18,bold:true,color:WHITE})]})]})) }),
          new TableRow({children:[
            new TableCell({borders, shading:{fill:TEAL2,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({children:[new TextRun({text:"1.0",font:"Arial",size:18,bold:true,color:TEAL})]})]}),
            new TableCell({borders, shading:{fill:TEAL2,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({children:[new TextRun({text:" ",font:"Arial",size:18})]})]}),
            new TableCell({borders, shading:{fill:TEAL2,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({children:[new TextRun({text:" ",font:"Arial",size:18})]})]}),
            new TableCell({borders, shading:{fill:TEAL2,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({children:[new TextRun({text:"Initial specification",font:"Arial",size:18,color:DGRAY})]})]}),
          ]}),
          ...Array(5).fill(null).map((_,i) => new TableRow({children:Array(4).fill(null).map(() => new TableCell({borders, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:100,bottom:100,left:100,right:100}, children:[new Paragraph({children:[new TextRun({text:" ",font:"Arial",size:18})]})]}))}))
        ]
      }),

      sp(80),
      h2("F8 — Sign-Off"),
      noteBox("Both engineering and support sign this specification before any agent session begins on this feature. It takes fifteen minutes. It prevents the first incident from also being an orientation."),
      new Table({
        width:{size:9360,type:WidthType.DXA}, columnWidths:[3120,3120,3120],
        rows:[
          new TableRow({children:["Engineering Owner","Support Owner","QA / Release"].map(r => new TableCell({borders, shading:{fill:TEAL,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:120,right:120}, children:[new Paragraph({children:[new TextRun({text:r,font:"Arial",size:18,bold:true,color:WHITE})]})]})) }),
          new TableRow({children:Array(3).fill(null).map(() => new TableCell({borders, shading:{fill:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:120,right:120}, children:[
            new Paragraph({spacing:{before:0,after:40}, children:[new TextRun({text:"Name:",font:"Arial",size:18,color:DGRAY})]}),
            new Paragraph({spacing:{before:0,after:40}, children:[new TextRun({text:"Signature:",font:"Arial",size:18,color:DGRAY})]}),
            new Paragraph({spacing:{before:0,after:0},  children:[new TextRun({text:"Date:",font:"Arial",size:18,color:DGRAY})]})
          ]}))})
        ]
      }),

      pb(),
      h1("Using the Four Documents Together"),
      rule(),
      body("The four documents in this kit work as a system. Here is how they connect in practice."),
      sp(80),
      new Table({
        width:{size:9360,type:WidthType.DXA}, columnWidths:[480,2000,3480,3400],
        rows:[
          new TableRow({children:["#","Document","When It\u2019s Used","Who Uses It"].map(h => new TableCell({borders, shading:{fill:NAVY,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({children:[new TextRun({text:h,font:"Arial",size:18,bold:true,color:WHITE})]})]})) }),
          ...[
            ["1","Supportability Context Document","Injected into every agent session. Reviewed when operational experience reveals a gap. Updated quarterly.","Set up once by engineering lead + support lead. Agent consumes it every session."],
            ["2","Gate Configuration Spec","Added to the CI/CD pipeline once. Runs automatically on every agent-generated PR thereafter.","Set up once by a DevOps or platform engineer. Runs without human involvement."],
            ["3","PR Template Addition","Appears in every PR. Human reviewer completes the five questions for agent-generated code.","Human code reviewer. Takes 5\u201310 minutes per PR after gates have passed."],
            ["4","Feature Specification","Completed before agent sessions begin for a new feature. Appended to the baseline injection block. Updated quarterly.","Engineering owner + support owner. Fifteen minutes per feature."],
          ].map(([n,d,w,wh],i) => new TableRow({children:[
            new TableCell({borders, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({alignment:AlignmentType.CENTER, children:[new TextRun({text:n,font:"Arial",size:18,bold:true,color:TEAL})]})]}),
            new TableCell({borders, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({children:[new TextRun({text:d,font:"Arial",size:18,bold:true,color:NAVY2})]})]}),
            new TableCell({borders, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({children:[new TextRun({text:w,font:"Arial",size:18,color:DGRAY})]})]}),
            new TableCell({borders, shading:{fill:i%2===0?TEAL2:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({children:[new TextRun({text:wh,font:"Arial",size:18,color:DGRAY})]})]}),
          ]}))
        ]
      }),
      sp(120),
      noteBox("Total setup time for all four documents: approximately one working day. Document 1 takes the most time — 2\u20134 hours to review and complete Section 7. Documents 2, 3, and 4 take 1\u20132 hours combined. After setup, the ongoing overhead is: 5\u201310 minutes per PR (Doc 3), 15 minutes per new feature (Doc 4), and a 1-hour quarterly review (update Doc 1 Section 7 and any Feature Specifications where gaps were found)."),
      sp(120),
      h2("What to Do When You Find a Gap"),
      body("When a production incident reveals that the agent produced code that did not meet the supportability standard, the update process is straightforward:"),
      sp(40),
      new Table({
        width:{size:9360,type:WidthType.DXA}, columnWidths:[480,2400,6480],
        rows:[
          new TableRow({children:["Step","Action","Details"].map(h => new TableCell({borders, shading:{fill:TEAL,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({children:[new TextRun({text:h,font:"Arial",size:18,bold:true,color:WHITE})]})]})) }),
          ...[
            ["1","Identify the gap type","Was it a logging gap, a missing error code, an unregistered dependency, a sensitive data exposure, or a failure mode not handled?"],
            ["2","Update the right document","Logging/error/dependency gap \u2192 Update Doc 1 Section 1\u20134. Feature-specific gap \u2192 Update Doc 4. Gate missed it \u2192 Update Doc 2 pattern list or registry."],
            ["3","Increment the version","Update the version number in the document and the header. Note what changed and why in the version history table."],
            ["4","Update the injection block","If Doc 1 was updated, update the Agent Injection Block in Section 8 to reflect the change. This is what the agent will use in future sessions."],
            ["5","Notify the team","Let engineers know the standard has been updated. New sessions will automatically use the updated context. Existing code may need a follow-up PR."],
          ].map(([s,a,d],i) => new TableRow({children:[
            new TableCell({borders, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({alignment:AlignmentType.CENTER, children:[new TextRun({text:s,font:"Arial",size:18,bold:true,color:TEAL})]})]}),
            new TableCell({borders, shading:{fill:i%2===0?MGRAY:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({children:[new TextRun({text:a,font:"Arial",size:18,bold:true,color:NAVY2})]})]}),
            new TableCell({borders, shading:{fill:i%2===0?TEAL2:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({children:[new TextRun({text:d,font:"Arial",size:18,color:DGRAY})]})]}),
          ]}))
        ]
      }),
      ...closingLine("4"),
    ]
  }]
});

// Build all three
Promise.all([
  Packer.toBuffer(doc2).then(buf => { fs.writeFileSync('/home/claude/SE_Baseline_2_GateConfigSpec.docx', buf); console.log('Done Doc 2'); }),
  Packer.toBuffer(doc3).then(buf => { fs.writeFileSync('/home/claude/SE_Baseline_3_PRTemplateAddition.docx', buf); console.log('Done Doc 3'); }),
  Packer.toBuffer(doc4).then(buf => { fs.writeFileSync('/home/claude/SE_Baseline_4_FeatureSpecification.docx', buf); console.log('Done Doc 4'); }),
]).then(() => console.log('All done'));
