export type ValidationIssue = {
  message: string;
  code:
    | "fullwidth-comma"
    | "fullwidth-semicolon"
    | "fullwidth-paren"
    | "fullwidth-quote"
    | "paren-mismatch"
    | "brace-mismatch"
    | "quote-mismatch"
    | "mixed-separator";
};

const FULLWIDTH_COMMA = /，/;
const FULLWIDTH_SEMICOLON = /；/;
const FULLWIDTH_PAREN = /[（）]/;
const FULLWIDTH_QUOTE = /＂/;

function stripStringLiterals(formula: string): string {
  return formula.replace(/"(?:[^"]|"")*"/g, '""');
}

function stripArrayConstants(formula: string): string {
  let result = "";
  let depth = 0;
  for (const ch of formula) {
    if (ch === "{") {
      depth += 1;
      continue;
    }
    if (ch === "}" && depth > 0) {
      depth -= 1;
      continue;
    }
    if (depth === 0) result += ch;
  }
  return result;
}

function hasArgumentComma(formula: string): boolean {
  // In locales using semicolon separators, a decimal comma such as 1,5
  // is valid and is not mixed separator syntax.
  for (let i = 0; i < formula.length; i++) {
    if (formula[i] !== ",") continue;
    const before = formula[i - 1];
    const after = formula[i + 1];
    if (before && after && /\d/.test(before) && /\d/.test(after)) continue;
    return true;
  }
  return false;
}

type BracketStatus = "ok" | "unclosed" | "premature";

function bracketCheck(
  formula: string,
  open: string,
  close: string
): BracketStatus {
  let depth = 0;
  for (const ch of formula) {
    if (ch === open) depth += 1;
    else if (ch === close) {
      depth -= 1;
      if (depth < 0) return "premature";
    }
  }
  return depth === 0 ? "ok" : "unclosed";
}

function checkQuotes(formula: string): boolean {
  const stripped = formula.replace(/"(?:[^"]|"")*"/g, "");
  return !stripped.includes('"');
}

export function validateFormula(formula: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!formula) return issues;

  // Fullwidth punctuation inside string literals is valid data, so check the
  // formula structure only after removing those literals.
  const stripped = stripStringLiterals(formula);

  if (FULLWIDTH_COMMA.test(stripped)) {
    issues.push({
      code: "fullwidth-comma",
      message: "检测到全角逗号（，），请改用半角逗号 ,",
    });
  }
  if (FULLWIDTH_SEMICOLON.test(stripped)) {
    issues.push({
      code: "fullwidth-semicolon",
      message: "检测到全角分号（；），请改用半角分号 ;",
    });
  }
  if (FULLWIDTH_PAREN.test(stripped)) {
    issues.push({
      code: "fullwidth-paren",
      message: "检测到全角括号（），请改用半角括号 ()",
    });
  }
  if (FULLWIDTH_QUOTE.test(stripped)) {
    issues.push({
      code: "fullwidth-quote",
      message: "检测到全角引号（＂），请改用半角引号 \"",
    });
  }


  const parenStatus = bracketCheck(stripped, "(", ")");
  if (parenStatus !== "ok") {
    issues.push({
      code: "paren-mismatch",
      message:
        parenStatus === "unclosed"
          ? "括号不匹配：缺少右括号 )"
          : "括号不匹配：右括号 ) 出现得太早",
    });
  }

  const braceStatus = bracketCheck(stripped, "{", "}");
  if (braceStatus !== "ok") {
    issues.push({
      code: "brace-mismatch",
      message:
        braceStatus === "unclosed"
          ? "花括号不匹配：缺少右花括号 }"
          : "花括号不匹配：右花括号 } 出现得太早",
    });
  }

  if (!checkQuotes(formula)) {
    issues.push({
      code: "quote-mismatch",
      message: "引号未成对，请检查双引号",
    });
  }

  const structural = stripArrayConstants(stripped);
  const hasComma = hasArgumentComma(structural);
  const hasSemicolon = /;/.test(structural);
  if (hasComma && hasSemicolon) {
    issues.push({
      code: "mixed-separator",
      message: "检测到逗号和分号混用，请统一使用一种分隔符",
    });
  }

  return issues;
}
