"use client";

import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

const POPULAR_GUIDES = {
  en: [
    { href: "/guides/sumifs-excel", label: "SUMIFS", desc: "Sum with conditions" },
    { href: "/guides/xlookup-excel", label: "XLOOKUP", desc: "Modern lookup" },
    { href: "/guides/index-match-excel", label: "INDEX/MATCH", desc: "Two-way lookup" },
    { href: "/guides/countifs-excel", label: "COUNTIFS", desc: "Count with criteria" },
    { href: "/guides/filter-excel", label: "FILTER", desc: "Filter rows dynamically" },
    { href: "/guides/unique-excel", label: "UNIQUE", desc: "Extract unique values" },
  ],
  zh: [
    { href: "/guides/sumifs-excel", label: "SUMIFS", desc: "按条件求和" },
    { href: "/guides/xlookup-excel", label: "XLOOKUP", desc: "现代查找" },
    { href: "/guides/index-match-excel", label: "INDEX/MATCH", desc: "双向查找" },
    { href: "/guides/countifs-excel", label: "COUNTIFS", desc: "按条件计数" },
    { href: "/guides/filter-excel", label: "FILTER", desc: "按条件筛选行" },
    { href: "/guides/unique-excel", label: "UNIQUE", desc: "提取不重复值" },
  ],
};

export default function TutorialsCta() {
  const { language } = useLanguage();
  const t = (en: string, zh: string) => (language === "zh" ? zh : en);

  return (
    <section className="max-w-4xl mx-auto px-4 mb-8">
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-6 md:p-8">
        <div className="flex items-start gap-3">
          <div className="bg-emerald-600 text-white p-2.5 rounded-lg flex-shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-900">
              {t("Learn how each formula works", "学学每个公式怎么用")}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {t(
                "Step-by-step tutorials with syntax, examples, real business cases, and common errors.",
                "分步教程：语法、示例、真实业务场景和常见错误。"
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-5">
          {POPULAR_GUIDES[language].map((guide) => (
            <Link
              key={guide.href}
              href={guide.href}
              className="group rounded-xl border border-slate-200 bg-white p-3 hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
            >
              <div className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700">
                {guide.label}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">{guide.desc}</div>
            </Link>
          ))}
        </div>

        <Link
          href="/guides"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
        >
          {t("Browse all tutorials", "查看全部教程")}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
