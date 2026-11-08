import {
  FORMULA_TASKS,
  buildFormula,
  parseFormulaPrompt,
  type FormulaResult,
  type FormulaTaskId,
} from "../lib/formulaBuilder.ts";
import { explainFormulaLocally } from "../lib/formulaExplainer.ts";
import { validateFormula } from "../lib/formulaValidator.ts";
import { prettifyFormula } from "../lib/formulaPrettify.ts";
import { runFormulaAuditCases } from "./formula-audit-cases.ts";

type Case = {
  name: string;
  prompt: string;
  platform: "excel" | "google_sheets";
  version:
    | "excel365"
    | "excel2021"
    | "excel2019"
    | "older"
    | "wps";
  must: string[];
  mustNot: string[];
  altMust?: string[];
  altNot?: string[];
  separator?: "," | ";";
};

const cases: Case[] = [
  {
    name: "SUMPRODUCT 备选使用有限区域",
    prompt: "求和C列，A列是Sales",
    platform: "excel",
    version: "excel365",
    must: ['C:C,A:A,"Sales"'],
    mustNot: [],
    altMust: ['--(A2:A1000="Sales"),C2:C1000'],
    altNot: ["A:A=", "(A:A* C:C)"],
  },
  {
    name: "中文混合条件+日期",
    prompt: "统计A列部门等于Sales、B列日期在2026年3月、C列金额总和",
    platform: "excel",
    version: "excel365",
    must: ['A:A,"Sales"', 'B:B,">="&DATE(2026,3,1)', 'B:B,"<="&DATE(2026,3,31)'],
    mustNot: ['A:A,">="'],
  },
  {
    name: "英文 for 边界",
    prompt: "Sum column C when column A is Sales for March 2026",
    platform: "excel",
    version: "excel365",
    must: ['A:A,"Sales"'],
    mustNot: ["Sales for March"],
  },
  {
    name: "只给日期不给条件",
    prompt: "求B列日期在2026年3月、C列金额总和",
    platform: "excel",
    version: "excel365",
    must: ['B:B,">="&DATE(2026,3,1)'],
    mustNot: ['"Sales"'],
    altMust: [
      "--(B2:B1000>=DATE(2026,3,1))",
      "--(B2:B1000<=DATE(2026,3,31))",
    ],
    altNot: ["B:B>="],
  },
  {
    name: "上个月偏移正确",
    prompt: "上个月的C列总和",
    platform: "excel",
    version: "excel365",
    must: ["EOMONTH(TODAY(),-2)+1", "EOMONTH(TODAY(),-1)"],
    mustNot: [],
  },
  {
    name: "Q1 固定锚点",
    prompt: "Q1 2026 的C列总和",
    platform: "excel",
    version: "excel365",
    must: ["DATE(2026,1,1)"],
    mustNot: ["TODAY()"],
  },
  {
    name: "2019 无 XLOOKUP",
    prompt: "根据A2查找C列",
    platform: "excel",
    version: "excel2019",
    must: ["INDEX", "MATCH"],
    mustNot: ["XLOOKUP"],
  },
  {
    name: "2019 无 UNIQUE",
    prompt: "A列不重复值",
    platform: "excel",
    version: "excel2019",
    must: [],
    mustNot: ["UNIQUE("],
  },
  {
    name: "older 无 TEXTJOIN",
    prompt: "合并A2和B2",
    platform: "excel",
    version: "older",
    must: ["&"],
    mustNot: ["TEXTJOIN"],
  },
  {
    name: "Google 域名不用 TEXTAFTER",
    prompt: "提取A2邮箱域名",
    platform: "google_sheets",
    version: "excel365",
    must: ["REGEXEXTRACT"],
    mustNot: ["TEXTAFTER"],
  },
  {
    name: "分号分隔符保留字符串逗号",
    prompt: "求B列日期在2026年3月、C列金额总和",
    platform: "excel",
    version: "excel365",
    separator: ";",
    must: ['B:B;">="&DATE(2026;3;1)'],
    mustNot: [],
  },
  {
    name: "中文非C列求和区域",
    prompt: "统计A列部门等于Sales、B列日期在2026年3月、D列金额总和",
    platform: "excel",
    version: "excel365",
    must: ['D:D,A:A,"Sales"'],
    mustNot: ["C:C"],
  },
  {
    name: "无日期中文求和列",
    prompt: "统计A列部门等于Sales、D列金额总和",
    platform: "excel",
    version: "excel365",
    must: ['D:D,A:A,"Sales"'],
    mustNot: [],
  },
  {
    name: "中文不重复值列表",
    prompt: "B列不重复值",
    platform: "excel",
    version: "excel365",
    must: ["UNIQUE(B2:B1000)"],
    mustNot: ["COUNTA"],
  },
  {
    name: "中文不重复值数量",
    prompt: "统计B列不重复值的数量",
    platform: "excel",
    version: "excel365",
    must: ["COUNTA(UNIQUE(FILTER(B2:B1000"],
    mustNot: ["=UNIQUE("],
  },
  {
    name: "中文小数位数",
    prompt: "把数字四舍五入保留三位小数",
    platform: "excel",
    version: "excel365",
    must: ["ROUND(A2,3)"],
    mustNot: ["ROUND(A2,2)"],
  },
  {
    name: "英文列与两位小数",
    prompt: "Round column D to two decimal places",
    platform: "excel",
    version: "excel365",
    must: ["ROUND(D2,2)"],
    mustNot: ["ROUND(A2"],
  },
  {
    name: "英文数字小数位",
    prompt: "Round column C to 3 decimal places",
    platform: "excel",
    version: "excel365",
    must: ["ROUND(C2,3)"],
    mustNot: ["ROUND(A2"],
  },
];

