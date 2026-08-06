import type { ToolLandingProps } from "@/components/ToolLanding";

export const aiPredictLanding: ToolLandingProps = {
  path: "/ai-predict",
  h1: "AI Predict — Ask Questions About Your Financial Documents",
  tagline: "AI financial analyst",
  intro:
    "Upload a P&L, balance sheet, bank statement, or CSV export and ask plain-English questions about it. AI Predict reads the document, extracts the numbers, and answers with ratios, trends, risk flags, and charts — no spreadsheet formulas required.",
  ctaLabel: "Start analyzing free",
  features: [
    {
      title: "Document-grounded answers",
      body: "Answers are generated from the documents you upload, not from generic training data. Every figure traces back to a line in your file.",
    },
    {
      title: "Ratios and risk in one pass",
      body: "Profitability, liquidity, solvency, and cash-flow ratios are calculated automatically, along with fraud and anomaly indicators.",
    },
    {
      title: "Charts you can export",
      body: "Ask for a breakdown and get an interactive chart back — exportable to PNG, SVG, CSV, or JSON for your own deck.",
    },
  ],
  steps: [
    "Create a free account — no credit card, no sales call.",
    "Upload a financial document (PDF, CSV, XLSX). Files are private to your account and protected by row-level security.",
    "Ask a question in plain English, or pick one of the suggested prompts like \"Analyze my cash flow\" or \"Check for fraud indicators\".",
    "Read the answer, drill into the charts, and export a report for your board, lender, or accountant.",
  ],
  sampleTitle: "Sample AI Predict output",
  sampleRows: [
    { label: "Gross margin", value: "62.4%", note: "Healthy for SaaS; above the 55% median for early-stage software." },
    { label: "Net margin", value: "-8.1%", note: "Still loss-making, driven by sales and marketing spend." },
    { label: "Current ratio", value: "1.9", note: "Comfortable short-term liquidity; above the 1.5 warning line." },
    { label: "Debt-to-equity", value: "0.41", note: "Conservative leverage — room to raise debt if needed." },
    { label: "Cash runway", value: "14 months", note: "Above the 12-month threshold most investors expect before a raise." },
    { label: "Fraud risk score", value: "Low (12/100)", note: "No duplicate entries, round-number clustering, or period-end spikes detected." },
  ],
  sections: [
    {
      heading: "Who AI Predict is for",
      body: "Solo founders and bootstrappers who don't have a CFO, finance teams that want a fast second read on a statement, and analysts who need to summarise a stack of documents before a meeting. If you can describe what you want to know, you can use it — there is no query language to learn.",
    },
    {
      heading: "What makes it different from pasting numbers into a chatbot",
      body: "A general chatbot forgets your documents between sessions and cannot calculate reliably across a large file. AI Predict stores your documents, chunks and indexes them for retrieval, and grounds each answer in the specific passages it retrieved. Conversations persist, so follow-up questions keep the same context.",
    },
    {
      heading: "How your data is handled",
      body: "Documents are stored per-account with database-level row security, so no other user can query them. You can delete a document at any time, which removes its indexed content too. See the privacy policy for retention details and the full list of subprocessors.",
    },
  ],
  faqs: [
    { q: "Is AI Predict free to use?", a: "Yes. The free plan includes a limited number of analyses per day, which is enough to evaluate the tool on a real document. Paid plans raise the daily and monthly limits." },
    { q: "What file formats are supported?", a: "PDF, CSV, XLSX, and plain text. Scanned image-only PDFs work best when the text layer is present." },
    { q: "How accurate are the answers?", a: "Ratios and arithmetic are computed from extracted figures, so they are as accurate as the source document. Interpretive commentary is AI-generated and should be reviewed before you act on it — it is not financial advice." },
    { q: "Can I use it for client work?", a: "Yes, many users run client statements through it. You remain responsible for reviewing the output, and you should confirm your own client confidentiality obligations first." },
    { q: "Does it replace an accountant?", a: "No. It replaces the first two hours of manual spreadsheet work before you talk to an accountant, so the conversation starts from analysis rather than data entry." },
  ],
  related: [
    { to: "/fin-predict", label: "Fin Predict statement analysis" },
    { to: "/calculators", label: "Free financial calculators" },
    { to: "/glossary", label: "Finance glossary" },
    { to: "/faq", label: "All FAQs" },
  ],
};

