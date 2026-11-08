import {
  FORMULA_TASKS,
  type FormulaTaskId,
  type FormulaValues,
} from "@/lib/formulaBuilder";

const VALID_VERSIONS = [
  "excel365",
  "excel2021",
  "excel2019",
  "older",
  "wps",
] as const;

const VALID_SEPARATORS = [",", ";"] as const;

export type DeepLinkState = {
  task: FormulaTaskId;
  values: FormulaValues;
  excelVersion: (typeof VALID_VERSIONS)[number];
  separator: (typeof VALID_SEPARATORS)[number];
  hasParams: boolean;
};

/**
 * Reads and whitelist-validates the tutorial deep-link query string.
 * Only known tasks and the fields defined for that task are accepted;
 * unknown or malformed values fall back to safe defaults.
 */
export function parseDeepLinkParams(
  params: Record<string, string | string[] | undefined>
): DeepLinkState {
  const get = (key: string): string | undefined => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const taskId = get("task");
  const task = FORMULA_TASKS.find((item) => item.id === taskId);
  const resolvedTask: FormulaTaskId = task ? task.id : "sumCondition";

  const values: FormulaValues = {};
  if (task) {
    for (const field of task.fields) {
      const raw = get(field.key);
      if (raw === undefined) continue;
      // A space delimiter is meaningful; every other field can be trimmed.
      const value = field.key === "delimiter" ? raw : raw.trim();
      if (value === "") continue;
      const optionValues = (field.options ?? []).map((option) => option.value);
      if (optionValues.length > 0 && !optionValues.includes(value.trim())) {
        continue;
      }
      values[field.key] = value;
    }
  }

  const rawVersion = get("excelVersion");
  const excelVersion = (VALID_VERSIONS as readonly string[]).includes(
    rawVersion ?? ""
  )
    ? (rawVersion as (typeof VALID_VERSIONS)[number])
    : "excel365";

  const rawSeparator = get("separator");
  const separator = (VALID_SEPARATORS as readonly string[]).includes(
    rawSeparator ?? ""
  )
    ? (rawSeparator as (typeof VALID_SEPARATORS)[number])
    : ",";

  const hasParams = Boolean(task && Object.keys(values).length > 0);

  return {
    task: resolvedTask,
    values,
    excelVersion,
    separator,
    hasParams,
  };
}