let failed = 0;
for (const c of cases) {
  const parsed = parseFormulaPrompt(c.prompt);
  const r: FormulaResult = buildFormula({
    task: parsed.task,
    values: parsed.values,
    platform: c.platform,
    excelVersion: c.version,
    lang: "zh",
    argumentSeparator: c.separator,
  });
  const f = r.formula || "";
  const alt = r.alternatives.map((item) => item.formula).join("\n");
  const ok =
    c.must.every((s) => f.includes(s)) &&
    c.mustNot.every((s) => !f.includes(s));
  const altOk =
    (c.altMust ?? []).every((s) => alt.includes(s)) &&
    (c.altNot ?? []).every((s) => !alt.includes(s));
  if (!ok) {
    failed++;
    console.log(`FAIL ${c.name}`);
    console.log(`  got: ${f}`);
    console.log(`  must: ${JSON.stringify(c.must)}`);
    console.log(`  not : ${JSON.stringify(c.mustNot)}`);
  } else {
    console.log(`PASS ${c.name}`);
  }
  if (!altOk) {
    failed++;
    console.log(`FAIL ${c.name} (alternatives)`);
    console.log(`  got: ${alt}`);
    console.log(`  must: ${JSON.stringify(c.altMust ?? [])}`);
    console.log(`  not : ${JSON.stringify(c.altNot ?? [])}`);
  }
}

const directCases: Array<{
  name: string;
  sourceRange: string;
  expected: string;
}> = [
  {
    name: "多列整列默认区域",
    sourceRange: "A:C",
    expected: '=FILTER(A2:C1000,A2:A1000="Sales","No matches")',
  },
  {
    name: "显式有限区域不改写",
    sourceRange: "A1:C100",
    expected: '=FILTER(A1:C100,A1:A100="Sales","No matches")',
  },
];

for (const c of directCases) {
  const r = buildFormula({
    task: "filterRows",
    values: {
      sourceRange: c.sourceRange,
      criteriaRange: "A:A",
      criteriaValue: "Sales",
    },
    platform: "excel",
    excelVersion: "excel365",
    lang: "zh",
    argumentSeparator: ",",
  });
  const f = r.formula || "";
  if (f !== c.expected) {
    failed++;
    console.log(`FAIL ${c.name}`);
    console.log(`  got: ${f}`);
    console.log(`  expected: ${c.expected}`);
  } else {
    console.log(`PASS ${c.name}`);
  }
}

