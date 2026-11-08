import type { FormulaTaskId } from "@/lib/formulaBuilder";

/**
 * Maps each tutorial slug to the matching Excel generator task id.
 * Shared by the guides list and the guide detail page so both always
 * jump to the exact same task. Only existing FormulaTaskId values are
 * referenced; no task enumeration is added or changed here.
 */
export const TUTORIAL_TASK_MAP: Record<string, FormulaTaskId> = {
  "sumifs-excel": "sumCondition",
  "sumifs-between-two-dates": "sumDateRange",
  "sumif-with-one-condition": "sumCondition",
  "countifs-excel": "countCondition",
  "countifs-date-range": "countDateRange",
  "countif-not-blank": "countCondition",
  "xlookup-excel": "lookup",
  "vlookup-excel": "lookup",
  "index-match-excel": "lookup",
  "vlookup-from-another-sheet": "lookup",
  "xlookup-multiple-criteria": "lookup",
  "index-match-two-way": "lookup",
  "filter-excel": "filterRows",
  "filter-multiple-criteria": "filterRows",
  "unique-excel": "uniqueValues",
  "count-unique-values": "countUnique",
  "textjoin-excel": "combineText",
  "textjoin-with-comma": "combineText",
  "concatenate-excel": "combineText",
  "concatenate-first-and-last-name": "combineText",
  "iferror-excel": "conditional",
  "if-greater-than": "conditional",
  "if-cell-contains-text": "textContains",
  "if-blank-excel": "ifBlank",
  "calculate-days-between-dates": "dateDifference",
  "calculate-percentage-change": "percentageChange",
  "rank-numbers-descending": "rank",
  "find-latest-date": "latestDate",
  "extract-domain-from-email": "extractDomain",
  "round-to-two-decimals": "roundNumber",
};

/**
 * Returns the task id for a tutorial slug, or undefined when the slug is
 * not mapped so callers can hide the builder jump instead of mis-routing.
 */
export function getTutorialTask(slug: string): FormulaTaskId | undefined {
  return TUTORIAL_TASK_MAP[slug];
}
