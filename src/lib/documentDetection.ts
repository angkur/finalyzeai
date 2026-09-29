export type DocumentKind =
  | "profit_loss"
  | "balance_sheet"
  | "cash_flow"
  | "bank_statement"
  | "invoice"
  | "payroll"
  | "tax_return"
  | "cap_table"
  | "fundraising_deck"
  | "budget_forecast"
  | "loan_agreement"
  | "contract_legal"
  | "market_data"
  | "metrics_report"
  | "research_report"
  | "other";

export type DetectionResult = {
  documentId: string;
  kind: DocumentKind;
  confidence: number;
  analysis: string;
  isFinancial: number | null;
  usability: number | null;
  alternatives?: { id: string; probability: number }[];
};

export const KIND_LABELS: Record<DocumentKind, string> = {
  profit_loss: "Profit & Loss statement",
  balance_sheet: "Balance sheet",
  cash_flow: "Cash flow statement",
  bank_statement: "Bank statement",
  invoice: "Invoice",
  payroll: "Payroll records",
  tax_return: "Tax return",
  cap_table: "Cap table",
  fundraising_deck: "Investor pitch or update",
  budget_forecast: "Budget or forecast",
  loan_agreement: "Loan or credit agreement",
  contract_legal: "Contract or legal document",
  market_data: "Market data",
  metrics_report: "Operating metrics report",
  research_report: "Research report",
  other: "Unrecognised document",
};

export const KIND_PLANS: Record<DocumentKind, string> = {
  profit_loss:
    "Reads margins, cost structure and profitability, and compares them with company benchmarks.",
  balance_sheet:
    "Checks liquidity, leverage and whether the balance sheet can support more debt.",
  cash_flow:
    "Works out real burn, free cash flow and how many months of runway are left.",
  bank_statement:
    "Reconstructs income and spending, and flags irregular or unusual movements.",
  invoice:
    "Summarises what is owed, by when, and whether the terms are normal for the industry.",
  payroll:
    "Breaks down salary cost per person and how payroll compares with total spending.",
  tax_return: "Pulls out the taxable position and checks it against the stated figures.",
  cap_table:
    "Maps ownership, dilution risk and what each round does to the founder's stake.",
  fundraising_deck:
    "Stress-tests the numbers an investor would question first, and scores the story.",
  budget_forecast:
    "Compares the plan against the actual trend and shows where the forecast breaks.",
  loan_agreement:
    "Extracts the real cost of the facility and tests whether the business can service it.",
  contract_legal:
    "Finds the financial obligations, penalties and dates that affect cash.",
  market_data:
    "Charts the series and highlights concentration, drift and volatility.",
  metrics_report:
    "Judges whether growth, retention and efficiency line up with a healthy company.",
  research_report:
    "Checks the claims against the underlying figures and summarises the real conclusion.",
  other: "Pick an analysis mode and the tool will work from the document text.",
};

export const MIN_CONFIDENCE_TO_RECOMMEND = 0.35;

export const PROMPT_TEMPLATES: Record<DocumentKind, string> = {
  profit_loss:
    "Analyse this profit and loss statement. Give me gross and operating margins, the biggest cost lines, and what is driving profit or loss.",
  balance_sheet:
    "Analyse this balance sheet. Give me liquidity ratios, leverage, working capital, and the two biggest risks.",
  cash_flow:
    "Analyse this cash flow statement. Work out monthly burn, free cash flow, and how many months of runway are left.",
  bank_statement:
    "Analyse this bank statement. Summarise income and spending by category and flag anything irregular or unusual.",
  invoice:
    "Review this invoice. Tell me what is owed, by when, and whether the terms and amounts look normal.",
  payroll:
    "Analyse this payroll data. Give me total monthly salary cost, cost per person, and how it compares with overall spending.",
  tax_return:
    "Review this tax return. Summarise the taxable position and check it against the figures shown.",
  cap_table:
    "Analyse this cap table. Show current ownership, likely dilution, and what the next round does to the founder stake.",
  fundraising_deck:
    "Review this investor material. List the numbers an investor would challenge first and score how solid the case looks.",
  budget_forecast:
    "Compare this budget or forecast with the actual trend. Show where the plan is realistic and where it breaks.",
  loan_agreement:
    "Review this financing agreement. Give me the true cost of the facility and whether the business can service it.",
  contract_legal:
    "Review this document for financial obligations, penalties and dates that affect cash.",
  market_data:
    "Analyse this market data. Chart the series and highlight concentration, drift and volatility.",
  metrics_report:
    "Analyse these operating metrics. Tell me whether growth, retention and efficiency look healthy for the stage.",
  research_report:
    "Review this research. Check the claims against the figures and summarise the real conclusion.",
  other: "Analyse this document and tell me the most important thing it reveals.",
};

export function kindLabel(kind: string | null | undefined): string {
  if (!kind) return "";
  return KIND_LABELS[kind as DocumentKind] ?? KIND_LABELS.other;
}

export function kindPlan(kind: string | null | undefined): string {
  if (!kind) return "";
  return KIND_PLANS[kind as DocumentKind] ?? KIND_PLANS.other;
}

export function promptFor(kind: string | null | undefined): string {
  if (!kind) return PROMPT_TEMPLATES.other;
  return PROMPT_TEMPLATES[kind as DocumentKind] ?? PROMPT_TEMPLATES.other;
}

export function formatConfidence(confidence: number | null | undefined): string {
  if (typeof confidence !== "number") return "";
  return `${Math.round(confidence * 100)}%`;
}

export function shouldRecommend(result: DetectionResult): boolean {
  if (result.kind === "other") return false;
  return result.confidence >= MIN_CONFIDENCE_TO_RECOMMEND;
}

/**
 * Trims extracted document text down to a size the decision model can judge
 * quickly. The head carries the title and table labels, the tail carries
 * totals, so both ends are kept.
 */
export function buildDetectionExcerpt(content: string, budget = 9000): string {
  const clean = content.replace(/\s+/g, " ").trim();
  if (clean.length <= budget) return clean;
  const head = clean.slice(0, Math.floor(budget * 0.7));
  const tail = clean.slice(Math.max(0, clean.length - Math.floor(budget * 0.25)));
  return `${head} ... ${tail}`;
}
