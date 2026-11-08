import type { BilingualText } from "./formulaBuilder";

export type AuditOptions = {
  platform: "excel" | "google_sheets";
  excelVersion:
    | "excel365"
    | "excel2021"
    | "excel2019"
    | "older"
    | "wps";
};

export type AuditItem = {
  code:
    | "whole-column"
    | "sumifs-structure"
    | "dynamic-date"
    | "version-compat"
    | "datedif-order"
    | "cross-sheet"
    | "empty-argument"
    | "sumproduct-boolean";
  level: "warn" | "error";
  title: BilingualText;
  desc: BilingualText;
  suggestion: BilingualText;
};

export type AuditResult = {
  ok: boolean;
  items: AuditItem[];
};

type ParsedCall = {
  name: string;
  openIndex: number;
  closeIndex: number;
  args: string[];
  maskedArgs: string[];
};

type MaskResult = {
  masked: string;
  balanced: boolean;
};

const emptyResult = (): AuditResult => ({ ok: true, items: [] });

const WITHHELD_RESULT = Object.freeze({
  ok: true,
  items: [],
}) as AuditResult;

/**
 * Replace string literals with spaces while preserving all source offsets.
 * This lets the audit use ordinary indexes against a formula without treating
 * text inside a literal as formula syntax.
 */
export function maskStringLiterals(formula: string): string {
  return buildMask(formula).masked;
}

function buildMask(formula: string): MaskResult {
  let masked = "";
  let inString = false;

  for (let index = 0; index < formula.length; index += 1) {
    const character = formula[index];

    if (!inString) {
      if (character === '"') {
        inString = true;
        masked += " ";
      } else {
        masked += character;
      }
      continue;
    }

    masked += " ";
    if (character === '"') {
      if (formula[index + 1] === '"') {
        // Excel escapes a quote by doubling it inside a string literal.
        masked += " ";
        index += 1;
      } else {
        inString = false;
      }
    }
  }

  return { masked, balanced: !inString };
}

function hasBalancedStructure(masked: string): boolean {
  const stack: string[] = [];
  const matching: Record<string, string> = {
    ")": "(",
    "]": "[",
    "}": "{",
  };

  for (const character of masked) {
    if (character === "(" || character === "[" || character === "{") {
      stack.push(character);
      continue;
    }

    if (character !== ")" && character !== "]" && character !== "}") {
      continue;
    }

    if (stack.pop() !== matching[character]) {
      return false;
    }
  }

  return stack.length === 0;
}

function findClosingParen(masked: string, openIndex: number): number {
  let depth = 0;
  for (let index = openIndex; index < masked.length; index += 1) {
    if (masked[index] === "(") depth += 1;
    if (masked[index] !== ")") continue;
    depth -= 1;
    if (depth === 0) return index;
    if (depth < 0) return -1;
  }
  return -1;
}

function findFunctionCalls(
  formula: string,
  masked: string
): ParsedCall[] {
  const calls: ParsedCall[] = [];
  const functionPattern = /([A-Za-z_][A-Za-z0-9_.]*)\s*(?=\()/g;
  let match: RegExpExecArray | null;

  while ((match = functionPattern.exec(masked)) !== null) {
    let openIndex = match.index + match[0].length;
    while (masked[openIndex] === " " && match[0].includes(" ")) {
      openIndex += 1;
    }
    if (masked[openIndex] !== "(") continue;

    const closeIndex = findClosingParen(masked, openIndex);
    if (closeIndex < 0) continue;

    const rawName = match[1].split(".").pop() ?? match[1];
    const parsed = splitArguments(formula, masked, openIndex, closeIndex);
    calls.push({
      name: rawName.toUpperCase(),
      openIndex,
      closeIndex,
      args: parsed.args,
      maskedArgs: parsed.maskedArgs,
    });
  }

  return calls;
}

function splitArguments(
  formula: string,
  masked: string,
  openIndex: number,
  closeIndex: number
): { args: string[]; maskedArgs: string[] } {
  const separators: number[] = [];
  let parenDepth = 0;
  let braceDepth = 0;
  let bracketDepth = 0;

  for (let index = openIndex + 1; index < closeIndex; index += 1) {
    const character = masked[index];

    if (character === "{") {
      braceDepth += 1;
      continue;
    }
    if (character === "}") {
      braceDepth = Math.max(0, braceDepth - 1);
      continue;
    }
    if (character === "[") {
      bracketDepth += 1;
      continue;
    }
    if (character === "]") {
      bracketDepth = Math.max(0, bracketDepth - 1);
      continue;
    }
    if (character === "(") {
      parenDepth += 1;
      continue;
    }
    if (character === ")") {
      parenDepth = Math.max(0, parenDepth - 1);
      continue;
    }

    if (
      parenDepth === 0 &&
      braceDepth === 0 &&
      bracketDepth === 0 &&
      (character === "," || character === ";")
    ) {
      separators.push(index);
    }
  }

  // Semicolon formulas can contain decimal commas, e.g. IF(C2>1,5;...). When
  // a semicolon is present at this call's top level, it is the argument
  // separator and commas are left inside the argument.
  const selectedSeparator = separators.some(
    (index) => masked[index] === ";"
  )
    ? ";"
    : ",";
  const selected = separators.filter(
    (index) => masked[index] === selectedSeparator
  );

  if (selected.length === 0) {
    return {
      args: [formula.slice(openIndex + 1, closeIndex).trim()],
      maskedArgs: [masked.slice(openIndex + 1, closeIndex).trim()],
    };
  }

  const args: string[] = [];
  const maskedArgs: string[] = [];
  let start = openIndex + 1;
  for (const separator of selected) {
    args.push(formula.slice(start, separator).trim());
    maskedArgs.push(masked.slice(start, separator).trim());
    start = separator + 1;
  }
  args.push(formula.slice(start, closeIndex).trim());
  maskedArgs.push(masked.slice(start, closeIndex).trim());

  return { args, maskedArgs };
}

function isStringLiteral(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length >= 2 && trimmed.startsWith('"') && trimmed.endsWith('"');
}

function isNumericLiteral(value: string): boolean {
  return /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][-+]?\d+)?$/.test(
    value.trim()
  );
}

