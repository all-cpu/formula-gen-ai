"use client";

import { useLanguage } from "@/components/LanguageProvider";

export default function AdPlaceholder() {
  const { language } = useLanguage();
  return (
    <div className="w-full max-w-4xl mx-auto my-8 p-4 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 tracking-widest uppercase h-24">
      {language === "zh" ? "广告位" : "Advertisement Placement"}
    </div>
  );
}
