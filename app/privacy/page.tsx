import SeoMeta from "@/components/SeoMeta";
import PrivacyContent from "@/components/PrivacyContent";

export default function PrivacyPage() {
  return (
    <>
      <SeoMeta
        title={{
          en: "Privacy Policy | FormulaGen",
          zh: "隐私政策 | FormulaGen",
        }}
        description={{
          en: "How FormulaGen handles your data: formulas stay local in your browser, third-party ads may use cookies, and how to opt out.",
          zh: "FormulaGen 如何处理你的数据：公式仅在浏览器本地运行，第三方广告可能使用 Cookie，以及如何拒绝。",
        }}
        canonical="https://formulagen.ai/privacy"
      />
      <PrivacyContent />
    </>
  );
}