type PrettifyCase = {
  name: string;
  formula: string;
  separator: "," | ";";
  expected: string;
  changed: boolean;
};

const prettifyCases: PrettifyCase[] = [
  {
    name: "SUMIFS 逗号模式美化",
    formula:
      '=SUMIFS(D:D,A:A,"Sales",B:B,">="&DATE(2026,3,1),B:B,"<="&DATE(2026,3,31))',
    separator: ",",
    expected:
      '=SUMIFS(\n    D:D,\n    A:A,\n    "Sales",\n    B:B,\n    ">="&DATE(2026,3,1),\n    B:B,\n    "<="&DATE(2026,3,31)\n)',
    changed: true,
  },
  {
    name: "SUMIFS 分号模式美化，不改嵌套 DATE",
    formula:
      '=SUMIFS(D:D;A:A;"Sales";B:B;">="&DATE(2026,3,1);B:B;"<="&DATE(2026,3,31))',
    separator: ";",
    expected:
      '=SUMIFS(\n    D:D;\n    A:A;\n    "Sales";\n    B:B;\n    ">="&DATE(2026,3,1);\n    B:B;\n    "<="&DATE(2026,3,31)\n)',
    changed: true,
  },
  {
    name: "字符串内逗号不拆分",
    formula: '=SUMIFS(C:C,A:A,"Sales, East",B:B,">0")',
    separator: ",",
    expected:
      '=SUMIFS(\n    C:C,\n    A:A,\n    "Sales, East",\n    B:B,\n    ">0"\n)',
    changed: true,
  },
  {
    name: "转义双引号不误判",
    formula: '=SUMIFS(C:C,A:A,"He said ""Hi, there""",B:B,">0")',
    separator: ",",
    expected:
      '=SUMIFS(\n    C:C,\n    A:A,\n    "He said ""Hi, there""",\n    B:B,\n    ">0"\n)',
    changed: true,
  },
  {
    name: "@ 包裹函数原样返回",
    formula: '=@SUMIFS(C:C,A:A,"Sales",B:B)',
    separator: ",",
    expected: '=@SUMIFS(C:C,A:A,"Sales",B:B)',
    changed: false,
  },
  {
    name: "嵌套 DATE 不拆分",
    formula: '=SUMIFS(D:D,A:A,"A",B:B,">="&DATE(2026,3,1))',
    separator: ",",
    expected:
      '=SUMIFS(\n    D:D,\n    A:A,\n    "A",\n    B:B,\n    ">="&DATE(2026,3,1)\n)',
    changed: true,
  },
  {
    name: "简单 SUMIFS 参数不足保持单行",
    formula: '=SUMIFS(C:C,A:A,"Sales")',
    separator: ",",
    expected: '=SUMIFS(C:C,A:A,"Sales")',
    changed: false,
  },
  {
    name: "FILTER 达到独立阈值",
    formula: '=FILTER(A2:C1000,A2:A1000="Sales","No matches")',
    separator: ",",
    expected:
      '=FILTER(\n    A2:C1000,\n    A2:A1000="Sales",\n    "No matches"\n)',
    changed: true,
  },
  {
    name: "括号不配对原样返回",
    formula: '=SUMIFS(D:D,A:A,"Sales",B:B',
    separator: ",",
    expected: '=SUMIFS(D:D,A:A,"Sales",B:B',
    changed: false,
  },
  {
    name: "末尾多余分隔符原样返回",
    formula: '=SUMIFS(D:D,A:A,"Sales",B:B,',
    separator: ",",
    expected: '=SUMIFS(D:D,A:A,"Sales",B:B,',
    changed: false,
  },
  {
    name: "非白名单函数原样返回",
    formula: "=SUM(A1,A2)",
    separator: ",",
    expected: "=SUM(A1,A2)",
    changed: false,
  },
  {
    name: "IFERROR 包裹不向内美化",
    formula: '=IFERROR(SUMIFS(D:D,A:A,"Sales",B:B,">0"),"")',
    separator: ",",
    expected: '=IFERROR(SUMIFS(D:D,A:A,"Sales",B:B,">0"),"")',
    changed: false,
  },
  {
    name: "已有换行原样返回",
    separator: ",",
    formula:
      '=SUMIFS(\n    D:D,\n    A:A,\n    "Sales",\n    B:B,\n    ">0"\n)',
    expected:
      '=SUMIFS(\n    D:D,\n    A:A,\n    "Sales",\n    B:B,\n    ">0"\n)',
    changed: false,
  },
  {
    name: "分隔符不匹配原样返回",
    formula: '=SUMIFS(D:D,A:A,"Sales",B:B)',
    separator: ";",
    expected: '=SUMIFS(D:D,A:A,"Sales",B:B)',
    changed: false,
  },
];

