"use client";

import { useLanguage } from "@/components/LanguageProvider";

type PageHeaderProps = {
  title: { en: string; zh: string };
  subtitle: { en: string; zh: string };
  size?: "lg" | "md";
};

export default function PageHeader({
  title,
  subtitle,
  size = "lg",
}: PageHeaderProps) {
  const { language } = useLanguage();
  const t = (en: string, zh: string) => (language === "zh" ? zh : en);

  return (
    <div className="max-w-4xl mx-auto px-4 text-center mb-6">
      <h1
        className={`${
          size === "lg" ? "text-3xl md:text-5xl" : "text-3xl md:text-4xl"
        } font-extrabold text-slate-900 tracking-tight mb-3`}
      >
        {t(title.en, title.zh)}
      </h1>
      <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
        {t(subtitle.en, subtitle.zh)}
      </p>
    </div>
  );
}
