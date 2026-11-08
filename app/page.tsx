import FormulaGenerator from "@/components/FormulaGenerator";
import AdPlaceholder from "@/components/AdPlaceholder";
import PageHeader from "@/components/PageHeader";
import TutorialsCta from "@/components/TutorialsCta";
import SeoMeta from "@/components/SeoMeta";

export default function HomePage() {
  return (
    <div className="py-6">
      <SeoMeta
        title={{ en: "FormulaGen | Excel, WPS & Google Sheets Formula Generator", zh: "FormulaGen｜Excel/WPS/谷歌表格公式生成器" }}
        description={{ en: "Free local spreadsheet formula generator. Build, beautify, audit and explain Excel, WPS and Google Sheets formulas in your browser, no API key required.", zh: "免费本地表格公式工具，浏览器内生成、美化、风险校验、解析Excel/WPS/谷歌表格公式，无需API密钥。" }}
      />
      <PageHeader
        title={{ en: "Free Smart Excel Formula Generator", zh: "免费智能 Excel 公式生成器" }}
        subtitle={{ en: "Choose a formula task, enter your ranges, and copy a ready formula instantly. No login and no API key required.", zh: "选择公式任务、填写区域，即可立即复制公式。无需登录，也不需要 API 密钥。" }}
      />
      <FormulaGenerator />
      <TutorialsCta />
      <AdPlaceholder />
    </div>
  );
}
