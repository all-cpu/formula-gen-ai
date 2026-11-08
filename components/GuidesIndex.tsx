"use client";

import Link from "next/link";
import { BookOpen, ArrowRight, Sparkles } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { GUIDE_INDEX } from "@/lib/guides";
import { getTutorialTask } from "@/lib/tutorialToTask";

export default function GuidesIndex() {
  const { language } = useLanguage();
  const t = (en: string, zh: string) => (language === "zh" ? zh : en);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">
          {t("Excel Formula Guides & Tutorials", "Excel 公式指南与教程")}
        </h1>
        <p className="text-slate-600 max-w-xl mx-auto">
          {t(
            "Learn how to write and optimize essential Excel formulas for business and data analysis.",
            "学习如何编写和优化业务与数据分析所需的常用 Excel 公式。"
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {GUIDE_INDEX.map((guide) => {
          const task = getTutorialTask(guide.slug);
          return (
            <div
              key={guide.slug}
              className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm mb-2">
                  <BookOpen className="w-4 h-4" /> {t("Guide", "教程")}
                </div>
                <h2 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors mb-2">
                  {language === "zh" ? guide.title.zh : guide.title.en}
                </h2>
                <p className="text-slate-600 text-sm mb-4">
                  {language === "zh" ? guide.desc.zh : guide.desc.en}
                </p>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <Link
                  href={`/guides/${guide.slug}`}
                  className="inline-flex items-center text-xs font-bold text-emerald-600 hover:text-emerald-700 gap-1"
                >
                  {t("Read Guide", "阅读教程")} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                {task && (
                  <Link
                    href={`/excel-formula-generator?task=${task}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-emerald-600 border border-slate-200 hover:border-emerald-300 rounded-lg px-3 py-1.5 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> {t("Try Builder", "试用生成器")}
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
