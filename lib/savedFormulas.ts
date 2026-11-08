import type { FormulaTaskId, FormulaValues } from "@/lib/formulaBuilder";

export const SAVED_FORMULAS_KEY = "formula-gen-saved-formulas";
export const SAVED_FORMULAS_EVENT = "formulagen:saved-formulas-changed";
export const SAVED_FORMULAS_LIMIT = 30;

export type FormulaPlatform = "excel" | "google_sheets";

export type SpreadsheetVersion =
  | "excel365"
  | "excel2021"
  | "excel2019"
  | "older"
  | "wps";

export type ArgumentSeparator = "," | ";";

export type SavedFormula = {
  id: string;
  /** Empty means the UI falls back to the localized task label. */
  name: string;
  formula: string;
  task: FormulaTaskId;
  values: FormulaValues;
  platform: FormulaPlatform;
  excelVersion: SpreadsheetVersion;
  separator: ArgumentSeparator;
  createdAt: number;
  updatedAt: number;
};

export type SavedFormulaDraft = Omit<
  SavedFormula,
  "id" | "name" | "createdAt" | "updatedAt"
>;

export type SavedFormulaMutationResult = {
  status: "saved" | "removed" | "limit" | "error";
  items: SavedFormula[];
};

const PLATFORMS: FormulaPlatform[] = ["excel", "google_sheets"];
const VERSIONS: SpreadsheetVersion[] = [
  "excel365",
  "excel2021",
  "excel2019",
  "older",
  "wps",
];
const SEPARATORS: ArgumentSeparator[] = [",", ";"];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const toValues = (value: unknown): FormulaValues => {
  if (!isRecord(value)) return {};
  const values: FormulaValues = {};
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry === "string") values[key] = entry;
  }
  return values;
};

const parseSavedFormula = (value: unknown): SavedFormula | null => {
  if (!isRecord(value)) return null;
  if (typeof value.id !== "string" || value.id === "") return null;
  if (typeof value.formula !== "string" || !value.formula.startsWith("=")) {
    return null;
  }
  if (typeof value.task !== "string") return null;
  if (!PLATFORMS.includes(value.platform as FormulaPlatform)) return null;
  if (!VERSIONS.includes(value.excelVersion as SpreadsheetVersion)) return null;
  if (!SEPARATORS.includes(value.separator as ArgumentSeparator)) return null;
  if (typeof value.createdAt !== "number" || !Number.isFinite(value.createdAt)) {
    return null;
  }

  return {
    id: value.id,
    name: typeof value.name === "string" ? value.name : "",
    formula: value.formula,
    task: value.task as FormulaTaskId,
    values: toValues(value.values),
    platform: value.platform as FormulaPlatform,
    excelVersion: value.excelVersion as SpreadsheetVersion,
    separator: value.separator as ArgumentSeparator,
    createdAt: value.createdAt,
    updatedAt:
      typeof value.updatedAt === "number" && Number.isFinite(value.updatedAt)
        ? value.updatedAt
        : value.createdAt,
  };
};

const createId = () => {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const notifyChange = () => {
  if (typeof window === "undefined") return;
  window.setTimeout(() => {
    try {
      window.dispatchEvent(new Event(SAVED_FORMULAS_EVENT));
    } catch (error) {
      console.warn(
        "FormulaGen: failed to notify saved formula changes.",
        error
      );
    }
  }, 0);
};

type SavedFormulaWindow = Window & {
  __formulaGenSavedFormulasStorageSyncBound?: boolean;
};

const bindStorageSync = () => {
  if (typeof window === "undefined") return;
  const scopedWindow = window as SavedFormulaWindow;
  if (scopedWindow.__formulaGenSavedFormulasStorageSyncBound) return;

  scopedWindow.__formulaGenSavedFormulasStorageSyncBound = true;
  window.addEventListener("storage", (event) => {
    try {
      if (event.key === null || event.key === SAVED_FORMULAS_KEY) {
        notifyChange();
      }
    } catch (error) {
      console.warn(
        "FormulaGen: failed to sync saved formulas across tabs.",
        error
      );
    }
  });
};

bindStorageSync();

const persist = (items: SavedFormula[]): boolean => {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(
      SAVED_FORMULAS_KEY,
      JSON.stringify(items.slice(0, SAVED_FORMULAS_LIMIT))
    );
    notifyChange();
    return true;
  } catch {
    return false;
  }
};

export function getSavedFormulas(): SavedFormula[] {
  if (typeof window === "undefined") return [];

  let raw: string | null;
  try {
    raw = window.localStorage.getItem(SAVED_FORMULAS_KEY);
  } catch {
    return [];
  }
  if (!raw) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    console.warn(
      "FormulaGen: saved formulas storage is corrupted and could not be parsed.",
      error
    );
    return [];
  }

  if (!Array.isArray(parsed)) {
    console.warn(
      "FormulaGen: saved formulas storage is corrupted; expected an array."
    );
    return [];
  }

  try {
    return parsed
      .map(parseSavedFormula)
      .filter((item): item is SavedFormula => item !== null)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, SAVED_FORMULAS_LIMIT);
  } catch (error) {
    console.warn(
      "FormulaGen: saved formulas storage could not be normalized.",
      error
    );
    return [];
  }
}

export function isFormulaSaved(
  items: SavedFormula[],
  formula: string,
  platform: FormulaPlatform
): boolean {
  return items.some(
    (item) => item.formula === formula && item.platform === platform
  );
}

export function toggleSavedFormula(
  draft: SavedFormulaDraft
): SavedFormulaMutationResult {
  const current = getSavedFormulas();
  const existing = current.find(
    (item) => item.formula === draft.formula && item.platform === draft.platform
  );

  if (existing) {
    const items = current.filter((item) => item.id !== existing.id);
    return persist(items)
      ? { status: "removed", items }
      : { status: "error", items: current };
  }

  if (current.length >= SAVED_FORMULAS_LIMIT) {
    return { status: "limit", items: current };
  }

  const now = Date.now();
  const items = [
    {
      ...draft,
      id: createId(),
      name: "",
      createdAt: now,
      updatedAt: now,
    },
    ...current,
  ].slice(0, SAVED_FORMULAS_LIMIT);

  return persist(items)
    ? { status: "saved", items }
    : { status: "error", items: current };
}

export function renameSavedFormula(
  id: string,
  name: string
): SavedFormulaMutationResult {
  const current = getSavedFormulas();
  if (!current.some((item) => item.id === id)) {
    return { status: "error", items: current };
  }
  const trimmedName = name.trim();
  const items = current.map((item) =>
    item.id === id
      ? { ...item, name: trimmedName, updatedAt: Date.now() }
      : item
  );
  return persist(items)
    ? { status: "saved", items }
    : { status: "error", items: current };
}

export function deleteSavedFormula(
  id: string
): SavedFormulaMutationResult {
  const current = getSavedFormulas();
  const items = current.filter((item) => item.id !== id);
  if (items.length === current.length) {
    return { status: "error", items: current };
  }
  return persist(items)
    ? { status: "removed", items }
    : { status: "error", items: current };
}

export function buildSavedFormulaHref(item: SavedFormula): string {
  const params = new URLSearchParams();
  params.set("task", item.task);
  for (const [key, value] of Object.entries(item.values)) {
    if (value !== "") params.set(key, value);
  }
  params.set("separator", item.separator);
  if (item.platform === "google_sheets") {
    return `/google-sheets-formula-generator?${params.toString()}`;
  }
  params.set("excelVersion", item.excelVersion);
  return `/excel-formula-generator?${params.toString()}`;
}
