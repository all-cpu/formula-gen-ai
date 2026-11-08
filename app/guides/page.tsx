import GuidesIndex from "@/components/GuidesIndex";
import SeoMeta from "@/components/SeoMeta";


export default function GuidesPage() {
  return (
    <>
      <SeoMeta
        title={{ en: "Formula Guides | Spreadsheet Function Tutorials", zh: "公式教程｜表格函数学习指南" }}
        description={{ en: "Browse all tutorials for Excel, WPS and Google Sheets formulas including SUMIFS, XLOOKUP, INDEX MATCH, SUMPRODUCT and more.", zh: "浏览全部Excel、WPS、谷歌表格函数教程，包含SUMIFS、XLOOKUP、INDEX MATCH、SUMPRODUCT等" }}
      />
      <GuidesIndex />
    </>
  );
}