export const finPredictLanding: ToolLandingProps = {
  path: "/fin-predict",
  h1: "Fin Predict — Financial Statement Analysis and Forecasting",
  tagline: "Statement scorecard and forecasting",
  intro:
    "Turn a financial statement into a scored health check: ratio scorecard, peer benchmark comparison, multi-year trend charts, what-if scenario modeling, and an exportable PDF report — generated in about thirty seconds.",
  ctaLabel: "Run a free analysis",
  features: [
    {
      title: "Scored ratio scorecard",
      body: "Profitability, liquidity, solvency, and efficiency are each scored and explained, so you can see at a glance where the business is weak.",
    },
    {
      title: "Benchmark comparison",
      body: "See how each ratio compares against typical ranges for the business type instead of judging a number in isolation.",
    },
    {
      title: "What-if scenario sliders",
      body: "Adjust revenue growth, margin, or cost assumptions and watch the forecast and runway recalculate live.",
    },
  ],
  steps: [
    "Sign in and open Fin Predict.",
    "Upload your income statement, balance sheet, or a combined financial report.",
    "Review the scorecard, benchmark chart, and multi-year trend analysis.",
    "Drag the what-if sliders to test scenarios, then export the whole thing as a PDF report.",
  ],
  sampleTitle: "Sample Fin Predict scorecard",
  sampleRows: [
    { label: "Overall health score", value: "71 / 100", note: "Solid but not investable-grade; margin is the limiting factor." },
    { label: "Profitability", value: "58 / 100", note: "Gross margin is strong, but operating expenses outpace revenue growth." },
    { label: "Liquidity", value: "82 / 100", note: "Current and quick ratios both comfortably above benchmark." },
    { label: "Solvency", value: "77 / 100", note: "Low leverage with adequate interest coverage." },
    { label: "Revenue trend (3 yr)", value: "+34% CAGR", note: "Consistent growth with no single-year distortion." },
    { label: "Break-even point", value: "Q3 next year", note: "Reached 2 quarters earlier if opex growth is held to 10%." },
  ],
  sections: [
    {
      heading: "Why a scorecard beats a pile of ratios",
      body: "A list of twenty ratios tells you nothing unless you know which ranges are normal. Fin Predict groups ratios into four categories, scores each against typical ranges, and writes a one-line interpretation, so the output reads like an analyst's note rather than a spreadsheet dump.",
    },
    {
      heading: "Forecasting and scenario modeling",
      body: "Fin Predict projects revenue, cost, and cash position forward using the trend in your own historical figures, then lets you override the key assumptions. That makes it useful for runway planning, hiring decisions, and pressure-testing a plan before you present it.",
    },
    {
      heading: "Reports you can send",
      body: "Every analysis can be exported as a formatted PDF with the scorecard, benchmark chart, trend charts, and commentary — suitable for a board update, a lender pack, or an investor data room.",
    },
  ],
  faqs: [
    { q: "How is Fin Predict different from AI Predict?", a: "AI Predict is a conversational analyst you ask questions. Fin Predict is a structured one-click report: upload a statement, get a fixed scorecard, benchmarks, trends, and forecasts." },
    { q: "How many years of data do I need?", a: "One period works for the scorecard. Trend analysis and forecasting get meaningfully better with two or three years of comparable figures." },
    { q: "Can I export the results?", a: "Yes — PDF report export is built in, and individual charts export to PNG, SVG, CSV, or JSON." },
    { q: "Does it work for non-US accounting standards?", a: "Yes. The ratio calculations are standard-agnostic as long as the statement labels the usual line items. Currency is read from the document." },
    { q: "Is my financial data used to train AI models?", a: "No. Your documents are used only to answer your own queries and are isolated to your account at the database level." },
  ],
  related: [
    { to: "/ai-predict", label: "AI Predict document Q&A" },
    { to: "/calculators/burn-rate-runway-calculator", label: "Burn rate & runway calculator" },
    { to: "/calculators/financial-ratio-calculator", label: "Financial ratio calculator" },
    { to: "/pricing", label: "Pricing" },
  ],
};
