import {
  FORMULA_TASKS,
  buildFormula,
  type FormulaValues,
} from "../lib/formulaBuilder.ts";
import {
  auditFormula,
  type AuditItem,
  type AuditOptions,
} from "../lib/formulaAudit.ts";

type AuditCase = {
  name: string;
  formula: string;
  options: AuditOptions;
  expectedCodes: AuditItem["code"][];
  absentCodes?: AuditItem["code"][];
  expectedOk: boolean;
};

const auditCases: AuditCase[] = [
  {
    name: "字符串内 A:A 不触发整列告警",
    formula: '=SUMIFS(C2:C100,B2:B100,"A:A")',
    options: { platform: "excel", excelVersion: "excel365" },
    expectedCodes: [],
    absentCodes: ["whole-column"],
    expectedOk: true,
  },
  {
    name: "有限区域内包含整列引用",
    formula: '=SUMIFS(C:C,A2:A100,"A:A")',
    options: { platform: "excel", excelVersion: "excel365" },
    expectedCodes: ["whole-column"],
    expectedOk: true,
  },
  {
    name: "SUMIFS 参数配对错位",
    formula: '=SUMIFS(B2:B100,"test",A2:A100)',
    options: { platform: "excel", excelVersion: "excel365" },
    expectedCodes: ["sumifs-structure"],
    expectedOk: false,
  },
  {
    name: "FILTER 在 Excel 2019 的版本与动态日期告警",
    formula: "=FILTER(A2:A100,A2:A100=TODAY())",
    options: { platform: "excel", excelVersion: "excel2019" },
    expectedCodes: ["version-compat", "dynamic-date"],
    expectedOk: true,
  },
  {
    name: "DATEDIF 反向字面日期",
    formula: '=DATEDIF(DATE(2026,5,1),DATE(2026,3,1),"m")',
    options: { platform: "excel", excelVersion: "excel365" },
    expectedCodes: ["datedif-order"],
    expectedOk: true,
  },
  {
    name: "Google XLOOKUP 不触发版本告警",
    formula: '=XLOOKUP("a",B2:B100,C2:C100)',
    options: { platform: "google_sheets", excelVersion: "excel2019" },
    expectedCodes: [],
    absentCodes: ["version-compat"],
    expectedOk: true,
  },
  {
    name: "已转换 SUMPRODUCT 不告警",
    formula: '=SUMPRODUCT(--(A2:A1000="Sales"),C2:C1000)',
    options: { platform: "excel", excelVersion: "excel365" },
    expectedCodes: [],
    absentCodes: ["sumproduct-boolean"],
    expectedOk: true,
  },
  {
    name: "裸 SUMPRODUCT 比较表达式告警",
    formula: "=SUMPRODUCT(A2:A1000>0,B2:B1000)",
    options: { platform: "excel", excelVersion: "excel365" },
    expectedCodes: ["sumproduct-boolean"],
    expectedOk: true,
  },
  {
    name: "SUMPRODUCT 仅对未转换参数告警",
    formula: "=SUMPRODUCT(--(A2:A1000>0),B2:B1000>0)",
    options: { platform: "excel", excelVersion: "excel365" },
    expectedCodes: ["sumproduct-boolean"],
    expectedOk: true,
  },
  {
    name: "IFERROR 包裹内部 SUMIFS 正常校验",
    formula: '=IFERROR(SUMIFS(B2:B100,"test",A2:A100),"")',
    options: { platform: "excel", excelVersion: "excel365" },
    expectedCodes: ["sumifs-structure"],
    expectedOk: false,
  },
  {
    name: "字符串内 TODAY 和感叹号不触发告警",
    formula: '=SUMIFS(C2:C100,A2:A100,"Sheet1!TODAY()")',
    options: { platform: "excel", excelVersion: "excel365" },
    expectedCodes: [],
    absentCodes: ["dynamic-date", "cross-sheet"],
    expectedOk: true,
  },
  {
    name: "IF 的合法空参数不报错",
    formula: "=IF(A1,,0)",
    options: { platform: "excel", excelVersion: "excel365" },
    expectedCodes: [],
    absentCodes: ["empty-argument"],
    expectedOk: true,
  },
  {
    name: "SUMIFS 尾随空条件参数",
    formula: "=SUMIFS(C2:C100,A2:A100,)",
    options: { platform: "excel", excelVersion: "excel365" },
    expectedCodes: ["empty-argument"],
    expectedOk: false,
  },
  {
    name: "分号模式 SUMIFS 参数结构正常",
    formula: '=SUMIFS(C2:C100;A2:A100;"Sales")',
    options: { platform: "excel", excelVersion: "excel365" },
    expectedCodes: [],
    absentCodes: ["sumifs-structure", "empty-argument"],
    expectedOk: true,
  },
  {
    name: "WPS 使用保守版本提示",
    formula: '=FILTER(A2:A100,A2:A100="Sales")',
    options: { platform: "excel", excelVersion: "wps" },
    expectedCodes: ["version-compat"],
    expectedOk: true,
  },
  {
    name: "严重括号错误走静默兜底",
    formula: '=SUMIFS(C2:C100,A2:A100,"Sales"',
    options: { platform: "excel", excelVersion: "excel365" },
    expectedCodes: [],
    expectedOk: true,
  },
];

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

