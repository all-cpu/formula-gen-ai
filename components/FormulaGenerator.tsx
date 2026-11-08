"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Bookmark,
  BookmarkCheck,
  Check,
  Copy,
  Info,
  Sparkles,
  Upload,
  Wand2,
} from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import CopyToast from "@/components/CopyToast";
import * as XLSX from "xlsx";
import { validateFormula } from "@/lib/formulaValidator";
import { prettifyFormula } from "@/lib/formulaPrettify";
import { auditFormula, type AuditItem } from "@/lib/formulaAudit";
import {
  FORMULA_TASKS,
  buildFormula,
  getDefaultValues,
  getFormulaTask,
  parseFormulaPrompt,
  type FormulaResult,
  type FormulaTaskId,
  type FormulaValues,
} from "@/lib/formulaBuilder";
import {
  getSavedFormulas,
  isFormulaSaved,
  SAVED_FORMULAS_EVENT,
  SAVED_FORMULAS_LIMIT,
  toggleSavedFormula,
  type SavedFormula,
  type SavedFormulaDraft,
} from "@/lib/savedFormulas";
import { parseDeepLinkParams } from "@/lib/deepLink";

type ToastKind = "copied" | "saved" | "removed" | "limit" | "storage";

const SAMPLE_PROMPTS = {
  en: [
    "Sum column C when column A is Sales.",
    "Sum column C when column B date is in March 2026.",
    "Count rows where status is Completed.",
    "Count rows where column B date is in March 2026.",
    "Look up price using product ID.",
    "Return Yes if amount is greater than 1000, otherwise No.",
    "Check whether column A contains urgent.",
    "Combine first name and last name.",
    "Calculate the difference between two dates in days.",
    "Calculate the percentage change from old value to new value.",
    "Rank sales amounts from highest to lowest.",
    "Find the latest date in column B.",
    "Count unique values in column A.",
    "Remove duplicates from column A.",
    "Extract the domain from an email address.",
    "Round column C to two decimal places.",
  ],
  zh: [
    "当 A 列是 Sales 时，求 C 列总和。",
    "统计 B 列日期在 2026 年 3 月的 C 列总和。",
    "统计状态为 Completed 的行数。",
    "统计 B 列日期在 2026 年 3 月的行数。",
    "根据产品 ID 查找价格。",
    "如果金额大于 1000，返回 Yes，否则返回 No。",
    "判断 A 列是否包含 urgent。",
    "合并名字和姓氏。",
    "计算两个日期相差多少天。",
    "计算从旧值到新值的百分比变化。",
    "按销售额从高到低排名。",
    "找出一列中最晚的日期。",
    "统计一列中不重复值的数量。",
    "去除列表中的重复项。",
    "从邮箱地址提取域名。",
    "把数字四舍五入保留两位小数。",
  ],
};

type FormulaGeneratorProps = {
  initialTask?: FormulaTaskId;
  compact?: boolean;
  initialValues?: FormulaValues;
  initialPlatform?: "excel" | "google_sheets";
  initialExcelVersion?: "excel365" | "excel2021" | "excel2019" | "older" | "wps";
  initialSeparator?: "," | ";";
  autoGenerate?: boolean;
};

const HISTORY_KEY = "formula-gen-history";
const HISTORY_MAX = 8;

const HISTORY_VERSIONS: HistoryEntry["excelVersion"][] = [
  "excel365",
  "excel2021",
  "excel2019",
  "older",
  "wps",
];

const isHistoryEntry = (value: unknown): value is HistoryEntry => {
  if (typeof value !== "object" || value === null) return false;
  const entry = value as Partial<HistoryEntry>;
  return (
    typeof entry.formula === "string" &&
    entry.formula.startsWith("=") &&
    typeof entry.values === "object" &&
    entry.values !== null &&
    typeof entry.timestamp === "number" &&
    (entry.lang === "en" || entry.lang === "zh") &&
    typeof entry.task === "string" &&
    FORMULA_TASKS.some((task) => task.id === entry.task) &&
    (entry.platform === "excel" || entry.platform === "google_sheets") &&
    typeof entry.excelVersion === "string" &&
    HISTORY_VERSIONS.includes(
      entry.excelVersion as HistoryEntry["excelVersion"]
    ) &&
    (entry.separator === "," || entry.separator === ";")
  );
};

type HistoryEntry = {
  task: FormulaTaskId;
  values: FormulaValues;
  formula: string;
  lang: "en" | "zh";
  platform: "excel" | "google_sheets";
  excelVersion: "excel365" | "excel2021" | "excel2019" | "older" | "wps";
  separator: "," | ";";
  timestamp: number;
};

