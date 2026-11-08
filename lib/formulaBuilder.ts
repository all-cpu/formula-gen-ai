export type BilingualText = { en: string; zh: string };

export type FormulaTaskId =
  | "sumCondition"
  | "sumDateRange"
  | "countCondition"
  | "countDateRange"
  | "lookup"
  | "conditional"
  | "textContains"
  | "ifBlank"
  | "combineText"
  | "dateDifference"
  | "percentageChange"
  | "rank"
  | "latestDate"
  | "uniqueValues"
  | "countUnique"
  | "extractDomain"
  | "roundNumber"
  | "filterRows";

export type FieldKind = "text" | "select" | "number";

export type FormulaField = {
  key: string;
  label: BilingualText;
  placeholder: BilingualText;
  required?: boolean;
  kind?: FieldKind;
  options?: Array<{ value: string; label: BilingualText }>;
  defaultValue?: string;
};

export type FormulaTask = {
  id: FormulaTaskId;
  label: BilingualText;
  description: BilingualText;
  fields: FormulaField[];
};

export type FormulaValues = Record<string, string>;

export type FormulaResult = {
  formula: string;
  explanation: BilingualText;
  steps: BilingualText[];
  assumptions: BilingualText[];
  alternatives: Array<{ label: BilingualText; formula: string }>;
  example?: { input: BilingualText; result: BilingualText };
  clarification?: BilingualText;
};

export type BuildFormulaInput = {
  task: FormulaTaskId;
  values: FormulaValues;
  platform: "excel" | "google_sheets";
  excelVersion:
    | "excel365"
    | "excel2021"
    | "excel2019"
    | "older"
    | "wps";
  argumentSeparator?: "," | ";";
  lang: "en" | "zh";
};

const pick = (lang: "en" | "zh", text: BilingualText) =>
  lang === "zh" ? text.zh : text.en;

const OPERATORS = [">", ">=", "<", "<=", "=", "<>"];

export const FORMULA_TASKS: FormulaTask[] = [
  {
    id: "sumCondition",
    label: { en: "Sum with a condition", zh: "按条件求和" },
    description: {
      en: "Use SUMIFS to total a column when another column matches a value.",
      zh: "当另一列匹配某个值时，用 SUMIFS 对目标列求和。",
    },
    fields: [
      {
        key: "sumRange",
        label: { en: "Sum range", zh: "求和区域" },
        placeholder: { en: "C:C", zh: "C:C" },
        required: true,
      },
      {
        key: "criteriaRange",
        label: { en: "Criteria range", zh: "条件区域" },
        placeholder: { en: "A:A", zh: "A:A" },
        required: true,
      },
      {
        key: "criteriaValue",
        label: { en: "Criteria value or cell", zh: "条件值或单元格" },
        placeholder: { en: "Sales", zh: "Sales" },
        required: true,
      },
    ],
  },
  {
    id: "sumDateRange",
    label: { en: "Sum between two dates", zh: "按日期区间求和" },
    description: {
      en: "Use SUMIFS with DATE() comparisons for region-safe date filters.",
      zh: "用 SUMIFS 和 DATE() 比较，生成不受区域日期格式影响的筛选公式。",
    },
    fields: [
      {
        key: "sumRange",
        label: { en: "Sum range", zh: "求和区域" },
        placeholder: { en: "C:C", zh: "C:C" },
        required: true,
      },
      {
        key: "dateRange",
        label: { en: "Date range", zh: "日期区域" },
        placeholder: { en: "B:B", zh: "B:B" },
        required: true,
      },
      {
        key: "startDate",
        label: { en: "Start date", zh: "开始日期" },
        placeholder: { en: "2026-03-01", zh: "2026-03-01" },
        required: true,
      },
      {
        key: "endDate",
        label: { en: "End date", zh: "结束日期" },
        placeholder: { en: "2026-03-31", zh: "2026-03-31" },
        required: true,
      },
      {
        key: "criteriaRange",
        label: { en: "Text criteria range (optional)", zh: "文本条件区域（可选）" },
        placeholder: { en: "A:A", zh: "A:A" },
      },
      {
        key: "criteriaValue",
        label: { en: "Text criteria value (optional)", zh: "文本条件值（可选）" },
        placeholder: { en: "Sales", zh: "Sales" },
      },
    ],
  },
  {
    id: "countCondition",
    label: { en: "Count with a condition", zh: "按条件计数" },
    description: {
      en: "Use COUNTIFS to count rows that match one condition.",
      zh: "用 COUNTIFS 统计匹配一个条件的行数。",
    },
    fields: [
      {
        key: "countRange",
        label: { en: "Count range", zh: "计数区域" },
        placeholder: { en: "A:A", zh: "A:A" },
        required: true,
      },
      {
        key: "criteriaValue",
        label: { en: "Criteria value or cell", zh: "条件值或单元格" },
        placeholder: { en: "Completed", zh: "Completed" },
        required: true,
      },
    ],
  },
  {
    id: "countDateRange",
    label: { en: "Count between two dates", zh: "按日期区间计数" },
    description: {
      en: "Count rows whose dates fall between two dates.",
      zh: "统计日期落在两个日期之间的行数。",
    },
    fields: [
      {
        key: "dateRange",
        label: { en: "Date range", zh: "日期区域" },
        placeholder: { en: "B:B", zh: "B:B" },
        required: true,
      },
      {
        key: "startDate",
        label: { en: "Start date", zh: "开始日期" },
        placeholder: { en: "2026-01-01", zh: "2026-01-01" },
        required: true,
      },
      {
        key: "endDate",
        label: { en: "End date", zh: "结束日期" },
        placeholder: { en: "2026-12-31", zh: "2026-12-31" },
        required: true,
      },
    ],
  },
  {
    id: "lookup",
    label: { en: "Look up a value", zh: "查找匹配值" },
    description: {
      en: "Use XLOOKUP in modern apps or INDEX/MATCH in older Excel.",
      zh: "新版应用使用 XLOOKUP，旧版 Excel 使用 INDEX/MATCH。",
    },
    fields: [
      {
        key: "lookupValue",
        label: { en: "Lookup value or cell", zh: "查找值或单元格" },
        placeholder: { en: "A2", zh: "A2" },
        required: true,
      },
      {
        key: "lookupRange",
        label: { en: "Lookup range", zh: "查找区域" },
        placeholder: { en: "A:A", zh: "A:A" },
        required: true,
      },
      {
        key: "returnRange",
        label: { en: "Return range", zh: "返回区域" },
        placeholder: { en: "C:C", zh: "C:C" },
        required: true,
      },
      {
        key: "notFound",
        label: { en: "Not found text", zh: "未找到时显示" },
        placeholder: { en: "Not found", zh: "未找到" },
        defaultValue: "Not found",
      },
    ],
  },
  {
    id: "conditional",
    label: { en: "If a number meets a rule", zh: "数字条件判断" },
    description: {
      en: "Return one value when a number passes a test and another when it does not.",
      zh: "数字满足条件时返回一个值，否则返回另一个值。",
    },
    fields: [
      {
        key: "valueCell",
        label: { en: "Value cell or range", zh: "数值单元格或区域" },
        placeholder: { en: "C2", zh: "C2" },
        required: true,
      },
      {
        key: "operator",
        label: { en: "Operator", zh: "运算符" },
        placeholder: { en: ">", zh: ">" },
        kind: "select",
        options: OPERATORS.map((operator) => ({
          value: operator,
          label: { en: operator, zh: operator },
        })),
        defaultValue: ">",
        required: true,
      },
      {
        key: "threshold",
        label: { en: "Threshold", zh: "阈值" },
        placeholder: { en: "1000", zh: "1000" },
        required: true,
      },
      {
        key: "trueValue",
        label: { en: "Value if true", zh: "为真时返回" },
        placeholder: { en: "Yes", zh: "Yes" },
        required: true,
      },
      {
        key: "falseValue",
        label: { en: "Value if false", zh: "为假时返回" },
        placeholder: { en: "No", zh: "No" },
        required: true,
      },
    ],
  },
  {
    id: "textContains",
    label: { en: "If text contains", zh: "判断文本是否包含" },
    description: {
      en: "Check whether a cell contains text and return a custom result.",
      zh: "判断单元格是否包含指定文本，并返回自定义结果。",
    },
    fields: [
      {
        key: "textCell",
        label: { en: "Text cell", zh: "文本单元格" },
        placeholder: { en: "A2", zh: "A2" },
        required: true,
      },
      {
        key: "searchText",
        label: { en: "Search text", zh: "查找文本" },
        placeholder: { en: "urgent", zh: "urgent" },
        required: true,
      },
      {
        key: "trueValue",
        label: { en: "Value if found", zh: "找到时返回" },
        placeholder: { en: "Yes", zh: "Yes" },
        required: true,
      },
      {
        key: "falseValue",
        label: { en: "Value if not found", zh: "未找到时返回" },
        placeholder: { en: "No", zh: "No" },
        required: true,
      },
    ],
  },
  {
    id: "ifBlank",
    label: { en: "If a cell is blank", zh: "判断单元格是否为空" },
    description: {
      en: "Return different values for blank and non-blank cells.",
      zh: "空白和非空白单元格返回不同结果。",
    },
    fields: [
      {
        key: "targetCell",
        label: { en: "Cell to test", zh: "要判断的单元格" },
        placeholder: { en: "B2", zh: "B2" },
        required: true,
      },
      {
        key: "blankValue",
        label: { en: "Value if blank", zh: "为空时返回" },
        placeholder: { en: "Missing", zh: "Missing" },
        required: true,
      },
      {
        key: "nonBlankValue",
        label: { en: "Value if not blank", zh: "不为空时返回" },
        placeholder: { en: "Complete", zh: "Complete" },
        required: true,
      },
    ],
  },
  {
    id: "combineText",
    label: { en: "Combine two text columns", zh: "合并两个文本列" },
    description: {
      en: "Join two cells with a delimiter and skip blanks when possible.",
      zh: "用分隔符连接两个单元格，并尽量忽略空值。",
    },
    fields: [
      {
        key: "firstText",
        label: { en: "First cell or range", zh: "第一个单元格或区域" },
        placeholder: { en: "A2", zh: "A2" },
        required: true,
      },
      {
        key: "secondText",
        label: { en: "Second cell or range", zh: "第二个单元格或区域" },
        placeholder: { en: "B2", zh: "B2" },
        required: true,
      },
      {
        key: "delimiter",
        label: { en: "Delimiter", zh: "分隔符" },
        placeholder: { en: " ", zh: " " },
        defaultValue: " ",
        required: true,
      },
    ],
  },
  {
    id: "dateDifference",
    label: { en: "Difference between two dates", zh: "计算两个日期差" },
    description: {
      en: "Calculate the number of days, months, or years between dates.",
      zh: "计算两个日期之间相差的天数、月数或年数。",
    },
    fields: [
      {
        key: "startDateCell",
        label: { en: "Start date cell", zh: "开始日期单元格" },
        placeholder: { en: "A2", zh: "A2" },
        required: true,
      },
      {
        key: "endDateCell",
        label: { en: "End date cell", zh: "结束日期单元格" },
        placeholder: { en: "B2", zh: "B2" },
        required: true,
      },
      {
        key: "unit",
        label: { en: "Unit", zh: "单位" },
        placeholder: { en: "days", zh: "days" },
        kind: "select",
        options: [
          { value: "days", label: { en: "Days", zh: "天数" } },
          { value: "months", label: { en: "Months", zh: "月数" } },
          { value: "years", label: { en: "Years", zh: "年数" } },
        ],
        defaultValue: "days",
        required: true,
      },
    ],
  },
  {
    id: "percentageChange",
    label: { en: "Percentage change", zh: "百分比变化" },
    description: {
      en: "Calculate the change from an old value to a new value.",
      zh: "计算从旧值到新值的变化幅度。",
    },
    fields: [
      {
        key: "oldValue",
        label: { en: "Old value cell", zh: "旧值单元格" },
        placeholder: { en: "A2", zh: "A2" },
        required: true,
      },
      {
        key: "newValue",
        label: { en: "New value cell", zh: "新值单元格" },
        placeholder: { en: "B2", zh: "B2" },
        required: true,
      },
    ],
  },
  {
    id: "rank",
    label: { en: "Rank a number", zh: "数字排名" },
    description: {
      en: "Rank a value within a range, from highest or lowest.",
      zh: "在区域内对数值排名，可从高到低或从低到高。",
    },
    fields: [
      {
        key: "rankValue",
        label: { en: "Value cell", zh: "数值单元格" },
        placeholder: { en: "C2", zh: "C2" },
        required: true,
      },
      {
        key: "valueRange",
        label: { en: "Value range", zh: "数值区域" },
        placeholder: { en: "C2:C1000", zh: "C2:C1000" },
        required: true,
      },
      {
        key: "order",
        label: { en: "Order", zh: "排序方式" },
        placeholder: { en: "Order", zh: "排序方式" },
        kind: "select",
        options: [
          { value: "0", label: { en: "Highest to lowest", zh: "从高到低" } },
          { value: "1", label: { en: "Lowest to highest", zh: "从低到高" } },
        ],
        defaultValue: "0",
        required: true,
      },
    ],
  },
  {
    id: "latestDate",
    label: { en: "Find the latest date", zh: "查找最晚日期" },
    description: {
      en: "Return the most recent date in a range.",
      zh: "返回区域中的最晚日期。",
    },
    fields: [
      {
        key: "dateRange",
        label: { en: "Date range", zh: "日期区域" },
        placeholder: { en: "B:B", zh: "B:B" },
        required: true,
      },
    ],
  },
  {
    id: "uniqueValues",
    label: { en: "Remove duplicates", zh: "去除重复值" },
    description: {
      en: "Return unique values as a dynamic array in Excel 365 or Google Sheets.",
      zh: "在 Excel 365 或 Google 表格中返回动态数组的唯一值。",
    },
    fields: [
      {
        key: "sourceRange",
        label: { en: "Source range", zh: "来源区域" },
        placeholder: { en: "A2:A1000", zh: "A2:A1000" },
        required: true,
      },
    ],
  },
  {
    id: "countUnique",
    label: { en: "Count unique values", zh: "统计唯一值数量" },
    description: {
      en: "Count how many distinct values appear in a range.",
      zh: "统计区域中不重复值的数量。",
    },
    fields: [
      {
        key: "sourceRange",
        label: { en: "Source range", zh: "来源区域" },
        placeholder: { en: "A2:A1000", zh: "A2:A1000" },
        required: true,
      },
    ],
  },
  {
    id: "extractDomain",
    label: { en: "Extract an email domain", zh: "提取邮箱域名" },
    description: {
      en: "Return the text after the @ sign in an email address.",
      zh: "返回邮箱地址中 @ 后面的域名。",
    },
    fields: [
      {
        key: "emailCell",
        label: { en: "Email cell", zh: "邮箱单元格" },
        placeholder: { en: "A2", zh: "A2" },
        required: true,
      },
    ],
  },
  {
    id: "roundNumber",
    label: { en: "Round a number", zh: "数字四舍五入" },
    description: {
      en: "Round a number to a fixed number of decimal places.",
      zh: "将数字四舍五入到指定小数位。",
    },
    fields: [
      {
        key: "numberCell",
        label: { en: "Number cell", zh: "数字单元格" },
        placeholder: { en: "A2", zh: "A2" },
        required: true,
      },
      {
        key: "decimals",
        label: { en: "Decimal places", zh: "小数位" },
        placeholder: { en: "2", zh: "2" },
        kind: "number",
        defaultValue: "2",
        required: true,
      },
    ],
  },
  {
    id: "filterRows",
    label: { en: "Filter rows by a condition", zh: "按条件筛选行" },
    description: {
      en: "Return matching rows as a dynamic array.",
      zh: "以动态数组返回匹配的行。",
    },
    fields: [
      {
        key: "sourceRange",
        label: { en: "Source range", zh: "来源区域" },
        placeholder: { en: "A2:C1000", zh: "A2:C1000" },
        required: true,
      },
      {
        key: "criteriaRange",
        label: { en: "Criteria range", zh: "条件区域" },
        placeholder: { en: "A2:A1000", zh: "A2:A1000" },
        required: true,
      },
      {
        key: "criteriaValue",
        label: { en: "Criteria value or cell", zh: "条件值或单元格" },
        placeholder: { en: "Sales", zh: "Sales" },
        required: true,
      },
    ],
  },
];

