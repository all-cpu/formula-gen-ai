import FormulaGenerator from "@/components/FormulaGenerator";
import AdSlot from "@/components/AdSlot";
import PageHeader from "@/components/PageHeader";
import TutorialsCta from "@/components/TutorialsCta";
import SeoMeta from "@/components/SeoMeta";

export default function ExcelGeneratorPage() {
  return (
    <div className="py-6">
      <SeoMeta
        title={{ en: "Excel Formula Generator | FormulaGen", zh: "Excel公式生成器 | FormulaGen" }}
        description={{ en: "Generate, format and audit Excel formulas locally. Supports SUMIFS, XLOOKUP, FILTER, SUMPRODUCT and more.", zh: "本地生成、美化、校验Excel公式，支持SUMIFS、XLOOKUP、FILTER、SUMPRODUCT等函数。" }}
      />
      <div className="max-w-7xl mx-auto px-4 flex items-start gap-6">
        <div className="w-full max-w-4xl mx-auto min-w-0">
          <PageHeader
            size="md"
            title={{ en: "Smart Excel Formula Generator", zh: "智能 Excel 公式生成器" }}
            subtitle={{ en: "Describe your task or fill in ranges to get an exact, copy-ready Excel formula.", zh: "描述任务或填写区域，即可获得可直接复制的 Excel 公式。" }}
          />
          <FormulaGenerator initialPlatform="excel" />
          <TutorialsCta />
          <AdSlot className="my-8" />
          <AdSlot className="mb-8" />
        </div>
        <aside className="hidden lg:block w-[300px] shrink-0 sticky top-24">
          <AdSlot className="h-[300px]" />
        </aside>
      </div>
    </div>
  );
}
