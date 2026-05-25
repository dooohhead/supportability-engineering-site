const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageNumber, PageNumberElement, PageBreak, SimpleField, LevelFormat,
  TabStopType, TabStopPosition
} = require('docx');
const fs = require('fs');

// ─── SHARED HELPERS ──────────────────────────────────────────────────────────

const NAVY   = '0F2340';
const NAVY2  = '1B3A5C';
const GOLD   = 'C9993A';
const GREEN  = '0F766E';
const WHITE  = 'FFFFFF';
const LGRAY  = 'F2F2F2';
const MGRAY  = 'D9D9D9';
const BLACK  = '000000';

const border = (color = 'CCCCCC') => ({ style: BorderStyle.SINGLE, size: 1, color });
const borders = (color = 'CCCCCC') => ({ top: border(color), bottom: border(color), left: border(color), right: border(color) });
const noBorder = () => ({ style: BorderStyle.NONE, size: 0, color: 'FFFFFF' });
const noBorders = () => ({ top: noBorder(), bottom: noBorder(), left: noBorder(), right: noBorder() });

const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };

function hdr(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({ heading: level, children: [new TextRun(text)] });
}

function para(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    ...opts,
    children: [new TextRun({ text, font: 'Arial', size: 22, ...opts.run })]
  });
}

function bold(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    ...opts,
    children: [new TextRun({ text, font: 'Arial', size: 22, bold: true, ...opts.run })]
  });
}

function spacer(lines = 1) {
  return Array.from({ length: lines }, () =>
    new Paragraph({ children: [new TextRun('')], spacing: { before: 0, after: 0 } })
  );
}

function cell(text, opts = {}) {
  const {
    bold: isBold = false, shade = null, color = null,
    width = 4680, colspan = 1, textColor = BLACK, size = 20,
    align = AlignmentType.LEFT, valign = VerticalAlign.CENTER,
    italic = false
  } = opts;
  return new TableCell({
    columnSpan: colspan,
    borders: borders(opts.borderColor || 'CCCCCC'),
    width: { size: width, type: WidthType.DXA },
    shading: shade ? { fill: shade, type: ShadingType.CLEAR } : undefined,
    margins: cellMargins,
    verticalAlign: valign,
    children: [new Paragraph({
      alignment: align,
      spacing: { before: 40, after: 40 },
      children: [new TextRun({ text, font: 'Arial', size, bold: isBold, italic, color: textColor })]
    })]
  });
}

function makeHeader(docTitle, phase) {
  return new Header({
    children: [
      new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: GREEN, space: 1 } },
        spacing: { before: 0, after: 120 },
        tabStops: [{ type: TabStopType.RIGHT, position: 9360 }],
        children: [
          new TextRun({ text: `Supportability Engineering  |  ${docTitle}`, font: 'Arial', size: 18, bold: true, color: NAVY }),
          new TextRun({ text: '\t', font: 'Arial', size: 18 }),
          new TextRun({ text: phase, font: 'Arial', size: 18, italic: true, color: '666666' }),
        ]
      })
    ]
  });
}

function makeFooter() {
  return new Footer({
    children: [
      new Paragraph({
        border: { top: { style: BorderStyle.SINGLE, size: 6, color: GREEN, space: 1 } },
        spacing: { before: 120, after: 0 },
        tabStops: [{ type: TabStopType.RIGHT, position: 9360 }],
        children: [
          new TextRun({ text: 'John A. Bowman  |  Supportability Engineering  |  Confidential', font: 'Arial', size: 16, color: '666666' }),
          new TextRun({ text: '\t', font: 'Arial', size: 16 }),
          new TextRun({ text: 'Page ', font: 'Arial', size: 16, color: '666666' }),
          new SimpleField("PAGE"),
        ]
      })
    ]
  });
}

function titleBlock(title, subtitle, docNum) {
  return [
    new Paragraph({
      spacing: { before: 0, after: 0 },
      shading: { fill: NAVY, type: ShadingType.CLEAR },
      children: [new TextRun({ text: '', size: 48 })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      shading: { fill: NAVY, type: ShadingType.CLEAR },
      spacing: { before: 200, after: 40 },
      children: [new TextRun({ text: 'SUPPORTABILITY ENGINEERING', font: 'Arial', size: 28, bold: true, color: GOLD })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      shading: { fill: NAVY, type: ShadingType.CLEAR },
      spacing: { before: 40, after: 40 },
      children: [new TextRun({ text: 'Compliance Baseline Standards Kit', font: 'Arial', size: 22, color: WHITE })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      shading: { fill: NAVY, type: ShadingType.CLEAR },
      spacing: { before: 40, after: 40 },
      children: [new TextRun({ text: `${docNum}  —  ${title}`, font: 'Arial', size: 32, bold: true, color: WHITE })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      shading: { fill: NAVY, type: ShadingType.CLEAR },
      spacing: { before: 40, after: 200 },
      children: [new TextRun({ text: subtitle, font: 'Arial', size: 20, italic: true, color: 'AAAAAA' })]
    }),
    new Paragraph({
      shading: { fill: GREEN, type: ShadingType.CLEAR },
      spacing: { before: 0, after: 0 },
      children: [new TextRun({ text: '', size: 16 })]
    }),
    ...spacer(1),
  ];
}

function metaTable(rows) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [2400, 6960],
    rows: rows.map(([label, value]) => new TableRow({
      children: [
        cell(label, { width: 2400, bold: true, shade: LGRAY }),
        cell(value, { width: 6960 }),
      ]
    }))
  });
}

function sectionHeading(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, font: 'Arial', size: 26, bold: true, color: NAVY })]
  });
}

function subHeading(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, font: 'Arial', size: 23, bold: true, color: GREEN })]
  });
}

function noteBox(text) {
  return new Paragraph({
    border: {
      left: { style: BorderStyle.SINGLE, size: 12, color: GREEN, space: 4 }
    },
    shading: { fill: 'F0F9F8', type: ShadingType.CLEAR },
    spacing: { before: 120, after: 120 },
    indent: { left: 360 },
    children: [new TextRun({ text, font: 'Arial', size: 20, italic: true, color: '1B3A5C' })]
  });
}

function checkRow(text, required = true) {
  return new TableRow({
    children: [
      cell('☐', { width: 400, align: AlignmentType.CENTER }),
      cell(text, { width: 7560 }),
      cell(required ? 'Required' : 'If applicable', {
        width: 1400, bold: true,
        shade: required ? 'E8F0FE' : 'FFF8E1',
        textColor: required ? '1B4DB5' : '7A5A00',
        align: AlignmentType.CENTER
      }),
    ]
  });
}

function checkSection(label) {
  return new TableRow({
    children: [
      new TableCell({
        columnSpan: 3,
        borders: borders(NAVY2),
        shading: { fill: NAVY2, type: ShadingType.CLEAR },
        margins: cellMargins,
        children: [new Paragraph({
          children: [new TextRun({ text: `  ${label}`, font: 'Arial', size: 20, bold: true, color: WHITE })]
        })]
      })
    ]
  });
}

function checkTable(sections) {
  const rows = [];
  for (const [sectionLabel, items] of sections) {
    rows.push(checkSection(sectionLabel));
    for (const [text, required] of items) {
      rows.push(checkRow(text, required));
    }
  }
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [400, 7560, 1400],
    rows
  });
}

const pageProps = {
  size: { width: 12240, height: 15840 },
  margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 }
};

const docStyles = {
  default: { document: { run: { font: 'Arial', size: 22 } } },
  paragraphStyles: [
    { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
      run: { size: 26, bold: true, font: 'Arial', color: NAVY },
      paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 0 } },
    { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
      run: { size: 23, bold: true, font: 'Arial', color: GREEN },
      paragraph: { spacing: { before: 180, after: 80 }, outlineLevel: 1 } },
  ]
};

// ─── DOC 1: COMPLIANCE CONTEXT DOCUMENT ──────────────────────────────────────