export function getFormulaTask(taskId: FormulaTaskId) {
  return FORMULA_TASKS.find((task) => task.id === taskId) ?? FORMULA_TASKS[0];
}

export function getDefaultValues(taskId: FormulaTaskId): FormulaValues {
  const task = getFormulaTask(taskId);
  return task.fields.reduce<FormulaValues>((values, field) => {
    values[field.key] = field.defaultValue ?? "";
    return values;
  }, {});
}

function isNumeric(value: string) {
  return value.trim() !== "" && Number.isFinite(Number(value));
}

const CELL_OR_RANGE_RE =
  /^(?:(?:'(?:[^']|'')+'|[^!\s']+)!)?(?:\$?[A-Za-z]{1,3}\$?\d+(?::\$?[A-Za-z]{1,3}\$?\d+)?|\$?[A-Za-z]{1,3}:\$?[A-Za-z]{1,3})$/;

function isCellOrRange(value: string) {
  return CELL_OR_RANGE_RE.test(value.trim());
}

function boundedDataRange(value: string, maxRow = 1000) {
  const range = value.trim().toUpperCase().replace(/\$/g, "");
  // Bound only whole-column references; explicit finite ranges stay as typed.
  const wholeColumn = range.match(/^([A-Z]+):([A-Z]+)$/);
  if (wholeColumn) return `${wholeColumn[1]}2:${wholeColumn[2]}${maxRow}`;
  return range;
}

type DataRangeShape = {
  startColumn: string;
  endColumn: string;
  startRow: number | null;
  endRow: number | null;
};

function parseDataRange(value: string): DataRangeShape | null {
  const range = value.trim().toUpperCase().replace(/\$/g, "");
  const whole = range.match(/^([A-Z]+):([A-Z]+)$/);
  if (whole) {
    return {
      startColumn: whole[1],
      endColumn: whole[2],
      startRow: null,
      endRow: null,
    };
  }
  const finite = range.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/);
  if (!finite) return null;
  return {
    startColumn: finite[1],
    endColumn: finite[3],
    startRow: Number(finite[2]),
    endRow: Number(finite[4]),
  };
}

function alignedFilterRanges(
  sourceValue: string,
  criteriaValue: string,
  maxRow = 1000
) {
  const source = parseDataRange(sourceValue);
  const criteria = parseDataRange(criteriaValue);
  if (
    !source ||
    !criteria ||
    (source.startRow !== null && criteria.startRow !== null)
  ) {
    return {
      source: boundedDataRange(sourceValue, maxRow),
      criteria: boundedDataRange(criteriaValue, maxRow),
    };
  }

  const startRow = source.startRow ?? criteria.startRow ?? 2;
  const endRow = source.endRow ?? criteria.endRow ?? maxRow;
  return {
    source: `${source.startColumn}${startRow}:${source.endColumn}${endRow}`,
    criteria: `${criteria.startColumn}${startRow}:${criteria.endColumn}${endRow}`,
  };
}

