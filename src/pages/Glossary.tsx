import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import useAdSense from "@/hooks/useAdSense";

type Term = { term: string; def: string; related?: { label: string; to: string }[] };

const TERMS: Term[] = [
  { term: "Accounts Payable (AP)", def: "Money a business owes suppliers for goods or services received but not yet paid for. AP sits on the balance sheet as a current liability and directly affects short-term cash flow — stretching AP increases cash on hand but can strain supplier relationships." },
  { term: "Accounts Receivable (AR)", def: "Money customers owe the business for goods or services already delivered. High AR relative to revenue often signals slow collections and can mask a cash-flow problem behind a healthy income statement." },
  { term: "Accrual Accounting", def: "Recording revenue when earned and expenses when incurred, regardless of when cash actually moves. Required under GAAP and IFRS for most companies; contrasts with cash accounting where transactions are recorded only when money changes hands." },
  { term: "Amortization", def: "The gradual write-down of an intangible asset (patents, goodwill, capitalized software) over its useful life, or the scheduled paydown of a loan's principal. Similar in mechanics to depreciation but applies to intangibles or debt." },
  { term: "ARR (Annual Recurring Revenue)", def: "The annualized value of a subscription business's recurring contracts, excluding one-time fees. ARR = MRR × 12. The core valuation metric for SaaS companies." },
  { term: "Balance Sheet", def: "A financial statement showing what a business owns (assets), owes (liabilities), and the residual equity at a single point in time. Assets = Liabilities + Equity, always.", related: [{ label: "Statement analysis guide", to: "/blog" }] },
  { term: "Beta (β)", def: "A stock's sensitivity to overall market movement. Beta of 1.0 moves with the market; > 1 is more volatile; < 1 is less. Used in the CAPM formula to estimate cost of equity." },
  { term: "Book Value", def: "The accounting value of an asset (cost minus accumulated depreciation) or of the whole company (total assets minus total liabilities). Often diverges significantly from market value, especially for asset-light businesses." },
  { term: "Burn Rate", def: "How fast a startup consumes cash each month. Gross burn = total monthly cash outflows; net burn = outflows minus inflows. Combined with cash on hand, it gives runway.", related: [{ label: "Burn rate calculator", to: "/calculators" }] },
  { term: "CAC (Customer Acquisition Cost)", def: "Total sales and marketing spend divided by number of new customers acquired in the same period. Healthy SaaS businesses recover CAC in under 12 months and maintain LTV:CAC of 3:1 or better." },
  { term: "CAGR (Compound Annual Growth Rate)", def: "The smoothed annualized rate at which a value grew over multiple years. CAGR = (End / Start)^(1/years) − 1. Useful for comparing growth across periods of different lengths.", related: [{ label: "CAGR calculator", to: "/calculators" }] },
  { term: "Capital Expenditure (CapEx)", def: "Money spent to acquire, upgrade, or maintain long-term physical assets (buildings, equipment, servers). CapEx is capitalized on the balance sheet and depreciated over time, not expensed immediately." },
  { term: "Cash Conversion Cycle", def: "Days it takes to convert investments in inventory and other resources into cash from sales. CCC = DIO + DSO − DPO. Lower is better; negative means suppliers finance operations." },
  { term: "Cash Flow Statement", def: "One of the three core financial statements, splitting cash movements into Operating, Investing, and Financing activities. Reveals whether profits on the income statement are backed by real cash." },
  { term: "COGS (Cost of Goods Sold)", def: "Direct costs of producing the goods or services sold — raw materials, direct labor, manufacturing overhead. Revenue − COGS = Gross Profit." },
  { term: "Cost of Capital", def: "The blended required return a company must earn on its investments to satisfy debt holders and equity holders. Usually measured as WACC. Projects with returns below cost of capital destroy value." },
  { term: "Current Ratio", def: "Current Assets ÷ Current Liabilities. A liquidity metric measuring the ability to cover short-term obligations. Above 1.0 is generally healthy; above 2.0 may signal idle assets." },
  { term: "DCF (Discounted Cash Flow)", def: "A valuation method that projects future free cash flows and discounts them back to present value using WACC. The output is intrinsic value — what the business is worth based on cash it will generate.", related: [{ label: "DCF calculator", to: "/calculators" }] },
  { term: "Debt-to-Equity", def: "Total Debt ÷ Total Equity. A leverage ratio showing how much of the business is financed by debt vs. owner capital. Ideal range varies wildly by industry — utilities can safely run 2.0+, tech usually stays below 0.5." },
  { term: "Depreciation", def: "The gradual write-down of a tangible fixed asset (equipment, buildings, vehicles) over its useful life. Non-cash expense on the income statement that reduces taxable income." },
  { term: "Dilution", def: "The reduction in existing shareholders' ownership percentage caused by issuing new shares — usually from funding rounds, employee stock grants, or convertible notes converting to equity." },
  { term: "DPO (Days Payable Outstanding)", def: "Average number of days a company takes to pay its suppliers. DPO = (AP × 365) ÷ COGS. Higher DPO improves working capital but at some point damages supplier trust." },
  { term: "DSO (Days Sales Outstanding)", def: "Average number of days it takes to collect payment after a sale. DSO = (AR × 365) ÷ Revenue. Rising DSO is an early warning sign of collection problems or aggressive revenue recognition." },
  { term: "EBITDA", def: "Earnings Before Interest, Taxes, Depreciation, and Amortization. A proxy for operating cash generation that strips out capital structure and accounting policy choices. Widely used in M&A and covenant tests, but ignores real CapEx needs." },
  { term: "Enterprise Value (EV)", def: "The total value of a business to all capital providers: Market Cap + Debt − Cash. Used in ratios like EV/EBITDA and EV/Revenue that are capital-structure-neutral." },
  { term: "Equity", def: "The residual ownership interest in a business after all liabilities are subtracted from assets. Also called shareholders' equity, net worth, or book value of equity." },
  { term: "Fixed Costs", def: "Costs that don't change with production volume in the short run — rent, salaried headcount, insurance, software subscriptions. High fixed costs create operating leverage: profits swing hard with revenue changes." },
  { term: "Free Cash Flow (FCF)", def: "Cash from operations minus CapEx. The actual cash a business generates that's available to pay down debt, buy back shares, or reinvest. The numerator in every serious DCF valuation." },
  { term: "GAAP", def: "Generally Accepted Accounting Principles — the U.S. accounting rulebook maintained by FASB. Public U.S. companies must file GAAP financials. IFRS is the international counterpart." },
  { term: "Goodwill", def: "The intangible premium paid in an acquisition above the fair value of identifiable net assets. Sits on the balance sheet as an intangible asset and is tested for impairment annually." },
  { term: "Gross Margin", def: "(Revenue − COGS) ÷ Revenue. Measures how much of each dollar of revenue is left after direct costs. Software businesses often exceed 80%; retail is typically 20–40%." },
  { term: "Hedging", def: "Taking a financial position specifically designed to offset the risk of another position — using currency forwards, interest rate swaps, or commodity futures to lock in prices." },
  { term: "Impairment", def: "A permanent reduction in the recorded value of an asset when its recoverable amount falls below its book value. Common on goodwill after a failed acquisition." },
  { term: "Income Statement", def: "Also called P&L. Reports revenue, expenses, and profit over a period (quarter, year). The top-to-bottom flow: Revenue → Gross Profit → Operating Income → Net Income." },
  { term: "IRR (Internal Rate of Return)", def: "The discount rate at which a project's NPV equals zero — effectively the annualized return the project delivers. Compared against hurdle rate to accept/reject investments." },
  { term: "LTV (Lifetime Value)", def: "The total gross profit a customer will generate over their entire relationship with the business. LTV ÷ CAC is the single most important unit-economics ratio for subscription businesses." },
  { term: "Market Cap", def: "Share price × shares outstanding. The equity market value of a company. Doesn't reflect debt or cash — use Enterprise Value for that." },
  { term: "MRR (Monthly Recurring Revenue)", def: "The predictable monthly subscription revenue at a point in time. Broken into New, Expansion, Contraction, and Churn MRR to diagnose growth quality." },
  { term: "Net Income", def: "The bottom line of the income statement — revenue minus all costs, expenses, interest, and taxes. Also called net profit or earnings." },
  { term: "Net Margin", def: "Net Income ÷ Revenue. The percentage of revenue that becomes profit after everything. Software SaaS often hits 15–25% at scale; grocery retail can be under 2%." },
  { term: "NPV (Net Present Value)", def: "The sum of discounted future cash flows minus the initial investment. Positive NPV = the project creates value at the assumed discount rate. Foundational rule of corporate finance." },
  { term: "Operating Cash Flow", def: "Cash generated by the core business, before investment and financing activities. Starts from net income and adds back non-cash charges (depreciation) and working capital changes." },
  { term: "Operating Leverage", def: "The degree to which a business uses fixed costs relative to variable costs. High operating leverage magnifies both profits and losses when revenue moves." },
  { term: "Operating Margin", def: "Operating Income ÷ Revenue. Profitability of the core business before interest and taxes. Isolates operational efficiency from financing decisions." },
  { term: "Payback Period", def: "The time it takes to recover the initial cash outlay of an investment. Simple to compute but ignores time value of money and cash flows after payback." },
  { term: "Quick Ratio", def: "(Current Assets − Inventory) ÷ Current Liabilities. A stricter liquidity test than current ratio because it excludes inventory, which may not convert to cash quickly." },
  { term: "Revenue Recognition", def: "The accounting principle determining when revenue is recorded — governed by ASC 606 (U.S.) and IFRS 15. Multi-year contracts with milestones require careful allocation." },
  { term: "ROA (Return on Assets)", def: "Net Income ÷ Total Assets. Measures how efficiently a company uses its asset base to generate profit. Asset-light software businesses post double-digit ROA; heavy industrials often single digits." },
  { term: "ROE (Return on Equity)", def: "Net Income ÷ Shareholders' Equity. The return generated on owners' invested capital. DuPont decomposition splits ROE into margin, asset turnover, and leverage." },
  { term: "ROI (Return on Investment)", def: "(Gain − Cost) ÷ Cost. A catch-all profitability metric. Popular because it's simple, criticized because it ignores time and risk.", related: [{ label: "ROI calculator", to: "/calculators" }] },
  { term: "Runway", def: "Cash on hand ÷ monthly net burn. How many months a startup can operate before raising more capital or reaching profitability. Below 12 months = start fundraising now." },
  { term: "SaaS", def: "Software as a Service — software delivered via subscription over the internet. Financially characterized by recurring revenue, high gross margins, upfront CAC, and long payback periods." },
  { term: "Terminal Value", def: "In a DCF, the estimated value of the business beyond the explicit forecast period, calculated via perpetuity growth or exit multiple. Often 60–80% of total DCF value, making the assumption critical." },
  { term: "Unit Economics", def: "The profit and loss on a per-unit basis (per customer, per subscription, per order). Positive unit economics are the prerequisite for a scalable business." },
  { term: "Variable Costs", def: "Costs that scale directly with output — raw materials, hourly labor, payment processing fees, cloud usage. Opposite of fixed costs." },
  { term: "WACC (Weighted Average Cost of Capital)", def: "The blended after-tax cost of a company's debt and equity, weighted by their proportions in the capital structure. The standard discount rate for DCF valuation." },
  { term: "Working Capital", def: "Current Assets − Current Liabilities. The short-term operating liquidity of a business. Growing working capital ties up cash; shrinking it releases cash." },
  { term: "Write-off", def: "Removing an asset from the balance sheet because it has no remaining value — typically uncollectible AR, obsolete inventory, or impaired goodwill. Flows through the income statement as an expense." },
  { term: "Yield", def: "The income return on an investment expressed as a percentage of its cost or current price. Dividend yield, bond yield, and earnings yield each measure a different flavor of return." },
  { term: "Zero-Based Budgeting", def: "A budgeting approach where every expense must be justified from zero each period, not extrapolated from last year. Forces discipline but is time-consuming." },
];