function buildDoc1() {
  const header = makeHeader('Compliance Context Document', 'Vol. 5 Baseline — Doc 1');
  const footer = makeFooter();

  const sections = [{
    properties: { page: pageProps },
    headers: { default: header },
    footers: { default: footer },
    children: [
      ...titleBlock('Compliance Context Document', 'Scope profiles, control mappings, org overrides, and agent injection', 'Doc 1'),

      metaTable([
        ['Framework Author', 'John A. Bowman'],
        ['Version', '1.0'],
        ['Date', 'May 2026'],
        ['Classification', 'Confidential — Consulting IP'],
        ['Contact', 'dooohhead@gmail.com  |  902-489-2429'],
        ['Org Name', ''],
        ['Completed By', ''],
        ['Date Completed', ''],
      ]),
      ...spacer(1),

      // ── SECTION 1 ──
      sectionHeading('1.  Purpose and Scope'),
      para('This document is the compliance anchor for Supportability Engineering Volume 5. It defines which compliance frameworks apply to your organization, maps those frameworks to the SE phase deliverables, and provides the pre-populated standards your teams reference throughout the development lifecycle.'),
      para('Every C- template deliverable (C-SRD, C-SAR, C-SIC, C-STP, C-SRR, C-SFL) references this document. It does not replace the base SE deliverables — it extends them. Section 7 is the only section requiring org-specific input. Section 8 is the ready-to-paste agent injection block for agentic development workflows.'),
      noteBox('Compliance by design means the same thing as supportability by design: the cost of retrofitting grows exponentially the later the gap is found. A missing audit trail discovered at architecture review costs hours. The same gap discovered during a SOC 2 audit costs weeks.'),
      ...spacer(1),

      // ── SECTION 2 ──
      sectionHeading('2.  Compliance Scope Profile'),
      para('Select the profile that matches your organization\'s regulatory obligations. The profile determines which C- template extensions apply to each feature. Profile selection is confirmed at C-SRD and reviewed at C-SRR.'),
      ...spacer(1),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [800, 2800, 5760],
        rows: [
          new TableRow({
            children: [
              cell('Profile', { width: 800, bold: true, shade: NAVY, textColor: WHITE }),
              cell('Condition', { width: 2800, bold: true, shade: NAVY, textColor: WHITE }),
              cell('C- Extensions Required', { width: 5760, bold: true, shade: NAVY, textColor: WHITE }),
            ]
          }),
          new TableRow({ children: [
            cell('0', { width: 800, shade: LGRAY }),
            cell('No regulated data', { width: 2800 }),
            cell('Base SE only — no C- extensions required', { width: 5760 }),
          ]}),
          new TableRow({ children: [
            cell('1', { width: 800, shade: LGRAY }),
            cell('Personal data (GDPR / CCPA)', { width: 2800 }),
            cell('C-SRD · C-SIC · C-SRR (+ C-STP if breach notification applies)', { width: 5760 }),
          ]}),
          new TableRow({ children: [
            cell('2', { width: 800, shade: LGRAY }),
            cell('Financial reporting (SOX)', { width: 2800 }),
            cell('C-SRD · C-SRR (three-signature)', { width: 5760 }),
          ]}),
          new TableRow({ children: [
            cell('3', { width: 800, shade: LGRAY }),
            cell('SOC 2 / ISO 27001 audit scope', { width: 2800 }),
            cell('C-SRD · C-STP · C-SRR', { width: 5760 }),
          ]}),
          new TableRow({ children: [
            cell('4', { width: 800, shade: LGRAY }),
            cell('Full regulated stack', { width: 2800 }),
            cell('C-SRD · C-SAR · C-SIC · C-STP · C-SRR · C-SFL', { width: 5760 }),
          ]}),
          new TableRow({ children: [
            cell('5', { width: 800, shade: LGRAY }),
            cell('FedRAMP boundary', { width: 2800 }),
            cell('Full C- stack + evidence package + regulatory notification log', { width: 5760 }),
          ]}),
        ]
      }),
      ...spacer(1),
      subHeading('2.1  Organization Profile Selection'),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3000, 6360],
        rows: [
          new TableRow({ children: [cell('Selected Profile', { width: 3000, bold: true, shade: LGRAY }), cell('', { width: 6360 })] }),
          new TableRow({ children: [cell('Applicable Frameworks', { width: 3000, bold: true, shade: LGRAY }), cell('SOC 2  /  ISO 27001  /  GDPR  /  CCPA  /  SOX  /  FedRAMP  (circle all that apply)', { width: 6360, italic: true })] }),
          new TableRow({ children: [cell('Confirmed By', { width: 3000, bold: true, shade: LGRAY }), cell('', { width: 6360 })] }),
          new TableRow({ children: [cell('Date', { width: 3000, bold: true, shade: LGRAY }), cell('', { width: 6360 })] }),
        ]
      }),
      ...spacer(1),

      // ── SECTION 3 ──
      sectionHeading('3.  Framework Control Mappings'),
      para('These mappings are pre-populated. They define which regulatory controls each SE phase satisfies. Use these at C-SRD to confirm which controls apply to each feature, and at C-SRR to confirm evidence of compliance.'),
      ...spacer(1),

      subHeading('3.1  SOC 2'),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2000, 2200, 5160],
        rows: [
          new TableRow({ children: [
            cell('Control', { width: 2000, bold: true, shade: NAVY2, textColor: WHITE }),
            cell('SE Phase', { width: 2200, bold: true, shade: NAVY2, textColor: WHITE }),
            cell('Description', { width: 5160, bold: true, shade: NAVY2, textColor: WHITE }),
          ]}),
          new TableRow({ children: [cell('CC7.2', { width: 2000 }), cell('SIC / STP', { width: 2200 }), cell('Anomaly and incident detection', { width: 5160 })] }),
          new TableRow({ children: [cell('CC7.3', { width: 2000 }), cell('SRD / SRR', { width: 2200 }), cell('Incident response and recovery', { width: 5160 })] }),
          new TableRow({ children: [cell('CC8.1', { width: 2000 }), cell('SAR / SIC', { width: 2200 }), cell('Change management controls', { width: 5160 })] }),
          new TableRow({ children: [cell('A1.2', { width: 2000 }), cell('STP / SRR', { width: 2200 }), cell('Availability — capacity and performance', { width: 5160 })] }),
          new TableRow({ children: [cell('C1.1', { width: 2000 }), cell('SRD / SIC', { width: 2200 }), cell('Confidentiality — data classification', { width: 5160 })] }),
        ]
      }),
      ...spacer(1),

      subHeading('3.2  ISO 27001'),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2000, 2200, 5160],
        rows: [
          new TableRow({ children: [
            cell('Control', { width: 2000, bold: true, shade: NAVY2, textColor: WHITE }),
            cell('SE Phase', { width: 2200, bold: true, shade: NAVY2, textColor: WHITE }),
            cell('Description', { width: 5160, bold: true, shade: NAVY2, textColor: WHITE }),
          ]}),
          new TableRow({ children: [cell('A.12.4', { width: 2000 }), cell('SIC', { width: 2200 }), cell('Logging and monitoring', { width: 5160 })] }),
          new TableRow({ children: [cell('A.16.1', { width: 2000 }), cell('SRD / SRR', { width: 2200 }), cell('Incident management', { width: 5160 })] }),
          new TableRow({ children: [cell('A.14.2.8', { width: 2000 }), cell('STP', { width: 2200 }), cell('System security testing', { width: 5160 })] }),
          new TableRow({ children: [cell('A.15.1', { width: 2000 }), cell('SAR', { width: 2200 }), cell('Supplier relationships', { width: 5160 })] }),
          new TableRow({ children: [cell('A.18.1', { width: 2000 }), cell('SRD / SRR', { width: 2200 }), cell('Legal and regulatory compliance', { width: 5160 })] }),
        ]
      }),
      ...spacer(1),

      subHeading('3.3  GDPR'),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2000, 2200, 5160],
        rows: [
          new TableRow({ children: [
            cell('Article', { width: 2000, bold: true, shade: NAVY2, textColor: WHITE }),
            cell('SE Phase', { width: 2200, bold: true, shade: NAVY2, textColor: WHITE }),
            cell('Description', { width: 5160, bold: true, shade: NAVY2, textColor: WHITE }),
          ]}),
          new TableRow({ children: [cell('Art. 25', { width: 2000 }), cell('SRD / SAR', { width: 2200 }), cell('Privacy by design and by default', { width: 5160 })] }),
          new TableRow({ children: [cell('Art. 32', { width: 2000 }), cell('SIC / STP', { width: 2200 }), cell('Security of processing', { width: 5160 })] }),
          new TableRow({ children: [cell('Art. 33', { width: 2000 }), cell('SRD / SRR', { width: 2200 }), cell('72-hour breach notification', { width: 5160 })] }),
          new TableRow({ children: [cell('Art. 35', { width: 2000 }), cell('SAR', { width: 2200 }), cell('Data protection impact assessment (DPIA)', { width: 5160 })] }),
          new TableRow({ children: [cell('Art. 5(2)', { width: 2000 }), cell('SFL', { width: 2200 }), cell('Accountability — ongoing demonstration', { width: 5160 })] }),
        ]
      }),
      ...spacer(1),

      subHeading('3.4  SOX'),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2000, 2200, 5160],
        rows: [
          new TableRow({ children: [
            cell('Control Area', { width: 2000, bold: true, shade: NAVY2, textColor: WHITE }),
            cell('SE Phase', { width: 2200, bold: true, shade: NAVY2, textColor: WHITE }),
            cell('Description', { width: 5160, bold: true, shade: NAVY2, textColor: WHITE }),
          ]}),
          new TableRow({ children: [cell('ITGC — Change Mgmt', { width: 2000 }), cell('SIC / SRR', { width: 2200 }), cell('IT general controls — change management', { width: 5160 })] }),
          new TableRow({ children: [cell('ITGC — Access', { width: 2000 }), cell('SRD / SAR', { width: 2200 }), cell('Access controls and segregation', { width: 5160 })] }),
          new TableRow({ children: [cell('ITGC — Operations', { width: 2000 }), cell('STP / SRR', { width: 2200 }), cell('Operational controls and monitoring', { width: 5160 })] }),
          new TableRow({ children: [cell('Sec. 302 Certification', { width: 2000 }), cell('SRR', { width: 2200 }), cell('Management certification of controls', { width: 5160 })] }),
        ]
      }),
      ...spacer(1),

      subHeading('3.5  FedRAMP'),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2000, 2200, 5160],
        rows: [
          new TableRow({ children: [
            cell('Control', { width: 2000, bold: true, shade: NAVY2, textColor: WHITE }),
            cell('SE Phase', { width: 2200, bold: true, shade: NAVY2, textColor: WHITE }),
            cell('Description', { width: 5160, bold: true, shade: NAVY2, textColor: WHITE }),
          ]}),
          new TableRow({ children: [cell('AU-2 / AU-12', { width: 2000 }), cell('SIC', { width: 2200 }), cell('Audit event logging', { width: 5160 })] }),
          new TableRow({ children: [cell('IR-3 / IR-4', { width: 2000 }), cell('STP / SRR', { width: 2200 }), cell('Incident testing and handling', { width: 5160 })] }),
          new TableRow({ children: [cell('CM-3 / CM-4', { width: 2000 }), cell('SAR / SIC', { width: 2200 }), cell('Configuration and change control', { width: 5160 })] }),
          new TableRow({ children: [cell('CA-7', { width: 2000 }), cell('SFL', { width: 2200 }), cell('Continuous monitoring', { width: 5160 })] }),
          new TableRow({ children: [cell('SA-11', { width: 2000 }), cell('STP', { width: 2200 }), cell('Developer security testing', { width: 5160 })] }),
        ]
      }),
      ...spacer(1),

      // ── SECTION 4 ──
      sectionHeading('4.  C- Template Extension Map'),
      para('This table confirms which C- template addenda are required at each phase for each compliance profile. Use this as a checklist at the start of each development cycle.'),
      ...spacer(1),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [1500, 1260, 1260, 1260, 1260, 1260, 1260],
        rows: [
          new TableRow({ children: [
            cell('Profile', { width: 1500, bold: true, shade: NAVY, textColor: WHITE }),
            cell('C-SRD', { width: 1260, bold: true, shade: NAVY, textColor: WHITE, align: AlignmentType.CENTER }),
            cell('C-SAR', { width: 1260, bold: true, shade: NAVY, textColor: WHITE, align: AlignmentType.CENTER }),
            cell('C-SIC', { width: 1260, bold: true, shade: NAVY, textColor: WHITE, align: AlignmentType.CENTER }),
            cell('C-STP', { width: 1260, bold: true, shade: NAVY, textColor: WHITE, align: AlignmentType.CENTER }),
            cell('C-SRR', { width: 1260, bold: true, shade: NAVY, textColor: WHITE, align: AlignmentType.CENTER }),
            cell('C-SFL', { width: 1260, bold: true, shade: NAVY, textColor: WHITE, align: AlignmentType.CENTER }),
          ]}),
          ...[
            ['0 — No regulated data', '—', '—', '—', '—', '—', '—'],
            ['1 — GDPR / CCPA', '✓', '—', '✓', 'if req', '✓', '—'],
            ['2 — SOX', '✓', '—', '—', '—', '✓', '—'],
            ['3 — SOC 2 / ISO 27001', '✓', '—', '—', '✓', '✓', '—'],
            ['4 — Full regulated stack', '✓', '✓', '✓', '✓', '✓', '✓'],
            ['5 — FedRAMP', '✓', '✓', '✓', '✓', '✓', '✓'],
          ].map(([profile, ...checks]) => new TableRow({
            children: [
              cell(profile, { width: 1500 }),
              ...checks.map(v => cell(v, { width: 1260, align: AlignmentType.CENTER, shade: v === '✓' ? 'E8F8F5' : v === '—' ? 'F5F5F5' : 'FFF8E1' }))
            ]
          }))
        ]
      }),
      ...spacer(1),

      // ── SECTION 5 ──
      sectionHeading('5.  Data Classification Standards'),
      para('Use this classification scheme consistently across all C- deliverables. Every SRD must identify the highest classification level of data the feature touches.'),
      ...spacer(1),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [1800, 2400, 5160],
        rows: [
          new TableRow({ children: [
            cell('Level', { width: 1800, bold: true, shade: NAVY2, textColor: WHITE }),
            cell('Type', { width: 2400, bold: true, shade: NAVY2, textColor: WHITE }),
            cell('Examples', { width: 5160, bold: true, shade: NAVY2, textColor: WHITE }),
          ]}),
          new TableRow({ children: [cell('DC-1  Public', { width: 1800 }), cell('No restriction', { width: 2400 }), cell('Marketing content, public documentation', { width: 5160 })] }),
          new TableRow({ children: [cell('DC-2  Internal', { width: 1800 }), cell('Internal use only', { width: 2400 }), cell('Internal procedures, non-sensitive operational data', { width: 5160 })] }),
          new TableRow({ children: [cell('DC-3  Confidential', { width: 1800 }), cell('Business sensitive', { width: 2400 }), cell('Customer data, financial records, contracts', { width: 5160 })] }),
          new TableRow({ children: [cell('DC-4  Regulated', { width: 1800 }), cell('Legally protected', { width: 2400 }), cell('PII, PHI, financial reporting data, government data', { width: 5160 })] }),
          new TableRow({ children: [cell('DC-5  Restricted', { width: 1800 }), cell('Highest protection', { width: 2400 }), cell('Cryptographic keys, credentials, FedRAMP CUI', { width: 5160 })] }),
        ]
      }),
      ...spacer(1),

      // ── SECTION 6 ──
      sectionHeading('6.  Breach and Incident Notification Thresholds'),
      para('These thresholds are pre-populated based on regulatory requirements. Confirm applicability for your organization at C-SRD. Actual notification timelines must be validated with legal counsel.'),
      ...spacer(1),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2000, 2200, 2000, 3160],
        rows: [
          new TableRow({ children: [
            cell('Framework', { width: 2000, bold: true, shade: NAVY2, textColor: WHITE }),
            cell('Notification Target', { width: 2200, bold: true, shade: NAVY2, textColor: WHITE }),
            cell('Timeline', { width: 2000, bold: true, shade: NAVY2, textColor: WHITE }),
            cell('SE Phase Responsible', { width: 3160, bold: true, shade: NAVY2, textColor: WHITE }),
          ]}),
          new TableRow({ children: [cell('GDPR', { width: 2000 }), cell('Supervisory authority', { width: 2200 }), cell('72 hours', { width: 2000 }), cell('SRD (define trigger) · SRR (confirm readiness)', { width: 3160 })] }),
          new TableRow({ children: [cell('GDPR', { width: 2000 }), cell('Data subjects', { width: 2200 }), cell('Without undue delay', { width: 2000 }), cell('SRD (template) · SRR (approve template)', { width: 3160 })] }),
          new TableRow({ children: [cell('CCPA', { width: 2000 }), cell('Affected consumers', { width: 2200 }), cell('Expedient', { width: 2000 }), cell('SRD (define trigger) · SRR (confirm readiness)', { width: 3160 })] }),
          new TableRow({ children: [cell('HIPAA', { width: 2000 }), cell('HHS / individuals', { width: 2200 }), cell('60 days', { width: 2000 }), cell('SRD (define trigger) · SRR (confirm readiness)', { width: 3160 })] }),
          new TableRow({ children: [cell('FedRAMP', { width: 2000 }), cell('ISSO / AO / US-CERT', { width: 2200 }), cell('1 hour (High)', { width: 2000 }), cell('SRR (confirm chain) · SFL (log all events)', { width: 3160 })] }),
        ]
      }),
      ...spacer(1),

      // ── SECTION 7 ──
      sectionHeading('7.  Organization-Specific Overrides'),
      noteBox('This is the only section requiring org-specific input. All other sections are pre-populated standards. Complete this section once and reference it from all C- deliverables.'),
      ...spacer(1),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3000, 6360],
        rows: [
          new TableRow({ children: [cell('Organization Name', { width: 3000, bold: true, shade: LGRAY }), cell('', { width: 6360 })] }),
          new TableRow({ children: [cell('Primary Compliance Contact', { width: 3000, bold: true, shade: LGRAY }), cell('', { width: 6360 })] }),
          new TableRow({ children: [cell('Legal / DPO Contact', { width: 3000, bold: true, shade: LGRAY }), cell('', { width: 6360 })] }),
          new TableRow({ children: [cell('Security Contact', { width: 3000, bold: true, shade: LGRAY }), cell('', { width: 6360 })] }),
          new TableRow({ children: [cell('Audit Cycle', { width: 3000, bold: true, shade: LGRAY }), cell('Annual  /  Continuous  /  Other: ______', { width: 6360, italic: true })] }),
          new TableRow({ children: [cell('Retention Policy (logs)', { width: 3000, bold: true, shade: LGRAY }), cell('', { width: 6360 })] }),
          new TableRow({ children: [cell('Retention Policy (audit evidence)', { width: 3000, bold: true, shade: LGRAY }), cell('', { width: 6360 })] }),
          new TableRow({ children: [cell('Additional Frameworks', { width: 3000, bold: true, shade: LGRAY }), cell('', { width: 6360 })] }),
          new TableRow({ children: [cell('Org-Specific Overrides', { width: 3000, bold: true, shade: LGRAY }), cell('List any control mappings, thresholds, or requirements that differ from the pre-populated standards in this document.', { width: 6360, italic: true })] }),
        ]
      }),
      ...spacer(1),

      // ── SECTION 8 ──
      sectionHeading('8.  Agent Injection Block'),
      para('Paste this block into the system prompt of any agentic development tool (Claude Code, Cursor, Copilot) to enforce compliance-aware supportability standards on all generated code.'),
      noteBox('This block extends the base SE agent injection from SE_Baseline_1_ContextDocument.docx. Both blocks should be present when using agentic development tools in a compliance-scoped environment.'),
      ...spacer(1),
      new Paragraph({
        shading: { fill: '1E293B', type: ShadingType.CLEAR },
        border: { left: { style: BorderStyle.SINGLE, size: 8, color: GREEN, space: 4 } },
        spacing: { before: 120, after: 60 },
        indent: { left: 0 },
        children: [new TextRun({ text: '  [COMPLIANCE BASELINE — SE Vol. 5]', font: 'Courier New', size: 18, color: GOLD, bold: true })]
      }),
      ...[
        'You are operating in a compliance-scoped environment. In addition to base Supportability Engineering standards, every output must satisfy the following compliance requirements:',
        '',
        'DATA HANDLING',
        '- Never include PII, credentials, tokens, or regulated data in any log output',
        '- Every data write must include an audit trail entry: who, what, when, from where',
        '- Classify every data element touched by this feature against DC-1 through DC-5',
        '- Data at DC-4 or DC-5 must be encrypted at rest and in transit',
        '',
        'AUDIT AND EVIDENCE',
        '- Every significant state change must produce a tamper-evident audit log entry',
        '- Audit logs must be retained per the retention policy in the Compliance Context Document',
        '- Evidence artifacts must be named, timestamped, and linked to the control they satisfy',
        '',
        'BREACH DETECTION',
        '- Instrument alerts for unauthorized access attempts, data exfiltration patterns, and anomalous data access volumes',
        '- Every alert must include: timestamp, affected data classification, affected customer count, and triggering event',
        '- Breach notification timer starts at detection — not at investigation completion',
        '',
        'CHANGE CONTROL',
        '- Every change to a compliance-scoped component must reference a change ticket',
        '- Rollback procedures must be documented and tested before any compliance-scoped release',
        '',
        'DEFAULT BEHAVIOR',
        '- When uncertain whether a compliance control applies, apply it',
        '- Never omit an audit trail entry to reduce log volume',
        '- If a compliance requirement conflicts with a feature requirement, flag it — do not resolve silently',
      ].map(line => new Paragraph({
        shading: { fill: '1E293B', type: ShadingType.CLEAR },
        spacing: { before: 0, after: 0 },
        children: [new TextRun({ text: `  ${line}`, font: 'Courier New', size: 18, color: 'E2E8F0' })]
      })),
      new Paragraph({
        shading: { fill: '1E293B', type: ShadingType.CLEAR },
        spacing: { before: 0, after: 120 },
        children: [new TextRun({ text: '  [END COMPLIANCE BASELINE]', font: 'Courier New', size: 18, color: GOLD, bold: true })]
      }),
      ...spacer(1),

      // ── SIGN-OFF ──
      sectionHeading('9.  Sign-Off'),
      para('Sign-off confirms this document reflects current compliance scope and organizational overrides. Review annually or when applicable regulatory obligations change.'),
      ...spacer(1),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2340, 2340, 2340, 2340],
        rows: [
          new TableRow({ children: [
            cell('Compliance / Legal', { width: 2340, bold: true, shade: NAVY2, textColor: WHITE }),
            cell('Engineering Lead', { width: 2340, bold: true, shade: NAVY2, textColor: WHITE }),
            cell('Security Lead', { width: 2340, bold: true, shade: NAVY2, textColor: WHITE }),
            cell('Framework Owner', { width: 2340, bold: true, shade: NAVY2, textColor: WHITE }),
          ]}),
          new TableRow({ children: [
            cell('Name:\n\nSignature:\n\nVersion:\n\nDate:', { width: 2340 }),
            cell('Name:\n\nSignature:\n\nVersion:\n\nDate:', { width: 2340 }),
            cell('Name:\n\nSignature:\n\nVersion:\n\nDate:', { width: 2340 }),
            cell('Name:\n\nSignature:\n\nVersion:\n\nDate:', { width: 2340 }),
          ]}),
        ]
      }),
    ]
  }];

  return new Document({ styles: docStyles, sections });
}