function excelString(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function formatScalar(value: string, separator: "," | ";" = ",") {
  const trimmed = value.trim();
  if (
    isNumeric(trimmed) ||
    /^(TRUE|FALSE)$/i.test(trimmed) ||
    isCellOrRange(trimmed) ||
    trimmed.startsWith("=") ||
    trimmed.startsWith('"') ||
    OPERATORS.includes(trimmed)
  ) {
    if (isNumeric(trimmed) && separator === ";") {
      return trimmed.replace(".", ",");
    }
    return trimmed;
  }
  return excelString(trimmed);
}

function formatDateInput(value: string) {
  const match = value.trim().match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return { year, month, day };
}

function dateComparison(
  operator: ">=" | "<=",
  value: string,
  sep = ","
) {
  const date = formatDateInput(value);
  if (!date) return null;
  return `"${operator}"&DATE(${[date.year, date.month, date.day].join(sep)})`;
}
function datePart(comparison: string): string {
  // "datePart" strips the quoted operator prefix from a dateComparison result,
  // returning just the DATE(...) expression for use inside SUMPRODUCT conditions.
  const match = comparison.match(/^"[><=]+"&(.+)$/);
  return match ? match[1] : comparison;
}
function dynamicDateComparisons(
  relativeDate: string,
  sep = ","
): {
  start: string;
  end: string;
} | null {
  const quarterStart = `DATE(YEAR(TODAY())${sep}3*INT((MONTH(TODAY())-1)/3)+1${sep}1)`;
  switch (relativeDate) {
    case "lastMonth":
      return {
        start: `">="&EOMONTH(TODAY()${sep}-2)+1`,
        end: `"<="&EOMONTH(TODAY()${sep}-1)`,
      };
    case "thisMonth":
      return {
        start: `">="&EOMONTH(TODAY()${sep}-1)+1`,
        end: `"<="&EOMONTH(TODAY()${sep}0)`,
      };
    case "thisQuarter":
      return {
        start: `">="&${quarterStart}`,
        end: `"<="&EOMONTH(${quarterStart}${sep}0)`,
      };
    case "thisYear":
      return {
        start: `">="&DATE(YEAR(TODAY())${sep}1${sep}1)`,
        end: `"<="&DATE(YEAR(TODAY())${sep}12${sep}31)`,
      };
    case "lastYear":
      return {
        start: `">="&DATE(YEAR(TODAY())-1${sep}1${sep}1)`,
        end: `"<="&DATE(YEAR(TODAY())-1${sep}12${sep}31)`,
      };
    default:
      return null;
  }
}

function missingResult(
  fieldLabel: BilingualText,
  lang: "en" | "zh"
): FormulaResult {
  return {
    formula: "",
    explanation: {
      en: "The formula is not ready yet.",
      zh: "公式尚未生成。",
    },
    steps: [],
    assumptions: [],
    alternatives: [],
    clarification: {
      en: `Please fill in "${fieldLabel.en}" before generating the formula.`,
      zh: `请先填写「${fieldLabel.zh}」，再生成公式。`,
    },
  };
}

function validateRequired(
  task: FormulaTask,
  values: FormulaValues,
  lang: "en" | "zh"
) {
  const missing = task.fields.find((field) => {
    if (!field.required) return false;
    const value = values[field.key] ?? "";
    return field.key === "delimiter" ? value === "" : value.trim() === "";
  });
  return missing ? missingResult(missing.label, lang) : null;
}

export function buildFormula(input: BuildFormulaInput): FormulaResult {
  const task = getFormulaTask(input.task);
  const values = input.values;
  const lang = input.lang;
  const missing = validateRequired(task, values, lang);
  if (missing) return missing;

  const v = (key: string) => values[key]?.trim() ?? "";
  const raw = (key: string) => values[key] ?? "";
  const supportsXlookup =
    input.platform === "google_sheets" ||
    input.excelVersion === "excel365" ||
    input.excelVersion === "excel2021" ||
    input.excelVersion === "wps";
  const supportsDynamicArrays =
    input.platform === "google_sheets" ||
    input.excelVersion === "excel365" ||
    input.excelVersion === "excel2021" ||
    input.excelVersion === "wps";
  const supportsTextJoin =
    input.platform === "google_sheets" ||
    input.excelVersion === "excel365" ||
    input.excelVersion === "excel2021" ||
    input.excelVersion === "excel2019" ||
    input.excelVersion === "wps";
  const supportsTextAfter =
    input.platform === "excel" && input.excelVersion === "excel365";
  const separator = input.argumentSeparator ?? ",";
  const joinArgs = (args: string[]) => args.join(separator);

  switch (input.task) {
    case "sumCondition": {
      const formula = `=SUMIFS(${joinArgs([
        v("sumRange"),
        v("criteriaRange"),
        formatScalar(v("criteriaValue"), separator),
      ])})`;
      const boundedCriteriaRange = boundedDataRange(v("criteriaRange"));
      const boundedSumRange = boundedDataRange(v("sumRange"));
      return {
        formula,
        explanation: {
          en: `This formula totals ${v("sumRange")} only where ${v(
            "criteriaRange"
          )} equals ${v("criteriaValue")}.`,
          zh: `该公式只在 ${v("criteriaRange")} 等于 ${v(
            "criteriaValue"
          )} 时，对 ${v("sumRange")} 求和。`,
        },
        steps: [
          {
            en: `${v("sumRange")} is the range being summed.`,
            zh: `${v("sumRange")} 是求和区域。`,
          },
          {
            en: `${v("criteriaRange")} is tested against the criteria.`,
            zh: `${v("criteriaRange")} 会与条件进行比较。`,
          },
          {
            en: "Only rows that pass the condition are included in the total.",
            zh: "只有满足条件的行会计入合计。",
          },
        ],
        assumptions: [
          {
            en: "The sum range and criteria range must contain the same number of rows.",
            zh: "求和区域和条件区域的行数必须一致。",
          },
        ],
        alternatives: [
          {
            label: {
              en: "SUMPRODUCT version",
              zh: "SUMPRODUCT 版本",
            },
            formula: `=SUMPRODUCT(${joinArgs([
              `--(${boundedCriteriaRange}=${formatScalar(
                v("criteriaValue"),
                separator
              )})`,
              boundedSumRange,
            ])})`,
          },
        ],
        example: {
          input: { en: "Sales | 500", zh: "Sales | 500" },
          result: { en: "500", zh: "500" },
        },
      };
    }

    case "sumDateRange": {
      const staticStart = dateComparison(">=", v("startDate"), separator);
      const staticEnd = dateComparison("<=", v("endDate"), separator);
      if (!staticStart || !staticEnd) {
        return {
          formula: "",
          explanation: { en: "", zh: "" },
          steps: [],
          assumptions: [],
          alternatives: [],
          clarification: {
            en: "Use valid dates in YYYY-MM-DD format, for example 2026-03-01.",
            zh: "请使用有效的 YYYY-MM-DD 日期，例如 2026-03-01。",
          },
        };
      }
      const dyn = v("relativeDate")
        ? dynamicDateComparisons(v("relativeDate"), separator)
        : null;
      const start = dyn?.start ?? staticStart;
      const end = dyn?.end ?? staticEnd;
      const criteriaRange = v("criteriaRange");
      const criteriaValue = v("criteriaValue");
      const hasTextCriteria = criteriaRange !== "" && criteriaValue !== "";
      const args = [v("sumRange")];
      if (hasTextCriteria) {
        args.push(criteriaRange, formatScalar(criteriaValue, separator));
      }
      args.push(v("dateRange"), start, v("dateRange"), end);
      const formula = `=SUMIFS(${joinArgs(args)})`;

      const boundedDateRange = boundedDataRange(v("dateRange"));
      const boundedSumRange = boundedDataRange(v("sumRange"));
      const boundedCriteriaRange = hasTextCriteria
        ? boundedDataRange(criteriaRange)
        : null;
      const sumproductArgs = [
        ...(boundedCriteriaRange
          ? [
              `--(${boundedCriteriaRange}=${formatScalar(
                criteriaValue,
                separator
              )})`,
            ]
          : []),
        `--(${boundedDateRange}>=${datePart(staticStart)})`,
        `--(${boundedDateRange}<=${datePart(staticEnd)})`,
        boundedSumRange,
      ];
      const staticSumproduct = `=SUMPRODUCT(${joinArgs(sumproductArgs)})`;

      const alternatives: Array<{
        label: BilingualText;
        formula: string;
      }> = [
        {
          label: {
            en: "SUMPRODUCT version for older workbooks (bounded range)",
            zh: "适用于旧工作簿的 SUMPRODUCT 版本（有限区域）",
          },
          formula: staticSumproduct,
        },
      ];
      if (dyn) {
        alternatives.push({
          label: {
            en: "Static dates version",
            zh: "固定日期版本",
          },
          formula: `=SUMIFS(${joinArgs([
            v("sumRange"),
            ...(hasTextCriteria
              ? [criteriaRange, formatScalar(criteriaValue, separator)]
              : []),
            v("dateRange"),
            staticStart,
            v("dateRange"),
            staticEnd,
          ])})`,
        });
      }

      return {
        formula,
        explanation: {
          en: `This formula totals ${v("sumRange")} for rows whose date in ${v(
            "dateRange"
          )} falls from ${v("startDate")} through ${v("endDate")}.`,
          zh: `该公式对 ${v("dateRange")} 中日期在 ${v(
            "startDate"
          )} 到 ${v("endDate")} 之间的行，汇总 ${v("sumRange")}。`,
        },
        steps: [
          {
            en: `${v("sumRange")} is the range being summed.`,
            zh: `${v("sumRange")} 是求和区域。`,
          },
          {
            en: "The first date comparison includes dates on or after the start date.",
            zh: "第一个日期比较包含开始日期及之后的日期。",
          },
          {
            en: "The second date comparison includes dates on or before the end date.",
            zh: "第二个日期比较包含结束日期及之前的日期。",
          },
        ],
        assumptions: [
          {
            en: `${v("dateRange")} must contain real dates, not text that looks like dates.`,
            zh: `${v("dateRange")} 必须包含真实日期，而不是看似日期的文本。`,
          },
        ],
        alternatives,
        example: {
          input: { en: "2026-03-05 | 500", zh: "2026-03-05 | 500" },
          result: { en: "500", zh: "500" },
        },
      };
    }

    case "countCondition": {
      const formula = `=COUNTIFS(${joinArgs([
        v("countRange"),
        formatScalar(v("criteriaValue"), separator),
      ])})`;
      return {
        formula,
        explanation: {
          en: `This formula counts rows in ${v("countRange")} that match ${v(
            "criteriaValue"
          )}.`,
          zh: `该公式统计 ${v("countRange")} 中匹配 ${v(
            "criteriaValue"
          )} 的行数。`,
        },
        steps: [
          {
            en: `${v("countRange")} is the range being tested.`,
            zh: `${v("countRange")} 是被检查的区域。`,
          },
          {
            en: "COUNTIFS increments the count once for every matching row.",
            zh: "每遇到一条匹配行，COUNTIFS 就增加 1。",
          },
        ],
        assumptions: [],
        alternatives: [
          {
            label: { en: "Count non-blank cells", zh: "统计非空单元格" },
            formula: `=COUNTA(${v("countRange")})`,
          },
        ],
        example: {
          input: { en: "Completed", zh: "Completed" },
          result: { en: "1 matching row", zh: "1 行匹配" },
        },
      };
    }

    case "countDateRange": {
      const staticStart = dateComparison(">=", v("startDate"), separator);
      const staticEnd = dateComparison("<=", v("endDate"), separator);
      if (!staticStart || !staticEnd) {
        return {
          formula: "",
          explanation: { en: "", zh: "" },
          steps: [],
          assumptions: [],
          alternatives: [],
          clarification: {
            en: "Use valid dates in YYYY-MM-DD format, for example 2026-01-01.",
            zh: "请使用有效的 YYYY-MM-DD 日期，例如 2026-01-01。",
          },
        };
      }
      const dyn = v("relativeDate")
        ? dynamicDateComparisons(v("relativeDate"), separator)
        : null;
      const start = dyn?.start ?? staticStart;
      const end = dyn?.end ?? staticEnd;
      const formula = `=COUNTIFS(${joinArgs([
        v("dateRange"),
        start,
        v("dateRange"),
        end,
      ])})`;
      const alternatives: Array<{ label: BilingualText; formula: string }> = [];
      if (dyn) {
        alternatives.push({
          label: { en: "Static dates version", zh: "固定日期版本" },
          formula: `=COUNTIFS(${joinArgs([
            v("dateRange"),
            staticStart,
            v("dateRange"),
            staticEnd,
          ])})`,
        });
      }
      return {
        formula,
        explanation: {
          en: `This formula counts rows where the date in ${v(
            "dateRange"
          )} is between ${v("startDate")} and ${v("endDate")}.`,
          zh: `该公式统计 ${v("dateRange")} 中日期在 ${v(
            "startDate"
          )} 到 ${v("endDate")} 之间的行数。`,
        },
        steps: [
          {
            en: "The first criterion includes dates on or after the start date.",
            zh: "第一个条件包含开始日期及之后的日期。",
          },
          {
            en: "The second criterion includes dates on or before the end date.",
            zh: "第二个条件包含结束日期及之前的日期。",
          },
        ],
        assumptions: [
          {
            en: "Blank cells and text values are not counted as dates.",
            zh: "空单元格和文本值不会按日期计数。",
          },
        ],
        alternatives,
        example: {
          input: { en: "2026-03-15", zh: "2026-03-15" },
          result: { en: "1 matching row", zh: "1 行匹配" },
        },
      };
    }

    case "lookup": {
      const notFound = formatScalar(
        v("notFound") || "Not found",
        separator
      );
      if (supportsXlookup) {
        return {
          formula: `=XLOOKUP(${joinArgs([
            v("lookupValue"),
            v("lookupRange"),
            v("returnRange"),
            notFound,
          ])})`,
          explanation: {
            en: `This formula finds ${v("lookupValue")} in ${v(
              "lookupRange"
            )} and returns the matching value from ${v("returnRange")}.`,
            zh: `该公式在 ${v("lookupRange")} 中查找 ${v(
              "lookupValue"
            )}，并返回 ${v("returnRange")} 中对应的值。`,
          },
          steps: [
            {
              en: `${v("lookupValue")} is the value to find.`,
              zh: `${v("lookupValue")} 是要查找的值。`,
            },
            {
              en: `${v("lookupRange")} is searched from top to bottom.`,
              zh: `${v("lookupRange")} 会从上到下搜索。`,
            },
            {
              en: `${v("returnRange")} supplies the value returned from the matching row.`,
              zh: `${v("returnRange")} 提供匹配行对应的返回值。`,
            },
          ],
          assumptions: [
            {
              en: "The lookup and return ranges must have the same number of rows.",
              zh: "查找区域和返回区域行数必须一致。",
            },
          ],
          alternatives: [
            {
              label: {
                en: "INDEX/MATCH for older Excel",
                zh: "旧版 Excel 的 INDEX/MATCH",
              },
              formula: `=IFERROR(${joinArgs([
                `INDEX(${joinArgs([
                  v("returnRange"),
                  `MATCH(${joinArgs([
                    v("lookupValue"),
                    v("lookupRange"),
                    "0",
                  ])})`,
                ])})`,
                notFound,
              ])})`,
            },
          ],
          example: {
            input: { en: "SKU-100 | 25.00", zh: "SKU-100 | 25.00" },
            result: { en: "25.00", zh: "25.00" },
          },
        };
      }

      return {
        formula: `=IFERROR(${joinArgs([
          `INDEX(${joinArgs([
            v("returnRange"),
            `MATCH(${joinArgs([
              v("lookupValue"),
              v("lookupRange"),
              "0",
            ])})`,
          ])})`,
          notFound,
        ])})`,
        explanation: {
          en: `This formula uses MATCH to locate ${v(
            "lookupValue"
          )} and INDEX to return the value from ${v("returnRange")}.`,
          zh: `该公式用 MATCH 定位 ${v(
            "lookupValue"
          )}，再用 INDEX 返回 ${v("returnRange")} 中的值。`,
        },
        steps: [
          {
            en: "MATCH finds the row number of the exact lookup value.",
            zh: "MATCH 找到精确查找值所在的行号。",
          },
          {
            en: "INDEX returns the value from that row in the return range.",
            zh: "INDEX 返回返回区域中该行的值。",
          },
          {
            en: "IFERROR shows the fallback text when there is no match.",
            zh: "没有匹配时，IFERROR 显示备用文本。",
          },
        ],
        assumptions: [],
        alternatives: [
          {
            label: {
              en: "XLOOKUP for Excel 365 / 2021 / WPS",
              zh: "Excel 365 / 2021 / WPS 的 XLOOKUP",
            },
            formula: `=XLOOKUP(${joinArgs([v("lookupValue"), v("lookupRange"), v("returnRange"), notFound])})`,
          },
        ],
        example: {
          input: { en: "SKU-100 | 25.00", zh: "SKU-100 | 25.00" },
          result: { en: "25.00", zh: "25.00" },
        },
      };
    }

    case "conditional": {
      const operator = OPERATORS.includes(v("operator")) ? v("operator") : ">";
      const formula = `=IF(${joinArgs([
        `${v("valueCell")}${operator}${formatScalar(
          v("threshold"),
          separator
        )}`,
        formatScalar(v("trueValue"), separator),
        formatScalar(v("falseValue"), separator),
      ])})`;
      return {
        formula,
        explanation: {
          en: `This formula returns ${v("trueValue")} when ${v(
            "valueCell"
          )} ${operator} ${v("threshold")}; otherwise it returns ${v(
            "falseValue"
          )}.`,
          zh: `当 ${v("valueCell")} ${operator} ${v(
            "threshold"
          )} 时返回 ${v("trueValue")}，否则返回 ${v("falseValue")}。`,
        },
        steps: [
          {
            en: "IF evaluates the logical test first.",
            zh: "IF 会先计算逻辑条件。",
          },
          {
            en: "When the test is true, the second argument is returned.",
            zh: "条件为真时返回第二个参数。",
          },
          {
            en: "When the test is false, the third argument is returned.",
            zh: "条件为假时返回第三个参数。",
          },
        ],
        assumptions: [
          {
            en: "Text values are case-insensitive in Excel comparisons.",
            zh: "Excel 的文本比较不区分大小写。",
          },
        ],
        alternatives: [],
        example: {
          input: { en: "1200", zh: "1200" },
          result: { en: v("trueValue"), zh: v("trueValue") },
        },
      };
    }

    case "textContains": {
      const formula = `=IF(${joinArgs([
        `ISNUMBER(SEARCH(${joinArgs([
          formatScalar(v("searchText"), separator),
          v("textCell"),
        ])}))`,
        formatScalar(v("trueValue"), separator),
        formatScalar(v("falseValue"), separator),
      ])})`;
      return {
        formula,
        explanation: {
          en: `This formula checks whether ${v(
            "textCell"
          )} contains ${v("searchText")} and returns ${v(
            "trueValue"
          )} or ${v("falseValue")}.`,
          zh: `该公式判断 ${v("textCell")} 是否包含 ${v(
            "searchText"
          )}，并返回 ${v("trueValue")} 或 ${v("falseValue")}。`,
        },
        steps: [
          {
            en: "SEARCH looks for the text and is case-insensitive.",
            zh: "SEARCH 查找文本，且不区分大小写。",
          },
          {
            en: "ISNUMBER converts a successful search into TRUE.",
            zh: "ISNUMBER 将查找成功转换为 TRUE。",
          },
          {
            en: "IF returns the requested result.",
            zh: "IF 返回你设置的结果。",
          },
        ],
        assumptions: [],
        alternatives: [
          {
            label: { en: "Case-sensitive version", zh: "区分大小写版本" },
            formula: `=IF(${joinArgs([
              `ISNUMBER(FIND(${joinArgs([
                formatScalar(v("searchText"), separator),
                v("textCell"),
              ])}))`,
              formatScalar(v("trueValue"), separator),
              formatScalar(v("falseValue"), separator),
            ])})`,
          },
        ],
        example: {
          input: { en: "Urgent invoice", zh: "Urgent invoice" },
          result: { en: v("trueValue"), zh: v("trueValue") },
        },
      };
    }

    case "ifBlank": {
      const formula = `=IF(${joinArgs([
        `${v("targetCell")}=""`,
        formatScalar(v("blankValue"), separator),
        formatScalar(v("nonBlankValue"), separator),
      ])})`;
      return {
        formula,
        explanation: {
          en: `This formula returns ${v("blankValue")} when ${v(
            "targetCell"
          )} is blank and ${v("nonBlankValue")} when it contains data.`,
          zh: `当 ${v("targetCell")} 为空时返回 ${v(
            "blankValue"
          )}，有内容时返回 ${v("nonBlankValue")}。`,
        },
        steps: [
          {
            en: 'The test compares the cell to an empty string "".',
            zh: '条件会将单元格与空字符串 "" 比较。',
          },
          {
            en: "A cell containing a formula that returns empty text is treated as blank by this test.",
            zh: "此条件会把公式返回空文本的单元格视为空。",
          },
        ],
        assumptions: [],
        alternatives: [
          {
            label: { en: "Treat zero as blank too", zh: "将 0 也视为空" },
            formula: `=IF(${joinArgs([
              `OR(${joinArgs([`${v("targetCell")}=""`, `${v("targetCell")}=0`])})`,
              formatScalar(v("blankValue"), separator),
              formatScalar(v("nonBlankValue"), separator),
            ])})`,
          },
        ],
        example: {
          input: { en: "Empty cell", zh: "空单元格" },
          result: { en: v("blankValue"), zh: v("blankValue") },
        },
      };
    }

    case "combineText": {
      // The delimiter is literal user text, so a single space must survive.
      const delimiterValue = raw("delimiter");
      const delimiter = excelString(delimiterValue);
      const legacyFormula = delimiterValue
        ? `=${v("firstText")}&${delimiter}&${v("secondText")}`
        : `=${v("firstText")}&${v("secondText")}`;
      const formula = supportsTextJoin
        ? `=TEXTJOIN(${joinArgs([delimiter, "TRUE", v("firstText"), v("secondText")])})`
        : legacyFormula;
      return {
        formula,
        explanation: {
          en: `This formula joins ${v("firstText")} and ${v(
            "secondText"
          )} using the delimiter you specified, ignoring blanks.`,
          zh: `该公式用你设置的分隔符连接 ${v("firstText")} 和 ${v(
            "secondText"
          )}，并忽略空值。`,
        },
        steps: [
          supportsTextJoin
            ? {
                en: "TEXTJOIN inserts the delimiter between values.",
                zh: "TEXTJOIN 会在值之间插入分隔符。",
              }
            : {
                en: "The & operator joins the two values directly.",
                zh: "& 运算符直接连接两个值。",
              },
          supportsTextJoin
            ? {
                en: "TRUE tells Excel to ignore empty cells.",
                zh: "TRUE 表示忽略空单元格。",
              }
            : {
                en: "This version keeps empty cells as part of the result.",
                zh: "此版本会把空单元格保留在结果中。",
              },
        ],
        assumptions: supportsTextJoin
          ? [
              {
                en: "TEXTJOIN is available in Excel 2019, Excel 365, WPS, and Google Sheets.",
                zh: "TEXTJOIN 适用于 Excel 2019、Excel 365、WPS 和 Google 表格。",
              },
            ]
          : [],
        alternatives: [
          {
            label: { en: "Older Excel compatible version", zh: "旧版 Excel 兼容版本" },
            formula: legacyFormula,
          },
        ],
        example: {
          input: { en: "Anna | Lee", zh: "Anna | Lee" },
          result: { en: "Anna Lee", zh: "Anna Lee" },
        },
      };
    }

    case "dateDifference": {
      const unit = v("unit") || "days";
      const formula =
        unit === "days"
          ? `=ABS(${v("endDateCell")}-${v("startDateCell")})`
          : `=IFERROR(${joinArgs([
              `DATEDIF(${joinArgs([v("startDateCell"), v("endDateCell"), `"${unit === "months" ? "m" : "y"}"`])})`,
              `""`,
            ])})`;
      return {
        formula,
        explanation: {
          en: `This formula calculates the number of ${unit} between ${v(
            "startDateCell"
          )} and ${v("endDateCell")}.`,
          zh: `该公式计算 ${v("startDateCell")} 和 ${v(
            "endDateCell"
          )} 之间相差的${unit === "days" ? "天数" : unit === "months" ? "月数" : "年数"}。`,
        },
        steps: [
          {
            en: "Both cells must contain real date values.",
            zh: "两个单元格都必须是真实日期值。",
          },
          {
            en: "The result is a number, not formatted text.",
            zh: "结果是数字，不是格式化文本。",
          },
        ],
        assumptions: [
          {
            en: "For DATEDIF, the start date should be earlier than or equal to the end date.",
            zh: "使用 DATEDIF 时，开始日期应早于或等于结束日期。",
          },
        ],
        alternatives:
          unit === "days"
            ? [
                {
                  label: { en: "Keep the sign", zh: "保留正负号" },
                  formula: `=${v("endDateCell")}-${v("startDateCell")}`,
                },
              ]
            : [],
        example: {
          input: { en: "2026-01-01 | 2026-01-31", zh: "2026-01-01 | 2026-01-31" },
          result:
            unit === "days"
              ? { en: "30", zh: "30" }
              : unit === "months"
              ? { en: "0", zh: "0" }
              : { en: "0", zh: "0" },
        },
      };
    }

    case "percentageChange": {
      const changeExpression = `(${v("newValue")}-${v(
        "oldValue"
      )})/ABS(${v("oldValue")})`;
      const formula = `=IFERROR(${joinArgs([changeExpression, `""`])})`;
      return {
        formula,
        explanation: {
          en: `This formula calculates the percentage change from ${v(
            "oldValue"
          )} to ${v("newValue")}. Format the result cell as a percentage.`,
          zh: `该公式计算从 ${v("oldValue")} 到 ${v(
            "newValue"
          )} 的百分比变化。请把结果单元格设置为百分比格式。`,
        },
        steps: [
          {
            en: "Subtract the old value from the new value.",
            zh: "用新值减去旧值。",
          },
          {
            en: "Divide by the absolute old value to handle negative baselines consistently.",
            zh: "除以旧值的绝对值，使负基数的方向更一致。",
          },
          {
            en: "Format the result as a percentage.",
            zh: "将结果格式设置为百分比。",
          },
        ],
        assumptions: [
          {
            en: "The old value must not be zero.",
            zh: "旧值不能为 0。",
          },
        ],
        alternatives: [
          {
            label: { en: "Without error guard", zh: "不隐藏错误" },
            formula: `=${changeExpression}`,
          },
        ],
        example: {
          input: { en: "80 | 100", zh: "80 | 100" },
          result: { en: "25%", zh: "25%" },
        },
      };
    }

    case "rank": {
      const order = v("order") === "1" ? "1" : "0";
      return {
        formula: `=${input.excelVersion === "older" && input.platform === "excel" ? "RANK" : "RANK.EQ"}(${joinArgs([
          v("rankValue"),
          v("valueRange"),
          order,
        ])})`,
        explanation: {
          en: `This formula ranks ${v("rankValue")} within ${v(
            "valueRange"
          )} using order ${order}.`,
          zh: `该公式按排序参数 ${order}，在 ${v(
            "valueRange"
          )} 中对 ${v("rankValue")} 排名。`,
        },
        steps: [
          {
            en: "Order 0 ranks the largest value as 1.",
            zh: "参数 0 表示最大值排名为 1。",
          },
          {
            en: "Order 1 ranks the smallest value as 1.",
            zh: "参数 1 表示最小值排名为 1。",
          },
        ],
        assumptions: [
          {
            en: "Duplicate values receive the same rank.",
            zh: "相同数值会得到相同排名。",
          },
        ],
        alternatives: [],
        example: {
          input: { en: "950 in a list", zh: "列表中的 950" },
          result: { en: "Rank 1", zh: "第 1 名" },
        },
      };
    }

    case "latestDate": {
      const dateRange = v("dateRange");
      return {
        formula: `=IF(${joinArgs([`COUNT(${dateRange})=0`, `""`, `MAX(${dateRange})`])})`,
        explanation: {
          en: `This formula returns the latest date found in ${v("dateRange")}, or blank when the range is empty.`,
          zh: `该公式返回 ${v("dateRange")} 中的最晚日期；区域为空时返回空白。`,
        },
        steps: [
          {
            en: "COUNT checks whether the range contains any number.",
            zh: "COUNT 检查区域中是否包含数字。",
          },
          {
            en: "MAX returns the latest date and ignores text and blank cells.",
            zh: "MAX 返回最晚日期，并忽略文本和空单元格。",
          },
          {
            en: "The result cell should use a date format.",
            zh: "结果单元格应使用日期格式。",
          },
        ],
        assumptions: [],
        alternatives: [
          {
            label: { en: "Earliest date", zh: "最早日期" },
            formula: `=IF(${joinArgs([`COUNT(${dateRange})=0`, `""`, `MIN(${dateRange})`])})`,
          },
        ],
        example: {
          input: { en: "2026-01-05 | 2026-03-20", zh: "2026-01-05 | 2026-03-20" },
          result: { en: "2026-03-20", zh: "2026-03-20" },
        },
      };
    }

    case "uniqueValues": {
      const uniqueSource = boundedDataRange(v("sourceRange"));
      return {
        formula: supportsDynamicArrays
          ? `=UNIQUE(${joinArgs([uniqueSource])})`
          : "",
        clarification: supportsDynamicArrays
          ? undefined
          : {
              en: "Your version does not support dynamic arrays. Use Data > Remove Duplicates or Data > Advanced Filter to get unique values.",
              zh: "你的版本不支持动态数组。请使用「数据→删除重复值」或「数据→高级筛选」来提取不重复值。",
            },
        explanation: {
          en: `This formula returns each distinct value from ${v(
            "sourceRange"
          )} once.`,
          zh: `该公式从 ${v("sourceRange")} 中返回每个不重复的值一次。`,
        },
        steps: [
          ...(supportsDynamicArrays
            ? [
                {
                  en: "The result spills down automatically in Excel 365 and Google Sheets.",
                  zh: "在 Excel 365 和 Google 表格中，结果会自动向下扩展。",
                },
              ]
            : [
                {
                  en: "Use Data > Remove Duplicates, or Data > Advanced Filter, to get unique values.",
                  zh: "请使用「数据→删除重复值」或「数据→高级筛选」来提取不重复值。",
                },
              ]),
          {
            en: "The source range is limited to the first 1000 rows for predictable results.",
            zh: "来源区域限制为前 1000 行，结果更可预测。",
          },
        ],
        assumptions: [
          {
            en: "UNIQUE is not available in older Excel versions.",
            zh: "旧版 Excel 不支持 UNIQUE。",
          },
        ],
        alternatives: [],
        example: {
          input: { en: "Sales | Sales | HR", zh: "Sales | Sales | HR" },
          result: { en: "Sales, HR", zh: "Sales, HR" },
        },
      };
    }

    case "countUnique":
      {
      const uniqueRange = boundedDataRange(v("sourceRange"));
      const modernFormula = `=IFERROR(${joinArgs([
        `COUNTA(UNIQUE(FILTER(${joinArgs([
          uniqueRange,
          `${uniqueRange}<>""`,
        ])})))`,
        "0",
      ])})`;
      const legacyFormula = `=SUMPRODUCT((${uniqueRange}<>"")/COUNTIF(${joinArgs([
        uniqueRange,
        `${uniqueRange}&""`,
      ])}))`;
      return {
        formula: supportsDynamicArrays ? modernFormula : legacyFormula,
        explanation: {
          en: `This formula counts the distinct non-empty values in ${v(
            "sourceRange"
          )}.`,
          zh: `该公式统计 ${v("sourceRange")} 中不重复且非空的值。`,
        },
        steps: supportsDynamicArrays
          ? [
              {
                en: "UNIQUE returns each value once.",
                zh: "UNIQUE 会返回每个值一次。",
              },
              {
                en: "COUNTA counts the returned values.",
                zh: "COUNTA 统计返回值的数量。",
              },
              {
                en: "IFERROR returns 0 when the source range is empty.",
                zh: "来源区域为空时，IFERROR 返回 0。",
              },
            ]
          : [
              {
                en: "SUMPRODUCT adds one fraction for each non-empty cell.",
                zh: "SUMPRODUCT 会为每个非空单元格累加一个分数。",
              },
              {
                en: "COUNTIF divides that fraction by the value's occurrence count.",
                zh: "COUNTIF 会把该分数除以该值的出现次数。",
              },
            ],
        assumptions: [
          {
            en: "The modern version requires Excel 365, Excel 2021, WPS, or Google Sheets.",
            zh: "现代版本需要 Excel 365、Excel 2021、WPS 或 Google 表格。",
          },
          ...(supportsDynamicArrays
            ? []
            : [
                {
                  en: "This version processes only the first 1000 rows of the source range.",
                  zh: "该版本仅处理来源区域的前 1000 行。",
                },
              ]),
        ],
        alternatives: supportsDynamicArrays
          ? [
              {
                label: {
                  en: "Older Excel compatible version",
                  zh: "旧版 Excel 兼容版本",
                },
                formula: legacyFormula,
              },
            ]
          : [],
        example: {
          input: { en: "A | A | B", zh: "A | A | B" },
          result: { en: "2", zh: "2" },
        },
      };
    }

    case "extractDomain":
      {
      const legacyDomainExpression = `MID(${joinArgs([
        v("emailCell"),
        `FIND("@",${joinArgs([v("emailCell")])})+1`,
        `LEN(${joinArgs([v("emailCell")])})-FIND("@",${joinArgs([v("emailCell")])})`,
      ])})`;
      const legacyDomainFormula = `=IFERROR(${joinArgs([
        legacyDomainExpression,
        `""`,
      ])})`;
      const domainFormula =
        input.platform === "google_sheets"
          ? `=IFERROR(${joinArgs([
              `REGEXEXTRACT(${joinArgs([v("emailCell"), `"@(.+)"`])})`,
              `""`,
            ])})`
          : supportsTextAfter
            ? `=IFERROR(${joinArgs([
                `TEXTAFTER(${joinArgs([v("emailCell"), `"@"`])})`,
                `""`,
              ])})`
            : legacyDomainFormula;
      const domainSteps: BilingualText[] =
        input.platform === "google_sheets"
          ? [
              {
                en: "REGEXEXTRACT captures the text after @.",
                zh: "REGEXEXTRACT 捕获 @ 后面的文本。",
              },
            ]
          : supportsTextAfter
          ? [
              {
                en: "TEXTAFTER returns the text after @.",
                zh: "TEXTAFTER 返回 @ 后面的文本。",
              },
            ]
          : [
              {
                en: "FIND locates the @ character.",
                zh: "FIND 定位 @ 字符的位置。",
              },
              {
                en: "LEN determines the total length of the email.",
                zh: "LEN 获取邮箱的总长度。",
              },
              {
                en: "MID returns the text after @.",
                zh: "MID 返回 @ 后面的文本。",
              },
            ];
      return {
        formula: domainFormula,
        explanation: {
          en: `This formula returns the domain after @ in ${v("emailCell")}.`,
          zh: `该公式返回 ${v("emailCell")} 中 @ 后面的域名。`,
        },
        steps: domainSteps,
        assumptions: [
          {
            en: "The cell must contain exactly one @ sign.",
            zh: "该单元格必须且只能包含一个 @ 符号。",
          },
        ],
        alternatives: [
          {
            label: {
              en: "Compatible MID/FIND version",
              zh: "兼容的 MID/FIND 版本",
            },
            formula: legacyDomainFormula,
          },
        ],
        example: {
          input: { en: "user@example.com", zh: "user@example.com" },
          result: { en: "example.com", zh: "example.com" },
        },
      };
    }

    case "roundNumber": {
      const decimals = Number.isFinite(Number(v("decimals")))
        ? String(Math.trunc(Number(v("decimals"))))
        : "2";
      return {
        formula: `=ROUND(${joinArgs([v("numberCell"), decimals])})`,
        explanation: {
          en: `This formula rounds ${v("numberCell")} to ${decimals} decimal place(s).`,
          zh: `该公式将 ${v("numberCell")} 四舍五入到 ${decimals} 位小数。`,
        },
        steps: [
          {
            en: "ROUND uses standard rounding, not truncation.",
            zh: "ROUND 使用标准四舍五入，不是直接截断。",
          },
          {
            en: "Use a negative number of decimals to round to tens or hundreds.",
            zh: "小数位使用负数时可四舍五入到十位或百位。",
          },
        ],
        assumptions: [],
        alternatives: [
          {
            label: { en: "Round up", zh: "向上舍入" },
            formula: `=ROUNDUP(${joinArgs([v("numberCell"), decimals])})`,
          },
          {
            label: { en: "Round down", zh: "向下舍入" },
            formula: `=ROUNDDOWN(${joinArgs([v("numberCell"), decimals])})`,
          },
        ],
        example: {
          input: { en: "2.345", zh: "2.345" },
          result: { en: "2.35", zh: "2.35" },
        },
      };
    }

    case "filterRows": {
      const { source: alignedSourceRange, criteria: alignedCriteriaRange } =
        alignedFilterRanges(v("sourceRange"), v("criteriaRange"));
      return {
        formula: supportsDynamicArrays
          ? `=FILTER(${joinArgs([
              alignedSourceRange,
              `${alignedCriteriaRange}=${formatScalar(
                v("criteriaValue"),
                separator
              )}`,
              `"No matches"`,
            ])})`
          : "",
        clarification: supportsDynamicArrays
          ? undefined
          : {
              en: "Your version does not support dynamic arrays. Use Data > Filter or Data > Advanced Filter to filter rows.",
              zh: "你的版本不支持动态数组。请使用「数据→筛选」或「数据→高级筛选」来筛选行。",
            },
        explanation: {
          en: `This formula returns rows from ${v(
            "sourceRange"
          )} where ${v("criteriaRange")} equals ${v("criteriaValue")}.`,
          zh: `该公式返回 ${v("sourceRange")} 中 ${v(
            "criteriaRange"
          )} 等于 ${v("criteriaValue")} 的行。`,
        },
        steps: [
          ...(supportsDynamicArrays
            ? [
                {
                  en: "FILTER evaluates the criteria range row by row.",
                  zh: "FILTER 会逐行检查条件区域。",
                },
                {
                  en: "Matching rows are returned as a dynamic array.",
                  zh: "匹配的行会以动态数组返回。",
                },
              ]
            : [
                {
                  en: "Use Data > Filter or Data > Advanced Filter to filter rows.",
                  zh: "请使用「数据→筛选」或「数据→高级筛选」来筛选行。",
                },
              ]),
          {
            en: 'If nothing matches, the formula returns "No matches".',
            zh: "没有匹配时返回 No matches。",
          },
        ],
        assumptions: [
          {
            en: "The source range and criteria range must have the same height.",
            zh: "来源区域和条件区域高度必须一致。",
          },
          {
            en: "FILTER is available in Excel 365, Excel 2021, WPS, and Google Sheets.",
            zh: "FILTER 适用于 Excel 365、Excel 2021、WPS 和 Google 表格。",
          },
        ],
        alternatives: [],
        example: {
          input: { en: "Sales | 500", zh: "Sales | 500" },
          result: { en: "Sales | 500", zh: "Sales | 500" },
        },
      };
  }
}
    }

const MONTHS: Record<string, number> = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};

function lastDayOfMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

const DECIMAL_WORDS: Record<string, string> = {
  one: "1",
  two: "2",
  three: "3",
  four: "4",
  five: "5",
  six: "6",
  seven: "7",
  eight: "8",
  nine: "9",
  ten: "10",
  一: "1",
  二: "2",
  两: "2",
  三: "3",
  四: "4",
  五: "5",
  六: "6",
  七: "7",
  八: "8",
  九: "9",
  十: "10",
};

function parseDecimalPlaces(prompt: string): string | null {
  const match = prompt.match(
    /(?:保留\s*|\bto\s+)(\d+|[一二两三四五六七八九十]|one|two|three|four|five|six|seven|eight|nine|ten)\s*(?:位|个?小数位?|decimal(?:\s+places?)?|places?)/i
  );
  if (!match) {
    return null;
  }
  const value = match[1].toLowerCase();
  return DECIMAL_WORDS[value] ?? value;
}

const MONTH_NAMES = Object.keys(MONTHS);

function extractColumns(prompt: string): { letter: string; index: number }[] {
  const refs: { letter: string; index: number }[] = [];
  let match: RegExpExecArray | null;
  const enRe = /\b(?:column|col)\s+([a-z])\b/gi;
  while ((match = enRe.exec(prompt))) {
    refs.push({ letter: match[1].toUpperCase(), index: match.index });
  }
  const zhRe = /([a-zA-Z])\s*列|列\s*([a-zA-Z])/g;
  while ((match = zhRe.exec(prompt))) {
    const letter = (match[1] ?? match[2] ?? "").toUpperCase();
    refs.push({ letter, index: match.index });
  }
  refs.sort((a, b) => a.index - b.index);
  return refs;
}