export default function FormulaGenerator({
  initialTask = "sumCondition",
  initialValues,
  initialPlatform = "excel",
  initialExcelVersion = "excel365",
  initialSeparator = ",",
  autoGenerate = false,
  compact = false,
}: FormulaGeneratorProps) {
  const { language } = useLanguage();
  const t = (en: string, zh: string) => (language === "zh" ? zh : en);
  const samplePrompts = SAMPLE_PROMPTS[language];

  const [platform, setPlatform] = useState<"excel" | "google_sheets">(initialPlatform);
  const [excelVersion, setExcelVersion] = useState<
    "excel365" | "excel2021" | "excel2019" | "older" | "wps"
  >(initialExcelVersion);
  const [task, setTask] = useState<FormulaTaskId>(initialTask);
  const [argumentSeparator, setArgumentSeparator] = useState<"," | ";">(initialSeparator);
  const [prettifyEnabled, setPrettifyEnabled] = useState(false);

  const [values, setValues] = useState<FormulaValues>(() => ({
    ...getDefaultValues(initialTask),
    ...(initialValues ?? {}),
  }));


  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<FormulaResult | null>(null);
  const [restoredFormula, setRestoredFormula] = useState("");
  const [copiedKey, setCopiedKey] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastKind, setToastKind] = useState<ToastKind>("copied");
  const [error, setError] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [savedFormulas, setSavedFormulas] = useState<SavedFormula[]>([]);
  const [lastGeneratedDraft, setLastGeneratedDraft] =
    useState<SavedFormulaDraft | null>(null);

  const [sampleData, setSampleData] = useState("");
  const [headers, setHeaders] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [dropMessage, setDropMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(HISTORY_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setHistory(parsed.filter(isHistoryEntry).slice(0, HISTORY_MAX));
        }
      }
    } catch {
      // localStorage can be unavailable (e.g. Safari private mode). Ignore.
    }
  }, []);

  useEffect(() => {
    const syncSavedFormulas = () => setSavedFormulas(getSavedFormulas());

    syncSavedFormulas();
    window.addEventListener(SAVED_FORMULAS_EVENT, syncSavedFormulas);

    return () => {
      window.removeEventListener(SAVED_FORMULAS_EVENT, syncSavedFormulas);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const showToast = (kind: ToastKind) => {
    setToastKind(kind);
    setToastVisible(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastVisible(false), 2000);
  };

  // Restore the prettify toggle from localStorage (client only).
  useEffect(() => {
    try {
      if (window.localStorage.getItem("prettify_enabled") === "true") {
        setPrettifyEnabled(true);
      }
    } catch {
      // localStorage unavailable; keep default false.
    }
  }, []);

  // Client-only deep link: restore ?task=... (and optional field values)
  // after hydration. The server no longer reads searchParams under static
  // export, so the generator reads the URL itself in the browser.
  useEffect(() => {
    try {
      const query = window.location.search;
      if (!query) return;
      const urlParams = new URLSearchParams(query);
      if (!urlParams.has("task")) return;
      const record: Record<string, string> = {};
      urlParams.forEach((value, key) => {
        record[key] = value;
      });
      const deep = parseDeepLinkParams(record);
      const nextValues = { ...getDefaultValues(deep.task), ...deep.values };
      setTask(deep.task);
      setValues(nextValues);
      setExcelVersion(deep.excelVersion);
      setArgumentSeparator(deep.separator);

      if (deep.hasParams) {
        const filled = getFormulaTask(deep.task)
          .fields.filter((field) => field.required)
          .every((field) => {
            const value = nextValues[field.key] ?? "";
            return field.key === "delimiter"
              ? value !== ""
              : value.trim() !== "";
          });
        if (!filled) return;
        const generated = buildFormula({
          task: deep.task,
          values: nextValues,
          platform,
          excelVersion: deep.excelVersion,
          lang: language,
          argumentSeparator: deep.separator,
        });
        setLastGeneratedDraft({
          formula: generated.formula,
          task: deep.task,
          values: { ...nextValues },
          platform,
          excelVersion: deep.excelVersion,
          separator: deep.separator,
        });
        setResult(generated);
        if (generated.clarification) {
          setError(generated.clarification[language]);
        }
      }
    } catch {
      // Malformed query or storage issue; fall back to default task silently.
    }
  }, []);

  const saveHistory = (entry: HistoryEntry) => {
    setHistory((previous) => {
      const latest = previous[0];
      const isDuplicate =
        latest !== undefined &&
        latest.task === entry.task &&
        latest.formula === entry.formula &&
        latest.platform === entry.platform &&
        latest.excelVersion === entry.excelVersion &&
        latest.separator === entry.separator &&
        JSON.stringify(latest.values) === JSON.stringify(entry.values);
      if (isDuplicate) return previous;
      const next = [entry, ...previous].slice(0, HISTORY_MAX);
      try {
        window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      } catch {
        // Storage full or unavailable; keep history in memory only.
      }
      return next;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      window.localStorage.removeItem(HISTORY_KEY);
    } catch {
      // Ignore storage errors.
    }
  };

  const restoreHistory = (entry: HistoryEntry) => {
    setTask(entry.task);
    setValues({ ...getDefaultValues(entry.task), ...entry.values });
    setPlatform(entry.platform);
    setExcelVersion(entry.excelVersion);
    setArgumentSeparator(entry.separator);
    setResult(null);
    setError("");
    setCopiedKey("");
    setRestoredFormula(entry.formula);
  };

  const currentTask = getFormulaTask(task);
  const resetResultState = () => {
    setResult(null);
    setRestoredFormula("");
    setError("");
    setCopiedKey("");
  };

  const changePlatform = (nextPlatform: "excel" | "google_sheets") => {
    if (nextPlatform === platform) return;
    setPlatform(nextPlatform);
    resetResultState();
  };

  const changeExcelVersion = (nextVersion: typeof excelVersion) => {
    if (nextVersion === excelVersion) return;
    setExcelVersion(nextVersion);
    resetResultState();
  };

  const changeArgumentSeparator = (nextSeparator: "," | ";") => {
    if (nextSeparator === argumentSeparator) return;
    setArgumentSeparator(nextSeparator);
    resetResultState();
  };
  const requiredFieldsFilled = currentTask.fields
    .filter((field) => field.required)
    .every((field) => {
      const value = values[field.key] ?? "";
      return field.key === "delimiter"
        ? value !== ""
        : value.trim() !== "";
    });

  const autoGeneratedRef = useRef(false);
  useEffect(() => {
    if (autoGeneratedRef.current) return;
    autoGeneratedRef.current = true;
    if (!autoGenerate) return;
    if (!requiredFieldsFilled) return;
    const generated = buildFormula({
      task,
      values,
      platform,
      excelVersion,
      lang: language,
      argumentSeparator,
    });
    setLastGeneratedDraft({
      formula: generated.formula,
      task,
      values: { ...values },
      platform,
      excelVersion,
      separator: argumentSeparator,
    });
    setResult(generated);
    if (generated.clarification) {
      setError(generated.clarification[language]);
    }
  }, []);

  const changeTask = (nextTask: FormulaTaskId) => {
    setTask(nextTask);
    setValues(getDefaultValues(nextTask));
    setRestoredFormula("");
    setResult(null);
    setError("");
    setCopiedKey("");
    setLastGeneratedDraft(null);
  };

  const applyPrompt = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) {
      setError(
        t(
          "Describe a task first, or fill in the structured fields below.",
          "请先描述任务，或直接填写下方结构化字段。"
        )
      );
      return;
    }
    const parsed = parseFormulaPrompt(trimmed);
    const defaults = getDefaultValues(parsed.task);
    setTask(parsed.task);
    setValues({ ...defaults, ...parsed.values });
    setRestoredFormula("");
    setResult(null);
    setError("");
    setCopiedKey("");
    setLastGeneratedDraft(null);
  };

  const handleGenerate = (event: React.FormEvent) => {
    event.preventDefault();
    setRestoredFormula("");
    setResult(null);
    setError("");
    setCopiedKey("");
    setLastGeneratedDraft(null);

    if (!requiredFieldsFilled) {
      setError(
        t(
          "Fill in all required fields to generate an exact formula.",
          "请填写所有必填字段，才能生成准确公式。"
        )
      );
      return;
    }

    const generated = buildFormula({
      task,
      values,
      platform,
      excelVersion,
      lang: language,
      argumentSeparator,
    });
    setLastGeneratedDraft({
      formula: generated.formula,
      task,
      values: { ...values },
      platform,
      excelVersion,
      separator: argumentSeparator,
    });
    setResult(generated);
    if (generated.formula) {
      saveHistory({
        task,
        values,
        formula: generated.formula,
        lang: language,
        platform,
        excelVersion,
        separator: argumentSeparator,
        timestamp: Date.now(),
      });
    }
    if (generated.clarification) {
      setError(generated.clarification[language]);
    }
  };

  const copyWithHiddenField = (text: string) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      return document.execCommand("copy");
    } catch {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  };

  const copyToClipboard = (key: string, text: string) => {
    const markCopied = () => {
      setCopiedKey(key);
      showToast("copied");
      setTimeout(() => setCopiedKey(""), 2000);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(markCopied)
        .catch(() => {
          if (copyWithHiddenField(text)) markCopied();
        });
      return;
    }
    if (copyWithHiddenField(text)) markCopied();
  };

  const applyParsedData = (text: string) => {
    if (!text.trim()) return;
    setSampleData(text.trim());
    setDropMessage("");
    if (!headers.trim()) {
      const rows = text.split(/\r?\n/).filter((row) => row.trim() !== "");
      const firstLine = rows[0] || "";
      const columns = firstLine.split("\t").filter((cell) => cell.trim() !== "");
      if (columns.length > 0) {
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const headerText = columns
          .slice(0, 26)
          .map((cell, index) => `${letters[index]}: ${cell.trim()}`)
          .join(", ");
        setHeaders(headerText);
        setDropMessage(
          `${t("Imported", "已导入")} ${rows.length} ${t(
            "row(s). Detected columns:",
            "行。识别到的列："
          )} ${headerText}`
        );
      }
    }
  };

  const parseSpreadsheetFile = (file: File) => {
    const name = file.name.toLowerCase();
    const isExcel = name.endsWith(".xlsx") || name.endsWith(".xls");
    const reader = new FileReader();
    reader.onload = () => {
      try {
        let text = "";
        if (isExcel) {
          const workbook = XLSX.read(reader.result, { type: "array" });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
            header: 1,
            raw: false,
          });
          if (!rows.length) {
            setDropMessage(t("The file has no data.", "文件中没有数据。"));
            return;
          }
          text = rows
            .map((row) => row.map((cell) => String(cell ?? "")).join("\t"))
            .join("\n");
        } else {
          text = String(reader.result || "");
        }
        applyParsedData(text);
      } catch {
        setDropMessage(
          t(
            "Could not read this file. Try a .csv or .xlsx file.",
            "无法读取该文件，请尝试 .csv 或 .xlsx 文件。"
          )
        );
      }
    };
    if (isExcel) reader.readAsArrayBuffer(file);
    else reader.readAsText(file);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      parseSpreadsheetFile(file);
      return;
    }
    const text =
      event.dataTransfer.getData("text") ||
      event.dataTransfer.getData("text/plain");
    if (text.trim()) applyParsedData(text);
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) parseSpreadsheetFile(file);
    event.target.value = "";
  };

  const mainPretty = prettifyFormula(result?.formula ?? "", argumentSeparator);
  const auditOptions = { platform, excelVersion };
  const mainAudit = result?.formula
    ? auditFormula(result.formula, auditOptions)
    : null;
  const alternativeAudits = (result?.alternatives ?? []).map((alternative) =>
    auditFormula(alternative.formula, auditOptions)
  );
  const restoredAudit = restoredFormula
    ? auditFormula(restoredFormula, auditOptions)
    : null;
  const hasAlternativeAuditItems = alternativeAudits.some(
    (audit) => audit.items.length > 0
  );

  const currentFormulaIsSaved = isFormulaSaved(
    savedFormulas,
    result?.formula ?? "",
    platform
  );

  const handleToggleSavedFormula = () => {
    if (!result?.formula) return;
    const fallbackDraft: SavedFormulaDraft = {
      formula: result.formula,
      task,
      values: { ...values },
      platform,
      excelVersion,
      separator: argumentSeparator,
    };
    const draft =
      lastGeneratedDraft && lastGeneratedDraft.formula === result.formula
        ? lastGeneratedDraft
        : fallbackDraft;
    const outcome = toggleSavedFormula(draft);
    setSavedFormulas(outcome.items);
    if (outcome.status === "saved") showToast("saved");
    if (outcome.status === "removed") showToast("removed");
    if (outcome.status === "limit") showToast("limit");
    if (outcome.status === "error") showToast("storage");
  };

  const toastMessage =
    toastKind === "saved"
      ? t("Saved to favorites", "已加入收藏")
      : toastKind === "removed"
        ? t("Removed from favorites", "已取消收藏")
        : toastKind === "limit"
          ? t(
              `Favorites are full (${SAVED_FORMULAS_LIMIT})`,
              `收藏已达上限（${SAVED_FORMULAS_LIMIT}条）`
            )
          : toastKind === "storage"
            ? t("Local storage is unavailable", "本地存储不可用")
            : t("Copied", "已复制");

  const renderAuditItems = (items: AuditItem[]) => (
    <ul className="space-y-2.5">
      {items.map((item, index) => (
        <li
          key={`${item.code}-${index}`}
          className="flex items-start gap-2.5 text-sm"
        >
          <span
            aria-hidden="true"
            className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${
              item.level === "error" ? "bg-red-500" : "bg-amber-500"
            }`}
          />
          <div className="min-w-0 break-words">
            <p
              className={`font-semibold ${
                item.level === "error" ? "text-red-700" : "text-amber-800"
              }`}
            >
              {t(item.title.en, item.title.zh)}
            </p>
            <p className="mt-0.5 leading-relaxed text-slate-600">
              {t(item.desc.en, item.desc.zh)}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              {t(item.suggestion.en, item.suggestion.zh)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="bg-white shadow-xl rounded-2xl border border-slate-200 p-6 md:p-8 mb-8">
        <form onSubmit={handleGenerate} className="space-y-6">
          <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => changePlatform("excel")}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all min-h-[44px] ${
                  platform === "excel"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {t("Excel / WPS", "Excel / WPS")}
              </button>
              <button
                type="button"
                onClick={() => changePlatform("google_sheets")}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all min-h-[44px] ${
                  platform === "google_sheets"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {t("Google Sheets", "Google 表格")}
              </button>
            </div>
            <div className="w-full sm:w-56">
              <label
                htmlFor="excel-version"
                className="block text-xs font-semibold text-slate-600 mb-1"
              >
                {t("Target version", "目标版本")}
              </label>
              <select
                id="excel-version"
                value={excelVersion}
                onChange={(event) =>
                  changeExcelVersion(event.target.value as typeof excelVersion)
                }
                disabled={platform === "google_sheets"}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white focus:border-emerald-600 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="excel365">
                  {t("Excel 365 / 2024", "Excel 365 / 2024")}
                </option>
                <option value="excel2021">
                  {t("Excel 2021", "Excel 2021")}
                </option>
                <option value="excel2019">
                  {t("Excel 2019", "Excel 2019")}
                </option>
                <option value="older">
                  {t("Excel 2016 and earlier", "Excel 2016 及更早")}
                </option>
                <option value="wps">WPS</option>
              </select>
            </div>
          </div>
          <div className="w-full sm:w-auto">
            <label
              htmlFor="argument-separator"
              className="block text-xs font-semibold text-slate-600 mb-1"
            >
              {t("Argument separator", "参数分隔符")}
            </label>
            <div className="flex rounded-lg border border-slate-300 overflow-hidden">
              <button
                type="button"
                onClick={() => changeArgumentSeparator(",")}
                className={`flex-1 px-3 py-2 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  argumentSeparator === ","
                    ? "bg-emerald-600 text-white"
                    : "bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {t("Comma (,)", "逗号 (,)")}
              </button>
              <button
                type="button"
                onClick={() => changeArgumentSeparator(";")}
                className={`flex-1 px-3 py-2 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  argumentSeparator === ";"
                    ? "bg-emerald-600 text-white"
                    : "bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {t("Semicolon (;)", "分号 (;)")}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              {platform === "google_sheets"
                ? t(
                    "Depends on your spreadsheet locale (File > Settings > Locale).",
                    "取决于你的表格区域设置（文件→设置→区域）。"
                  )
                : t(
                    "Semicolon mode also writes decimal constants with a comma.",
                    "分号模式会把数字常量的小数点写成逗号。"
                  )}
            </p>
          </div>

          <div>
            <label
              htmlFor="formula-task"
              className="block text-sm font-semibold text-slate-800 mb-2"
            >
              {t("What do you need?", "你需要什么公式？")}
            </label>
            <select
              id="formula-task"
              value={task}
              onChange={(event) =>
                changeTask(event.target.value as FormulaTaskId)
              }
              className="w-full rounded-xl border border-slate-300 p-3 text-sm font-semibold text-slate-900 bg-white focus:border-emerald-600 outline-none"
            >
              {FORMULA_TASKS.map((item) => (
                <option key={item.id} value={item.id}>
                  {t(item.label.en, item.label.zh)}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-2">
              {t(currentTask.description.en, currentTask.description.zh)}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentTask.fields.map((field) => (
              <div key={field.key}>
                <label
                  htmlFor={`field-${field.key}`}
                  className="block text-xs font-semibold text-slate-600 mb-1"
                >
                  {t(field.label.en, field.label.zh)}
                  {field.required && <span className="text-red-500"> *</span>}
                </label>
                {field.kind === "select" ? (
                  <select
                    id={`field-${field.key}`}
                    value={values[field.key] ?? field.defaultValue ?? ""}
                    onChange={(event) =>
                      setValues((previous) => ({
                        ...previous,
                        [field.key]: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white focus:border-emerald-600 outline-none"
                  >
                    {(field.options ?? []).map((option) => (
                      <option key={option.value} value={option.value}>
                        {t(option.label.en, option.label.zh)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={`field-${field.key}`}
                    type={field.kind === "number" ? "number" : "text"}
                    value={values[field.key] ?? ""}
                    onChange={(event) =>
                      setValues((previous) => ({
                        ...previous,
                        [field.key]: event.target.value,
                      }))
                    }
                    placeholder={t(field.placeholder.en, field.placeholder.zh)}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm font-mono text-slate-900 focus:border-emerald-600 outline-none"
                  />
                )}
              </div>
            ))}
          </div>

          {!compact && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <label
                htmlFor="natural-prompt"
                className="block text-xs font-semibold text-slate-700 mb-2"
              >
                {t(
                  "Optional: describe it in plain language",
                  "可选：用自然语言描述需求"
                )}
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  id="natural-prompt"
                  type="text"
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder={t(
                    "e.g., Sum column C when column A is Sales",
                    "例如：当 A 列是 Sales 时，求 C 列总和"
                  )}
                  className="flex-1 rounded-lg border border-slate-300 bg-white p-2.5 text-sm text-slate-900 focus:border-emerald-600 outline-none"
                />
                <button
                  type="button"
                  onClick={() => applyPrompt(prompt)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                >
                  <Wand2 className="h-4 w-4" />
                  {t("Fill fields", "自动填入")}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {t(
                  "The prompt helper runs locally with deterministic rules. It pre-fills the structured form; it does not send your data to an AI service.",
                  "提示词助手使用本地确定性规则运行，只会预填结构化表单，不会把数据发送到 AI 服务。"
                )}
              </p>
              {prompt.trim().startsWith("=") && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-xs leading-relaxed">
                  <span>
                    {t(
                      "It looks like you pasted a formula. Use the Formula Explainer to understand it.",
                      "看起来你粘贴的是一个公式。想理解它请使用「公式解释器」。"
                    )}{" "}
                    <Link
                      href="/excel-formula-explainer"
                      className="underline font-semibold"
                    >
                      {t("Go to Formula Explainer", "前往公式解释器")}
                    </Link>
                  </span>
                </div>
              )}
              {prompt.trim().startsWith("=") &&
                validateFormula(prompt.trim()).length > 0 && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs leading-relaxed">
                    <strong className="font-semibold">
                      {t("Formula check: ", "公式检查：")}
                    </strong>
                    <ul className="list-disc list-inside mt-1 space-y-0.5">
                      {validateFormula(prompt.trim()).map((issue, index) => (
                        <li key={index}>{issue.message}</li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          )}

          {!compact && (
            <div>
              <span className="block text-xs font-semibold text-slate-500 mb-2">
                {t("Quick tasks:", "快捷任务：")}
              </span>
              <div className="flex flex-wrap gap-2">
                {samplePrompts.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setPrompt(item);
                      applyPrompt(item);
                    }}
                    className="text-xs bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!compact && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="sample-data"
                  className="block text-xs font-semibold text-slate-600"
                >
                  {t("Sample data (optional)", "示例数据（可选）")}
                </label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200 font-medium transition-colors flex items-center gap-1"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {t("Upload file", "上传文件")}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt,.tsv,.xlsx,.xls"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </div>
              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragOver(true);
                }}
                onDragEnter={(event) => {
                  event.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={(event) => {
                  event.preventDefault();
                  setDragOver(false);
                }}
                onDrop={handleDrop}
                className="relative rounded-lg"
              >
                <textarea
                  id="sample-data"
                  rows={3}
                  value={sampleData}
                  onChange={(event) => {
                    setSampleData(event.target.value);
                    setDropMessage("");
                  }}
                  placeholder={t(
                    "Paste, drag, or upload sample rows to identify your columns.",
                    "粘贴、拖入或上传示例数据，帮助确认列结构。"
                  )}
                  className={`w-full rounded-lg border p-2.5 text-sm text-slate-900 focus:outline-none min-h-[80px] font-mono ${
                    dragOver
                      ? "border-emerald-500 bg-emerald-50/50"
                      : "border-slate-300 focus:border-emerald-600"
                  }`}
                />
                {dragOver && (
                  <div className="pointer-events-none absolute inset-0 bg-emerald-100/50 rounded-lg flex items-center justify-center text-sm font-semibold text-emerald-700">
                    {t("Release to import data", "松开以导入数据")}
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {t(
                  "Sample data stays in your browser and is used only to show detected column labels. The formula uses the ranges you enter above.",
                  "示例数据只保留在浏览器中，用于识别列名；公式只使用你在上方填写的区域。"
                )}
              </p>
              {dropMessage && (
                <p className="text-xs text-amber-600 mt-1.5">{dropMessage}</p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={!requiredFieldsFilled}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-5 h-5" />
            {t("Generate Formula", "生成公式")}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {result && (
        <div className="relative bg-white shadow-xl rounded-2xl border border-slate-200 p-6 md:p-8 space-y-6">
          <CopyToast visible={toastVisible} message={toastMessage} />
          {result.clarification && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-800 text-sm">
              <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold">
                  {t("Needs clarification: ", "需要补充说明：")}
                </strong>
                {t(result.clarification.en, result.clarification.zh)}
              </div>
            </div>
          )}

          {result.formula && (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    {t("Recommended Formula", "推荐公式")}
                  </h2>
                  <label className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prettifyEnabled}
                      onChange={(event) => {
                        const next = event.target.checked;
                        setPrettifyEnabled(next);
                        try {
                          window.localStorage.setItem("prettify_enabled", String(next));
                        } catch {
                          // localStorage unavailable; ignore.
                        }
                      }}
                      className="h-4 w-4 rounded border-slate-300 accent-emerald-600"
                    />
                    <span>
                      {t("Prettify formula (line break)", "美化公式(换行缩进)")}
                    </span>
                  </label>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap">
                    {platform === "excel"
                      ? t("Excel Format", "Excel 格式")
                      : t("Google Sheets Format", "Google 表格格式")}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard("main", result.formula)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-all min-h-[44px]"
                  >
                    {copiedKey === "main" ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    {copiedKey === "main"
                      ? t("Copied!", "已复制!")
                      : t("Copy single-line", "复制单行")}
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleSavedFormula}
                    aria-pressed={currentFormulaIsSaved}
                    translate="no"
                    title={
                      currentFormulaIsSaved
                        ? t("Remove from saved formulas", "从收藏夹移除")
                        : t("Save formula", "收藏公式")
                    }
                    className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-all min-h-[44px] border ${
                      currentFormulaIsSaved
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="inline-flex items-center" aria-hidden="true">
                      <BookmarkCheck
                        className={`w-4 h-4 ${
                          currentFormulaIsSaved ? "" : "hidden"
                        }`}
                      />
                      <Bookmark
                        className={`w-4 h-4 ${
                          currentFormulaIsSaved ? "hidden" : ""
                        }`}
                      />
                    </span>
                    <span
                      className={currentFormulaIsSaved ? "" : "hidden"}
                    >
                      {t("Saved", "已收藏")}
                    </span>
                    <span
                      className={currentFormulaIsSaved ? "hidden" : ""}
                    >
                      {t("Save", "收藏")}
                    </span>
                  </button>
                  <button
                    type="button"
                    disabled={!mainPretty.changed}
                    title={mainPretty.changed ? undefined : t("This formula does not qualify for prettify", "当前公式不满足美化条件")}
                    onClick={() => copyToClipboard("main-pretty", mainPretty.text)}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-all disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px]"
                  >
                    {copiedKey === "main-pretty" ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    {copiedKey === "main-pretty"
                      ? t("Copied!", "已复制!")
                      : t("Copy prettified", "复制美化版")}
                  </button>
                </div>
              </div>
              <div className="relative min-w-0 w-full rounded-xl bg-slate-900 p-4">
                {prettifyEnabled && mainPretty.changed ? (
                  <>
                  <pre className="whitespace-pre overflow-x-auto font-mono text-sm leading-6 text-emerald-400">
                    {mainPretty.text}
                  </pre>
                  <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-slate-900 to-transparent" />
                  </>
                ) : (
                <code className="text-emerald-400 font-mono text-sm md:text-base overflow-x-auto whitespace-nowrap py-1">
                  {result.formula}
                </code>
                )}
                <button
                  type="button"
                  onClick={() => copyToClipboard("main", result.formula)}
                  className="hidden"
                >
                  {copiedKey === "main" ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {copiedKey === "main"
                    ? t("Copied!", "已复制！")
                    : t("Copy", "复制")}
                </button>
              </div>
            </div>
          )}

          {prettifyEnabled && mainPretty.changed && (
            <p className="text-xs text-slate-500">
              {t(
                "Pretty format for reading only, prefer single-line for spreadsheet paste",
                "多行美化仅方便阅读,粘贴到表格优先使用单行版本"
              )}
            </p>
          )}
          {result.explanation.en && (
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                {t("Logic Explanation", "逻辑说明")}
              </h3>
              <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm">
                {t(result.explanation.en, result.explanation.zh)}
              </p>
            </div>
          )}

          {result.steps.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                {t("Step-by-Step Breakdown", "逐步拆解")}
              </h3>
              <ul className="space-y-2">
                {result.steps.map((step, index) => (
                  <li
                    key={`${step.en}-${index}`}
                    className="flex items-start gap-2.5 text-sm text-slate-700"
                  >
                    <span className="bg-emerald-100 text-emerald-800 font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs">
                      {index + 1}
                    </span>
                    <span>{t(step.en, step.zh)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(result.assumptions.length > 0 ||
            (mainAudit?.items.length ?? 0) > 0 ||
            hasAlternativeAuditItems) && (
            <div className="bg-slate-50 border border-slate-200 p-4 sm:p-5 rounded-xl">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {t("Assumptions & Checks", "假设与检查")}
              </h3>
              {result.assumptions.length > 0 && (
                <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                  {result.assumptions.map((assumption, index) => (
                    <li key={`${assumption.en}-${index}`}>
                      {t(assumption.en, assumption.zh)}
                    </li>
                  ))}
                </ul>
              )}
              {(mainAudit?.items.length ?? 0) > 0 && (
                <div className={result.assumptions.length > 0 ? "mt-4 border-t border-slate-200 pt-3" : ""}
                >
                  <p className="mb-2 text-xs font-semibold text-slate-700">
                    {t("Recommended formula checks", "推荐公式检查")}
                  </p>
                  {mainAudit ? renderAuditItems(mainAudit.items) : null}
                </div>
              )}
              {alternativeAudits.map((audit, index) =>
                audit.items.length > 0 ? (
                  <div
                    key={`alternative-audit-${index}`}
                    className="mt-4 border-t border-slate-200 pt-3"
                  >
                    <p className="mb-2 text-xs font-semibold text-slate-700">
                      {t("Alternative formula checks", "兼容公式检查")}
                    </p>
                    {renderAuditItems(audit.items)}
                  </div>
                ) : null
              )}
            </div>
          )}

          {result.alternatives.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                {t("Alternative Formulas", "兼容公式")}
              </h3>
              <div className="space-y-3">
                {result.alternatives.map((alternative, index) => {
                  const alternativePretty = prettifyFormula(
                    alternative.formula,
                    argumentSeparator
                  );
                  const alternativePrettyActive =
                    prettifyEnabled && alternativePretty.changed;
                  return (
                  <div
                    key={`${alternative.formula}-${index}`}
                    className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-semibold text-slate-500 block mb-1">
                        {t(alternative.label.en, alternative.label.zh)}
                      </span>
                      <div className="relative min-w-0 w-full rounded-xl bg-slate-900 p-4">
                        {alternativePrettyActive ? (
                          <>
                          <pre className="whitespace-pre overflow-x-auto font-mono text-sm leading-6 text-emerald-400">
                            {alternativePretty.text}
                          </pre>
                          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-slate-900 to-transparent" />
                          </>
                        ) : (
                          <code className="block overflow-x-auto whitespace-nowrap font-mono text-sm text-emerald-400">
                            {alternative.formula}
                          </code>
                        )}
                      </div>
                      {alternativePrettyActive && (
                        <p className="mt-2 text-xs text-slate-500">
                          {t(
                            "Pretty format for reading only, prefer single-line for spreadsheet paste",
                            "多行美化仅方便阅读,粘贴到表格优先使用单行版本"
                          )}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          `alternative-${index}`,
                          alternative.formula
                        )
                      }
                      className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg font-medium self-start sm:self-center flex items-center gap-1 flex-shrink-0 min-h-[44px]"
                    >
                      {copiedKey === `alternative-${index}` && (
                        <Check className="h-3.5 w-3.5" />
                      )}
                      {copiedKey === `alternative-${index}`
                        ? t("Copied!", "已复制!")
                        : t("Copy single-line", "复制单行")}
                    </button>
                    <button
                      type="button"
                      disabled={!alternativePretty.changed}
                      title={alternativePretty.changed ? undefined : t("This formula does not qualify for prettify", "当前公式不满足美化条件")}
                      onClick={() =>
                        copyToClipboard(
                          `alternative-pretty-${index}`,
                          alternativePretty.text
                        )
                      }
                      className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1.5 rounded-lg font-medium self-start sm:self-center flex items-center gap-1 flex-shrink-0 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px]"
                    >
                      {copiedKey === `alternative-pretty-${index}` && (
                        <Check className="h-3.5 w-3.5" />
                      )}
                      {copiedKey === `alternative-pretty-${index}`
                        ? t("Copied!", "已复制!")
                        : t("Copy prettified", "复制美化版")}
                    </button>
                  </div>
                  );
                })}
              </div>
            </div>
          )}

          {result.example && (
            <div className="border-t border-slate-100 pt-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                {t("Example", "示例")}
              </h3>
              <div className="bg-emerald-50/60 border border-emerald-100 p-3.5 rounded-xl text-sm flex flex-col sm:flex-row justify-between gap-2">
                <div>
                  <span className="font-semibold text-slate-700">
                    {t("Input: ", "输入：")}
                  </span>
                  <span className="text-slate-600">
                    {t(result.example.input.en, result.example.input.zh)}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-emerald-800">
                    {t("Result: ", "结果：")}
                  </span>
                  <span className="font-mono text-emerald-900 font-bold">
                    {t(result.example.result.en, result.example.result.zh)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {restoredFormula && !result && (
        <div className="bg-white shadow-xl rounded-2xl border border-slate-200 p-6 md:p-8 mt-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              {t("Assumptions & Checks", "假设与检查")}
            </h2>
            <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-2.5 py-0.5 rounded-full">
              {t("Restored formula", "已还原公式")}
            </span>
          </div>
          <div className="rounded-xl bg-slate-900 p-4 mb-4">
            <code className="block overflow-x-auto whitespace-nowrap font-mono text-sm text-emerald-400">
              {restoredFormula}
            </code>
          </div>
          {restoredAudit && restoredAudit.items.length > 0 ? (
            renderAuditItems(restoredAudit.items)
          ) : (
            <p className="text-sm text-emerald-700">
              {t("No obvious risks detected.", "未发现明显风险。")}
            </p>
          )}
        </div>
      )}

      {!compact && history.length > 0 && (
        <div className="bg-white shadow-xl rounded-2xl border border-slate-200 p-6 md:p-8 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              {t("Recent History", "最近历史")}
            </h2>
            <button
              type="button"
              onClick={clearHistory}
              className="text-xs text-red-600 hover:text-red-700 font-medium"
            >
              {t("Clear history", "一键清空")}
            </button>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            {t(
              "Stored locally only. Nothing is uploaded.",
              "仅存本地，不上传。"
            )}
          </p>
          <ul className="space-y-3">
            {history.map((entry, index) => {
              const taskItem = FORMULA_TASKS.find(
                (item) => item.id === entry.task
              );
              return (
                <li
                  key={`${entry.formula}-${entry.timestamp}-${index}`}
                  className="border border-slate-200 rounded-xl p-3.5 bg-slate-50"
                >
                  <div className="flex items-center justify-between gap-3 mb-1.5">
                    <span className="text-xs font-semibold text-slate-600">
                      {taskItem
                        ? t(taskItem.label.en, taskItem.label.zh)
                        : entry.task}
                    </span>
                    <button
                      type="button"
                      onClick={() => restoreHistory(entry)}
                      className="text-xs bg-slate-900 hover:bg-slate-700 text-white px-2.5 py-1 rounded-lg font-medium"
                    >
                      {t("Restore", "还原")}
                    </button>
                  </div>
                  <code className="block text-slate-800 font-mono text-xs break-all bg-white border border-slate-200 rounded-lg p-2.5">
                    {entry.formula}
                  </code>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