// ─── DOC 2: COMPLIANCE GATE CONFIG SPEC ──────────────────────────────────────

function buildDoc2() {
  const header = makeHeader('Compliance Gate Config Spec', 'Vol. 5 Baseline — Doc 2');
  const footer = makeFooter();

  const GH_BODY = '${{ github.event.pull_request.body }}';
  const CI_MR_DESC = '$CI_MERGE_REQUEST_DESCRIPTION';
  const CI_COMMIT = '$CI_COMMIT_BRANCH';
  const CI_TARGET = '$CI_MERGE_REQUEST_TARGET_BRANCH_NAME';
  const yamlGate1 = `# SE Compliance Gate 1 — SRD Compliance Review
# Runs at: PR open against feature branches in compliance-scoped repos
# Blocks merge if: C-SRD not completed for feature, or data classification missing

name: SE Compliance Gate 1 - SRD Review
on:
  pull_request:
    branches: [ main, develop, 'feature/**' ]

jobs:
  compliance-srd-check:
    name: C-SRD Compliance Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check C-SRD completion
        run: |
          # Verify C-SRD reference exists in PR description
          if ! echo "` + GH_BODY + `" | grep -q "C-SRD:"; then
            echo "COMPLIANCE GATE BLOCKED: C-SRD reference missing from PR description"
            echo "Add 'C-SRD: [reference number]' to PR description to proceed"
            exit 1
          fi
          # Verify data classification is declared
          if ! echo "` + GH_BODY + `" | grep -qE "DC-[1-5]"; then
            echo "COMPLIANCE GATE BLOCKED: Data classification not declared"
            echo "Add 'Data Classification: DC-[1-5]' to PR description to proceed"
            exit 1
          fi
          echo "C-SRD compliance check passed"`;

  const yamlGate2 = `# SE Compliance Gate 2 — Build-Time Compliance Checks
# Runs at: every commit on compliance-scoped branches
# Blocks merge if: PII in logs detected, audit trail missing, or no-log annotations present

name: SE Compliance Gate 2 - Build Compliance
on:
  push:
    branches: [ main, develop, 'feature/**' ]

jobs:
  compliance-build-check:
    name: C-SIC Compliance Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Scan for PII patterns in log statements
        run: |
          # Detect common PII patterns in log calls — add org-specific patterns here
          PII_PATTERNS="ssn|social.security|credit.card|card.number|password|passwd|secret|api.key"
          if grep -rniE "log\.(info|warn|error|debug).*($PII_PATTERNS)" src/; then
            echo "COMPLIANCE GATE BLOCKED: Potential PII detected in log statements"
            exit 1
          fi
          echo "PII log scan passed"

      - name: Check audit trail instrumentation
        run: |
          # Verify audit trail calls exist for data-write operations
          # Customize DATA_WRITE_PATTERNS for your ORM / DB library
          DATA_WRITE_PATTERNS="\.save\(\|\.create\(\|\.update\(\|\.delete\(\|\.insert\("
          AUDIT_PATTERN="auditLog\|audit_log\|AuditTrail\|writeAudit"
          if grep -rniE "$DATA_WRITE_PATTERNS" src/ | grep -v test; then
            if ! grep -rniE "$AUDIT_PATTERN" src/ | grep -v test; then
              echo "COMPLIANCE WARNING: Data write operations found without audit trail calls"
              echo "Review src/ for missing audit instrumentation"
            fi
          fi
          echo "Audit trail check complete"

      - name: Verify encryption for DC-4/DC-5 data fields
        run: |
          # Check that fields tagged DC-4 or DC-5 use encryption helpers
          # Customize ENCRYPT_PATTERN for your encryption library
          if grep -rniE "@DC4|@DC5|dc_level.*[45]" src/; then
            if ! grep -rniE "encrypt\(|Encrypted\|@Encrypted" src/; then
              echo "COMPLIANCE GATE BLOCKED: DC-4/DC-5 fields without encryption annotation"
              exit 1
            fi
          fi
          echo "Encryption check passed"`;

  const yamlGate3 = `# SE Compliance Gate 3 — Pre-Release Compliance Evidence Check
# Runs at: PR to main/release branches
# Blocks merge if: C-SRR not signed off, evidence artifacts missing

name: SE Compliance Gate 3 - Release Compliance
on:
  pull_request:
    branches: [ main, 'release/**' ]

jobs:
  compliance-release-check:
    name: C-SRR Compliance Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Verify C-SRR sign-off
        run: |
          if ! echo "` + GH_BODY + `" | grep -q "C-SRR:"; then
            echo "COMPLIANCE GATE BLOCKED: C-SRR sign-off reference missing"
            echo "Add 'C-SRR: [reference number]' to PR description to proceed"
            exit 1
          fi
          echo "C-SRR reference found"

      - name: Check evidence artifacts present
        run: |
          # Verify compliance evidence directory exists and is populated
          if [ ! -d "compliance-evidence" ]; then
            echo "COMPLIANCE GATE BLOCKED: compliance-evidence/ directory missing"
            echo "Create compliance-evidence/ and add required artifacts before release"
            exit 1
          fi
          ARTIFACT_COUNT=$(ls compliance-evidence/ | wc -l)
          if [ "$ARTIFACT_COUNT" -lt 1 ]; then
            echo "COMPLIANCE GATE BLOCKED: No evidence artifacts found in compliance-evidence/"
            exit 1
          fi
          echo "Evidence artifacts found: $ARTIFACT_COUNT files"

      - name: Verify breach notification runbook exists
        run: |
          if [ ! -f "runbooks/breach-notification.md" ] && [ ! -f "runbooks/breach-notification.docx" ]; then
            echo "COMPLIANCE WARNING: Breach notification runbook not found in runbooks/"
            echo "Ensure runbooks/breach-notification.[md|docx] exists before release"
          fi
          echo "Runbook check complete"`;

  const gitlabYaml = `# GitLab CI equivalent — all three compliance gates
# Add to .gitlab-ci.yml

compliance:srd-check:
  stage: validate
  script:
    - |
      if ! echo "` + CI_MR_DESC + `" | grep -q "C-SRD:"; then
        echo "COMPLIANCE GATE BLOCKED: C-SRD reference missing"
        exit 1
      fi
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'

compliance:build-check:
  stage: build
  script:
    - grep -rniE 'log\.(info|warn|error).*password|ssn|credit' src/ && exit 1 || true
    - echo "PII log scan passed"
  rules:
    - if: '$CI_COMMIT_BRANCH =~ /^(main|develop|feature\\/.*)$/'

compliance:release-check:
  stage: release
  script:
    - |
      if ! echo "` + CI_MR_DESC + `" | grep -q "C-SRR:"; then
        echo "COMPLIANCE GATE BLOCKED: C-SRR sign-off missing"
        exit 1
      fi
      test -d compliance-evidence || (echo "Evidence directory missing" && exit 1)
  rules:
    - if: '$CI_MERGE_REQUEST_TARGET_BRANCH_NAME =~ /^(main|release\\/.*)$/'`;

  const children = [
    ...titleBlock('Compliance Gate Config Spec', 'CI/CD compliance gates for GitHub Actions and GitLab CI', 'Doc 2'),

    metaTable([
      ['Framework Author', 'John A. Bowman'],
      ['Version', '1.0'],
      ['Date', 'May 2026'],
      ['Doc 1 Reference', ''],
      ['Repo / Pipeline', ''],
      ['Configured By', ''],
      ['Date Configured', ''],
    ]),
    ...spacer(1),

    sectionHeading('1.  Purpose'),
    para('This document provides ready-to-use CI/CD gate configurations that enforce compliance-aware supportability standards at the three critical checkpoints in the development pipeline: requirements confirmation, build-time scanning, and pre-release evidence verification.'),
    para('These gates are additive to the base SE gates in SE_Baseline_2_GateConfigSpec.docx. Both sets of gates should be active in compliance-scoped repositories.'),
    noteBox('A compliance gate that blocks a deploy costs minutes. The same gap discovered in a SOC 2 audit costs weeks of evidence reconstruction and remediation. These gates are the automated enforcement of the shift left principle applied to compliance.'),
    ...spacer(1),

    sectionHeading('2.  Gate Overview'),
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [1400, 2400, 2560, 3000],
      rows: [
        new TableRow({ children: [
          cell('Gate', { width: 1400, bold: true, shade: NAVY, textColor: WHITE }),
          cell('Trigger', { width: 2400, bold: true, shade: NAVY, textColor: WHITE }),
          cell('Checks', { width: 2560, bold: true, shade: NAVY, textColor: WHITE }),
          cell('Blocks On', { width: 3000, bold: true, shade: NAVY, textColor: WHITE }),
        ]}),
        new TableRow({ children: [
          cell('Gate 1 — C-SRD', { width: 1400 }),
          cell('PR open — feature branches', { width: 2400 }),
          cell('C-SRD reference · data classification declared', { width: 2560 }),
          cell('Missing C-SRD ref or data classification', { width: 3000 }),
        ]}),
        new TableRow({ children: [
          cell('Gate 2 — C-SIC', { width: 1400 }),
          cell('Every commit — compliance branches', { width: 2400 }),
          cell('PII in logs · audit trail · DC-4/5 encryption', { width: 2560 }),
          cell('PII detected or DC-4/5 without encryption', { width: 3000 }),
        ]}),
        new TableRow({ children: [
          cell('Gate 3 — C-SRR', { width: 1400 }),
          cell('PR to main / release branches', { width: 2400 }),
          cell('C-SRR sign-off · evidence artifacts · breach runbook', { width: 2560 }),
          cell('Missing C-SRR ref or empty evidence directory', { width: 3000 }),
        ]}),
      ]
    }),
    ...spacer(1),

    sectionHeading('3.  Gate 1 — C-SRD Compliance Review (GitHub Actions)'),
    para('Paste this YAML into .github/workflows/se-compliance-gate-1.yml'),
    ...spacer(1),
    new Paragraph({
      shading: { fill: '1E293B', type: ShadingType.CLEAR },
      spacing: { before: 80, after: 80 },
      children: [new TextRun({ text: yamlGate1, font: 'Courier New', size: 16, color: 'E2E8F0' })]
    }),
    ...spacer(1),

    sectionHeading('4.  Gate 2 — C-SIC Build Compliance (GitHub Actions)'),
    para('Paste this YAML into .github/workflows/se-compliance-gate-2.yml. Customize the PII_PATTERNS and AUDIT_PATTERN variables for your tech stack.'),
    ...spacer(1),
    new Paragraph({
      shading: { fill: '1E293B', type: ShadingType.CLEAR },
      spacing: { before: 80, after: 80 },
      children: [new TextRun({ text: yamlGate2, font: 'Courier New', size: 16, color: 'E2E8F0' })]
    }),
    ...spacer(1),

    sectionHeading('5.  Gate 3 — C-SRR Release Compliance (GitHub Actions)'),
    para('Paste this YAML into .github/workflows/se-compliance-gate-3.yml'),
    ...spacer(1),
    new Paragraph({
      shading: { fill: '1E293B', type: ShadingType.CLEAR },
      spacing: { before: 80, after: 80 },
      children: [new TextRun({ text: yamlGate3, font: 'Courier New', size: 16, color: 'E2E8F0' })]
    }),
    ...spacer(1),

    sectionHeading('6.  GitLab CI Equivalent'),
    para('Add these jobs to your existing .gitlab-ci.yml. Adjust stage names to match your pipeline definition.'),
    ...spacer(1),
    new Paragraph({
      shading: { fill: '1E293B', type: ShadingType.CLEAR },
      spacing: { before: 80, after: 80 },
      children: [new TextRun({ text: gitlabYaml, font: 'Courier New', size: 16, color: 'E2E8F0' })]
    }),
    ...spacer(1),

    sectionHeading('7.  Evidence Directory Structure'),
    para('Gate 3 checks for the existence of a compliance-evidence/ directory. Use this standard structure:'),
    ...spacer(1),
    new Paragraph({
      shading: { fill: '1E293B', type: ShadingType.CLEAR },
      spacing: { before: 80, after: 80 },
      children: [new TextRun({
        text: `compliance-evidence/
  ├── c-srd/                  # Completed C-SRD documents per feature
  ├── c-sar/                  # Completed C-SAR documents (if applicable)
  ├── c-sic/                  # PR-level C-SIC sign-off records
  ├── c-stp/                  # Test execution results and pass records
  ├── c-srr/                  # Signed C-SRR documents
  ├── c-sfl/                  # Quarterly SFL review records
  ├── audit-logs/             # Retained audit log samples (where required)
  └── breach-runbook/         # Breach notification procedure`,
        font: 'Courier New', size: 16, color: 'E2E8F0'
      })]
    }),
    ...spacer(1),

    sectionHeading('8.  Customization Notes'),
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [3000, 6360],
      rows: [
        new TableRow({ children: [cell('Variable / Pattern', { width: 3000, bold: true, shade: LGRAY }), cell('What to customize', { width: 6360, bold: true, shade: LGRAY })] }),
        new TableRow({ children: [cell('PII_PATTERNS (Gate 2)', { width: 3000 }), cell('Add org-specific field names, internal identifiers, or custom data types that should never appear in logs', { width: 6360 })] }),
        new TableRow({ children: [cell('DATA_WRITE_PATTERNS (Gate 2)', { width: 3000 }), cell('Replace with your ORM or database library method names', { width: 6360 })] }),
        new TableRow({ children: [cell('AUDIT_PATTERN (Gate 2)', { width: 3000 }), cell('Replace with your audit logging function or class name', { width: 6360 })] }),
        new TableRow({ children: [cell('ENCRYPT_PATTERN (Gate 2)', { width: 3000 }), cell('Replace with your encryption helper or annotation', { width: 6360 })] }),
        new TableRow({ children: [cell('compliance-evidence/ path', { width: 3000 }), cell('Adjust if your evidence directory lives elsewhere in the repo', { width: 6360 })] }),
        new TableRow({ children: [cell('Branch names', { width: 3000 }), cell('Update main, develop, feature/**, release/** to match your branching strategy', { width: 6360 })] }),
      ]
    }),
  ];

  return new Document({
    styles: docStyles,
    sections: [{
      properties: { page: pageProps },
      headers: { default: header },
      footers: { default: footer },
      children
    }]
  });
}

