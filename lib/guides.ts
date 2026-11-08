export type Bilingual = { en: string; zh: string };
import type { FormulaTaskId } from "./formulaBuilder";

export type GuideIndexEntry = {
  slug: string;
  title: Bilingual;
  desc: Bilingual;
};

export type GuideDetailEntry = {
  slug: string;
  title: Bilingual;
  syntax: string;
  summary: Bilingual;
  example: Bilingual;
  useCase: Bilingual;
  errors: Bilingual[];
  toolTask?: FormulaTaskId;
};

export const GUIDE_INDEX: GuideIndexEntry[] = [
  {
    slug: "sumifs-excel",
    title: { en: "SUMIFS Excel Formula", zh: "SUMIFS Excel 公式" },
    desc: { en: "Sum values based on multiple conditions.", zh: "根据多个条件求和。" },
  },
  {
    slug: "xlookup-excel",
    title: { en: "XLOOKUP Excel Formula", zh: "XLOOKUP Excel 公式" },
    desc: { en: "Modern, flexible lookup function for Excel 365.", zh: "Excel 365 的现代灵活查找函数。" },
  },
  {
    slug: "countifs-excel",
    title: { en: "COUNTIFS Excel Formula", zh: "COUNTIFS Excel 公式" },
    desc: { en: "Count cells that satisfy multiple criteria.", zh: "统计满足多个条件的单元格数量。" },
  },
  {
    slug: "iferror-excel",
    title: { en: "IFERROR Excel Formula", zh: "IFERROR Excel 公式" },
    desc: { en: "Trap and handle errors smoothly.", zh: "捕获并优雅处理错误。" },
  },
  {
    slug: "index-match-excel",
    title: { en: "INDEX MATCH Excel Formula", zh: "INDEX MATCH Excel 公式" },
    desc: { en: "Classic powerful lookup alternative to VLOOKUP.", zh: "经典强大的 VLOOKUP 替代查找方案。" },
  },
  {
    slug: "textjoin-excel",
    title: { en: "TEXTJOIN Excel Formula", zh: "TEXTJOIN Excel 公式" },
    desc: { en: "Combine text from multiple ranges with delimiters.", zh: "用分隔符合并多个区域文本。" },
  },
  {
    slug: "filter-excel",
    title: { en: "FILTER Excel Formula", zh: "FILTER Excel 公式" },
    desc: { en: "Dynamically filter ranges based on criteria.", zh: "按条件动态筛选区域。" },
  },
  {
    slug: "unique-excel",
    title: { en: "UNIQUE Excel Formula", zh: "UNIQUE Excel 公式" },
    desc: { en: "Extract distinct values from a range.", zh: "从区域提取不重复值。" },
  },
  {
    slug: "concatenate-excel",
    title: { en: "CONCATENATE Excel Formula", zh: "CONCATENATE Excel 公式" },
    desc: { en: "Join multiple strings together.", zh: "将多个字符串连接起来。" },
  },
  {
    slug: "vlookup-excel",
    title: { en: "VLOOKUP Excel Formula", zh: "VLOOKUP Excel 公式" },
    desc: { en: "Traditional vertical lookup guide.", zh: "传统垂直查找指南。" },
  },
  {
    slug: "sumifs-between-two-dates",
    title: { en: "SUMIFS Between Two Dates", zh: "两个日期之间的 SUMIFS" },
    desc: { en: "Sum values only when the date is between a start and end date.", zh: "仅对日期位于开始和结束日期之间的值求和。" },
  },
  {
    slug: "sumif-with-one-condition",
    title: { en: "SUMIF with One Condition", zh: "单条件 SUMIF" },
    desc: { en: "Total a column when one column matches a value.", zh: "当一列匹配某个值时，对目标列求和。" },
  },
  {
    slug: "countifs-date-range",
    title: { en: "COUNTIFS Date Range", zh: "COUNTIFS 日期区间" },
    desc: { en: "Count rows whose dates fall between two dates.", zh: "统计日期落在两个日期之间的行数。" },
  },
  {
    slug: "countif-not-blank",
    title: { en: "COUNTIF Not Blank", zh: "COUNTIF 非空" },
    desc: { en: "Count cells that are not empty.", zh: "统计非空单元格数量。" },
  },
  {
    slug: "if-greater-than",
    title: { en: "IF Greater Than", zh: "IF 大于" },
    desc: { en: "Return one value when a number is greater than a threshold.", zh: "数字大于阈值时返回一个值，否则返回另一个。" },
  },
  {
    slug: "if-cell-contains-text",
    title: { en: "IF Cell Contains Text", zh: "IF 判断单元格是否包含文本" },
    desc: { en: "Check whether a cell contains a word and return Yes or No.", zh: "判断单元格是否包含某个词，并返回 Yes 或 No。" },
  },
  {
    slug: "vlookup-from-another-sheet",
    title: { en: "VLOOKUP from Another Sheet", zh: "跨表 VLOOKUP" },
    desc: { en: "Pull values from a different worksheet using VLOOKUP.", zh: "用 VLOOKUP 从另一个工作表取值。" },
  },
  {
    slug: "xlookup-multiple-criteria",
    title: { en: "XLOOKUP Multiple Criteria", zh: "XLOOKUP 多条件" },
    desc: { en: "Use XLOOKUP with joined criteria for precise lookups.", zh: "用 XLOOKUP 组合条件进行精确查找。" },
  },
  {
    slug: "index-match-two-way",
    title: { en: "INDEX MATCH Two-Way Lookup", zh: "INDEX MATCH 双向查找" },
    desc: { en: "Look up a value by matching both row and column.", zh: "同时匹配行和列进行查找。" },
  },
  {
    slug: "textjoin-with-comma",
    title: { en: "TEXTJOIN with Comma", zh: "逗号分隔 TEXTJOIN" },
    desc: { en: "Join a list with commas and skip blank cells.", zh: "用逗号连接列表并跳过空单元格。" },
  },
  {
    slug: "concatenate-first-and-last-name",
    title: { en: "Concatenate First and Last Name", zh: "合并姓名" },
    desc: { en: "Join first and last name cells into a full name.", zh: "把名和姓单元格合并为完整姓名。" },
  },
  {
    slug: "calculate-days-between-dates",
    title: { en: "Calculate Days Between Dates", zh: "计算两个日期之间天数" },
    desc: { en: "Count the number of days between two date cells.", zh: "统计两个日期单元格之间的天数。" },
  },
  {
    slug: "calculate-percentage-change",
    title: { en: "Calculate Percentage Change", zh: "计算百分比变化" },
    desc: { en: "Measure growth from an old value to a new value.", zh: "测量从旧值到新值的增长幅度。" },
  },
  {
    slug: "rank-numbers-descending",
    title: { en: "Rank Numbers Descending", zh: "数字降序排名" },
    desc: { en: "Rank sales or scores from highest to lowest.", zh: "按销售额或分数从高到低排名。" },
  },
  {
    slug: "find-latest-date",
    title: { en: "Find Latest Date", zh: "查找最晚日期" },
    desc: { en: "Return the most recent date in a column.", zh: "返回一列中的最晚日期。" },
  },
  {
    slug: "count-unique-values",
    title: { en: "Count Unique Values", zh: "统计唯一值数量" },
    desc: { en: "Count distinct non-empty values in a range.", zh: "统计区域中不重复且非空的值。" },
  },
  {
    slug: "extract-domain-from-email",
    title: { en: "Extract Domain from Email", zh: "从邮箱提取域名" },
    desc: { en: "Return the domain after @ in an email address.", zh: "返回邮箱地址中 @ 后面的域名。" },
  },
  {
    slug: "round-to-two-decimals",
    title: { en: "Round to Two Decimals", zh: "四舍五入保留两位小数" },
    desc: { en: "Round a number to two decimal places.", zh: "将数字四舍五入到两位小数。" },
  },
  {
    slug: "filter-multiple-criteria",
    title: { en: "FILTER Multiple Criteria", zh: "FILTER 多条件" },
    desc: { en: "Filter rows using more than one condition.", zh: "使用多个条件筛选行。" },
  },
  {
    slug: "if-blank-excel",
    title: { en: "IF Blank Excel Formula", zh: "Excel 判断空单元格" },
    desc: { en: "Return a different value when a cell is blank.", zh: "单元格为空时返回不同结果。" },
  },
];