for (const c of prettifyCases) {
  let actual;
  try {
    actual = prettifyFormula(c.formula, c.separator);
  } catch {
    failed++;
    console.log(`FAIL ${c.name}`);
    console.log("  threw unexpectedly");
    continue;
  }
  const ok = actual.text === c.expected && actual.changed === c.changed;
  if (!ok) {
    failed++;
    console.log(`FAIL ${c.name}`);
    console.log(`  got: ${JSON.stringify(actual)}`);
    console.log(`  expected: ${JSON.stringify({ text: c.expected, changed: c.changed })}`);
  } else {
    console.log(`PASS ${c.name}`);
  }
}

const idempotenceInput =
  '=SUMIFS(D:D,A:A,"Sales",B:B,">="&DATE(2026,3,1),B:B,"<="&DATE(2026,3,31))';
const once = prettifyFormula(idempotenceInput, ",");
const twice = prettifyFormula(once.text, ",");
if (twice.text !== once.text || twice.changed) {
  failed++;
  console.log("FAIL 美化幂等性");
  console.log(`  once: ${JSON.stringify(once)}`);
  console.log(`  twice: ${JSON.stringify(twice)}`);
} else {
  console.log("PASS 美化幂等性");
}

type DirectFormulaCase = {
  name: string;
  task: FormulaTaskId;
  values: Record<string, string>;
  platform: "excel" | "google_sheets";
  version:
    | "excel365"
    | "excel2021"
    | "excel2019"
    | "older"
    | "wps";
  separator?: "," | ";";
  expected: string;
};