// ─── DOC 3: COMPLIANCE PR TEMPLATE ADDITION ──────────────────────────────────

function buildDoc3() {
  const header = makeHeader('Compliance PR Template Addition', 'Vol. 5 Baseline — Doc 3');
  const footer = makeFooter();

  const prMarkdown = `## Supportability Engineering — Compliance Checklist
<!-- SE Vol. 5 Compliance Baseline | Doc 3 | Attach to every PR in compliance-scoped repos -->

### Compliance Scope
- **C-SRD Reference:** <!-- e.g. C-SRD-2026-042 -->
- **Data Classification:** <!-- DC-1 / DC-2 / DC-3 / DC-4 / DC-5 -->
- **Applicable Frameworks:** <!-- SOC 2 / ISO 27001 / GDPR / SOX / FedRAMP / N/A -->

---

### DATA PROTECTION
- [ ] No PII, credentials, tokens, or regulated data present in any log statement
- [ ] All DC-4 / DC-5 data fields are encrypted at rest and in transit
- [ ] Data retention behavior matches the policy in the Compliance Context Document
- [ ] No new data elements introduced without a corresponding C-SRD data classification entry

### AUDIT TRAIL
- [ ] Every significant state change produces an audit log entry (who / what / when / from where)
- [ ] Audit log entries are tamper-evident and include correlation ID
- [ ] Audit trail covers all data writes in this change
- [ ] Audit log retention period is respected by the implementation

### BREACH DETECTION
- [ ] Alerts instrumented for unauthorized access attempts on regulated data
- [ ] Alert payloads include: timestamp, data classification level, affected customer count, triggering event
- [ ] Breach detection logic reviewed against thresholds in Section 6 of the Compliance Context Document

### CHANGE CONTROL
- [ ] This change references a change ticket (ticket #: _________)
- [ ] Rollback procedure is documented and tested for compliance-scoped components
- [ ] No compliance-scoped component changed without a corresponding C-SRD update

### REVIEWER CONFIRMATION
- [ ] Reviewer has independently verified no PII in log statements
- [ ] Reviewer has confirmed audit trail completeness
- [ ] Reviewer has confirmed encryption is applied to all DC-4 / DC-5 fields
- [ ] Reviewer confirms this change does not introduce a new compliance scope gap

---
**Developer sign-off:** I confirm all applicable compliance items are addressed or have documented justification.
**Reviewer sign-off:** I confirm independent verification of all compliance items.`;

  const children = [
    ...titleBlock('Compliance PR Template Addition', 'Compliance checklist for code review — attach to every PR in compliance-scoped repos', 'Doc 3'),

    metaTable([
      ['Framework Author', 'John A. Bowman'],
      ['Version', '1.0'],
      ['Date', 'May 2026'],
      ['Doc 1 Reference', ''],
      ['Doc 2 Reference', ''],
      ['Repo', ''],
      ['Configured By', ''],
    ]),
    ...spacer(1),

    sectionHeading('1.  Purpose'),
    para('This document provides the compliance extension to the base SE PR template (SE_Baseline_3_PRTemplateAddition.docx). Add this checklist to every pull request in repositories that handle regulated data or fall within an audit scope.'),
    para('The five compliance questions in this checklist mirror the five supportability questions in the base PR template — the intent is the same. A PR should not be merged if a support engineer could not operate the resulting code, and it should not be merged if a compliance obligation has been missed.'),
    noteBox('Compliance items missed at code review become audit findings. An audit finding costs days to remediate and weeks to evidence. A PR checklist item costs minutes. This is the shift left principle applied to compliance.'),
    ...spacer(1),

    sectionHeading('2.  When to Use This Template'),
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [3000, 6360],
      rows: [
        new TableRow({ children: [cell('Use for ALL PRs in this repo', { width: 3000, bold: true, shade: 'E8F8F5' }), cell('Any repo handling DC-3 or higher data, or within SOC 2 / ISO 27001 / FedRAMP audit scope', { width: 6360 })] }),
        new TableRow({ children: [cell('Use for SELECTED PRs', { width: 3000, bold: true, shade: 'FFF8E1' }), cell('Repos with mixed compliance scope — apply to PRs touching compliance-scoped components only. Tag those components in your repo README.', { width: 6360 })] }),
        new TableRow({ children: [cell('Skip this template', { width: 3000, bold: true, shade: LGRAY }), cell('Profile 0 repos only — no regulated data, not in audit scope. Confirm with compliance contact.', { width: 6360 })] }),
      ]
    }),
    ...spacer(1),

    sectionHeading('3.  PR Template — Ready to Paste'),
    para('Copy the block below into your repository\'s .github/PULL_REQUEST_TEMPLATE/compliance.md or append it to your existing PULL_REQUEST_TEMPLATE.md.'),
    ...spacer(1),
    new Paragraph({
      shading: { fill: '1E293B', type: ShadingType.CLEAR },
      spacing: { before: 80, after: 80 },
      children: [new TextRun({ text: prMarkdown, font: 'Courier New', size: 16, color: 'E2E8F0' })]
    }),
    ...spacer(1),

    sectionHeading('4.  Reviewer Guidance'),
    para('Compliance items require independent verification — not just developer self-attestation. The checklist is designed so that each item can be verified by inspecting the diff.'),
    ...spacer(1),
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [3000, 6360],
      rows: [
        new TableRow({ children: [cell('Checklist Item', { width: 3000, bold: true, shade: LGRAY }), cell('How to verify in the diff', { width: 6360, bold: true, shade: LGRAY })] }),
        new TableRow({ children: [cell('No PII in logs', { width: 3000 }), cell('Search diff for log.* calls and confirm no customer identifiers, emails, payment data, or credentials appear as arguments', { width: 6360 })] }),
        new TableRow({ children: [cell('DC-4/5 fields encrypted', { width: 3000 }), cell('Identify any new fields with personal or regulated data; confirm they use the org encryption helper or annotation', { width: 6360 })] }),
        new TableRow({ children: [cell('Audit trail complete', { width: 3000 }), cell('Identify all data write operations; confirm each one calls the audit logging function before or after the write', { width: 6360 })] }),
        new TableRow({ children: [cell('Breach detection instrumented', { width: 3000 }), cell('Confirm that any new data access path that touches regulated data has a corresponding anomaly detection hook or alert', { width: 6360 })] }),
        new TableRow({ children: [cell('Change ticket referenced', { width: 3000 }), cell('Verify the ticket number in the PR description is active and approved', { width: 6360 })] }),
      ]
    }),
    ...spacer(1),

    sectionHeading('5.  Escalation — When to Block a PR'),
    para('Block the PR (do not merge) in any of the following cases:'),
    ...spacer(1),
    checkTable([
      ['Block conditions', [
        ['PII or regulated data detected in any log statement — no exceptions', true],
        ['DC-4 or DC-5 data field without encryption annotation or helper', true],
        ['Data write operation without a corresponding audit trail call', true],
        ['No C-SRD reference for a PR that introduces new data handling', true],
        ['Breach detection missing for a new regulated data access path', true],
        ['Reviewer cannot independently verify a Required item in the checklist', true],
      ]]
    ]),
    ...spacer(1),
    para('If a block is raised, document it in the PR comments with the specific item and what remediation is required. Do not merge with an unresolved compliance block — request a compliance review from the compliance contact named in Section 7 of the Compliance Context Document.'),
  ];

  return new Document({
    styles: docStyles,
    sections: [{
      properties: { page: pageProps },
      headers: { default: header },
      footers: { default: footer },
      children
    }]
  });
}

