import FormulaGenerator from "@/components/FormulaGenerator";
import AdSlot from "@/components/AdSlot";
import PageHeader from "@/components/PageHeader";
import TutorialsCta from "@/components/TutorialsCta";
import SeoMeta from "@/components/SeoMeta";
import { parseDeepLinkParams } from "@/lib/deepLink";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function GoogleSheetsGeneratorPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const deep = parseDeepLinkParams(params);
  return (
    <div className="py-6">
      <SeoMeta
        title={{ en: "Google Sheets Formula Generator | FormulaGen", zh: "Google Sheets公式生成器 | FormulaGen" }}
        description={{ en: "Create and audit Google Sheets formulas locally in browser, no backend API.", zh: "浏览器本地生成、校验谷歌表格公式，不调用后端API。" }}
      />
      <div className="max-w-7xl mx-auto px-4 flex items-start gap-6">
        <div className="w-full max-w-4xl mx-auto min-w-0">
          <PageHeader
            size="md"
            title={{ en: "Google Sheets Formula Generator", zh: "Google 表格公式生成器" }}
            subtitle={{ en: "Choose a task, enter ranges, and copy a Google Sheets formula instantly. No login required.", zh: "选择任务并填写区域，即可复制 Google 表格公式。无需登录。" }}
          />
          <FormulaGenerator
            initialTask={deep.task}
            initialValues={deep.values}
            initialPlatform="google_sheets"
            initialExcelVersion={deep.excelVersion}
            initialSeparator={deep.separator}
            autoGenerate={deep.hasParams}
          />
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
