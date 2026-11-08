"use client";
import Link from "next/link";
import {
  Bookmark,
  BookOpen,
  FileSpreadsheet,
  Languages,
  Sparkles,
  Terminal,
} from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

const LINKS = {
  en: [
    { href: "/excel-formula-generator", label: "Excel Generator", icon: FileSpreadsheet },
    { href: "/excel-formula-explainer", label: "Explainer", icon: Terminal },
    { href: "/guides", label: "Guides", icon: BookOpen },
    { href: "/saved-formulas", label: "Saved", icon: Bookmark },
  ],
  zh: [
    { href: "/excel-formula-generator", label: "Excel 生成器", icon: FileSpreadsheet },
    { href: "/excel-formula-explainer", label: "公式解释", icon: Terminal },
    { href: "/guides", label: "教程", icon: BookOpen },
    { href: "/saved-formulas", label: "收藏夹", icon: Bookmark },
  ],
};

export default function Navbar() {
  const { language, toggleLanguage } = useLanguage();
  const links = LINKS[language];
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3 sm:h-16 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg sm:text-xl text-slate-900 whitespace-nowrap">
          <div className="bg-emerald-600 text-white p-1.5 sm:p-2 rounded-lg">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span>FormulaGen<span className="text-emerald-600">.ai</span></span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-5 flex-wrap">
          <nav className="flex items-center gap-2 sm:gap-5 text-xs sm:text-sm font-medium text-slate-600 flex-wrap">
            {links.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} title={label} className="hover:text-emerald-600 transition-colors flex items-center gap-1.5 whitespace-nowrap">
                <Icon className="w-4 h-4" /> {label}
              </Link>
            ))}
          </nav>
          <button type="button" onClick={toggleLanguage} title={language === "en" ? "中文" : "EN"} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 whitespace-nowrap">
            <Languages className="h-4 w-4" />
            {language === "en" ? "中文" : "EN"}
          </button>
        </div>
      </div>
    </header>
  );
}
