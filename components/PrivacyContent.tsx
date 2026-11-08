"use client";

import { useLanguage } from "@/components/LanguageProvider";

type PrivacySection = {
  title: { en: string; zh: string };
  body: { en: string; zh: string };
};

const SECTIONS: PrivacySection[] = [
  {
    title: { en: "1. Local Processing", zh: "1. 本地处理" },
    body: {
      en: "FormulaGen is a purely front-end tool. Every formula, input range and spreadsheet you work with stays in your browser's local storage or memory. Nothing is uploaded to any server.",
      zh: "FormulaGen 是纯前端工具。你使用的所有公式、输入区域和表格数据仅保存在浏览器本地存储或内存中，不会上传至任何服务器。",
    },
  },
  {
    title: { en: "2. Third-Party Advertising", zh: "2. 第三方广告" },
    body: {
      en: "This site displays third-party advertising, such as Google AdSense. These providers may use cookies or similar technologies to serve and measure ads, including personalized advertising based on your browsing behaviour.",
      zh: "本站展示第三方广告，例如 Google AdSense。这些服务商可能使用 Cookie 或类似技术来投放和统计广告，包括基于浏览行为的个性化广告。",
    },
  },
  {
    title: { en: "3. Disabling Cookies", zh: "3. 禁用 Cookie" },
    body: {
      en: "You can disable or clear cookies at any time through your browser settings. Doing so may affect how ads are delivered, but it will not affect your ability to use FormulaGen.",
      zh: "你可以随时通过浏览器设置禁用或清除 Cookie。这可能会影响广告的投放方式，但不会影响你使用 FormulaGen。",
    },
  },
  {
    title: { en: "4. Contact", zh: "4. 联系方式" },
    body: {
      en: "For privacy questions, contact us at contact@formulagen.ai (placeholder address, to be updated).",
      zh: "如需咨询隐私相关问题，请联系 contact@formulagen.ai（占位邮箱，待更新）。",
    },
  },
];

export default function PrivacyContent() {
  const { language } = useLanguage();
  const t = (en: string, zh: string) => (language === "zh" ? zh : en);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <article className="bg-white rounded-2xl border border-slate-200 p-6 md:p-10 shadow-sm space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">
            {t("Privacy Policy", "隐私政策")}
          </h1>
          <p className="text-slate-500 text-sm">
            {t("Last updated: 2026-11-08", "最后更新日期：2026-11-08")}
          </p>
        </div>

        {SECTIONS.map((section) => (
          <section key={section.title.en} className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900">
              {t(section.title.en, section.title.zh)}
            </h2>
            <p className="text-slate-700 text-sm leading-relaxed">
              {t(section.body.en, section.body.zh)}
            </p>
          </section>
        ))}
      </article>
    </div>
  );
}