function isLiteral(value: string): boolean {
  const trimmed = value.trim();
  return (
    isStringLiteral(trimmed) ||
    isNumericLiteral(trimmed) ||
    /^(?:TRUE|FALSE)$/i.test(trimmed)
  );
}

function looksLikeRangeReference(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length === 0) return false;

  // Remove an optional sheet prefix. Quoted sheet names are handled first so
  // Sheet1!A:A and 'Sheet 1'!A:A both resolve to the same local range shape.
  const withoutSheet = trimmed
    .replace(/^(?:'(?:[^']|'')*'|\[[^\]]+\][^!]*|[^!]+)!/, "")
    .trim();

  return /^\$?[A-Z]{1,3}(?:\$?\d+)?:\$?[A-Z]{1,3}(?:\$?\d+)?$/i.test(
    withoutSheet
  );
}

function parseBareDate(value: string): number | null {
  const match = /^DATE\s*\(([^()]*)\)$/i.exec(value.trim());
  if (!match) return null;

  const parts = match[1]
    .split(/[,;]/)
    .map((part) => part.trim());
  if (parts.length !== 3 || parts.some((part) => !/^\d+$/.test(part))) {
    return null;
  }

  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  const timestamp = Date.UTC(year, month - 1, day);
  const date = new Date(timestamp);
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return timestamp;
}

function hasWholeColumnReference(masked: string): boolean {
  return /(?:\$?[A-Z]{1,3}:\$?[A-Z]{1,3})(?![A-Z0-9])/i.test(masked);
}

function hasTopLevelComparison(maskedArgument: string): boolean {
  let value = maskedArgument.trim();

  // Remove parentheses that wrap the whole argument, e.g. (A2:A100>0).
  while (value.startsWith("(") && value.endsWith(")")) {
    let depth = 0;
    let closesAtEnd = false;
    for (let index = 0; index < value.length; index += 1) {
      if (value[index] === "(") depth += 1;
      if (value[index] === ")") {
        depth -= 1;
        if (depth === 0) {
          closesAtEnd = index === value.length - 1;
          break;
        }
        if (depth < 0) return false;
      }
    }
    if (!closesAtEnd) break;
    value = value.slice(1, -1).trim();
  }

  let parenDepth = 0;
  let braceDepth = 0;
  let bracketDepth = 0;
  for (const character of value) {
    if (character === "(") {
      parenDepth += 1;
      continue;
    }
    if (character === ")") {
      parenDepth = Math.max(0, parenDepth - 1);
      continue;
    }
    if (character === "{") {
      braceDepth += 1;
      continue;
    }
    if (character === "}") {
      braceDepth = Math.max(0, braceDepth - 1);
      continue;
    }
    if (character === "[") {
      bracketDepth += 1;
      continue;
    }
    if (character === "]") {
      bracketDepth = Math.max(0, bracketDepth - 1);
      continue;
    }
    if (
      parenDepth === 0 &&
      braceDepth === 0 &&
      bracketDepth === 0 &&
      (character === ">" || character === "<" || character === "=")
    ) {
      return true;
    }
  }

  return false;
}