export const GUIDE_DETAILS: Record<string, GuideDetailEntry> = {
  "sumifs-excel": {
    slug: "sumifs-excel",
    title: { en: "SUMIFS Formula Guide", zh: "SUMIFS 公式教程" },
    syntax: "=SUMIFS(sum_range, criteria_range1, criteria1, ...)",
    summary: {
      en: "The SUMIFS function adds cells specified by a given set of conditions or criteria.",
      zh: "SUMIFS 函数按一组给定条件或准则对单元格求和。",
    },
    example: {
      en: "Suppose you have a sales list with Department, Date, and Amount columns. SUMIFS lets you total Amount only for rows where Department is Sales and Date falls in March 2026.",
      zh: "假设销售表包含部门、日期和金额列，SUMIFS 可只对部门为 Sales 且日期在 2026 年 3 月的行求金额合计。",
    },
    useCase: {
      en: "Finance and operations teams use SUMIFS for monthly reporting, budget variance, and reconciling transactions by department or region.",
      zh: "财务和运营团队用 SUMIFS 做月度报表、预算差异分析，以及按部门或区域对账。",
    },
    errors: [
      { en: "Criteria ranges and the sum range must have the same size.", zh: "条件区域与求和区域大小必须一致。" },
      { en: "Text criteria must be wrapped in double quotes.", zh: "文本条件必须用双引号括起来。" },
      { en: "Date criteria need a valid date or a DATE() reference.", zh: "日期条件需为有效日期或使用 DATE() 引用。" },
    ],
  },
  "xlookup-excel": {
    slug: "xlookup-excel",
    title: { en: "XLOOKUP Formula Guide", zh: "XLOOKUP 公式教程" },
    syntax: "=XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found])",
    summary: {
      en: "XLOOKUP searches a range or an array, and then returns an item corresponding to the first match it finds.",
      zh: "XLOOKUP 在区域或数组中查找，并返回第一个匹配项对应的值。",
    },
    example: {
      en: "Suppose you have a product ID in B2 and a price table. XLOOKUP returns the matching price, with a friendly message if it is not found.",
      zh: "假设 B2 是产品 ID，价格表为查找区域，XLOOKUP 返回匹配价格，找不到时返回友好提示。",
    },
    useCase: {
      en: "Sales and inventory teams use XLOOKUP to join product data, pull prices, and replace VLOOKUP with a more robust lookup.",
      zh: "销售和库存团队用 XLOOKUP 关联产品数据、取价格，并替代更脆弱的 VLOOKUP。",
    },
    errors: [
      { en: "lookup_array and return_array must have the same number of rows.", zh: "查找区域与返回区域行数必须一致。" },
      { en: "The optional if_not_found argument avoids #N/A errors.", zh: "使用可选 if_not_found 参数可避免 #N/A 错误。" },
      { en: "Lookup values must match exactly unless you enable match mode.", zh: "除非启用匹配模式，否则查找值需完全匹配。" },
    ],
  },
  "countifs-excel": {
    slug: "countifs-excel",
    title: { en: "COUNTIFS Formula Guide", zh: "COUNTIFS 公式教程" },
    syntax: "=COUNTIFS(criteria_range1, criteria1, ...)",
    summary: {
      en: "Applies criteria to cells across multiple ranges and counts the number of times all criteria are met.",
      zh: "对多个区域应用条件，并统计同时满足所有条件的次数。",
    },
    example: {
      en: "Suppose you want the number of orders where status is Completed and the order date is in 2026. COUNTIFS returns that count in one cell.",
      zh: "假设要统计状态为 Completed 且订单日期在 2026 年的订单数量，COUNTIFS 可在一个单元格返回结果。",
    },
    useCase: {
      en: "Operations and support teams use COUNTIFS to track SLAs, completed tasks, and rows that match several filters at once.",
      zh: "运营和客服团队用 COUNTIFS 追踪 SLA、已完成任务以及同时匹配多个筛选条件的行。",
    },
    errors: [
      { en: "Every criteria_range must have the same number of rows and columns.", zh: "所有条件区域行列数必须一致。" },
      { en: "Criteria are case-insensitive but must match the stored text.", zh: "条件不区分大小写，但需与存储文本匹配。" },
      { en: "Use wildcards * and ? for partial matches.", zh: "使用通配符 * 和 ? 进行部分匹配。" },
    ],
  },
  "iferror-excel": {
    slug: "iferror-excel",
    title: { en: "IFERROR Formula Guide", zh: "IFERROR 公式教程" },
    syntax: "=IFERROR(value, value_if_error)",
    summary: {
      en: "Returns a value you specify if a formula evaluates to an error; otherwise, returns the result of the formula.",
      zh: "如果公式计算结果为错误，则返回你指定的值；否则返回公式结果。",
    },
    example: {
      en: "Suppose a division by zero or a missing lookup triggers #DIV/0! or #N/A. IFERROR replaces those errors with 0 or a custom message.",
      zh: "假设除零或查找缺失触发 #DIV/0! 或 #N/A，IFERROR 可用 0 或自定义提示替代。",
    },
    useCase: {
      en: "Reporting dashboards use IFERROR to keep totals clean and prevent broken-looking cells when source data is incomplete.",
      zh: "报表仪表盘用 IFERROR 保持合计整洁，避免源数据不完整时出现异常单元格。",
    },
    errors: [
      { en: "IFERROR catches all errors, including ones you may want to inspect.", zh: "IFERROR 会捕获所有错误，包括你可能想检查的错误。" },
      { en: "If you need only #N/A, use IFNA instead.", zh: "如果只需处理 #N/A，请改用 IFNA。" },
      { en: "The fallback value is returned exactly as written.", zh: "备用值会原样返回。" },
    ],
  },
  "index-match-excel": {
    slug: "index-match-excel",
    title: { en: "INDEX MATCH Guide", zh: "INDEX MATCH 教程" },
    syntax: "=INDEX(array, MATCH(lookup_value, lookup_array, 0))",
    summary: {
      en: "Combines INDEX and MATCH to create a powerful two-way lookup system.",
      zh: "组合 INDEX 和 MATCH，构建强大的双向查找系统。",
    },
    example: {
      en: "Suppose you need a price by product ID where the lookup column is not the first column. INDEX/MATCH finds the row and returns the right column.",
      zh: "假设要按产品 ID 取价格，但查找列不在第一列。INDEX/MATCH 定位行并返回正确列。",
    },
    useCase: {
      en: "Analysts use INDEX/MATCH when they need to look left, insert columns safely, or build two-way matrix lookups that VLOOKUP cannot handle.",
      zh: "当需要向左查找、安全插入列或构建 VLOOKUP 无法处理的双向矩阵查找时，分析师使用 INDEX/MATCH。",
    },
    errors: [
      { en: "MATCH with 0 requires an exact match.", zh: "MATCH 的 0 表示精确匹配。" },
      { en: "The array and lookup_array must be oriented the same way.", zh: "数组与查找数组方向必须一致。" },
      { en: "For two-way lookups, use MATCH for both the row and the column.", zh: "双向查找需分别用 MATCH 匹配行和列。" },
    ],
  },
  "textjoin-excel": {
    slug: "textjoin-excel",
    title: { en: "TEXTJOIN Formula Guide", zh: "TEXTJOIN 公式教程" },
    syntax: "=TEXTJOIN(delimiter, ignore_empty, text1, ...)",
    summary: {
      en: "Combines text from multiple ranges and/or strings, and includes a delimiter you specify.",
      zh: "合并多个区域或字符串的文本，并加入你指定的分隔符。",
    },
    example: {
      en: "Suppose you have first names in A and last names in B. TEXTJOIN with a space joins them into full names, ignoring blanks.",
      zh: "假设 A 列是名，B 列是姓，TEXTJOIN 用空格连接成完整姓名并忽略空白。",
    },
    useCase: {
      en: "HR and marketing teams use TEXTJOIN to build mailing labels, tag lists, and readable summaries from scattered cells.",
      zh: "HR 和营销团队用 TEXTJOIN 从分散单元格生成邮件标签、标签列表和易读摘要。",
    },
    errors: [
      { en: "TEXTJOIN is only available in Excel 2019 and later.", zh: "TEXTJOIN 仅适用于 Excel 2019 及以后版本。" },
      { en: "ignore_empty should usually be TRUE to avoid double delimiters.", zh: "ignore_empty 通常设为 TRUE 以避免多余分隔符。" },
      { en: "Excel 365 supports range references; older versions need individual arguments.", zh: "Excel 365 支持区域引用，旧版本需逐个参数传入。" },
    ],
  },
  "filter-excel": {
    slug: "filter-excel",
    title: { en: "FILTER Formula Guide", zh: "FILTER 公式教程" },
    syntax: "=FILTER(array, include, [if_empty])",
    summary: {
      en: "Filters a range or array based on criteria you define.",
      zh: "按你定义的条件筛选区域或数组。",
    },
    example: {
      en: "Suppose you want only rows where Amount is greater than 1000. FILTER returns those rows as a dynamic array that spills.",
      zh: "假设只要金额大于 1000 的行，FILTER 以动态数组方式返回这些行。",
    },
    useCase: {
      en: "Analysts use FILTER to build live dashboards that update automatically as source data changes, without pivot tables.",
      zh: "分析师用 FILTER 构建随源数据自动更新的实时仪表盘，无需数据透视表。",
    },
    errors: [
      { en: "FILTER is only in Excel 365 / 2021.", zh: "FILTER 仅适用于 Excel 365 / 2021。" },
      { en: "The include array must be the same height as the source.", zh: "include 数组高度必须与源数据一致。" },
      { en: "Use the if_empty argument to avoid #CALC! when nothing matches.", zh: "无匹配时用 if_empty 参数避免 #CALC!。" },
    ],
  },
  "unique-excel": {
    slug: "unique-excel",
    title: { en: "UNIQUE Formula Guide", zh: "UNIQUE 公式教程" },
    syntax: "=UNIQUE(array)",
    summary: {
      en: "Returns a list of unique values from a list or range.",
      zh: "从列表或区域返回不重复值列表。",
    },
    example: {
      en: "Suppose you have a list of departments with repeats. UNIQUE returns each department once, spilling down automatically.",
      zh: "假设部门列表有重复，UNIQUE 自动向下填充每个部门一次。",
    },
    useCase: {
      en: "Data teams use UNIQUE to build dropdown source lists and de-duplicate IDs before reporting.",
      zh: "数据团队用 UNIQUE 构建下拉列表源，并在报表前去重 ID。",
    },
    errors: [
      { en: "UNIQUE is only in Excel 365 / 2021.", zh: "UNIQUE 仅适用于 Excel 365 / 2021。" },
      { en: "For rows, use the by_col argument.", zh: "按行提取需使用 by_col 参数。" },
      { en: "Combine with SORT to order the results.", zh: "配合 SORT 可对结果排序。" },
    ],
  },
  "concatenate-excel": {
    slug: "concatenate-excel",
    title: { en: "CONCATENATE Formula Guide", zh: "CONCATENATE 公式教程" },
    syntax: "=CONCATENATE(text1, [text2], ...)",
    summary: {
      en: "Joins two or more text strings into one string.",
      zh: "将两个或多个文本字符串连接成一个字符串。",
    },
    example: {
      en: "Suppose you have first and last name cells. CONCATENATE joins them with a space into a full name.",
      zh: "假设有名和姓单元格，CONCATENATE 用空格连接成完整姓名。",
    },
    useCase: {
      en: "Administrative teams use CONCATENATE to build labels, IDs, and human-readable keys from separate fields.",
      zh: "行政团队用 CONCATENATE 从多个字段生成标签、ID 和易读键值。",
    },
    errors: [
      { en: "Use & or TEXTJOIN instead for cleaner joins.", zh: "更推荐用 & 或 TEXTJOIN 连接。" },
      { en: "Numbers are joined as text; format them first if needed.", zh: "数字会按文本连接，必要时先格式化。" },
      { en: "Empty cells produce empty text, not spaces.", zh: "空单元格产生空文本而非空格。" },
    ],
  },
  "vlookup-excel": {
    slug: "vlookup-excel",
    title: { en: "VLOOKUP Formula Guide", zh: "VLOOKUP 公式教程" },
    syntax: "=VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])",
    summary: {
      en: "Looks for a value in the leftmost column of a table and returns a value in the same row from a specified column.",
      zh: "在表的最左列查找值，并返回同一行指定列的值。",
    },
    example: {
      en: "Suppose you have a product table with ID in the first column and Price in the third. VLOOKUP returns the price for a given ID.",
      zh: "假设产品表第一列是 ID，第三列是价格，VLOOKUP 按给定 ID 返回价格。",
    },
    useCase: {
      en: "Finance and sales teams use VLOOKUP to pull customer details, prices, and status codes into a report.",
      zh: "财务和销售团队用 VLOOKUP 把客户信息、价格和状态码带入报表。",
    },
    errors: [
      { en: "The lookup column must be the first column of table_array.", zh: "查找列必须是 table_array 的第一列。" },
      { en: "col_index_num must be 1 or greater and within the table width.", zh: "col_index_num 必须大于等于 1 且不超过表宽。" },
      { en: "Use FALSE for exact matches to avoid unexpected results.", zh: "精确匹配请使用 FALSE，避免意外结果。" },
    ],
  },
};
