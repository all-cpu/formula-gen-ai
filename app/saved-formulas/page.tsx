import SeoMeta from "@/components/SeoMeta";
import SavedFormulasList from "@/components/SavedFormulasList";

export default function SavedFormulasPage() {
  return (
    <div className="py-6">
      <SeoMeta
        title={{
          en: "Saved Formulas | FormulaGen",
          zh: "已收藏公式 | FormulaGen",
        }}
        description={{
          en: "Your locally saved Excel and Google Sheets formulas. Load them back into the generator, copy, rename or delete. Stored only in this browser.",
          zh: "你本地收藏的 Excel 与 Google 表格公式。可加载回生成器、复制、重命名或删除，仅保存在当前浏览器。",
        }}
        canonical="https://formulagen.ai/saved-formulas"
      />
      <SavedFormulasList />
    </div>
  );
}