function hasBooleanConversion(maskedArgument: string): boolean {
  return (
    /^\s*--\s*\(/.test(maskedArgument) ||
    /\*\s*1(?:\D|$)/.test(maskedArgument)
  );
}

function addItem(items: AuditItem[], item: AuditItem): void {
  const key = `${item.code}|${item.title.en}|${item.desc.en}`;
  if (
    items.some(
      (existing) =>
        `${existing.code}|${existing.title.en}|${existing.desc.en}` === key
    )
  ) {
    return;
  }
  items.push(item);
}

const itemText = {
  wholeColumn: {
    title: {
      en: "Whole-column reference",
      zh: "整列引用",
    },
    desc: {
      en: "Whole-column references scan the entire sheet and can slow large workbooks.",
      zh: "整列引用会扫描整张工作表,数据量大时可能拖慢计算。",
    },
    suggestion: {
      en: "Limit the range, for example A2:A1000.",
      zh: "建议改为限定范围,例如 A2:A1000。",
    },
  },
  sumifsStructure: {
    title: {
      en: "SUMIFS/COUNTIFS argument structure",
      zh: "SUMIFS/COUNTIFS 参数结构",
    },
    desc: {
      en: "The condition ranges and condition values are not paired correctly.",
      zh: "条件区域与条件值没有按正确顺序成对填写。",
    },
    suggestion: {
      en: "Check each condition range is followed by its condition value.",
      zh: "请确认每个条件区域后面都紧跟着对应的条件值。",
    },
  },
  dynamicDate: {
    title: {
      en: "Dynamic date",
      zh: "动态日期",
    },
    desc: {
      en: "TODAY() and NOW() update whenever the workbook opens instead of staying fixed.",
      zh: "TODAY() 和 NOW() 会在每次打开工作簿时变化,不是固定日期。",
    },
    suggestion: {
      en: "Use DATE() with a fixed date when the result must stay stable.",
      zh: "如果需要固定日期,请改用 DATE() 硬编码日期。",
    },
  },
  version: {
    titlePrefix: {
      en: "Version compatibility: ",
      zh: "版本兼容性:",
    },
    desc: {
      en: "This function is not supported in the selected version and may return an error when pasted into a spreadsheet.",
      zh: "当前选择的版本不支持该函数,粘贴到表格后可能报错。",
    },
    suggestion: {
      en: "Use a compatible alternative such as INDEX/MATCH where possible.",
      zh: "建议使用兼容写法,例如 INDEX/MATCH 等。",
    },
    wpsDesc: {
      en: "This function may work in newer WPS, older WPS versions will throw errors. Please verify your WPS version.",
      zh: "新版WPS可能支持该函数,低版本WPS会报错,请确认你的WPS版本。",
    },
  },
  datedifOrder: {
    title: {
      en: "DATEDIF date order",
      zh: "DATEDIF 日期顺序",
    },
    desc: {
      en: "The end date is earlier than the start date, so DATEDIF returns #NUM!.",
      zh: "结束日期早于起始日期,DATEDIF 会返回 #NUM!。",
    },
    suggestion: {
      en: "Swap the start and end dates, or validate the order before using DATEDIF.",
      zh: "请交换开始和结束日期,或先校验日期先后顺序。",
    },
  },
  crossSheet: {
    title: {
      en: "Cross-sheet reference",
      zh: "跨工作表引用",
    },
    desc: {
      en: "Cross-sheet references stop working if the source sheet is renamed.",
      zh: "跨工作表引用在源工作表改名后会失效。",
    },
    suggestion: {
      en: "Keep the sheet name stable, or use a defined name for the source range.",
      zh: "请保持工作表名称稳定,或使用名称管理器定义来源区域。",
    },
  },
  emptyArgument: {
    title: {
      en: "Empty function argument",
      zh: "函数参数为空",
    },
    desc: {
      en: "SUMIFS/COUNTIFS has a trailing separator or an empty condition argument.",
      zh: "SUMIFS/COUNTIFS 存在尾随分隔符或空的条件参数。",
    },
    suggestion: {
      en: "Remove the trailing separator and fill in every condition argument.",
      zh: "请删除尾随分隔符,并补齐每个条件参数。",
    },
  },
  sumproductBoolean: {
    title: {
      en: "SUMPRODUCT boolean array",
      zh: "SUMPRODUCT 布尔数组",
    },
    desc: {
      en: "A bare TRUE/FALSE array is being used without numeric conversion.",
      zh: "布尔数组没有先转换为 1/0,统计结果可能异常。",
    },
    suggestion: {
      en: "Wrap the boolean expression with --() or multiply it by 1.",
      zh: "请用 --() 包裹布尔表达式,或乘以 1 转换为数值。",
    },
  },
} as const;

function addVersionCompatibility(
  items: AuditItem[],
  calls: ParsedCall[],
  options: AuditOptions
): void {
  if (options.platform === "google_sheets") return;

  const functions = new Set(
    calls
      .map((call) => call.name)
      .filter((name) =>
        ["XLOOKUP", "FILTER", "TOCOL", "BYROW"].includes(name)
      )
  );

  for (const name of functions) {
    const isUnsupported =
      options.excelVersion === "wps"
        ? true
        : name === "XLOOKUP" || name === "FILTER"
          ? options.excelVersion === "excel2019" ||
            options.excelVersion === "older"
          : options.excelVersion !== "excel365";

    if (!isUnsupported) continue;

    const usesWpsText = options.excelVersion === "wps";
    addItem(items, {
      code: "version-compat",
      level: "warn",
      title: {
        en: `${itemText.version.titlePrefix.en}${name}`,
        zh: `${itemText.version.titlePrefix.zh}${name}`,
      },
      desc: usesWpsText
        ? itemText.version.wpsDesc
        : itemText.version.desc,
      suggestion: itemText.version.suggestion,
    });
  }
}

function hasMalformedSumIfsCall(
  call: ParsedCall,
  kind: "SUMIFS" | "COUNTIFS"
): boolean {
  const { args } = call;

  if (kind === "SUMIFS") {
    if (args.length < 3) return true;
    if (isLiteral(args[0]) || args[0].trim() === "") return true;

    for (let index = 1; index < args.length; index += 2) {
      if (index >= args.length || args[index].trim() === "") return true;
      if (isLiteral(args[index])) return true;
      if (index + 1 >= args.length) return true;
      if (args[index + 1].trim() === "") return true;
      if (looksLikeRangeReference(args[index + 1])) return true;
    }
    return false;
  }

  if (args.length < 2 || args.length % 2 !== 0) return true;
  for (let index = 0; index < args.length; index += 2) {
    if (args[index].trim() === "" || isLiteral(args[index])) return true;
    if (index + 1 >= args.length || args[index + 1].trim() === "") {
      return true;
    }
    if (looksLikeRangeReference(args[index + 1])) return true;
  }
  return false;
}

export function auditFormula(
  formula: string,
  options: AuditOptions
): AuditResult {
  try {
    if (typeof formula !== "string" || formula.trim() === "") {
      return emptyResult();
    }

    const mask = buildMask(formula);
    if (!mask.balanced || !hasBalancedStructure(mask.masked)) {
      return emptyResult();
    }

    const calls = findFunctionCalls(formula, mask.masked);
    const items: AuditItem[] = [];

    if (hasWholeColumnReference(mask.masked)) {
      addItem(items, {
        code: "whole-column",
        level: "warn",
        ...itemText.wholeColumn,
      });
    }

    const sumIfsCalls = calls.filter(
      (call) => call.name === "SUMIFS" || call.name === "COUNTIFS"
    );
    const hasEmptyArgument = sumIfsCalls.some((call) =>
      call.args.some((arg) => arg.trim() === "")
    );
    if (hasEmptyArgument) {
      addItem(items, {
        code: "empty-argument",
        level: "error",
        ...itemText.emptyArgument,
      });
    }

    const hasStructureError = sumIfsCalls.some((call) =>
      hasMalformedSumIfsCall(
        call,
        call.name === "SUMIFS" ? "SUMIFS" : "COUNTIFS"
      )
    );
    if (hasStructureError && !hasEmptyArgument) {
      addItem(items, {
        code: "sumifs-structure",
        level: "error",
        ...itemText.sumifsStructure,
      });
    }

    if (/\b(?:TODAY|NOW)\s*\(/i.test(mask.masked)) {
      addItem(items, {
        code: "dynamic-date",
        level: "warn",
        ...itemText.dynamicDate,
      });
    }

    addVersionCompatibility(items, calls, options);

    const hasDatedifOrderIssue = calls
      .filter((call) => call.name === "DATEDIF")
      .some((call) => {
        if (call.args.length < 2) return false;
        const start = parseBareDate(call.args[0]);
        const end = parseBareDate(call.args[1]);
        return start !== null && end !== null && start > end;
      });
    if (hasDatedifOrderIssue) {
      addItem(items, {
        code: "datedif-order",
        level: "warn",
        ...itemText.datedifOrder,
      });
    }

    if (mask.masked.includes("!")) {
      addItem(items, {
        code: "cross-sheet",
        level: "warn",
        ...itemText.crossSheet,
      });
    }

    const hasBooleanIssue = calls
      .filter((call) => call.name === "SUMPRODUCT")
      .some((call) =>
        call.maskedArgs.some(
          (argument) =>
            !hasBooleanConversion(argument) &&
            hasTopLevelComparison(argument)
        )
      );
    if (hasBooleanIssue) {
      addItem(items, {
        code: "sumproduct-boolean",
        level: "warn",
        ...itemText.sumproductBoolean,
      });
    }

    return {
      ok: !items.some((item) => item.level === "error"),
      items,
    };
  } catch {
    return WITHHELD_RESULT;
  }
}