const hasBilingualFields = (formula: string, options: AuditOptions) =>
  auditFormula(formula, options).items.every(
    (item) =>
      item.title.en.length > 0 &&
      item.title.zh.length > 0 &&
      item.desc.en.length > 0 &&
      item.desc.zh.length > 0 &&
      item.suggestion.en.length > 0 &&
      item.suggestion.zh.length > 0
  );

function checkCase(testCase: AuditCase): boolean {
  const actual = auditFormula(testCase.formula, testCase.options);
  const codes = actual.items.map((item) => item.code);
  const hasExpected = testCase.expectedCodes.every((code) =>
    codes.includes(code)
  );
  const hasForbidden = (testCase.absentCodes ?? []).some((code) =>
    codes.includes(code)
  );
  const again = auditFormula(testCase.formula, testCase.options);
  const pass =
    hasExpected &&
    !hasForbidden &&
    actual.ok === testCase.expectedOk &&
    hasBilingualFields(testCase.formula, testCase.options) &&
    JSON.stringify(actual) === JSON.stringify(again);

  if (!pass) {
    console.log(`FAIL 风险校验 ${testCase.name}`);
    console.log(`  got: ${JSON.stringify(actual)}`);
    console.log(`  expected codes: ${JSON.stringify(testCase.expectedCodes)}`);
    console.log(`  absent codes: ${JSON.stringify(testCase.absentCodes ?? [])}`);
  } else {
    console.log(`PASS 风险校验 ${testCase.name}`);
  }

  return pass;
}

function checkSweep(): number {
  let failures = 0;
  const platforms: AuditOptions["platform"][] = ["excel", "google_sheets"];
  const versions: AuditOptions["excelVersion"][] = [
    "excel365",
    "excel2021",
    "excel2019",
    "older",
    "wps",
  ];

  for (const task of FORMULA_TASKS) {
    const values: FormulaValues = {};
    for (const field of task.fields) {
      values[field.key] =
        selfCheckFill[field.key] ??
        field.defaultValue ??
        field.options?.[0]?.value ??
        "A2";
    }

    for (const platform of platforms) {
      for (const excelVersion of versions) {
        for (const argumentSeparator of [",", ";"] as const) {
          const built = buildFormula({
            task: task.id,
            values,
            platform,
            excelVersion,
            lang: "zh",
            argumentSeparator,
          });
          const formulas = [
            built.formula,
            ...built.alternatives.map((item) => item.formula),
          ].filter(Boolean);

          for (const formula of formulas) {
            try {
              const options = { platform, excelVersion };
              const first = auditFormula(formula, options);
              const second = auditFormula(formula, options);
              if (
                JSON.stringify(first) !== JSON.stringify(second) ||
                !hasBilingualFields(formula, options)
              ) {
                failures += 1;
                console.log(
                  `FAIL 风险校验遍历 ${task.id} ${platform}/${excelVersion}/${argumentSeparator}`
                );
                console.log(`  formula: ${formula}`);
              }
            } catch {
              failures += 1;
              console.log(
                `FAIL 风险校验遍历 ${task.id} ${platform}/${excelVersion}/${argumentSeparator}`
              );
              console.log(`  formula: ${formula}`);
              console.log("  threw unexpectedly");
            }
          }
        }
      }
    }
  }

  return failures;
}

export function runFormulaAuditCases(): number {
  let failures = 0;
  for (const testCase of auditCases) {
    if (!checkCase(testCase)) failures += 1;
  }
  failures += checkSweep();
  console.log(
    failures === 0
      ? "PASS 风险校验用例与全量遍历"
      : "FAIL 风险校验用例与全量遍历"
  );
  return failures;
}