// ─── DOC 4: COMPLIANCE FEATURE SPECIFICATION ─────────────────────────────────

function buildDoc4() {
  const header = makeHeader('Compliance Feature Specification', 'Vol. 5 Baseline — Doc 4');
  const footer = makeFooter();

  const children = [
    ...titleBlock('Compliance Feature Specification', 'Per-feature compliance delta — references Doc 1 for all baseline standards', 'Doc 4'),

    metaTable([
      ['Framework Author', 'John A. Bowman'],
      ['Version', '1.0'],
      ['Date', 'May 2026'],
      ['Doc 1 Reference', ''],
      ['Feature / Service Name', ''],
      ['Base SRD Reference', ''],
      ['Base C-SRD Reference', ''],
      ['Author', ''],
      ['Date', ''],
    ]),
    ...spacer(1),

    sectionHeading('1.  Purpose'),
    para('This document captures the compliance-specific requirements that are unique to this feature. It does not repeat the baseline standards from SE_Baseline_C_Doc1_ComplianceContextDocument.docx — it references them. Only deviations, additions, and feature-specific obligations are recorded here.'),
    noteBox('If a field in this document would simply repeat the baseline, leave it blank and note "See Doc 1." The goal is a concise, feature-specific compliance record — not a copy of the framework documentation.'),
    ...spacer(1),

    sectionHeading('2.  Feature Compliance Profile'),
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [3000, 6360],
      rows: [
        new TableRow({ children: [cell('Feature Description', { width: 3000, bold: true, shade: LGRAY }), cell('Plain-language description of what this feature does and why it exists.', { width: 6360, italic: true })] }),
        new TableRow({ children: [cell('', { width: 3000, shade: LGRAY }), cell('', { width: 6360 })] }),
        new TableRow({ children: [cell('Applicable Org Profile', { width: 3000, bold: true, shade: LGRAY }), cell('Profile 0 / 1 / 2 / 3 / 4 / 5  (from Doc 1 Section 2)', { width: 6360, italic: true })] }),
        new TableRow({ children: [cell('Does this feature change the profile?', { width: 3000, bold: true, shade: LGRAY }), cell('Yes / No — if Yes, state the new profile and reason below', { width: 6360, italic: true })] }),
        new TableRow({ children: [cell('Profile change reason', { width: 3000, bold: true, shade: LGRAY }), cell('', { width: 6360 })] }),
      ]
    }),
    ...spacer(1),

    sectionHeading('3.  Data Elements Introduced by This Feature'),
    para('List only new data elements — elements not already covered by the baseline in Doc 1. For each, confirm classification and handling requirements.'),
    ...spacer(1),
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [2400, 1400, 1600, 1680, 2280],
      rows: [
        new TableRow({ children: [
          cell('Data Element', { width: 2400, bold: true, shade: NAVY2, textColor: WHITE }),
          cell('Classification', { width: 1400, bold: true, shade: NAVY2, textColor: WHITE }),
          cell('Encrypted?', { width: 1600, bold: true, shade: NAVY2, textColor: WHITE }),
          cell('Logged?', { width: 1680, bold: true, shade: NAVY2, textColor: WHITE }),
          cell('Retention', { width: 2280, bold: true, shade: NAVY2, textColor: WHITE }),
        ]}),
        ...[1,2,3,4,5].map(() => new TableRow({ children: [
          cell('', { width: 2400 }),
          cell('DC-?', { width: 1400, italic: true }),
          cell('Yes / No', { width: 1600, italic: true }),
          cell('Never / Masked / Ref only', { width: 1680, italic: true }),
          cell('', { width: 2280 }),
        ]}))
      ]
    }),
    ...spacer(1),

    sectionHeading('4.  Feature-Specific Control Obligations'),
    para('List only controls that apply specifically to this feature beyond the baseline in Doc 1 Section 3. For example: a feature that processes financial transactions may trigger SOX ITGC obligations not applicable to other features.'),
    ...spacer(1),
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [1800, 1800, 2160, 3600],
      rows: [
        new TableRow({ children: [
          cell('Framework', { width: 1800, bold: true, shade: NAVY2, textColor: WHITE }),
          cell('Control', { width: 1800, bold: true, shade: NAVY2, textColor: WHITE }),
          cell('SE Phase', { width: 2160, bold: true, shade: NAVY2, textColor: WHITE }),
          cell('Feature-Specific Obligation', { width: 3600, bold: true, shade: NAVY2, textColor: WHITE }),
        ]}),
        ...[1,2,3,4].map(() => new TableRow({ children: [
          cell('', { width: 1800 }),
          cell('', { width: 1800 }),
          cell('', { width: 2160 }),
          cell('', { width: 3600 }),
        ]}))
      ]
    }),
    ...spacer(1),

    sectionHeading('5.  Breach Detection Requirements — This Feature'),
    para('Define the specific breach detection obligations for this feature. Reference Doc 1 Section 6 for notification thresholds — record only what is unique to this feature here.'),
    ...spacer(1),
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [3000, 6360],
      rows: [
        new TableRow({ children: [cell('Breach trigger definition', { width: 3000, bold: true, shade: LGRAY }), cell('What event or pattern constitutes a breach for this feature?', { width: 6360, italic: true })] }),
        new TableRow({ children: [cell('', { width: 3000, shade: LGRAY }), cell('', { width: 6360 })] }),
        new TableRow({ children: [cell('Affected data classification', { width: 3000, bold: true, shade: LGRAY }), cell('DC-?', { width: 6360 })] }),
        new TableRow({ children: [cell('Max customer exposure', { width: 3000, bold: true, shade: LGRAY }), cell('Estimated number of customers affected if a breach occurs', { width: 6360, italic: true })] }),
        new TableRow({ children: [cell('Notification timeline', { width: 3000, bold: true, shade: LGRAY }), cell('Reference Doc 1 Section 6 unless this feature has a shorter obligation', { width: 6360, italic: true })] }),
        new TableRow({ children: [cell('Alert instrumented?', { width: 3000, bold: true, shade: LGRAY }), cell('Yes / No — if Yes, reference SIC / STP record', { width: 6360 })] }),
        new TableRow({ children: [cell('Runbook location', { width: 3000, bold: true, shade: LGRAY }), cell('', { width: 6360 })] }),
      ]
    }),
    ...spacer(1),

    sectionHeading('6.  Audit Trail Specification — This Feature'),
    para('Define what must be in the audit trail for this feature. Every data write must produce an audit entry. Record the schema here so it can be verified at SIC and tested at STP.'),
    ...spacer(1),
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [2400, 1600, 1680, 3680],
      rows: [
        new TableRow({ children: [
          cell('Event', { width: 2400, bold: true, shade: NAVY2, textColor: WHITE }),
          cell('Required Fields', { width: 1600, bold: true, shade: NAVY2, textColor: WHITE }),
          cell('Retention', { width: 1680, bold: true, shade: NAVY2, textColor: WHITE }),
          cell('Notes', { width: 3680, bold: true, shade: NAVY2, textColor: WHITE }),
        ]}),
        new TableRow({ children: [
          cell('', { width: 2400 }),
          cell('timestamp · actor · action · entity · result · correlation_id', { width: 1600, italic: true, size: 18 }),
          cell('', { width: 1680 }),
          cell('', { width: 3680 }),
        ]}),
        ...[1,2,3,4].map(() => new TableRow({ children: [
          cell('', { width: 2400 }),
          cell('', { width: 1600 }),
          cell('', { width: 1680 }),
          cell('', { width: 3680 }),
        ]}))
      ]
    }),
    ...spacer(1),

    sectionHeading('7.  C- Template Checklist — This Feature'),
    para('Confirm which C- templates are required for this feature based on the profile selected in Section 2. Check all that apply.'),
    ...spacer(1),
    checkTable([
      ['Required C- Deliverables', [
        ['C-SRD — Compliance addendum to the Supportability Requirements Document', true],
        ['C-SAR — Compliance addendum to the Supportability Architecture Review (Profile 4/5 or DPIA required)', false],
        ['C-SIC — Compliance addendum to the Supportability Implementation Checklist', false],
        ['C-STP — Compliance addendum to the Supportability Test Plan (SOC 2 / FedRAMP / breach notification)', false],
        ['C-SRR — Compliance addendum to the Support Readiness Review', true],
        ['C-SFL — Compliance addendum to the Supportability Feedback Loop (Profile 4/5)', false],
      ]]
    ]),
    ...spacer(1),

    sectionHeading('8.  Deviations from Baseline'),
    para('Record any cases where this feature requires a different standard than the baseline in Doc 1. Every deviation must be justified and approved by the compliance contact.'),
    ...spacer(1),
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [2400, 2400, 2400, 2160],
      rows: [
        new TableRow({ children: [
          cell('Baseline Standard', { width: 2400, bold: true, shade: NAVY2, textColor: WHITE }),
          cell('This Feature Deviation', { width: 2400, bold: true, shade: NAVY2, textColor: WHITE }),
          cell('Justification', { width: 2400, bold: true, shade: NAVY2, textColor: WHITE }),
          cell('Approved By', { width: 2160, bold: true, shade: NAVY2, textColor: WHITE }),
        ]}),
        ...[1,2,3].map(() => new TableRow({ children: [
          cell('', { width: 2400 }),
          cell('', { width: 2400 }),
          cell('', { width: 2400 }),
          cell('', { width: 2160 }),
        ]}))
      ]
    }),
    ...spacer(1),

    sectionHeading('9.  Sign-Off'),
    para('Sign-off confirms this document reflects current compliance requirements for this feature. Review whenever the feature scope changes or a new compliance obligation applies.'),
    ...spacer(1),
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [2340, 2340, 2340, 2340],
      rows: [
        new TableRow({ children: [
          cell('Feature Owner', { width: 2340, bold: true, shade: NAVY2, textColor: WHITE }),
          cell('Engineering Lead', { width: 2340, bold: true, shade: NAVY2, textColor: WHITE }),
          cell('Compliance Contact', { width: 2340, bold: true, shade: NAVY2, textColor: WHITE }),
          cell('Support Lead', { width: 2340, bold: true, shade: NAVY2, textColor: WHITE }),
        ]}),
        new TableRow({ children: [
          cell('Name:\n\nSignature:\n\nVersion:\n\nDate:', { width: 2340 }),
          cell('Name:\n\nSignature:\n\nVersion:\n\nDate:', { width: 2340 }),
          cell('Name:\n\nSignature:\n\nVersion:\n\nDate:', { width: 2340 }),
          cell('Name:\n\nSignature:\n\nVersion:\n\nDate:', { width: 2340 }),
        ]}),
      ]
    }),
  ];

  return new Document({
    styles: docStyles,
    sections: [{
      properties: { page: pageProps },
      headers: { default: header },
      footers: { default: footer },
      children
    }]
  });
}

// ─── BUILD ALL FOUR ───────────────────────────────────────────────────────────

async function buildAll() {
  const docs = [
    { doc: buildDoc1(), name: 'SE_Baseline_C_Doc1_ComplianceContextDocument.docx' },
    { doc: buildDoc2(), name: 'SE_Baseline_C_Doc2_ComplianceGateConfigSpec.docx' },
    { doc: buildDoc3(), name: 'SE_Baseline_C_Doc3_CompliancePRTemplateAddition.docx' },
    { doc: buildDoc4(), name: 'SE_Baseline_C_Doc4_ComplianceFeatureSpecification.docx' },
  ];

  for (const { doc, name } of docs) {
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(`/mnt/user-data/outputs/${name}`, buffer);
    console.log(`Built: ${name}`);
  }
}

buildAll().catch(console.error);
