import FormulaExplainer from "@/components/FormulaExplainer";
import AdPlaceholder from "@/components/AdPlaceholder";
import PageHeader from "@/components/PageHeader";
import SeoMeta from "@/components/SeoMeta";


export default function ExplainerPage() {
  return (
    <div className="py-6">
      <SeoMeta
        title={{ en: "Formula Explainer | Decode Spreadsheet Formulas", zh: "公式解析器｜解读表格公式" }}
        description={{ en: "Paste any spreadsheet formula and get bilingual breakdown, step explanation and compatibility notes.", zh: "粘贴任意表格公式，获取双语拆解、分步解释和版本兼容说明。" }}
      />
      <PageHeader
        size="md"
        title={{ en: "Excel Formula Explainer", zh: "Excel 公式解释器" }}
        subtitle={{ en: "Understand confusing Excel formulas in seconds.", zh: "几秒钟理解复杂的 Excel 公式。" }}
      />
      <FormulaExplainer />
      <AdPlaceholder />
    </div>
  );
}
