import { MetadataRoute } from 'next';
import { GUIDE_INDEX } from "@/lib/guides";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://formulagen.ai";
  const guideSlugs = GUIDE_INDEX.map((guide) => guide.slug);

  const guideUrls = guideSlugs.map((slug) => ({
    url: `${baseUrl}/guides/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/excel-formula-generator`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/google-sheets-formula-generator`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/excel-formula-explainer`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/guides`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    ...guideUrls,
  ];
}