function findSumColumn(prompt: string): string | null {
  let match = prompt.match(
    /\b(sum|total|add)\b[^.\n]{0,30}?\b(?:column|col)\s+([a-z])\b/i
  );
  if (match) return match[2].toUpperCase();
  match = prompt.match(/([a-z])\s*列\s*的?\s*(?:总和|求和|汇总)/i);
  if (match) return match[1].toUpperCase();
  match = prompt.match(/([a-z])\s*列[^。、，,；;\n]{0,12}?(?:总和|求和|汇总)/i);
  if (match) return match[1].toUpperCase();
  match = prompt.match(/(?:总和|求和|汇总)[^。]{0,20}?([a-z])\s*列/i);
  if (match) return match[1].toUpperCase();
  return null;
}

function findConditionColumn(prompt: string): string | null {
  let match = prompt.match(
    /\b(when|where|whether)\b[^.]{0,40}?\b(?:column|col)\s+([a-z])\b/i
  );
  if (match) return match[2].toUpperCase();
  match = prompt.match(
    /\b(?:column|col)\s+([a-z])\b[^.]{0,20}?(is|=|contains|equals)/i
  );
  if (match) return match[1].toUpperCase();
  match = prompt.match(/([a-z])\s*列[^。]{0,15}?(是|等于|为|日期|在|包含)/i);
  if (match) return match[1].toUpperCase();
  return null;
}

