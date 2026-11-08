"use client";

import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";
import type { BilingualText } from "@/lib/formulaBuilder";

const BASE_URL = "https://formulagen.ai";

type SeoMetaProps = {
  title: BilingualText;
  description: BilingualText;
  canonical?: string;
};

export default function SeoMeta({ title, description, canonical }: SeoMetaProps) {
  const pathname = usePathname();
  const { language } = useLanguage();
  const localizedTitle = language === "zh" ? title.zh : title.en;
  const localizedDescription = language === "zh" ? description.zh : description.en;
  const canonicalUrl = canonical ?? `${BASE_URL}${pathname}`;

  return (
    <>
      <title>{localizedTitle}</title>
      <meta name="description" content={localizedDescription} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:title" content={localizedTitle} />
      <meta property="og:description" content={localizedDescription} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="FormulaGen AI" />
    </>
  );
}
