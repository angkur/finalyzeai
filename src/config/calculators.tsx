import { ComponentType } from "react";
import { TrendingUp, DollarSign, Percent, BarChart3, Flame, PieChart, LucideIcon } from "lucide-react";
import {
  DCFCalc,
  ROICalc,
  LoanCalc,
  BreakEvenCalc,
  RunwayCalc,
  RatiosCalc,
} from "@/components/calculators/CalcWidgets";

export interface CalculatorDef {
  slug: string;
  short: string;
  name: string;
  h1: string;
  tagline: string;
  metaTitle: string;
  metaDescription: string;
  icon: LucideIcon;
  Component: ComponentType;
  intro: string[];
  sections: { h2: string; body: string[] }[];
  faqs: { q: string; a: string }[];
}

export const calculators: CalculatorDef[] = [
  {
    slug: "dcf-calculator",
    short: "DCF",
    name: "DCF Valuation Calculator",
    h1: "DCF Valuation Calculator",
    tagline:
      "Discount projected free cash flow back to today and get an enterprise value in seconds. Free, no signup, runs entirely in your browser.",
    metaTitle: "Free DCF Calculator - Discounted Cash Flow Valuation Tool",
    metaDescription:
      "Free DCF calculator: project free cash flow, apply WACC discounting and Gordon Growth terminal value to get an enterprise value instantly. No signup.",
    icon: TrendingUp,
    Component: DCFCalc,
    intro: [
      "A discounted cash flow (DCF) model values a business as the present value of the cash it will generate in the future. You forecast free cash flow for a handful of years, discount each year back to today using a discount rate (usually WACC), then add a terminal value representing everything beyond the forecast horizon.",
      "This calculator implements the standard two-stage DCF: an explicit forecast period with a constant growth rate, plus a Gordon Growth terminal value. Change any input and the enterprise value updates immediately.",
    ],
    sections: [
      {
        h2: "How the DCF formula works",
        body: [
          "Each forecast year's free cash flow is grown from the year-1 figure at your chosen growth rate, then divided by (1 + WACC) raised to the power of the year number. Those present values are summed to get the value of the explicit forecast period.",
          "The terminal value takes the final year's cash flow, grows it one more year at the terminal growth rate, and divides by (WACC − terminal growth). That figure is then discounted back to today. Enterprise value is the sum of both parts.",
        ],
      },
      {
        h2: "Choosing realistic inputs",
        body: [
          "WACC for a small private company usually lands between 10% and 20%; large listed companies are often 7% to 10%. Terminal growth should never exceed long-run GDP growth — 2% to 3% is the defensible range.",
          "Terminal value typically represents 60–80% of the total in a five-year DCF. If yours is above 90%, your forecast period is too short or your terminal growth is too aggressive. If WACC is less than or equal to terminal growth, the formula breaks down and produces nonsense.",
        ],
      },
      {
        h2: "From enterprise value to equity value",
        body: [
          "This calculator returns enterprise value. To get equity value, subtract net debt (total debt minus cash) and any minority interests, then divide by fully diluted shares outstanding for a per-share figure.",
        ],
      },
    ],
    faqs: [
      {
        q: "What discount rate should I use in a DCF?",
        a: "Use the weighted average cost of capital (WACC) for the business being valued. For an early-stage private company, 15–25% reflects the risk; for a stable, cash-generative listed company, 7–10% is typical.",
      },
      {
        q: "How many years should I forecast?",
        a: "Five years is the standard. Ten years only makes sense when cash flows are genuinely predictable that far out — otherwise you are just moving guesswork into the explicit period.",
      },
      {
        q: "Is a DCF accurate?",
        a: "A DCF is only as accurate as its assumptions. It is best used as a sanity check and to test how sensitive value is to growth and discount rate, not as a single precise answer.",
      },
    ],
  },
  {
    slug: "roi-calculator",
    short: "ROI",
    name: "ROI & CAGR Calculator",
    h1: "ROI and CAGR Calculator",
    tagline:
      "Calculate total return on investment and the annualized (CAGR) equivalent so you can fairly compare investments held over different time periods.",
    metaTitle: "Free ROI Calculator with CAGR - Annualized Return Tool",
    metaDescription:
      "Free ROI calculator: enter your investment, final value, and holding period to get total profit, total ROI percentage, and annualized CAGR instantly.",
    icon: Percent,
    Component: ROICalc,
    intro: [
      "Return on investment tells you what percentage you gained or lost relative to what you put in. It is simple, universal, and slightly misleading on its own — because a 50% return earned over ten years is far worse than a 20% return earned in one.",
      "That is why this calculator also gives you the compound annual growth rate (CAGR): the constant annual rate that would have taken your starting value to your ending value over the same period.",
    ],
    sections: [
      {
        h2: "ROI vs CAGR — which one to use",
        body: [
          "Use total ROI when the holding period is fixed or identical across the options you are comparing. Use CAGR whenever the time periods differ; it is the only fair basis for comparison.",
          "CAGR smooths out volatility. A portfolio that went +80% then −40% has a very different ride than one that compounded at 3.9% a year, even though both end in the same place.",
        ],
      },
      {
        h2: "What ROI leaves out",
        body: [
          "Simple ROI ignores intermediate cash flows, taxes, transaction costs, and inflation. For projects with uneven cash flows in and out, IRR or NPV is the better tool.",
          "To convert a nominal return to a real one, subtract the inflation rate over the same period. A 6% nominal return with 4% inflation is roughly a 2% real return.",
        ],
      },
    ],
    faqs: [
      {
        q: "What is a good ROI?",
        a: "It depends on risk and horizon. Long-run equity market returns average roughly 7–10% a year, so a business project should typically clear that plus a risk premium to be worth doing.",
      },
      {
        q: "How is CAGR different from average return?",
        a: "An average return is the arithmetic mean of yearly returns and overstates performance when returns are volatile. CAGR is the geometric mean and reflects what you actually ended up with.",
      },
    ],
  },
  {
    slug: "loan-calculator",
    short: "Loan",
    name: "Loan & Mortgage Calculator",
    h1: "Loan and Mortgage Payment Calculator",
    tagline:
      "Work out the monthly payment, total amount repaid, and total interest cost on any amortizing loan — mortgage, auto, or business term loan.",
    metaTitle: "Free Loan & Mortgage Calculator - Monthly Payment + Interest",
    metaDescription:
      "Free loan calculator: enter loan amount, interest rate, and term to see the monthly payment, total repaid, and total interest cost over the life of the loan.",
    icon: DollarSign,
    Component: LoanCalc,
    intro: [
      "An amortizing loan has a fixed monthly payment split between interest and principal. Early on, most of each payment goes to interest; later, most goes to principal. This calculator uses the standard amortization formula to give you that payment and the true lifetime cost of borrowing.",
    ],
    sections: [
      {
        h2: "How term length changes the total cost",
        body: [
          "A longer term lowers your monthly payment but raises the total interest substantially. On a $250,000 loan at 6.5%, moving from a 15-year to a 30-year term cuts the payment by roughly a third while more than doubling total interest paid.",
          "If cash flow allows, shortening the term or making extra principal payments is the single most effective way to reduce borrowing cost.",
        ],
      },
      {
        h2: "What this calculator does not include",
        body: [
          "The figures shown cover principal and interest only. A real mortgage payment also includes property taxes, homeowners insurance, and possibly PMI or HOA fees. Business loans may add origination fees, which raise the effective rate above the stated one.",
        ],
      },
    ],
    faqs: [
      {
        q: "How is a monthly loan payment calculated?",
        a: "Payment = P × r × (1 + r)^n / ((1 + r)^n − 1), where P is the principal, r is the monthly interest rate (annual rate divided by 12), and n is the total number of monthly payments.",
      },
      {
        q: "Does paying extra each month help?",
        a: "Yes — extra payments applied to principal reduce the balance that interest accrues on, which shortens the term and can save tens of thousands over a long mortgage.",
      },
    ],
  },
  {
    slug: "break-even-calculator",
    short: "Break-Even",
    name: "Break-Even Analysis Calculator",
    h1: "Break-Even Point Calculator",
    tagline:
      "Find the exact unit volume and revenue you need to cover fixed and variable costs, plus your contribution margin per unit.",
    metaTitle: "Free Break-Even Calculator - Units, Revenue & Margin",
    metaDescription:
      "Free break-even calculator: enter fixed costs, unit price, and variable cost to get break-even units, break-even revenue, and contribution margin.",
    icon: BarChart3,
    Component: BreakEvenCalc,
    intro: [
      "Break-even is the point at which total revenue equals total cost — the first unit past it is profit. It is the fastest reality check on a pricing decision, a new product line, or a capital investment.",
      "The core input is contribution margin: price minus variable cost per unit. Divide fixed costs by contribution margin and you have your break-even volume.",
    ],
    sections: [
      {
        h2: "Fixed vs variable costs",
        body: [
          "Fixed costs stay the same regardless of volume: rent, salaries, software subscriptions, insurance. Variable costs scale with each unit sold: materials, payment processing, shipping, per-seat hosting.",
          "Misclassifying a cost is the most common error. If a cost changes when you sell one more unit, it is variable.",
        ],
      },
      {
        h2: "Using break-even to price",
        body: [
          "If break-even volume is higher than your realistic market demand, the business does not work at that price. You have three levers: raise price, cut variable cost, or cut fixed cost. If contribution margin is negative, every additional sale loses money and no volume can save you.",
        ],
      },
    ],
    faqs: [
      {
        q: "What is the break-even formula?",
        a: "Break-even units = fixed costs ÷ (price per unit − variable cost per unit). Break-even revenue = break-even units × price per unit.",
      },
      {
        q: "What is a healthy contribution margin?",
        a: "Software and digital products often run 70–90%. Physical products and retail typically sit between 20% and 50%. Below 20% leaves very little room for fixed-cost coverage.",
      },
    ],
  },
  {
    slug: "burn-rate-runway-calculator",
    short: "Runway",
    name: "Burn Rate & Runway Calculator",
    h1: "Startup Burn Rate and Runway Calculator",
    tagline:
      "Enter cash on hand, monthly revenue, and monthly expenses to see your net burn, months of runway, and the growth rate needed to reach break-even.",
    metaTitle: "Free Burn Rate & Runway Calculator for Startups",
    metaDescription:
      "Free startup runway calculator: get net monthly burn, months of runway from cash on hand, and the monthly growth rate needed to break even within a year.",
    icon: Flame,
    Component: RunwayCalc,
    intro: [
      "Runway is how many months you can keep operating before cash reaches zero. It is the single most important number for any pre-profitability company — most startup failures are cash-timing failures, not demand failures.",
      "Net burn is monthly expenses minus monthly revenue. Divide cash on hand by net burn and you have runway in months.",
    ],
    sections: [
      {
        h2: "Gross burn vs net burn",
        body: [
          "Gross burn is total monthly cash out. Net burn subtracts revenue coming in. Runway should always be calculated on net burn, but track gross burn too — it shows your true cost base if revenue stalls.",
        ],
      },
      {
        h2: "How much runway is enough",
        body: [
          "Investors generally want to see 18–24 months of runway immediately after a round closes. Below 12 months you should already be planning the next raise; below 6 months your negotiating position weakens sharply.",
          "Start a fundraise nine months before you would hit zero. Raising while desperate costs equity.",
        ],
      },
      {
        h2: "Extending runway without cutting growth",
        body: [
          "Move annual contracts to upfront billing, tighten collection on receivables, renegotiate cloud commitments, and pause hires that do not directly drive revenue. Each of those buys months without touching the product roadmap.",
        ],
      },
    ],
    faqs: [
      {
        q: "How do I calculate runway?",
        a: "Runway in months = cash on hand ÷ (monthly expenses − monthly revenue). If revenue exceeds expenses, runway is effectively infinite and you are cash-flow positive.",
      },
      {
        q: "What is a good burn multiple?",
        a: "Burn multiple is net burn divided by net new ARR. Below 1 is excellent, 1–1.5 is good, 2+ suggests you are buying growth inefficiently.",
      },
    ],
  },
  {
    slug: "financial-ratio-calculator",
    short: "Ratios",
    name: "Financial Ratio Calculator",
    h1: "Financial Ratio Calculator",
    tagline:
      "Compute the eight most-used liquidity, leverage, and profitability ratios from your balance sheet and income statement, with healthy benchmark ranges.",
    metaTitle: "Free Financial Ratio Calculator - Liquidity, Debt & ROE",
    metaDescription:
      "Free financial ratio calculator: current ratio, quick ratio, debt-to-equity, ROE, ROA, net margin and asset turnover with healthy benchmark ranges.",
    icon: PieChart,
    Component: RatiosCalc,
    intro: [
      "Financial ratios turn raw statement figures into comparable signals. This calculator computes eight core ratios across three families — liquidity (can you pay short-term bills), leverage (how much debt you carry), and profitability (how efficiently you turn assets and equity into profit).",
    ],
    sections: [
      {
        h2: "Liquidity ratios",
        body: [
          "The current ratio (current assets ÷ current liabilities) shows short-term solvency; 1.5–3.0 is generally healthy. Below 1 means you cannot cover the next year's obligations from current assets. The quick ratio strips out inventory for a stricter test — above 1.0 is the target.",
        ],
      },
      {
        h2: "Leverage ratios",
        body: [
          "Debt-to-equity compares borrowed capital to owner capital. Under 1.5 is comfortable for most industries, though capital-intensive sectors like utilities routinely run higher. Debt-to-assets below 50% means creditors fund less than half the balance sheet.",
        ],
      },
      {
        h2: "Profitability ratios",
        body: [
          "Net margin above 10% is solid for most sectors. Return on equity above 15% and return on assets above 5% indicate management is generating real returns on the capital deployed. Asset turnover shows how much revenue each dollar of assets produces — higher is more efficient.",
          "Always compare ratios against industry peers and against the same company over time. A single ratio in isolation says very little.",
        ],
      },
    ],
    faqs: [
      {
        q: "Which financial ratios matter most?",
        a: "For lenders: current ratio and debt-to-equity. For investors: ROE, net margin, and asset turnover. For operators: contribution margin and cash conversion. Pick the ones tied to the decision you are making.",
      },
      {
        q: "Can I calculate these from a PDF statement automatically?",
        a: "Yes — FinalyzeAI's AI Predict tool extracts figures directly from uploaded statements and computes the full ratio set along with trend and benchmark analysis.",
      },
    ],
  },
];

export const getCalculator = (slug?: string) =>
  calculators.find((c) => c.slug === slug);
