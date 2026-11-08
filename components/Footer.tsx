"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

export default function Footer() {
  const { language } = useLanguage();
  const t = (en: string, zh: string) => (language === "zh" ? zh : en);

  return (
    <footer className="border-t border-slate-200 bg-white text-slate-500 py-8 text-sm mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p>{t("© {year} FormulaGen AI. All rights reserved.", "© {year} FormulaGen AI. 版权所有。").replace("{year}", String(new Date().getFullYear()))}</p>
        <div className="flex flex-wrap gap-6 text-xs sm:text-sm">
          <Link href="/excel-formula-generator" className="hover:underline">{t("Excel Formula Generator", "Excel 公式生成器")}</Link>
          <Link href="/google-sheets-formula-generator" className="hover:underline">{t("Google Sheets", "Google 表格")}</Link>
          <Link href="/excel-formula-explainer" className="hover:underline">{t("Formula Explainer", "公式解释器")}</Link>
          <Link href="/guides" className="hover:underline">{t("Guides", "教程")}</Link>
          <Link href="/privacy" className="hover:underline">{t("Privacy Policy", "隐私政策")}</Link>
          <a href="/sitemap.xml" className="hover:underline">{t("Sitemap", "站点地图")}</a>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 pt-4 border-t border-slate-100 text-xs text-slate-400 text-center">
        {t("Disclaimer: Generated formulas should be validated against your spreadsheet structure. Always review critical financial calculations manually.", "免责声明：生成的公式应根据实际表格结构进行验证，重要财务计算请务必人工复核。")}
      </div>
    </footer>
  );
}
