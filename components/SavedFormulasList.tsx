"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Bookmark,
  Check,
  ClipboardCopy,
  Copy,
  Download,
  Pencil,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import CopyToast from "@/components/CopyToast";
import PageHeader from "@/components/PageHeader";
import { getFormulaTask } from "@/lib/formulaBuilder";
import {
  buildSavedFormulaHref,
  deleteSavedFormula,
  getSavedFormulas,
  renameSavedFormula,
  SAVED_FORMULAS_EVENT,
  SAVED_FORMULAS_LIMIT,
  type SavedFormula,
} from "@/lib/savedFormulas";

export default function SavedFormulasList() {
  const { language } = useLanguage();
  const t = (en: string, zh: string) => (language === "zh" ? zh : en);

  const [items, setItems] = useState<SavedFormula[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copyAllCopied, setCopyAllCopied] = useState(false);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyAllTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const allCheckboxRef = useRef<HTMLInputElement | null>(null);

  const selectedCount = selectedIds.size;
  const allSelected = items.length > 0 && selectedCount === items.length;
  const someSelected = selectedCount > 0 && selectedCount < items.length;

  useEffect(() => {
    const refresh = () => {
      const nextItems = getSavedFormulas();
      setItems(nextItems);
      setSelectedIds((previous) => {
        const next = new Set<string>();
        for (const id of previous) {
          if (nextItems.some((item) => item.id === id)) next.add(id);
        }
        return next;
      });
      setLoaded(true);
    };

    refresh();
    window.addEventListener(SAVED_FORMULAS_EVENT, refresh);
    return () => {
      window.removeEventListener(SAVED_FORMULAS_EVENT, refresh);
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
      if (copyAllTimerRef.current) clearTimeout(copyAllTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (allCheckboxRef.current) {
      allCheckboxRef.current.indeterminate = someSelected;
    }
  }, [someSelected, allSelected]);

  const copyTextFallback = (text: string) => {
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

  const copyFormula = async (item: SavedFormula) => {
    let copied = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(item.formula);
        copied = true;
      }
    } catch {
      copied = false;
    }
    if (!copied) copied = copyTextFallback(item.formula);
    if (!copied) return;
    setCopiedId(item.id);
    if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    copiedTimerRef.current = setTimeout(() => setCopiedId(null), 2000);
  };

  const startRename = (item: SavedFormula) => {
    setEditingId(item.id);
    setDraftName(item.name);
  };

  const commitRename = () => {
    if (!editingId) return;
    const outcome = renameSavedFormula(editingId, draftName);
    if (outcome.status === "error") return;
    setItems(outcome.items);
    setEditingId(null);
    setDraftName("");
  };

  const cancelRename = () => {
    setEditingId(null);
    setDraftName("");
  };

  const removeItem = (item: SavedFormula) => {
    const outcome = deleteSavedFormula(item.id);
    if (outcome.status === "error") return;
    setItems(outcome.items);
    setSelectedIds(new Set());
    if (editingId === item.id) cancelRename();
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((item) => item.id)));
    }
  };

  const confirmDeleteSelected = () => {
    if (selectedCount === 0) return;
    for (const id of selectedIds) {
      deleteSavedFormula(id);
    }
    const nextItems = getSavedFormulas();
    setItems(nextItems);
    setSelectedIds(new Set());
    setShowDeleteConfirm(false);
    if (editingId && !nextItems.some((item) => item.id === editingId)) {
      cancelRename();
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(items, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    downloadBlob(blob, "saved-formulas.json");
  };

  const csvEscape = (value: string) => `"${value.replace(/"/g, '""')}"`;

  const exportCsv = () => {
    const header = ["Name", "Task", "Platform", "Formula", "Created At"];
    const rows = items.map((item) => {
      const task = getFormulaTask(item.task);
      const name = item.name || t(task.label.en, task.label.zh);
      return [
        csvEscape(name),
        csvEscape(item.task),
        csvEscape(item.platform),
        csvEscape(item.formula),
        csvEscape(new Date(item.createdAt).toISOString()),
      ].join(",");
    });
    const content =
      "\uFEFF" + [header.map(csvEscape).join(","), ...rows].join("\r\n");
    const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
    downloadBlob(blob, "saved-formulas.csv");
  };

  const copyAll = async () => {
    const text = items
      .map((item) => {
        const task = getFormulaTask(item.task);
        const name = item.name || t(task.label.en, task.label.zh);
        return `${name}\n${item.formula}`;
      })
      .join("\n\n");

    let copied = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        copied = true;
      }
    } catch {
      copied = false;
    }
    if (!copied) copied = copyTextFallback(text);
    if (!copied) return;

    setCopyAllCopied(true);
    if (copyAllTimerRef.current) clearTimeout(copyAllTimerRef.current);
    copyAllTimerRef.current = setTimeout(() => setCopyAllCopied(false), 2000);
  };

  if (!loaded) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-sm text-slate-500">
        {t("Loading saved formulas...", "正在加载收藏公式...")}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <PageHeader
        size="md"
        title={{
          en: "Saved Formulas",
          zh: "已收藏公式",
        }}
        subtitle={{
          en: "Formulas you saved locally in this browser. Load them back into the generator, copy, rename or delete them.",
          zh: "你在此浏览器中收藏的公式。可加载回生成器、复制、重命名或删除。",
        }}
      />

      <p className="text-xs text-slate-500 mb-4">
        {t(
          "Stored locally only. Nothing is uploaded.",
          "仅保存在本地，不上传任何数据。"
        )}
      </p>

      {items.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center">
          <Bookmark className="w-10 h-10 mx-auto text-slate-300 mb-3" />
          <h2 className="text-lg font-bold text-slate-900 mb-2">
            {t("No saved formulas yet", "还没有收藏公式")}
          </h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            {t(
              "When you generate a formula, click the Save button next to Copy single-line.",
              "生成公式后，点击“复制单行”按钮旁边的收藏按钮即可保存。"
            )}
          </p>
          <Link
            href="/excel-formula-generator"
            className="inline-flex items-center gap-2 mt-5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-all"
          >
            {t("Open Excel Generator", "打开 Excel 生成器")}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <>
          <div className="relative bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 mb-4">
            <CopyToast
              visible={copyAllCopied}
              message={t("Copied", "已复制")}
            />

            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-600 cursor-pointer">
                <input
                  ref={allCheckboxRef}
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 accent-emerald-600 cursor-pointer"
                />
                <span>{t("Select all", "全选")}</span>
              </label>

              <div className="flex flex-wrap items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={exportJson}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-2 text-xs sm:text-sm font-medium min-h-[44px]"
                >
                  <Download className="w-4 h-4" />
                  {t("Export JSON", "导出 JSON")}
                </button>
                <button
                  type="button"
                  onClick={exportCsv}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-2 text-xs sm:text-sm font-medium min-h-[44px]"
                >
                  <Download className="w-4 h-4" />
                  {t("Export CSV", "导出 CSV")}
                </button>
                <button
                  type="button"
                  onClick={copyAll}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-2 text-xs sm:text-sm font-medium min-h-[44px]"
                >
                  <ClipboardCopy className="w-4 h-4" />
                  {t("Copy all", "复制全部")}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={selectedCount === 0}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 text-xs sm:text-sm font-medium min-h-[44px] disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                  {t("Delete selected", "删除选中")}
                  {selectedCount > 0 ? ` (${selectedCount})` : ""}
                </button>
              </div>
            </div>
          </div>

          <ul className="space-y-4">
            {items.map((item) => {
              const task = getFormulaTask(item.task);
              const title =
                item.name || t(task.label.en, task.label.zh);
              const href = buildSavedFormulaHref(item);
              const dateLabel = new Date(item.createdAt).toLocaleDateString(
                language === "zh" ? "zh-CN" : "en-US",
                { year: "numeric", month: "short", day: "numeric" }
              );
              return (
                <li
                  key={item.id}
                  className="relative bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6"
                >
                  <CopyToast
                    visible={copiedId === item.id}
                    message={t("Copied", "已复制")}
                  />

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(item.id)}
                      onChange={() => toggleSelected(item.id)}
                      aria-label={t("Select formula", "选择公式")}
                      className="mt-1.5 w-4 h-4 accent-emerald-600 cursor-pointer shrink-0"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          {editingId === item.id ? (
                            <div className="flex flex-wrap gap-2">
                              <input
                                value={draftName}
                                onChange={(event) =>
                                  setDraftName(event.target.value)
                                }
                                onKeyDown={(event) => {
                                  if (event.key === "Enter") commitRename();
                                  if (event.key === "Escape") cancelRename();
                                }}
                                placeholder={t(
                                  task.label.en,
                                  task.label.zh
                                )}
                                maxLength={60}
                                autoFocus
                                className="flex-1 min-w-0 rounded-lg border border-emerald-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
                              />
                              <button
                                type="button"
                                onClick={commitRename}
                                title={t("Save name", "保存名称")}
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 text-sm font-semibold min-h-[44px]"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={cancelRename}
                                title={t("Cancel", "取消")}
                                className="inline-flex items-center gap-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-2 text-sm font-semibold min-h-[44px]"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <h2 className="text-base font-bold text-slate-900 break-words">
                                {title}
                              </h2>
                              <p className="text-xs text-slate-500 mt-1">
                                {t(task.label.en, task.label.zh)} ·{" "}
                                {item.platform === "excel"
                                  ? t("Excel / WPS", "Excel / WPS")
                                  : t("Google Sheets", "Google 表格")}{" "}
                                · {dateLabel}
                              </p>
                            </>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={href}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 text-xs sm:text-sm font-medium min-h-[44px]"
                          >
                            <RotateCcw className="w-4 h-4" />
                            {t("Load", "加载")}
                          </Link>
                          <button
                            type="button"
                            onClick={() => copyFormula(item)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-2 text-xs sm:text-sm font-medium min-h-[44px]"
                          >
                            <Copy className="w-4 h-4" />
                            {t("Copy", "复制")}
                          </button>
                          <button
                            type="button"
                            onClick={() => startRename(item)}
                            title={t("Rename", "重命名")}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-2 text-xs sm:text-sm font-medium min-h-[44px]"
                          >
                            <Pencil className="w-4 h-4" />
                            {t("Rename", "重命名")}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeItem(item)}
                            title={t("Delete", "删除")}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 text-xs sm:text-sm font-medium min-h-[44px]"
                          >
                            <Trash2 className="w-4 h-4" />
                            {t("Delete", "删除")}
                          </button>
                        </div>
                      </div>

                      <code className="block mt-4 text-xs sm:text-sm font-mono text-slate-800 break-all bg-slate-50 border border-slate-200 rounded-lg p-3">
                        {item.formula}
                      </code>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <div className="mt-5 text-center text-xs font-semibold text-slate-500">
        {items.length} / {SAVED_FORMULAS_LIMIT}
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">
              {t("Delete selected formulas", "删除选中的收藏")}
            </h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              {t(
                `Are you sure you want to delete the selected ${selectedCount} saved formulas? This action cannot be undone.`,
                `确定删除选中的 ${selectedCount} 条收藏吗？此操作不可撤销。`
              )}
            </p>
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="inline-flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 text-sm font-semibold min-h-[44px]"
              >
                {t("Cancel", "取消")}
              </button>
              <button
                type="button"
                onClick={confirmDeleteSelected}
                className="inline-flex items-center justify-center rounded-lg bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 text-sm font-semibold min-h-[44px]"
              >
                {t("Delete", "删除")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
