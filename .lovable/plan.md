

## Plan: Add Financial Statement Analysis Feature & Reply to Client

This plan addresses two things: (1) adding a "Financial Statement Analysis" feature that extracts ratios from PDF financial statements, and (2) how to reply to the potential client.

---

### How to Reply to Eric Pach

Send him a professional email like this:

> **Subject:** FinalyzeAI — Financial Statement Analysis Tool for Insurance Programs
>
> Hi Eric,
>
> Thank you for reaching out! Your use case aligns well with what FinalyzeAI offers.
>
> We have a financial analysis platform that can:
> - **Accept PDF financial statements** in various formats
> - **Extract key financial data** (revenue, assets, liabilities, cash flow, etc.)
> - **Automatically calculate financial ratios** — profitability (ROI, net margin, gross margin), solvency (debt-to-equity, interest coverage), and liquidity/cash flow ratios
> - **Score and rate** each category with clear pass/fail indicators
> - **Generate a summary report** with an overall recommendation for program eligibility
>
> I'd love to give you a demo or set up a trial account. Would you be available for a quick call this week?
>
> Best regards,
> [Your Name]
> FinalyzeAI — https://finalyzeai.lovable.app

---

### Feature Implementation Plan

#### 1. Add "Financial Statement Analysis" system prompt to edge function

Update `supabase/functions/financial-analysis/index.ts` to add a new `financial-statement` analysis type with a specialized prompt that instructs the AI to:
- Extract balance sheet, income statement, and cash flow data from uploaded documents
- Calculate ratios: **Profitability** (gross margin, net margin, ROE, ROA), **Solvency** (debt-to-equity, interest coverage, debt ratio), **Cash Flow** (operating cash flow ratio, free cash flow margin)
- Score each ratio on a scale (Strong / Adequate / Weak / Critical)
- Provide an overall eligibility recommendation

#### 2. Add new analysis type to AIDemo (Fin Predict)

In `src/components/AIDemo.tsx`:
- Add `'financial-statement'` to the `AnalysisType` union
- Add a new tab entry with a `FileText` icon labeled "Statement Analysis"
- Add a sample prompt showing example financial statement data
- Display results with a structured scorecard component

#### 3. Create a Financial Scorecard component

New file `src/components/FinancialScorecard.tsx`:
- Parses the AI response to extract ratio categories and scores
- Displays a visual scorecard with color-coded ratings (green/yellow/orange/red)
- Shows three sections: Profitability, Solvency, Cash Flow
- Each ratio shows: name, calculated value, industry benchmark, and rating
- Overall score/recommendation at the top

#### 4. Add suggestion chip to AI Predict page

In `src/pages/AiPredict.tsx`:
- Add a "Statement Analysis" suggestion chip that prompts: "Analyze the uploaded financial statements. Extract key financial data, calculate profitability ratios (gross margin, net margin, ROE), solvency ratios (debt-to-equity, interest coverage), and cash flow ratios. Score each category and provide an eligibility recommendation."

#### 5. Update the Fin Predict page prompt guidance

Add contextual help text when "Statement Analysis" tab is selected, guiding users to upload a PDF financial statement first, then click analyze.

### Technical Details

- No database changes needed — uses existing document upload and AI analysis pipeline
- The AI prompt will handle ratio extraction and scoring via structured instructions
- The scorecard component will parse markdown tables from the AI response
- File upload already supports PDF via the existing document processing pipeline
- Edge function deployment needed after prompt update