const Glossary = () => {
  useAdSense();
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () =>
      TERMS.filter(
        (t) =>
          t.term.toLowerCase().includes(query.toLowerCase()) ||
          t.def.toLowerCase().includes(query.toLowerCase()),
      ).sort((a, b) => a.term.localeCompare(b.term)),
    [query],
  );

  const letters = useMemo(() => {
    const set = new Set(filtered.map((t) => t.term[0].toUpperCase()));
    return Array.from(set).sort();
  }, [filtered]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container px-4 sm:px-6 py-12 sm:py-16 max-w-5xl mx-auto">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
            <BookOpen className="w-3.5 h-3.5" /> Finance & AI Glossary
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold mb-4">Finance Glossary</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Plain-English definitions for {TERMS.length}+ financial and AI terms used throughout FinalyzeAI, our blog, and our calculators. Written by our editorial team, cross-linked to worked examples.
          </p>
        </div>

        <div className="relative max-w-xl mx-auto mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search terms or definitions…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {letters.length > 0 && (
          <nav className="flex flex-wrap gap-2 justify-center mb-8" aria-label="Alphabet index">
            {letters.map((l) => (
              <a
                key={l}
                href={`#letter-${l}`}
                className="px-2.5 py-1 text-xs rounded-md border border-border hover:bg-muted transition-colors"
              >
                {l}
              </a>
            ))}
          </nav>
        )}

        <div className="space-y-8">
          {letters.map((letter) => (
            <section key={letter} id={`letter-${letter}`}>
              <h2 className="text-2xl font-bold mb-4 text-primary">{letter}</h2>
              <div className="grid gap-3">
                {filtered
                  .filter((t) => t.term[0].toUpperCase() === letter)
                  .map((t) => (
                    <Card key={t.term} className="p-5">
                      <h3 className="font-semibold text-lg mb-2">{t.term}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{t.def}</p>
                      {t.related && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {t.related.map((r) => (
                            <Link
                              key={r.to + r.label}
                              to={r.to}
                              className="text-xs text-primary hover:underline"
                            >
                              → {r.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </Card>
                  ))}
              </div>
            </section>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-16">No terms match "{query}".</p>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Glossary;
