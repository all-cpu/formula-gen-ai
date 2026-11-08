import type { BilingualText, FormulaResult } from "./formulaBuilder";

type FunctionInfo = {
  args: string;
  desc: BilingualText;
};

const FUNCTION_INFO: Record<string, FunctionInfo> = {
  SUMIFS: {
    args: "sum_range, criteria_range1, criteria1, ...",
    desc: {
      en: "SUMIFS adds cells that match one or more criteria.",
      zh: "SUMIFS 对满足一个或多个条件的单元格求和。",
    },
  },
  SUMIF: {
    args: "range, criteria, [sum_range]",
    desc: {
      en: "SUMIF adds cells in one range that match a criterion.",
      zh: "SUMIF 对匹配某个条件的区域求和。",
    },
  },
  COUNTIFS: {
    args: "criteria_range1, criteria1, ...",
    desc: {
      en: "COUNTIFS counts rows that satisfy multiple criteria.",
      zh: "COUNTIFS 统计同时满足多个条件的行数。",
    },
  },
  COUNTIF: {
    args: "range, criteria",
    desc: {
      en: "COUNTIF counts cells that satisfy one criterion.",
      zh: "COUNTIF 统计满足一个条件的单元格数。",
    },
  },
  COUNTA: {
    args: "value1, ...",
    desc: {
      en: "COUNTA counts non-empty cells in a range.",
      zh: "COUNTA 统计区域中的非空单元格。",
    },
  },
  XLOOKUP: {
    args: "lookup_value, lookup_array, return_array, [if_not_found]",
    desc: {
      en: "XLOOKUP finds a value and returns a value from the same row.",
      zh: "XLOOKUP 查找值并返回同一行对应的值。",
    },
  },
  VLOOKUP: {
    args: "lookup_value, table_array, col_index_num, [range_lookup]",
    desc: {
      en: "VLOOKUP searches the first column of a table and returns a value to its right.",
      zh: "VLOOKUP 在表首列查找，并返回右侧指定列的值。",
    },
  },
  HLOOKUP: {
    args: "lookup_value, table_array, row_index_num, [range_lookup]",
    desc: {
      en: "HLOOKUP searches the first row and returns a value below it.",
      zh: "HLOOKUP 在表首行查找，并返回下方指定行的值。",
    },
  },
  INDEX: {
    args: "array, row_num, [column_num]",
    desc: {
      en: "INDEX returns a value at a specific position inside a range.",
      zh: "INDEX 返回区域中指定位置的值。",
    },
  },
  MATCH: {
    args: "lookup_value, lookup_array, [match_type]",
    desc: {
      en: "MATCH returns the relative position of a value in a range.",
      zh: "MATCH 返回值在区域中的相对位置。",
    },
  },
  IF: {
    args: "logical_test, value_if_true, [value_if_false]",
    desc: {
      en: "IF chooses between two results based on a logical test.",
      zh: "IF 根据逻辑条件在两个结果之间选择。",
    },
  },
  IFERROR: {
    args: "value, value_if_error",
    desc: {
      en: "IFERROR replaces any formula error with a fallback value.",
      zh: "IFERROR 用备用值替换任何公式错误。",
    },
  },
  IFNA: {
    args: "value, value_if_na",
    desc: {
      en: "IFNA replaces only #N/A errors with a fallback value.",
      zh: "IFNA 仅用备用值替换 #N/A 错误。",
    },
  },
  OR: {
    args: "logical1, [logical2], ...",
    desc: {
      en: "OR returns TRUE when any of the logical tests is true.",
      zh: "OR 在任一逻辑条件为真时返回 TRUE。",
    },
  },
  TEXTJOIN: {
    args: "delimiter, ignore_empty, text1, ...",
    desc: {
      en: "TEXTJOIN combines text values with a delimiter and can ignore blanks.",
      zh: "TEXTJOIN 用分隔符合并文本，并可忽略空值。",
    },
  },
  CONCATENATE: {
    args: "text1, [text2], ...",
    desc: {
      en: "CONCATENATE joins text strings together.",
      zh: "CONCATENATE 将多个文本字符串连接起来。",
    },
  },
  CONCAT: {
    args: "text1, [text2], ...",
    desc: {
      en: "CONCAT joins text values and supports ranges.",
      zh: "CONCAT 连接文本值，并支持区域。",
    },
  },
  UNIQUE: {
    args: "array, [by_col], [exactly_once]",
    desc: {
      en: "UNIQUE returns distinct values from an array.",
      zh: "UNIQUE 从数组中返回不重复值。",
    },
  },
  FILTER: {
    args: "array, include, [if_empty]",
    desc: {
      en: "FILTER returns rows that satisfy an include condition.",
      zh: "FILTER 返回满足条件的行。",
    },
  },
  SORT: {
    args: "array, [sort_index], [sort_order], [by_col]",
    desc: {
      en: "SORT reorders a range or dynamic array.",
      zh: "SORT 对区域或动态数组重新排序。",
    },
  },
  SORTBY: {
    args: "array, by_array, [sort_order], ...",
    desc: {
      en: "SORTBY sorts one array using another array as the key.",
      zh: "SORTBY 使用另一数组作为键值排序。",
    },
  },
  RANK: {
    args: "number, ref, [order]",
    desc: {
      en: "RANK returns the rank of a number within a list.",
      zh: "RANK 返回数字在列表中的排名。",
    },
  },
  "RANK.EQ": {
    args: "number, ref, [order]",
    desc: {
      en: "RANK.EQ returns the rank of a number, with ties sharing the top rank.",
      zh: "RANK.EQ 返回数字的排名，相同值共享较优名次。",
    },
  },
  MAX: {
    args: "number1, ...",
    desc: {
      en: "MAX returns the largest number in a range.",
      zh: "MAX 返回区域中的最大数值。",
    },
  },
  MIN: {
    args: "number1, ...",
    desc: {
      en: "MIN returns the smallest number in a range.",
      zh: "MIN 返回区域中的最小数值。",
    },
  },
  ROUND: {
    args: "number, num_digits",
    desc: {
      en: "ROUND rounds a number to a specified number of digits.",
      zh: "ROUND 将数字四舍五入到指定小数位。",
    },
  },
  ROUNDUP: {
    args: "number, num_digits",
    desc: {
      en: "ROUNDUP rounds a number away from zero.",
      zh: "ROUNDUP 将数字远离零舍入。",
    },
  },
  ROUNDDOWN: {
    args: "number, num_digits",
    desc: {
      en: "ROUNDDOWN rounds a number toward zero.",
      zh: "ROUNDDOWN 将数字向零舍入。",
    },
  },
  DATEDIF: {
    args: "start_date, end_date, unit",
    desc: {
      en: "DATEDIF returns the difference between dates in a specified unit.",
      zh: "DATEDIF 按指定单位返回两个日期的差。",
    },
  },
  ABS: {
    args: "number",
    desc: {
      en: "ABS returns the absolute value of a number.",
      zh: "ABS 返回数字的绝对值。",
    },
  },
  MID: {
    args: "text, start_num, num_chars",
    desc: {
      en: "MID extracts a substring from the middle of text.",
      zh: "MID 从文本中间提取子字符串。",
    },
  },
  FIND: {
    args: "find_text, within_text, [start_num]",
    desc: {
      en: "FIND locates text and is case-sensitive.",
      zh: "FIND 定位文本，且区分大小写。",
    },
  },
  SEARCH: {
    args: "find_text, within_text, [start_num]",
    desc: {
      en: "SEARCH locates text and is case-insensitive.",
      zh: "SEARCH 定位文本，且不区分大小写。",
    },
  },
  LEN: {
    args: "text",
    desc: {
      en: "LEN returns the number of characters in text.",
      zh: "LEN 返回文本的字符数。",
    },
  },
  SUMPRODUCT: {
    args: "array1, [array2], ...",
    desc: {
      en: "SUMPRODUCT multiplies corresponding array values and sums the products.",
      zh: "SUMPRODUCT 将对应数组值相乘并求和。",
    },
  },
  ISNUMBER: {
    args: "value",
    desc: {
      en: "ISNUMBER returns TRUE when a value is a number.",
      zh: "ISNUMBER 在值为数字时返回 TRUE。",
    },
  },
  DATE: {
    args: "year, month, day",
    desc: {
      en: "DATE builds a real date from year, month, and day.",
      zh: "DATE 由年、月、日构建真实日期。",
    },
  },
  EOMONTH: {
    args: "start_date, months",
    desc: {
      en: "EOMONTH returns the last day of a month offset from start_date.",
      zh: "EOMONTH 返回从 start_date 偏移若干月后的最后一天。",
    },
  },
  YEAR: {
    args: "serial_number",
    desc: {
      en: "YEAR returns the year of a date.",
      zh: "YEAR 返回日期的年份。",
    },
  },
  MONTH: {
    args: "serial_number",
    desc: {
      en: "MONTH returns the month of a date as a number.",
      zh: "MONTH 返回日期的月份数字。",
    },
  },
  INT: {
    args: "number",
    desc: {
      en: "INT rounds a number down to the nearest integer.",
      zh: "INT 将数字向下取整到最接近的整数。",
    },
  },
  REGEXEXTRACT: {
    args: "text, regular_expression",
    desc: {
      en: "REGEXEXTRACT extracts text matching a regular expression (Google Sheets).",
      zh: "REGEXEXTRACT 用正则表达式提取文本（Google 表格）。",
    },
  },
  TEXTAFTER: {
    args: "text, delimiter, [instance_num], [match_mode], [match_end], [if_not_found]",
    desc: {
      en: "TEXTAFTER returns text after a delimiter (Excel 365 only).",
      zh: "TEXTAFTER 返回分隔符之后的文本（仅 Excel 365）。",
    },
  },
  TEXTBEFORE: {
    args: "text, delimiter, [instance_num], [match_mode], [match_end], [if_not_found]",
    desc: {
      en: "TEXTBEFORE returns text before a delimiter (Excel 365 only).",
      zh: "TEXTBEFORE 返回分隔符之前的文本（仅 Excel 365）。",
    },
  },
  TODAY: {
    args: "",
    desc: {
      en: "TODAY returns the current date.",
      zh: "TODAY 返回当前日期。",
    },
  },
  SUM: {
    args: "number1, ...",
    desc: {
      en: "SUM adds all numeric values in a range.",
      zh: "SUM 对区域内的数值求和。",
    },
  },
  COUNT: {
    args: "value1, ...",
    desc: {
      en: "COUNT counts numeric cells only.",
      zh: "COUNT 只统计数值单元格。",
    },
  },
  AVERAGE: {
    args: "number1, ...",
    desc: {
      en: "AVERAGE returns the arithmetic mean of numeric values.",
      zh: "AVERAGE 返回数值的算术平均值。",
    },
  },
  TEXT: {
    args: "value, format_text",
    desc: {
      en: "TEXT converts a value to text with a number format.",
      zh: "TEXT 按数字格式将值转换为文本。",
    },
  },
  SUBSTITUTE: {
    args: "text, old_text, new_text, [instance_num]",
    desc: {
      en: "SUBSTITUTE replaces text inside a string.",
      zh: "SUBSTITUTE 替换字符串中的文本。",
    },
  },
  TRIM: {
    args: "text",
    desc: {
      en: "TRIM removes leading, trailing, and repeated spaces.",
      zh: "TRIM 清除首尾及多余空格。",
    },
  },
  LEFT: {
    args: "text, [num_chars]",
    desc: {
      en: "LEFT returns the first characters of text.",
      zh: "LEFT 返回文本开头的字符。",
    },
  },
  RIGHT: {
    args: "text, [num_chars]",
    desc: {
      en: "RIGHT returns the last characters of text.",
      zh: "RIGHT 返回文本末尾的字符。",
    },
  },
  VALUE: {
    args: "text",
    desc: {
      en: "VALUE converts text that looks like a number into a number.",
      zh: "VALUE 将看起来像数字的文本转换为数字。",
    },
  },
};

