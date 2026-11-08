import type { MetadataRoute } from "next";
import { GUIDE_DETAILS } from "@/lib/guides";
import { EXTRA_GUIDE_DETAILS } from "@/lib/guidesExtra";

// Static export requires this route to be fully static. A fixed date keeps the
// generated sitemap deterministic across builds (no dynamic new Date()).
export const dynamic = "force-static";

const baseUrl = "https://formulagen.ai";
const lastModified = "2026-11-08";

export default function sitemap(): MetadataRoute.Sitemap {
  const guideSlugs = Object.keys({ ...GUIDE_DETAILS, ...EXTRA_GUIDE_DETAILS });

  const guideUrls = guideSlugs.map((slug) => ({
    url: `${baseUrl}/guides/${slug}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    { url: baseUrl, lastModified, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/excel-formula-generator`, lastModified, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/google-sheets-formula-generator`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/excel-formula-explainer`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/guides`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/privacy`, lastModified, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/saved-formulas`, lastModified, changeFrequency: "monthly", priority: 0.4 },
    ...guideUrls,
  ];
}
