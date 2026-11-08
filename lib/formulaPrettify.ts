export type PrettifyResult = {
  text: string;
  changed: boolean;
};

type WhitelistedFunction = "SUMIFS" | "COUNTIFS" | "SUMPRODUCT" | "FILTER";

const WHITELIST_THRESHOLDS: Record<WhitelistedFunction, number> = {
  SUMIFS: 4,
  COUNTIFS: 4,
  SUMPRODUCT: 2,
  FILTER: 2,
};

const unchanged = (formula: string): PrettifyResult => ({
  text: formula,
  changed: false,
});

/**
 * Formats only a bare, whitelisted function call. This intentionally does not
 * rewrite nested separators or any formula that is already multiline.
 */
export function prettifyFormula(
  formula: string,
  separator: "," | ";"
): PrettifyResult {
  try {
    if (typeof formula !== "string" || formula.length === 0) {
      return unchanged(formula);
    }

    // Keep the input as the source of truth for already formatted formulas.
    if (formula.includes("\n") || formula.includes("\r")) {
      return unchanged(formula);
    }

    const trimmedStart = formula.trimStart();
    let functionStart = formula.length - trimmedStart.length;
    let candidate = trimmedStart;

    if (candidate.startsWith("=")) {
      candidate = candidate.slice(1);
      functionStart += 1;
    }

    const withoutLeadingSpace = candidate.trimStart();
    functionStart += candidate.length - withoutLeadingSpace.length;

    // Require a bare function call. @SUMIFS(...) and _xlfn.SUMIFS(...)
    // are wrappers and must not be unwrapped by this module.
    const functionMatch = /^([A-Z][A-Z0-9.]*)[ \t]*\(/i.exec(
      withoutLeadingSpace
    );
    if (!functionMatch) {
      return unchanged(formula);
    }

    const functionName = functionMatch[1];
    const upperName = functionName.toUpperCase();
    const threshold = WHITELIST_THRESHOLDS[upperName as WhitelistedFunction];
    if (threshold === undefined) {
      return unchanged(formula);
    }

    const openParenIndex = functionStart + functionMatch[0].length - 1;
    let depth = 0;
    let braceDepth = 0;
    let bracketDepth = 0;
    let inString = false;
    let closeParenIndex = -1;
    const separators: number[] = [];

    for (let index = openParenIndex; index < formula.length; index += 1) {
      const character = formula[index];

      if (inString) {
        if (character === '"') {
          if (formula[index + 1] === '"') {
            // Excel escapes a quote by doubling it inside a string literal.
            index += 1;
          } else {
            inString = false;
          }
        }
        continue;
      }

      if (character === '"') {
        inString = true;
        continue;
      }

      if (character === "{") {
        braceDepth += 1;
        continue;
      }
      if (character === "}") {
        if (braceDepth === 0) return unchanged(formula);
        braceDepth -= 1;
        continue;
      }
      if (character === "[") {
        bracketDepth += 1;
        continue;
      }
      if (character === "]") {
        if (bracketDepth === 0) return unchanged(formula);
        bracketDepth -= 1;
        continue;
      }
      if (character === "(") {
        depth += 1;
        continue;
      }
      if (character === ")") {
        if (depth === 0) return unchanged(formula);
        depth -= 1;
        if (depth === 0) {
          if (braceDepth !== 0 || bracketDepth !== 0) {
            return unchanged(formula);
          }
          closeParenIndex = index;
          break;
        }
        continue;
      }

      if (
        depth === 1 &&
        braceDepth === 0 &&
        bracketDepth === 0 &&
        (character === "," || character === ";")
      ) {
        separators.push(index);
      }
    }

    if (
      closeParenIndex < 0 ||
      depth !== 0 ||
      inString ||
      braceDepth !== 0 ||
      bracketDepth !== 0
    ) {
      return unchanged(formula);
    }

    // A bare helper formula cannot have an operator or another function after
    // its matching closing parenthesis.
    if (formula.slice(closeParenIndex + 1).trim() !== "") {
      return unchanged(formula);
    }

    // The requested separator must match every top-level argument separator.
    // Nested separators are intentionally ignored and never rewritten.
    if (
      separators.length === 0 ||
      separators.some((index) => formula[index] !== separator)
    ) {
      return unchanged(formula);
    }

    const argumentCount = separators.length + 1;
    if (argumentCount < threshold) {
      return unchanged(formula);
    }

    const argumentsList: string[] = [];
    let argumentStart = openParenIndex + 1;
    for (const separatorIndex of separators) {
      argumentsList.push(formula.slice(argumentStart, separatorIndex).trim());
      argumentStart = separatorIndex + 1;
    }
    argumentsList.push(formula.slice(argumentStart, closeParenIndex).trim());

    if (argumentsList.some((argument) => argument.length === 0)) {
      return unchanged(formula);
    }

    const prefix = formula.slice(0, functionStart);
    const formatted = `${prefix}${functionName}(\n${argumentsList
      .map((argument) => `    ${argument}`)
      .join(`${separator}\n`)}\n)`;

    return {
      text: formatted,
      changed: formatted !== formula,
    };
  } catch {
    return unchanged(formula);
  }
}
