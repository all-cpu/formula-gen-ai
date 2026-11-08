"use client";

import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { GUIDE_DETAILS } from "@/lib/guides";
import { EXTRA_GUIDE_DETAILS } from "@/lib/guidesExtra";
import FormulaGenerator from "@/components/FormulaGenerator";
import { getTutorialTask } from "@/lib/tutorialToTask";

export default function GuideDetail({ slug }: { slug: string }) {
  const { language } = useLanguage();
  const t = (en: string, zh: string) => (language === "zh" ? zh : en);
  const guides = { ...GUIDE_DETAILS, ...EXTRA_GUIDE_DETAILS };
  const guide = guides[slug];

  // Shared slug -> task mapping. Only the task id is passed; the generator
  // selects it without auto-generating any formula.
  const toolTask = getTutorialTask(slug) ?? "sumCondition";
  const deepHref = `/excel-formula-generator?task=${toolTask}`;

  if (!guide) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        href="/guides"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> {t("Back to Guides", "返回教程")}
      </Link>

      <article className="bg-white rounded-2xl border border-slate-200 p-6 md:p-10 shadow-sm space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
            {language === "zh" ? guide.title.zh : guide.title.en}
          </h1>
          <p className="text-slate-600 text-lg leading-relaxed">
            {language === "zh" ? guide.summary.zh : guide.summary.en}
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">{t("1. Formula Syntax", "1. 公式语法")}</h2>
          <div className="bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-sm overflow-x-auto">
            {guide.syntax}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">{t("2. Simple Example", "2. 简单示例")}</h2>
          <p className="text-slate-700 text-sm">
            {language === "zh" ? guide.example.zh : guide.example.en}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">{t("3. Real Business Use Case", "3. 真实业务场景")}</h2>
          <p className="text-slate-700 text-sm">
            {language === "zh" ? guide.useCase.zh : guide.useCase.en}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">{t("4. Common Errors", "4. 常见错误")}</h2>
          <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
            {guide.errors.map((error, idx) => (
              <li key={idx}>{language === "zh" ? error.zh : error.en}</li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">
            {t("5. Build It for Your Spreadsheet", "5. 为你的表格生成公式")}
          </h2>
          <FormulaGenerator initialTask={toolTask} compact />
        </section>

        {/* CTA to Smart Builder */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-6 md:p-8 text-center space-y-4 shadow-xl">
          <h3 className="text-xl md:text-2xl font-bold">
            {t("Need More Formula Patterns?", "需要更多公式场景吗？")}
          </h3>
          <p className="text-emerald-100 text-sm max-w-lg mx-auto">
            {t(
              "Explore the full Smart Formula Builder with structured fields, plain-language helpers, and compatibility alternatives.",
              "查看完整的智能公式生成器，支持结构化字段、自然语言助手和兼容公式。"
            )}
          </p>
          <Link
            href={deepHref}
            className="inline-flex items-center gap-2 bg-white text-emerald-700 font-bold px-6 py-3 rounded-xl hover:bg-emerald-50 transition-all text-sm shadow-md"
          >
            <Sparkles className="w-4 h-4" /> {t("Try Smart Builder", "立即试用智能生成器")}
          </Link>
        </div>
      </article>
    </div>
  );
}
