import { notFound } from "next/navigation";
import GuideDetail from "@/components/GuideDetail";
import SeoMeta from "@/components/SeoMeta";
import { GUIDE_DETAILS } from "@/lib/guides";
import { EXTRA_GUIDE_DETAILS } from "@/lib/guidesExtra";

export async function generateStaticParams() {
  return Object.keys({ ...GUIDE_DETAILS, ...EXTRA_GUIDE_DETAILS }).map((slug) => ({ slug }));
}

export default async function GuideDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = { ...GUIDE_DETAILS, ...EXTRA_GUIDE_DETAILS }[slug];
  if (!guide) {
    notFound();
  }

  return (
    <>
      <SeoMeta
        title={guide.title}
        description={guide.summary}
        canonical={`https://formulagen.ai/guides/${slug}`}
      />
      <GuideDetail slug={slug} />
    </>
  );
}