const directFormulaCases: DirectFormulaCase[] = [
  {
    name: "现代 COUNTUNIQUE 排除空值",
    task: "countUnique",
    values: { sourceRange: "A:A" },
    platform: "excel",
    version: "excel365",
    expected: '=IFERROR(COUNTA(UNIQUE(FILTER(A2:A1000,A2:A1000<>""))),0)',
  },
  {
    name: "分号 INDEX/MATCH",
    task: "lookup",
    values: {
      lookupValue: "A2",
      lookupRange: "A:A",
      returnRange: "C:C",
      notFound: "Not found",
    },
    platform: "excel",
    version: "excel2019",
    separator: ";",
    expected: '=IFERROR(INDEX(C:C;MATCH(A2;A:A;0));"Not found")',
  },
  {
    name: "分号百分比变化",
    task: "percentageChange",
    values: { oldValue: "A2", newValue: "B2" },
    platform: "excel",
    version: "excel365",
    separator: ";",
    expected: '=IFERROR((B2-A2)/ABS(A2);"")',
  },
  {
    name: "分号 Google 域名",
    task: "extractDomain",
    values: { emailCell: "A2" },
    platform: "google_sheets",
    version: "excel365",
    separator: ";",
    expected: '=IFERROR(REGEXEXTRACT(A2;"@(.+)");"")',
  },
  {
    name: "分号小数常量",
    task: "conditional",
    values: {
      valueCell: "C2",
      operator: ">",
      threshold: "1.5",
      trueValue: "Yes",
      falseValue: "No",
    },
    platform: "excel",
    version: "excel365",
    separator: ";",
    expected: '=IF(C2>1,5;"Yes";"No")',
  },
  {
    name: "分号数字条件",
    task: "sumCondition",
    values: {
      sumRange: "C:C",
      criteriaRange: "A:A",
      criteriaValue: "1.5",
    },
    platform: "excel",
    version: "excel365",
    separator: ";",
    expected: '=SUMIFS(C:C;A:A;1,5)',
  },
  {
    name: "空格分隔符保留",
    task: "combineText",
    values: { firstText: "A2", secondText: "B2", delimiter: " " },
    platform: "excel",
    version: "excel365",
    expected: '=TEXTJOIN(" ",TRUE,A2,B2)',
  },
  {
    name: "绝对单元格作阈值",
    task: "conditional",
    values: {
      valueCell: "C2",
      operator: ">",
      threshold: "$B$2",
      trueValue: "Yes",
      falseValue: "No",
    },
    platform: "excel",
    version: "excel365",
    expected: '=IF(C2>$B$2,"Yes","No")',
  },
  {
    name: "绝对单元格作条件",
    task: "sumCondition",
    values: {
      sumRange: "C:C",
      criteriaRange: "A:A",
      criteriaValue: "$B$2",
    },
    platform: "excel",
    version: "excel365",
    expected: '=SUMIFS(C:C,A:A,$B$2)',
  },
  {
    name: "绝对整列筛选限行",
    task: "filterRows",
    values: {
      sourceRange: "$A:$C",
      criteriaRange: "$A:$A",
      criteriaValue: "Sales",
    },
    platform: "excel",
    version: "excel365",
    expected: '=FILTER(A2:C1000,A2:A1000="Sales","No matches")',
  },
  {
    name: "小数位向下取整",
    task: "roundNumber",
    values: { numberCell: "A2", decimals: "2.5" },
    platform: "excel",
    version: "excel365",
    expected: "=ROUND(A2,2)",
  },
];

for (const c of directFormulaCases) {
  const r = buildFormula({
    task: c.task,
    values: c.values,
    platform: c.platform,
    excelVersion: c.version,
    lang: "zh",
    argumentSeparator: c.separator,
  });
  const f = r.formula || "";
  if (f !== c.expected) {
    failed++;
    console.log(`FAIL ${c.name}`);
    console.log(`  got: ${f}`);
    console.log(`  expected: ${c.expected}`);
  } else {
    console.log(`PASS ${c.name}`);
  }
}

type ValidatorCase = {
  name: string;
  formula: string;
  expectedCodes: string[];
};

const validatorCases: ValidatorCase[] = [
  { name: "数组常量不误报", formula: "=SUM({1,2;3,4})", expectedCodes: [] },
  {
    name: "分号模式小数逗号不误报",
    formula: '=IF(C2>1,5;"Yes";"No")',
    expectedCodes: [],
  },
  {
    name: "真正混用分隔符",
    formula: "=SUM(A1,B1;C1)",
    expectedCodes: ["mixed-separator"],
  },
  { name: "全角逗号", formula: "=SUM(A1，A2)", expectedCodes: ["fullwidth-comma"] },
  { name: "引号内括号", formula: '=IF(A1="(",1,2)', expectedCodes: [] },
  { name: "括号不匹配", formula: "=SUM(A1:A10", expectedCodes: ["paren-mismatch"] },
];

for (const c of validatorCases) {
  const codes: string[] = validateFormula(c.formula).map(
    (issue) => issue.code
  );
  const ok =
    codes.length === c.expectedCodes.length &&
    c.expectedCodes.every((code) => codes.includes(code));
  if (!ok) {
    failed++;
    console.log(`FAIL ${c.name}`);
    console.log(`  got: ${codes.join(",")}`);
    console.log(`  expected: ${c.expectedCodes.join(",")}`);
  } else {
    console.log(`PASS ${c.name}`);
  }
}

