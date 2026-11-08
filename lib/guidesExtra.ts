import type { GuideDetailEntry } from "./guides";

export const EXTRA_GUIDE_DETAILS: Record<string, GuideDetailEntry> = {
  "sumifs-between-two-dates": {
    slug: "sumifs-between-two-dates",
    title: { en: "SUMIFS Between Two Dates", zh: "两个日期之间的 SUMIFS" },
    syntax:
      '=SUMIFS(sum_range, date_range, ">="&DATE(start_y, start_m, start_d), date_range, "<="&DATE(end_y, end_m, end_d))',
    summary: {
      en: "SUMIFS totals a range only when a date column falls between two real dates.",
      zh: "SUMIFS 仅对日期列位于两个真实日期之间的范围求和。",
    },
    example: {
      en: "Sum Amount only when Date is between 2026-03-01 and 2026-03-31.",
      zh: "仅当日期在 2026-03-01 到 2026-03-31 之间时，对金额求和。",
    },
    useCase: {
      en: "Monthly sales reporting and period closes are the most common use cases.",
      zh: "月度销售报表和期间结算是最常见的用途。",
    },
    errors: [
      { en: "Date values must be real dates, not text.", zh: "日期必须是真实日期，不能是文本。" },
      { en: 'Never use quoted ISO date strings like ">=2026-03-01".', zh: '不要使用带引号的 ISO 日期字符串，例如 ">=2026-03-01"。' },
    ],
    toolTask: "sumDateRange",
  },
  "sumif-with-one-condition": {
    slug: "sumif-with-one-condition",
    title: { en: "SUMIF with One Condition", zh: "单条件 SUMIF" },
    syntax: "=SUMIF(range, criteria, [sum_range])",
    summary: {
      en: "SUMIF adds cells that match a single text, number, or cell reference.",
      zh: "SUMIF 对匹配单个文本、数字或单元格引用的单元格求和。",
    },
    example: {
      en: "Total Amount where Department equals Sales.",
      zh: "部门等于 Sales 时的金额合计。",
    },
    useCase: {
      en: "Budget owners use it to total one category from a long transaction list.",
      zh: "预算负责人用它从长交易列表中汇总某个类别。",
    },
    errors: [
      { en: "Criteria text must be quoted.", zh: "条件文本必须加引号。" },
      { en: "Ranges must align row by row.", zh: "区域必须逐行对齐。" },
    ],
    toolTask: "sumCondition",
  },
  "countifs-date-range": {
    slug: "countifs-date-range",
    title: { en: "COUNTIFS Date Range", zh: "COUNTIFS 日期区间" },
    syntax:
      '=COUNTIFS(date_range, ">="&DATE(start_y, start_m, start_d), date_range, "<="&DATE(end_y, end_m, end_d))',
    summary: {
      en: "Count rows where a date column is inside a date range.",
      zh: "统计日期列位于日期区间内的行数。",
    },
    example: {
      en: "Count orders placed in January 2026.",
      zh: "统计 2026 年 1 月下单的订单数。",
    },
    useCase: {
      en: "Operations teams count SLA completions within a month.",
      zh: "运营团队统计一个月内完成的 SLA。",
    },
    errors: [
      { en: "The range should contain dates, not text.", zh: "区域应包含日期，而不是文本。" },
      { en: "Use DATE() to avoid regional date issues.", zh: "使用 DATE() 避免区域日期问题。" },
    ],
    toolTask: "countDateRange",
  },
  "countif-not-blank": {
    slug: "countif-not-blank",
    title: { en: "COUNTIF Not Blank", zh: "COUNTIF 非空" },
    syntax: '=COUNTIF(range, "<>")',
    summary: {
      en: 'COUNTIF with <> counts cells that contain any value.',
      zh: 'COUNTIF 使用 <> 统计有内容的单元格。',
    },
    example: {
      en: "Count how many customer cells are filled in.",
      zh: "统计已填写的客户单元格数量。",
    },
    useCase: {
      en: "Data cleanup teams check completeness before importing a file.",
      zh: "数据清理团队在导入前检查完整性。",
    },
    errors: [
      { en: "Empty strings produced by formulas are counted.", zh: "公式产生的空字符串会计入。" },
      { en: "Use COUNTA for a simpler count.", zh: "更简单可用 COUNTA。" },
    ],
    toolTask: "countCondition",
  },
  "if-greater-than": {
    slug: "if-greater-than",
    title: { en: "IF Greater Than", zh: "IF 大于" },
    syntax: "=IF(value_cell > threshold, value_if_true, value_if_false)",
    summary: {
      en: "IF returns a result when a number passes a comparison.",
      zh: "数字通过比较时，IF 返回一个结果。",
    },
    example: {
      en: "Flag amounts above 1000 as Yes, otherwise No.",
      zh: "金额大于 1000 标记为 Yes，否则为 No。",
    },
    useCase: {
      en: "Reviewers create approval flags and exception alerts.",
      zh: "审核人员创建审批标记和异常提醒。",
    },
    errors: [
      { en: "Text comparisons are case-insensitive.", zh: "文本比较不区分大小写。" },
      { en: "Numbers stored as text may not compare correctly.", zh: "文本形式存储的数字可能无法正确比较。" },
    ],
    toolTask: "conditional",
  },
  "if-cell-contains-text": {
    slug: "if-cell-contains-text",
    title: { en: "IF Cell Contains Text", zh: "IF 判断单元格是否包含文本" },
    syntax: '=IF(ISNUMBER(SEARCH("word", cell)), yes, no)',
    summary: {
      en: "SEARCH finds text case-insensitively and ISNUMBER turns it into a logical test.",
      zh: "SEARCH 不区分大小写查找文本，ISNUMBER 将其转换为逻辑判断。",
    },
    example: {
      en: "Return Yes when a status cell contains urgent.",
      zh: "状态单元格包含 urgent 时返回 Yes。",
    },
    useCase: {
      en: "Support teams classify tickets and invoices by keyword.",
      zh: "客服团队按关键词分类工单和发票。",
    },
    errors: [
      { en: "SEARCH is case-insensitive.", zh: "SEARCH 不区分大小写。" },
      { en: "FIND is case-sensitive.", zh: "FIND 区分大小写。" },
    ],
    toolTask: "textContains",
  },
  "vlookup-from-another-sheet": {
    slug: "vlookup-from-another-sheet",
    title: { en: "VLOOKUP from Another Sheet", zh: "跨表 VLOOKUP" },
    syntax: "=VLOOKUP(lookup, Products!A:C, 3, FALSE)",
    summary: {
      en: "Prefix the table range with the worksheet name to look up across sheets.",
      zh: "在表格区域前加工作表名，即可跨表查找。",
    },
    example: {
      en: "Pull the price from the Products sheet into a sales report.",
      zh: "从 Products 工作表把价格取到销售报表。",
    },
    useCase: {
      en: "Analysts combine master data with transaction data without manual copying.",
      zh: "分析师无需手动复制即可合并主数据和交易数据。",
    },
    errors: [
      { en: "Sheet names with spaces need single quotes.", zh: "包含空格的工作表名需要单引号。" },
      { en: "The lookup column must still be the first column.", zh: "查找列仍必须是第一列。" },
    ],
    toolTask: "lookup",
  },
  "xlookup-multiple-criteria": {
    slug: "xlookup-multiple-criteria",
    title: { en: "XLOOKUP Multiple Criteria", zh: "XLOOKUP 多条件" },
    syntax: '=XLOOKUP(criteria1&criteria2, lookup1&lookup2, return_range, "Not found")',
    summary: {
      en: "Join two lookup keys to create a precise composite match.",
      zh: "连接两个查找键，实现精确的组合匹配。",
    },
    example: {
      en: "Look up a price using both Product ID and Region.",
      zh: "同时用产品 ID 和区域查找价格。",
    },
    useCase: {
      en: "Inventory analysts match SKU plus warehouse to avoid duplicate IDs.",
      zh: "库存分析师按 SKU 加仓库匹配，避免重复 ID。",
    },
    errors: [
      { en: "Both lookup arrays must have the same size.", zh: "两个查找数组必须大小一致。" },
      { en: "Use a delimiter when keys may collide.", zh: "键可能冲突时应使用分隔符。" },
    ],
    toolTask: "lookup",
  },
  "index-match-two-way": {
    slug: "index-match-two-way",
    title: { en: "INDEX MATCH Two-Way Lookup", zh: "INDEX MATCH 双向查找" },
    syntax: "=INDEX(table, MATCH(row_key, row_keys, 0), MATCH(col_key, col_keys, 0))",
    summary: {
      en: "Two MATCH functions locate both a row and a column inside a matrix.",
      zh: "两个 MATCH 在矩阵中分别定位行和列。",
    },
    example: {
      en: "Return a value for a specific region and month.",
      zh: "返回指定区域和月份对应的值。",
    },
    useCase: {
      en: "FP&A teams build matrix reports that survive inserted rows and columns.",
      zh: "FP&A 团队用矩阵报表，插入行列后仍稳定。",
    },
    errors: [
      { en: "MATCH 0 requires an exact match.", zh: "MATCH 0 需要精确匹配。" },
      { en: "Index row and column numbers must stay in range.", zh: "行列号不能超出范围。" },
    ],
    toolTask: "lookup",
  },
  "textjoin-with-comma": {
    slug: "textjoin-with-comma",
    title: { en: "TEXTJOIN with Comma", zh: "逗号分隔 TEXTJOIN" },
    syntax: '=TEXTJOIN(", ", TRUE, A2:C2)',
    summary: {
      en: "TEXTJOIN joins a range of cells with a delimiter and ignores blanks.",
      zh: "TEXTJOIN 用分隔符连接单元格区域，并忽略空值。",
    },
    example: {
      en: "Build a comma-separated list of tags from a row.",
      zh: "从一行构建逗号分隔的标签列表。",
    },
    useCase: {
      en: "Marketing teams build category tags and readable summaries.",
      zh: "营销团队构建分类标签和易读摘要。",
    },
    errors: [
      { en: "TEXTJOIN requires Excel 2019 or later.", zh: "TEXTJOIN 需要 Excel 2019 或更高版本。" },
      { en: "Use TRUE to avoid empty delimiters.", zh: "使用 TRUE 避免空分隔符。" },
    ],
    toolTask: "combineText",
  },
  "concatenate-first-and-last-name": {
    slug: "concatenate-first-and-last-name",
    title: { en: "Concatenate First and Last Name", zh: "合并姓名" },
    syntax: '=TEXTJOIN(" ", TRUE, A2, B2)',
    summary: {
      en: "Join first and last name cells into a clean full name.",
      zh: "把名和姓单元格合并为干净的完整姓名。",
    },
    example: {
      en: "Convert Anna in A2 and Lee in B2 into Anna Lee.",
      zh: "将 A2 的 Anna 和 B2 的 Lee 合并为 Anna Lee。",
    },
    useCase: {
      en: "HR and CRM teams normalize names before exporting to another system.",
      zh: "HR 和 CRM 团队在导出前规范化姓名。",
    },
    errors: [
      { en: "Use TEXTJOIN to skip missing names.", zh: "用 TEXTJOIN 跳过缺失姓名。" },
      { en: "Older Excel can use A2&\" \"&B2.", zh: "旧版 Excel 可用 A2&\" \"&B2。" },
    ],
    toolTask: "combineText",
  },
  "calculate-days-between-dates": {
    slug: "calculate-days-between-dates",
    title: { en: "Calculate Days Between Dates", zh: "计算两个日期之间天数" },
    syntax: "=ABS(end_date - start_date)",
    summary: {
      en: "Subtract two real date values to count the days between them.",
      zh: "用两个真实日期相减，统计相差天数。",
    },
    example: {
      en: "Count the number of days between an order date and a delivery date.",
      zh: "统计订单日期到交付日期之间的天数。",
    },
    useCase: {
      en: "Logistics teams calculate delivery times and aging metrics.",
      zh: "物流团队计算交付时长和账龄指标。",
    },
    errors: [
      { en: "Both cells must contain real dates.", zh: "两个单元格都必须是真实日期。" },
      { en: "Format the result as a number, not a date.", zh: "结果格式应设为数字，而不是日期。" },
    ],
    toolTask: "dateDifference",
  },
  "calculate-percentage-change": {
    slug: "calculate-percentage-change",
    title: { en: "Calculate Percentage Change", zh: "计算百分比变化" },
    syntax: "=(new_value - old_value) / ABS(old_value)",
    summary: {
      en: "Measure growth from an old value to a new value and format as a percentage.",
      zh: "测量从旧值到新值的增长，并格式化为百分比。",
    },
    example: {
      en: "Compare revenue from last month to this month.",
      zh: "比较上个月和本月的收入。",
    },
    useCase: {
      en: "Finance teams build month-over-month and year-over-year variance reports.",
      zh: "财务团队构建环比和同比差异报告。",
    },
    errors: [
      { en: "The old value must not be zero.", zh: "旧值不能为 0。" },
      { en: "Format the cell as percentage to read the result correctly.", zh: "将单元格格式设为百分比才能正确读取结果。" },
    ],
    toolTask: "percentageChange",
  },
  "rank-numbers-descending": {
    slug: "rank-numbers-descending",
    title: { en: "Rank Numbers Descending", zh: "数字降序排名" },
    syntax: "=RANK(value, range, 0)",
    summary: {
      en: "RANK with order 0 gives the largest number rank 1.",
      zh: "RANK 参数 0 表示最大数字排名为 1。",
    },
    example: {
      en: "Rank monthly sales amounts from highest to lowest.",
      zh: "按月度销售额从高到低排名。",
    },
    useCase: {
      en: "Sales leaders rank territories and identify top performers.",
      zh: "销售负责人排名区域并识别优秀表现者。",
    },
    errors: [
      { en: "Duplicate values receive the same rank.", zh: "相同数值会得到相同排名。" },
      { en: "Use order 1 for ascending ranking.", zh: "升序排名使用参数 1。" },
    ],
    toolTask: "rank",
  },
  "find-latest-date": {
    slug: "find-latest-date",
    title: { en: "Find Latest Date", zh: "查找最晚日期" },
    syntax: "=MAX(date_range)",
    summary: {
      en: "MAX returns the most recent date in a date range.",
      zh: "MAX 返回日期区域中的最晚日期。",
    },
    example: {
      en: "Find the latest transaction date in a ledger.",
      zh: "查找账本中最新的交易日期。",
    },
    useCase: {
      en: "Auditors identify the last activity date before a cutoff.",
      zh: "审计人员在截止日期前识别最后活动日期。",
    },
    errors: [
      { en: "MAX ignores text dates.", zh: "MAX 会忽略文本日期。" },
      { en: "Format the result cell as a date.", zh: "结果单元格应使用日期格式。" },
    ],
    toolTask: "latestDate",
  },
  "count-unique-values": {
    slug: "count-unique-values",
    title: { en: "Count Unique Values", zh: "统计唯一值数量" },
    syntax: "=COUNTA(UNIQUE(source_range))",
    summary: {
      en: "UNIQUE removes duplicates and COUNTA counts the remaining values.",
      zh: "UNIQUE 去重，COUNTA 统计剩余值的数量。",
    },
    example: {
      en: "Count the number of distinct customer IDs in a list.",
      zh: "统计列表中不重复客户 ID 的数量。",
    },
    useCase: {
      en: "Analysts count unique customers, products, or SKUs before reporting.",
      zh: "分析师在报表前统计唯一客户、产品或 SKU。",
    },
    errors: [
      { en: "UNIQUE is unavailable in older Excel.", zh: "旧版 Excel 不支持 UNIQUE。" },
      { en: "For older Excel use SUMPRODUCT with COUNTIF.", zh: "旧版 Excel 可用 SUMPRODUCT 配合 COUNTIF。" },
    ],
    toolTask: "countUnique",
  },
  "extract-domain-from-email": {
    slug: "extract-domain-from-email",
    title: { en: "Extract Domain from Email", zh: "从邮箱提取域名" },
    syntax: "=MID(email, FIND(\"@\", email) + 1, LEN(email) - FIND(\"@\", email))",
    summary: {
      en: "FIND locates @ and MID returns everything after it.",
      zh: "FIND 定位 @，MID 返回其后的所有内容。",
    },
    example: {
      en: "Convert user@example.com into example.com.",
      zh: "将 user@example.com 转换为 example.com。",
    },
    useCase: {
      en: "Marketing teams group contacts by corporate domain.",
      zh: "营销团队按企业域名分组联系人。",
    },
    errors: [
      { en: "The cell must contain one @ sign.", zh: "单元格必须且只能有一个 @ 符号。" },
      { en: "Modern apps can use TEXTAFTER(email,\"@\").", zh: "新应用可用 TEXTAFTER(email,\"@\")。" },
    ],
    toolTask: "extractDomain",
  },
  "round-to-two-decimals": {
    slug: "round-to-two-decimals",
    title: { en: "Round to Two Decimals", zh: "四舍五入保留两位小数" },
    syntax: "=ROUND(number, 2)",
    summary: {
      en: "ROUND rounds a value to two decimal places using standard rounding.",
      zh: "ROUND 使用标准四舍五入将值保留两位小数。",
    },
    example: {
      en: "Round a unit price from 2.345 to 2.35.",
      zh: "将单价从 2.345 四舍五入为 2.35。",
    },
    useCase: {
      en: "Finance and pricing teams normalize currency values before export.",
      zh: "财务和定价团队在导出前规范化货币值。",
    },
    errors: [
      { en: "Use ROUNDUP or ROUNDDOWN when direction matters.", zh: "需要方向时可用 ROUNDUP 或 ROUNDDOWN。" },
      { en: "ROUND changes the value; formatting a cell does not.", zh: "ROUND 改变值，而单元格格式化不会。" },
    ],
    toolTask: "roundNumber",
  },
  "filter-multiple-criteria": {
    slug: "filter-multiple-criteria",
    title: { en: "FILTER Multiple Criteria", zh: "FILTER 多条件" },
    syntax: '=FILTER(source, (criteria1="A")*(criteria2="B"), "No matches")',
    summary: {
      en: "Multiply Boolean arrays in FILTER to apply multiple criteria.",
      zh: "在 FILTER 中相乘布尔数组即可应用多个条件。",
    },
    example: {
      en: "Return rows where Department is Sales and Status is Completed.",
      zh: "返回部门为 Sales 且状态为 Completed 的行。",
    },
    useCase: {
      en: "Analysts build live exception reports without pivot tables.",
      zh: "分析师无需透视表即可构建实时异常报告。",
    },
    errors: [
      { en: "Use + for OR criteria and * for AND criteria.", zh: "OR 条件用 +，AND 条件用 *。" },
      { en: "Include arrays must match the source height.", zh: "条件数组高度必须与来源一致。" },
    ],
    toolTask: "filterRows",
  },
  "if-blank-excel": {
    slug: "if-blank-excel",
    title: { en: "IF Blank Excel Formula", zh: "Excel 判断空单元格" },
    syntax: '=IF(cell="", value_if_blank, value_if_not_blank)',
    summary: {
      en: "Return one result when a cell is empty and another when it has data.",
      zh: "单元格为空时返回一个结果，有数据时返回另一个。",
    },
    example: {
      en: "Show Missing when a customer name is blank, otherwise Complete.",
      zh: "客户姓名为空时显示 Missing，否则显示 Complete。",
    },
    useCase: {
      en: "Reporting teams flag incomplete records before submission.",
      zh: "报表团队在提交前标记不完整记录。",
    },
    errors: [
      { en: "A formula returning \"\" is treated as blank.", zh: "返回空文本的公式会被视为空。" },
      { en: "Use OR(cell=\"\",cell=0) to treat zero as blank too.", zh: "如需把 0 也视为空，可使用 OR(cell=\"\",cell=0)。" },
    ],
    toolTask: "ifBlank",
  },
};
