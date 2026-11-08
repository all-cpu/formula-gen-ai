"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type Language = "en" | "zh";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
};

const LanguageContext = createContext<LanguageContextValue>({
  language: "en",
  setLanguage: () => {},
  toggleLanguage: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem("formulagen-language");
    if (savedLanguage === "en" || savedLanguage === "zh") {
      setLanguageState(savedLanguage);
    }
  }, []);

  // 只在客户端、语言切换完成后同步 <html lang>。延迟到 useEffect，
  // 避免初始化瞬间直接修改 documentElement 触发 SSR 水合 mismatch；
  // 不设置任何 className，translated-ltr 由外部脚本/插件维护，与 React 无关。
  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  }, [language]);

  const setLanguage = useCallback((nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    window.localStorage.setItem("formulagen-language", nextLanguage);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === "en" ? "zh" : "en");
  }, [language, setLanguage]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