function extractCriteriaValue(prompt: string): string | null {
  // Split into clauses on Chinese/English separators so the value stops at
  // the clause boundary instead of swallowing later date/sum descriptions.
  const clauses = splitPromptClauses(prompt);
  for (const clause of clauses) {
    if (containsDateKeyword(clause)) continue;
    const value = extractCriteriaValueFromClause(clause);
    if (value) return value;
  }
  return null;
}

const CN_CLAUSE_SPLIT = /[、，。；]/;
const EN_CLAUSE_SPLIT = /\b(for|in|during|between|and|when|where|whose|with|that|while|if|by)\b/i;

function splitPromptClauses(prompt: string): string[] {
  // Keep values like "Sales, East" intact: only split on clause-level separators,
  // never on a bare comma inside a quoted or unquoted value.
  const chunks = prompt.split(CN_CLAUSE_SPLIT);
  const out: string[] = [];
  for (const chunk of chunks) {
    const parts = chunk.split(EN_CLAUSE_SPLIT);
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed) out.push(trimmed);
    }
  }
  return out;
}

function containsDateKeyword(clause: string): boolean {
  return /(\d{4}\s*年\s*\d{1,2}\s*月|\d{4}[-/]\d{1,2}[-/]\d{1,2}|date|日期|时间|month|quarter|年|月)/i.test(
    clause
  );
}