function normalizeDateCriteria(formula: string) {
  return formula.replace(
    /"\s*(>=|<=|>|<)\s*(\d{4})-(\d{2})-(\d{2})\s*"/g,
    (_match, operator: string, year: string, month: string, day: string) =>
      `"${operator}"&DATE(${Number(year)},${Number(month)},${Number(day)})`
  );
}

function uniqueFunctions(formula: string) {
  const names = Array.from(
    formula
      .replace(/"(?:[^"]|"")*"/g, "")
      .matchAll(/\b([A-Z][A-Z0-9.]*)\s*\(/g),
    (match) => match[1].toUpperCase()
  );
  return Array.from(new Set(names));
}

export function explainFormulaLocally(
  formula: string,
  lang: "en" | "zh"
): FormulaResult {
  const trimmed = formula.trim();
  const hasEquals = trimmed.startsWith("=");
  const functions = uniqueFunctions(trimmed);
  const known = functions.filter((name) => FUNCTION_INFO[name]);
  const unknown = functions.filter((name) => !FUNCTION_INFO[name]);
  const hasUnsafeDate = /"\s*(>=|<=|>|<)\s*\d{4}-\d{2}-\d{2}\s*"/.test(
    trimmed
  );
  const corrected = hasUnsafeDate ? normalizeDateCriteria(trimmed) : "";

  const functionLines = known.map((name) => {
    const info = FUNCTION_INFO[name];
    return lang === "zh"
      ? `${name}(${info.args})：${info.desc.zh}`
      : `${name}(${info.args}) - ${info.desc.en}`;
  });

  const explanation =
    lang === "zh"
      ? functions.length
        ? `该公式使用 ${functions.join(", ")} 完成计算。`
        : "未识别到常见函数，请检查公式中的函数名。"
      : functions.length
      ? `This formula uses ${functions.join(", ")} to perform the calculation.`
      : "No common function was recognized. Check the function names in the formula.";

  const steps =
    functionLines.length > 0
      ? functionLines.map((line) => ({ en: line, zh: line }))
      : [];

  const assumptions: BilingualText[] = [];
  if (!hasEquals) {
    assumptions.push({
      en: "Spreadsheet formulas normally begin with an equals sign.",
      zh: "表格公式通常以等号开头。",
    });
  }
  if (functions.includes("SUMIFS") || functions.includes("COUNTIFS")) {
    assumptions.push({
      en: "Every criteria range must have the same number of rows as the sum or count range.",
      zh: "所有条件区域必须与求和或计数区域保持相同行数。",
    });
  }
  if (functions.includes("XLOOKUP")) {
    assumptions.push({
      en: "The lookup array and return array must have the same number of rows.",
      zh: "查找数组与返回数组必须具有相同行数。",
    });
  }
  if (functions.includes("VLOOKUP")) {
    assumptions.push({
      en: "VLOOKUP searches only the first column of table_array.",
      zh: "VLOOKUP 只在 table_array 的第一列查找。",
    });
  }
  if (functions.includes("TEXTJOIN")) {
    assumptions.push({
      en: "TEXTJOIN is available in Excel 2019 or later, WPS, and Google Sheets.",
      zh: "TEXTJOIN 适用于 Excel 2019 及以后版本、WPS 和 Google 表格。",
    });
  }
  if (functions.includes("UNIQUE") || functions.includes("FILTER")) {
    assumptions.push({
      en: "UNIQUE and FILTER require Excel 365, Excel 2021, WPS, or Google Sheets.",
      zh: "UNIQUE 和 FILTER 需要 Excel 365、Excel 2021、WPS 或 Google 表格。",
    });
  }
  if (functions.includes("DATEDIF")) {
    assumptions.push({
      en: "The start date should be earlier than or equal to the end date.",
      zh: "开始日期应早于或等于结束日期。",
    });
  }
  if (hasUnsafeDate) {
    assumptions.push({
      en: "Quoted date strings such as \">=2026-03-01\" are affected by regional date settings. Use DATE() instead.",
      zh: "类似 \">=2026-03-01\" 的带引号日期字符串会受到区域日期设置影响，应改用 DATE()。",
    });
  }
  if (unknown.length > 0) {
    assumptions.push({
      en: `This formula contains function(s) not in the built-in reference: ${unknown.join(", ")}.`,
      zh: `该公式包含内置参考中未覆盖的函数：${unknown.join(", ")}。`,
    });
  }

  const alternatives: Array<{ label: BilingualText; formula: string }> = [];
  if (corrected && corrected !== trimmed) {
    alternatives.push({
      label: {
        en: "Region-safe date version",
        zh: "区域安全的日期版本",
      },
      formula: corrected,
    });
  }

  return {
    formula: trimmed,
    explanation: { en: explanation, zh: explanation },
    steps,
    assumptions,
    alternatives,
    example: {
      input: {
        en: trimmed,
        zh: trimmed,
      },
      result: {
        en: lang === "zh" ? "逻辑已拆解" : "Logic explained",
        zh: lang === "zh" ? "逻辑已拆解" : "Logic explained",
      },
    },
  };
}
