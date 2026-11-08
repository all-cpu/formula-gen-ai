import { buildFormula, parseFormulaPrompt } from "../lib/formulaBuilder.ts";
const prompts = [
  "上个月的C列总和",
  "Q1 2026 的C列总和",
  "合并A2和B2",
];
for (const p of prompts) {
  const r = parseFormulaPrompt(p);
  const built = buildFormula({
    task: r.task,
    values: r.values,
    platform: r.task === "combineText" ? "excel" : "excel",
    excelVersion: p === "合并A2和B2" ? "older" : "excel365",
    lang: "zh",
  });
  console.log(JSON.stringify({ prompt: p, task: r.task, values: r.values, formula: built.formula }));
}
