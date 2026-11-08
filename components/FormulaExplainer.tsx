"use client";

import { useState } from "react";
import { AlertCircle, Check, Copy, Info, Terminal } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import CopyToast from "@/components/CopyToast";
import { explainFormulaLocally } from "@/lib/formulaExplainer";
import type { FormulaResult } from "@/lib/formulaBuilder";

export default function FormulaExplainer() {
  const { language } = useLanguage();
  const t = (en: string, zh: string) => (language === "zh" ? zh : en);

  const [formula, setFormula] = useState("");
  const [result, setResult] = useState<FormulaResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [error, setError] = useState("");

  const handleExplain = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setCopied(false);

    const trimmedFormula = formula.trim();
    if (!trimmedFormula) {
      setResult(null);
      setError(t("Please paste a formula first.", "请先粘贴一个公式。"));
      return;
    }

    setResult(
      explainFormulaLocally(trimmedFormula, language)
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="bg-white shadow-xl rounded-2xl border border-slate-200 p-6 md:p-8 mb-8">
        <form onSubmit={handleExplain} className="space-y-4">
          <div>
            <label
              htmlFor="explain-formula"
              className="block text-sm font-semibold text-slate-800 mb-2"
            >
              {t("Paste Excel Formula to Explain", "粘贴要解释的 Excel 公式")}
            </label>
            <textarea
              id="explain-formula"
              value={formula}
              onChange={(event) => setFormula(event.target.value)}
              placeholder={t('e.g., =SUMIFS(C:C, A:A, "Sales", B:B, ">="&DATE(2026,3,1))', '例如：=SUMIFS(C:C, A:A, "Sales", B:B, ">="&DATE(2026,3,1))')}
              maxLength={600}
              rows={3}
              className="w-full rounded-xl border border-slate-300 p-4 font-mono text-sm text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none resize-y"
              required
            />
            <p className="text-xs text-slate-400 mt-1.5">
              {t(
                "Paste the complete formula, including the leading equals sign.",
                "请粘贴完整公式，并包含开头的等号。"
              )}
            </p>
            {formula.trim() && !formula.trim().startsWith("=") && (
              <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5 text-amber-800 text-xs leading-relaxed">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  {t(
                    'Excel formulas normally start with "=". You can still submit this text if you want.',
                    "Excel 公式通常以 \"=\" 开头；如需解释普通文字也可以继续提交。"
                  )}
                </span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!formula.trim()}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Terminal className="w-5 h-5" />
            {t("Explain Formula", "解释公式")}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {result && (
        <div className="relative bg-white shadow-xl rounded-2xl border border-slate-200 p-6 md:p-8 space-y-6">
          <CopyToast visible={toastVisible} message={t("Copied", "已复制")} />
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 gap-3">
            <h2 className="text-lg font-bold text-slate-900">
              {t("Formula Breakdown", "公式拆解")}
            </h2>
            <button
              type="button"
              onClick={() => copyToClipboard(result.formula)}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 whitespace-nowrap"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? t("Copied", "已复制") : t("Copy Raw Formula", "复制原始公式")}
            </button>
          </div>

          <div className="bg-slate-900 p-4 rounded-xl">
            <code className="text-emerald-400 font-mono text-sm sm:text-base overflow-x-auto block">
              {result.formula}
            </code>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              {t("High-Level Explanation", "整体说明")}
            </h3>
            <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
              {t(result.explanation.en, result.explanation.zh)}
            </p>
          </div>

          {result.steps.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                {t("Component-by-Component Logic", "各部分逻辑")}
              </h3>
              <ul className="space-y-2">
                {result.steps.map((step, index) => (
                  <li
                    key={`${step.en}-${index}`}
                    className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700"
                  >
                    <span className="bg-emerald-100 text-emerald-800 font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs">
                      {index + 1}
                    </span>
                    <span className="leading-relaxed min-w-0 break-words">{t(step.en, step.zh)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.assumptions.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {t("Checks & Caveats", "检查与注意事项")}
              </h3>
              <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                {result.assumptions.map((assumption, index) => (
                  <li key={`${assumption.en}-${index}`}>
                    {t(assumption.en, assumption.zh)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.alternatives.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                {t("Suggested Correction", "建议修正")}
              </h3>
              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <code className="text-slate-900 font-mono text-sm break-all">
                  {result.alternatives[0].formula}
                </code>
                <button
                  type="button"
                  onClick={() => copyToClipboard(result.alternatives[0].formula)}
                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 self-start sm:self-center"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? t("Copied", "已复制") : t("Copy", "复制")}
                </button>
              </div>
            </div>
          )}

          {result.example && (
            <div className="border-t border-slate-100 pt-4 flex items-start gap-2 text-xs text-slate-500">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                {t(
                  "This explanation runs entirely in your browser using a built-in function reference.",
                  "此解释完全在浏览器中运行，使用内置函数参考。"
                )}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