const checkPrettifySweep = (
  formula: string,
  label: string,
  separator: "," | ";"
) => {
  if (!formula) return;
  try {
    const pretty = prettifyFormula(formula, separator);
    const sourceSemantics = formula.replace(/\s+/g, "");
    const prettySemantics = pretty.text.replace(/\s+/g, "");
    const again = prettifyFormula(pretty.text, separator);
    if (
      sourceSemantics !== prettySemantics ||
      again.text !== pretty.text ||
      again.changed
    ) {
      failed++;
      console.log(`FAIL 美化遍历 ${label} (${separator})`);
      console.log(`  formula: ${formula}`);
      console.log(`  pretty: ${JSON.stringify(pretty)}`);
      console.log(`  again: ${JSON.stringify(again)}`);
    }
  } catch {
    failed++;
    console.log(`FAIL 美化遍历 ${label} (${separator})`);
    console.log(`  formula: ${formula}`);
    console.log("  threw unexpectedly");
  }
};

const selfCheckFill: Record<string, string> = {
  sumRange: "C:C",
  criteriaRange: "A:A",
  criteriaValue: "Sales",
  dateRange: "B:B",
  startDate: "2026-03-01",
  endDate: "2026-03-31",
  countRange: "A:A",
  lookupValue: "A2",
  lookupRange: "A:A",
  returnRange: "C:C",
  notFound: "Not found",
  valueCell: "C2",
  operator: ">",
  threshold: "1000",
  trueValue: "Yes",
  falseValue: "No",
  textCell: "A2",
  searchText: "urgent",
  targetCell: "B2",
  blankValue: "Missing",
  nonBlankValue: "Complete",
  firstText: "A2",
  secondText: "B2",
  delimiter: " ",
  startDateCell: "A2",
  endDateCell: "B2",
  unit: "days",
  oldValue: "A2",
  newValue: "B2",
  rankValue: "C2",
  valueRange: "C2:C1000",
  order: "0",
  sourceRange: "A2:A1000",
  numberCell: "A2",
  decimals: "2",
  emailCell: "A2",
};

const beforeSelfCheck = failed;
for (const task of FORMULA_TASKS) {
  const values: Record<string, string> = {};
  for (const field of task.fields) {
    values[field.key] =
      selfCheckFill[field.key] ??
      field.defaultValue ??
      field.options?.[0]?.value ??
      "A2";
  }
  for (const separator of [",", ";"] as const) {
    const built = buildFormula({
      task: task.id,
      values,
      platform: "excel",
      excelVersion: "excel365",
      lang: "zh",
      argumentSeparator: separator,
    });
    if (!built.formula) continue;
    checkPrettifySweep(built.formula, `${task.id}-main`, separator);
    for (const alternative of built.alternatives) {
      checkPrettifySweep(
        alternative.formula,
        `${task.id}-alternative`,
        separator
      );
    }
    const issues = validateFormula(built.formula);
    if (issues.length > 0) {
      failed++;
      console.log(`FAIL 自检校验 ${task.id} (${separator})`);
      console.log(`  formula: ${built.formula}`);
      console.log(`  issues: ${issues.map((issue) => issue.code).join(",")}`);
      continue;
    }
    const explained = explainFormulaLocally(built.formula, "zh");
    if (explained.assumptions.some((item) => item.zh.includes("未覆盖"))) {
      failed++;
      console.log(`FAIL 自检解释 ${task.id} (${separator})`);
      console.log(`  formula: ${built.formula}`);
    }
  }
}
console.log(
  failed === beforeSelfCheck
    ? "PASS 生成器/校验器/解释器自检"
    : "FAIL 生成器/校验器/解释器自检"
);

failed += runFormulaAuditCases();
console.log(failed ? `\n${failed} case(s) failed` : "\nAll cases passed");
process.exit(failed ? 1 : 0);