function extractCriteriaValueFromClause(clause: string): string | null {
  let match = clause.match(/(?:is|equals?|contains)\s+([^.,;]+)/i);
  if (match) {
    const value = trimCriteriaValue(match[1]);
    if (value) return value;
  }
  match = clause.match(
    /(?:包含|等于|为|(?!是否)是)\s*(.+?)(?=时|的|中|里|内|和|以及|且|，|。|；|$)/
  );
  if (match) {
    const value = trimCriteriaValue(match[1]);
    if (value) return value;
  }
  return null;
}

function trimCriteriaValue(raw: string): string {
  return raw.trim().replace(/^["']|["']$/g, "").replace(/[。，、；]$/, "").trim();
}

function extractThreshold(text: string): string | null {
  let match = text.match(
    /(?:greater than|more than|大于|超过|高于)\s*(\d+(?:\.\d+)?)/i
  );
  if (match) return match[1];
  match = text.match(/(?:less than|小于|低于)\s*(\d+(?:\.\d+)?)/i);
  if (match) return match[1];
  return null;
}

const MONTH_ABBREVIATIONS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12,
};
const MONTH_ABBREV_NAMES = Object.keys(MONTH_ABBREVIATIONS);

function setMonthRange(values: FormulaValues, year: number, month: number) {
  values.startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  values.endDate = `${year}-${String(month).padStart(2, "0")}-${lastDayOfMonth(year, month)}`;
}

function extractDates(text: string): FormulaValues {
  const values: FormulaValues = {};
  let match = text.match(/(\d{4})\s*年\s*(\d{1,2})\s*月/);
  if (match) {
    setMonthRange(values, Number(match[1]), Number(match[2]));
    return values;
  }
  // Fixed quarter: Q1 2026 / 2026年Q1 / 2026 Q1
  match = text.match(/q\s*([1-4])\s*(\d{4})|(\d{4})\s*年?\s*q\s*([1-4])/i);
  if (match) {
    const q = Number(match[1] ?? match[4]);
    const year = Number(match[2] ?? match[3]);
    const startMonth = 3 * (q - 1) + 1;
    values.startDate = `${year}-${String(startMonth).padStart(2, "0")}-01`;
    values.endDate = `${year}-${String(startMonth + 2).padStart(2, "0")}-${lastDayOfMonth(year, startMonth + 2)}`;
    return values;
  }
  // Full month name + year: March 2026
  match = text.match(
    new RegExp(`\\b(${MONTH_NAMES.join("|")})\\s+(\\d{4})\\b`, "i")
  );
  if (match) {
    setMonthRange(values, Number(match[2]), MONTHS[match[1].toLowerCase()] ?? 1);
    return values;
  }
  // Month abbreviation + year: Mar 2026 (word boundary; "may I ask" won't match)
  match = text.match(
    new RegExp(`\\b(${MONTH_ABBREV_NAMES.join("|")})\\s+(\\d{4})\\b`, "i")
  );
  if (match) {
    setMonthRange(values, Number(match[2]), MONTH_ABBREVIATIONS[match[1].toLowerCase()] ?? 1);
    return values;
  }
  // Year only: 2026年 (no month)
  match = text.match(/(\d{4})\s*年(?!\s*\d{1,2}\s*月)/);
  if (match) {
    const year = Number(match[1]);
    values.startDate = `${year}-01-01`;
    values.endDate = `${year}-12-31`;
    return values;
  }
  // Relative periods: dynamic TODAY() formulas; compute static dates for alternatives.
  const now = new Date();
  if (/(上个月|上月|last month)/i.test(text)) {
    values.relativeDate = "lastMonth";
    const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    setMonthRange(values, d.getFullYear(), d.getMonth() + 1);
    return values;
  }
  if (/(本月|这个月|this month)/i.test(text)) {
    values.relativeDate = "thisMonth";
    setMonthRange(values, now.getFullYear(), now.getMonth() + 1);
    return values;
  }
  if (/(本季度|这个季度|this quarter)/i.test(text)) {
    values.relativeDate = "thisQuarter";
    const qStart = Math.floor(now.getMonth() / 3) * 3 + 1;
    values.startDate = `${now.getFullYear()}-${String(qStart).padStart(2, "0")}-01`;
    values.endDate = `${now.getFullYear()}-${String(qStart + 2).padStart(2, "0")}-${lastDayOfMonth(now.getFullYear(), qStart + 2)}`;
    return values;
  }
  if (/(今年|this year)/i.test(text)) {
    values.relativeDate = "thisYear";
    values.startDate = `${now.getFullYear()}-01-01`;
    values.endDate = `${now.getFullYear()}-12-31`;
    return values;
  }
  if (/(去年|last year)/i.test(text)) {
    values.relativeDate = "lastYear";
    values.startDate = `${now.getFullYear() - 1}-01-01`;
    values.endDate = `${now.getFullYear() - 1}-12-31`;
    return values;
  }
  const explicit = Array.from(
    text.matchAll(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/g)
  );
  if (explicit.length >= 2) {
    values.startDate = explicit[0][0];
    values.endDate = explicit[1][0];
  }
  return values;
}

function hasSum(text: string) {
  return /\b(sum|total|add)\b/i.test(text) || /(总和|求和|汇总)/.test(text);
}

function hasCount(text: string) {
  return /\b(count|how many)\b/i.test(text) || /(统计|计数|行数)/.test(text);
}

function hasDateRange(text: string) {
  if (/(\d{4})\s*年\s*\d{1,2}\s*月/.test(text)) return true;
  if (/q\s*[1-4]\s*\d{4}|\d{4}\s*年?\s*q\s*[1-4]/i.test(text)) return true;
  if (/(\d{4})\s*年(?!\s*\d{1,2}\s*月)/.test(text)) return true;
  if (/(上个月|上月|本月|这个月|本季度|这个季度|今年|去年|last month|this month|this quarter|this year|last year)/i.test(text)) return true;
  if (
    new RegExp(`\\b(${MONTH_NAMES.join("|")})\\s+\\d{4}\\b`, "i").test(text)
  )
    return true;
  if (
    new RegExp(`\\b(${MONTH_ABBREV_NAMES.join("|")})\\s+\\d{4}\\b`, "i").test(text)
  )
    return true;
  if (/\b(between|from)\b.*\bdate\b|\bdate\b.*\b(between|from)\b/i.test(text))
    return true;
  return (
    Array.from(text.matchAll(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/g)).length >= 2
  );
}

export function parseFormulaPrompt(prompt: string): {
  task: FormulaTaskId;
  values: FormulaValues;
} {
  const text = prompt.toLowerCase();
  const values: FormulaValues = {};

  const sumCol = findSumColumn(prompt);
  const condCol = findConditionColumn(prompt);
  const dateCol = findDateColumn(prompt);
  const textCondCol = findTextConditionColumn(prompt);
  const criteriaValue = extractCriteriaValue(prompt);
  const threshold = extractThreshold(text);
  const firstColumn = extractColumns(prompt)[0]?.letter ?? null;
  Object.assign(values, extractDates(text));

  const hasSumK = hasSum(text);
  const hasCountK = hasCount(text);
  const hasDateK = hasDateRange(text);

  if (hasSumK && hasDateK) {
    if (!values.sumRange) values.sumRange = sumCol ? `${sumCol}:${sumCol}` : "C:C";
    if (!values.dateRange) values.dateRange = dateCol ? `${dateCol}:${dateCol}` : "B:B";
    if (!values.criteriaRange) values.criteriaRange = textCondCol ? `${textCondCol}:${textCondCol}` : "";
    if (!values.criteriaValue) values.criteriaValue = criteriaValue ?? "";
    return { task: "sumDateRange", values };
  }
  if (hasCountK && hasDateK) {
    if (!values.dateRange) values.dateRange = dateCol ? `${dateCol}:${dateCol}` : "B:B";
    return { task: "countDateRange", values };
  }
  if (hasSumK) {
    if (!values.sumRange) values.sumRange = sumCol ? `${sumCol}:${sumCol}` : "C:C";
    if (!values.criteriaRange) {
      const conditionColumn = textCondCol ?? condCol;
      values.criteriaRange = conditionColumn ? `${conditionColumn}:${conditionColumn}` : "A:A";
    }
    if (!values.criteriaValue) values.criteriaValue = criteriaValue ?? "";
    return { task: "sumCondition", values };
  }
  const wantsUniqueCount =
    /(count unique|unique count|distinct count|how many (unique|distinct)|\bcount\b[^.]{0,30}\bdistinct\b|不重复值的?数量|不重复值数量|不重复的?个数|唯一值(?:的)?数量|唯一值(?:的)?个数|统计[^。、，]{0,10}不重复|不重复[^。、，]{0,10}(?:多少|几个|数量|个数))/.test(
      text
    );
  if (wantsUniqueCount) {
    const sourceColumn = firstColumn ?? condCol;
    if (!values.sourceRange)
      values.sourceRange = sourceColumn
        ? `${sourceColumn}:${sourceColumn}`
        : "A2:A1000";
    return { task: "countUnique", values };
  }
  if (hasCountK) {
    if (!values.countRange) values.countRange = condCol ? `${condCol}:${condCol}` : "A:A";
    if (!values.criteriaValue) values.criteriaValue = criteriaValue ?? "Completed";
    return { task: "countCondition", values };
  }
  if (/(lookup|look up|vlookup|xlookup|find.*price|match.*id|查找)/.test(text)) {
    values.lookupValue = values.lookupValue ?? "A2";
    values.lookupRange = values.lookupRange ?? "A:A";
    values.returnRange = values.returnRange ?? "C:C";
    values.notFound = values.notFound ?? "Not found";
    return { task: "lookup", values };
  }
  if (/(percentage change|percent change|growth rate|百分比变化|增长率)/.test(text)) {
    values.oldValue = values.oldValue ?? "A2";
    values.newValue = values.newValue ?? "B2";
    return { task: "percentageChange", values };
  }
  if (/(days between|difference between two dates|date difference|日期相差|相差多少天|两个日期)/.test(text)) {
    values.startDateCell = values.startDateCell ?? "A2";
    values.endDateCell = values.endDateCell ?? "B2";
    values.unit = values.unit ?? "days";
    return { task: "dateDifference", values };
  }
  if (/(\brank|排名|名次)/.test(text)) {
    values.rankValue = values.rankValue ?? "C2";
    values.valueRange = values.valueRange ?? "C2:C1000";
    values.order = values.order ?? "0";
    return { task: "rank", values };
  }
  if (/(latest date|most recent date|last date|max date|最晚的日期|最新日期)/.test(text)) {
    values.dateRange = values.dateRange ?? (condCol ? `${condCol}:${condCol}` : "B:B");
    return { task: "latestDate", values };
  }
  if (/(remove duplicates|unique values|deduplicate|de-duplicate|去除.*重复|重复项|不重复值|去重)/.test(text)) {
    const sourceColumn = firstColumn ?? condCol;
    values.sourceRange =
      values.sourceRange ??
      (sourceColumn ? `${sourceColumn}:${sourceColumn}` : "A2:A1000");
    return { task: "uniqueValues", values };
  }
  if (/(email domain|extract.*domain|after the @|提取域名|邮箱.*域名|域名)/.test(text)) {
    values.emailCell = values.emailCell ?? "A2";
    return { task: "extractDomain", values };
  }
  if (/(round to|round a number|decimal places|四舍五入|保留.*位)/.test(text)) {
    const numberColumn = sumCol ?? firstColumn;
    values.numberCell = values.numberCell ?? (numberColumn ? `${numberColumn}2` : "A2");
    values.decimals = values.decimals ?? parseDecimalPlaces(prompt) ?? "2";
    return { task: "roundNumber", values };
  }
  if (/(combine|join|concatenate|first name.*last name|merge|合并|连接)/.test(text)) {
    values.firstText = values.firstText ?? "A2";
    values.secondText = values.secondText ?? "B2";
    values.delimiter = values.delimiter ?? " ";
    return { task: "combineText", values };
  }
  if (/(contains|包含|whether)/.test(text)) {
    values.textCell = values.textCell ?? (condCol ? `${condCol}2` : "A2");
    values.searchText = values.searchText ?? criteriaValue ?? "urgent";
    values.trueValue = values.trueValue ?? "Yes";
    values.falseValue = values.falseValue ?? "No";
    return { task: "textContains", values };
  }
  if (/(blank|empty|为空|空白)/.test(text)) {
    values.targetCell = values.targetCell ?? "B2";
    values.blankValue = values.blankValue ?? "Missing";
    values.nonBlankValue = values.nonBlankValue ?? "Complete";
    return { task: "ifBlank", values };
  }
  if (/(filter|only show|show rows|筛选|只显示)/.test(text)) {
    values.sourceRange = values.sourceRange ?? "A2:C1000";
    values.criteriaRange = values.criteriaRange ?? (condCol ? `${condCol}:${condCol}` : "A2:A1000");
    values.criteriaValue = values.criteriaValue ?? criteriaValue ?? "Sales";
    return { task: "filterRows", values };
  }
  if (/(greater than|less than|大于|小于|如果.*否则)/.test(text)) {
    values.valueCell = values.valueCell ?? (condCol ? `${condCol}2` : "C2");
    values.operator = values.operator ?? ">";
    values.threshold = values.threshold ?? threshold ?? "1000";
    values.trueValue = values.trueValue ?? "Yes";
    values.falseValue = values.falseValue ?? "No";
    return { task: "conditional", values };
  }

  values.sumRange = values.sumRange ?? "C:C";
  values.criteriaRange = values.criteriaRange ?? "A:A";
  values.criteriaValue = values.criteriaValue ?? criteriaValue ?? "";
  return { task: "sumCondition", values };
}
function findColumnNearKeywords(prompt: string, keywordRe: RegExp): string | null {
  const clauses = splitPromptClauses(prompt);
  for (const clause of clauses) {
    if (!keywordRe.test(clause)) continue;
    const refs = extractColumns(clause);
    if (!refs.length) continue;
    const re = new RegExp(keywordRe.source, keywordRe.flags.replace("g", "") + "g");
    let best: string | null = null;
    let bestDist = Infinity;
    let m: RegExpExecArray | null;
    while ((m = re.exec(clause))) {
      for (const ref of refs) {
        const dist = Math.abs(ref.index - m.index);
        if (dist < bestDist) {
          bestDist = dist;
          best = ref.letter;
        }
      }
    }
    if (best) return best;
  }
  return null;
}

function findDateColumn(prompt: string): string | null {
  const col = findColumnNearKeywords(
    prompt,
    /(日期|时间|\bdate\b|\btime\b)/i
  );
  if (col) return col;
  return findColumnNearKeywords(
    prompt,
    new RegExp(`\\b(${MONTH_NAMES.join("|")})\\s+\\d{4}\\b`, "i")
  );
}

function findTextConditionColumn(prompt: string): string | null {
  return findColumnNearKeywords(
    prompt,
    /(是|等于|为|包含|\bis\b|equals?|contains)/i
  );
}
