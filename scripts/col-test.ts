import { parseFormulaPrompt } from "../lib/formulaBuilder.ts";
const prompts = [
  "统计A列部门等于Sales、B列日期在2026年3月、C列金额总和",
  "Sum column C when column A is Sales for March 2026",
  "求B列日期在2026年3月、C列金额总和",
];
for (const p of prompts) {
  const r = parseFormulaPrompt(p);
  console.log(JSON.stringify({ prompt: p, task: r.task, values: r.values }));
}
