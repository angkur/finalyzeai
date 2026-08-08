import { ComponentType } from "react";
import { TrendingUp, DollarSign, Percent, BarChart3, Flame, PieChart, Sparkles, Timer, Users, Gauge, Split, Award, Receipt, Wallet, LucideIcon } from "lucide-react";
import {
  DCFCalc,
  ROICalc,
  LoanCalc,
  BreakEvenCalc,
  RunwayCalc,
  RatiosCalc,
} from "@/components/calculators/CalcWidgets";
import {
  MagicNumberCalc,
  CacPaybackCalc,
  LtvCacCalc,
  RuleOf40Calc,
  DilutionCalc,
  EsopValueCalc,
  FactoringCostCalc,
  WorkingCapitalCalc,
} from "@/components/calculators/CalcWidgets2";

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
  {
    slug: "saas-magic-number-calculator",
    short: "Magic Number",
    name: "SaaS Magic Number Calculator",
    h1: "SaaS Magic Number Calculator",
    tagline:
      "Measure how much new ARR each dollar of sales and marketing spend buys, and find out whether it is safe to increase go-to-market budget.",
    metaTitle: "SaaS Magic Number Calculator - Free Go-To-Market Efficiency Tool",
    metaDescription:
      "Free SaaS magic number calculator: enter quarterly ARR and sales & marketing spend to see go-to-market efficiency and whether you should scale budget.",
    icon: Sparkles,
    Component: MagicNumberCalc,
    intro: [
      "The magic number answers one question: for every dollar you spent on sales and marketing last quarter, how many dollars of annualised recurring revenue did you add this quarter? It is the cleanest single measure of go-to-market efficiency.",
      "The formula is annualised net new ARR divided by the prior quarter's sales and marketing spend. The one-quarter lag matters — pipeline created by spend rarely closes in the same period.",
    ],
    sections: [
      {
        h2: "How to read the result",
        body: [
          "Above 1.0 means each dollar of spend returned more than a dollar of annualised revenue within a year. That is the signal to increase budget, because you are leaving growth on the table.",
          "Between 0.5 and 1.0 is the normal operating band for most SaaS companies. Below 0.5 means the go-to-market motion is broken somewhere — pricing, targeting, conversion, or onboarding — and adding budget will simply burn cash faster.",
        ],
      },
      {
        h2: "Common mistakes",
        body: [
          "Using the same quarter's spend instead of the prior quarter overstates efficiency in a fast-ramping team. Including customer success or support costs in the sales and marketing figure understates it. Be consistent quarter over quarter, since the trend matters more than any single reading.",
          "The magic number says nothing about retention. A company can post a strong magic number while churning heavily; always read it alongside net revenue retention and CAC payback.",
        ],
      },
    ],
    faqs: [
      {
        q: "What is a good SaaS magic number?",
        a: "Above 1.0 is excellent and signals you should spend more. 0.75–1.0 is healthy. Below 0.5 means go-to-market is inefficient and additional spend will not pay back.",
      },
      {
        q: "Should I use gross or net new ARR?",
        a: "Use net new ARR — new plus expansion minus churn and contraction. Gross new ARR flatters the number by hiding the revenue you lost.",
      },
    ],
  },
  {
    slug: "cac-payback-period-calculator",
    short: "CAC Payback",
    name: "CAC Payback Period Calculator",
    h1: "CAC Payback Period Calculator",
    tagline:
      "Find out how many months of gross profit it takes to recover what you spent acquiring a customer — the fastest read on capital efficiency.",
    metaTitle: "CAC Payback Period Calculator - Free SaaS Payback Tool",
    metaDescription:
      "Free CAC payback calculator: enter acquisition cost, monthly revenue per account, and gross margin to get payback in months and a benchmark verdict.",
    icon: Timer,
    Component: CacPaybackCalc,
    intro: [
      "CAC payback is how long a customer must stay before the gross profit they generate repays what you spent to acquire them. Until that point, every new customer makes your cash position worse, not better.",
      "The calculation uses gross profit, not revenue. A customer paying $500 a month at 80% gross margin only contributes $400 a month toward repaying acquisition cost.",
    ],
    sections: [
      {
        h2: "Why payback beats LTV:CAC for cash planning",
        body: [
          "LTV:CAC tells you whether a customer is profitable eventually. CAC payback tells you when the cash comes back. A company with an excellent LTV:CAC ratio can still run out of money if payback takes three years, because the cash is locked up in the future.",
          "For a company managing runway, payback is the more actionable number: it directly determines how much growth you can self-fund.",
        ],
      },
      {
        h2: "Benchmarks by segment",
        body: [
          "Self-serve and SMB SaaS should target under 12 months. Mid-market typically lands between 12 and 18. Enterprise deals with large contract values can justify 18 to 24 months, because contracts are long and churn is low.",
          "Anything beyond 24 months means you are effectively financing your customers, and growth will require continuous outside capital.",
        ],
      },
    ],
    faqs: [
      {
        q: "What is a good CAC payback period?",
        a: "Under 12 months is strong for most SaaS businesses. 12–18 months is acceptable, especially for enterprise. Beyond 18–24 months, growth becomes dependent on external funding.",
      },
      {
        q: "Should CAC include salaries?",
        a: "Yes. Fully loaded CAC includes sales and marketing salaries, commissions, tooling, and ad spend — not just advertising. Excluding headcount typically halves the reported number.",
      },
    ],
  },
  {
    slug: "ltv-cac-ratio-calculator",
    short: "LTV:CAC",
    name: "LTV to CAC Ratio Calculator",
    h1: "LTV : CAC Ratio Calculator",
    tagline:
      "Calculate customer lifetime value from churn and gross margin, then compare it against acquisition cost to see whether unit economics actually work.",
    metaTitle: "LTV to CAC Ratio Calculator - Free Unit Economics Tool",
    metaDescription:
      "Free LTV:CAC calculator: enter revenue per account, gross margin, monthly churn, and CAC to get lifetime value, customer lifetime, and the LTV:CAC ratio.",
    icon: Users,
    Component: LtvCacCalc,
    intro: [
      "Lifetime value is the gross profit an average customer generates before they leave. Divide it by what you spent to acquire them and you get the single most quoted unit-economics metric in software.",
      "Average customer lifetime is the inverse of churn: 2% monthly churn implies a 50-month average lifetime. Multiply that by monthly gross profit per account and you have LTV.",
    ],
    sections: [
      {
        h2: "Why 3:1 is the benchmark",
        body: [
          "A 3:1 ratio leaves enough gross profit after acquisition cost to cover product, engineering, general and administrative expenses, and still leave margin. Below 3:1 the business rarely reaches profitability at scale without raising prices.",
          "Above 5:1 is usually a warning too — it often means you could profitably acquire many more customers and are under-investing in growth.",
        ],
      },
      {
        h2: "Where the formula misleads",
        body: [
          "Early-stage companies have too little history to estimate churn reliably, and a low churn estimate inflates LTV dramatically. If your churn number comes from a few months of data, treat LTV as directional only.",
          "The simple formula also ignores expansion revenue. If accounts grow over time, net revenue retention above 100% makes true LTV materially higher than this calculator shows.",
        ],
      },
    ],
    faqs: [
      {
        q: "How do I calculate LTV?",
        a: "LTV = monthly revenue per account × gross margin ÷ monthly churn rate. Using gross profit rather than revenue is essential; revenue-based LTV overstates value by the cost of delivery.",
      },
      {
        q: "What is a bad LTV:CAC ratio?",
        a: "Below 1:1 the business loses money on every customer. Between 1:1 and 3:1 it is marginal — payback is slow and there is little left to fund the rest of the company.",
      },
    ],
  },
  {
    slug: "rule-of-40-calculator",
    short: "Rule of 40",
    name: "Rule of 40 Calculator",
    h1: "Rule of 40 Calculator",
    tagline:
      "Add revenue growth to profit margin and see whether your growth-versus-profitability trade-off clears the benchmark investors use to value software companies.",
    metaTitle: "Rule of 40 Calculator - Free SaaS Growth & Margin Tool",
    metaDescription:
      "Free Rule of 40 calculator: add year-over-year revenue growth to profit margin to score your SaaS business against the investor benchmark of 40.",
    icon: Gauge,
    Component: RuleOf40Calc,
    intro: [
      "The Rule of 40 says a healthy software company's revenue growth rate plus its profit margin should be at least 40. It exists because growth and profitability are substitutes: burning cash is acceptable if you are growing fast, and slow growth is acceptable if you are profitable.",
      "A company growing 60% with a −20% margin scores 40. So does one growing 10% with a 30% margin. Both are considered acceptable; a company growing 10% with a −20% margin scores −10 and is not.",
    ],
    sections: [
      {
        h2: "Which margin to use",
        body: [
          "There is no single standard. EBITDA margin is the most common, free cash flow margin is the most honest, and operating margin sits between them. Pick one and use it consistently — switching definitions between quarters makes the trend meaningless.",
          "For early-stage companies, free cash flow margin is usually the most informative because it captures the actual cash impact of growth spend.",
        ],
      },
      {
        h2: "When the rule does not apply",
        body: [
          "The Rule of 40 was designed for SaaS companies above roughly $10M in revenue. Below that, growth rates are volatile and percentages swing wildly on small absolute numbers, so the score tells you little.",
          "It also breaks down for capital-intensive or usage-based businesses where margin structure differs fundamentally from subscription software.",
        ],
      },
    ],
    faqs: [
      {
        q: "What is the Rule of 40 formula?",
        a: "Rule of 40 score = year-over-year revenue growth rate (%) + profit margin (%). A score of 40 or above is considered healthy.",
      },
      {
        q: "Is the Rule of 40 still relevant?",
        a: "Yes, and arguably more so in a higher-interest-rate environment, where investors weight profitability more heavily than they did during the growth-at-all-costs period.",
      },
    ],
  },
  {
    slug: "startup-equity-dilution-calculator",
    short: "Dilution",
    name: "Startup Equity Dilution Calculator",
    h1: "Startup Equity Dilution Calculator",
    tagline:
      "See exactly how much ownership you give up in a funding round once the new investor stake and the option pool top-up are both accounted for.",
    metaTitle: "Startup Equity Dilution Calculator - Free Founder Ownership Tool",
    metaDescription:
      "Free equity dilution calculator: enter pre-money valuation, raise amount, your ownership, and option pool increase to see post-round ownership and stake value.",
    icon: Split,
    Component: DilutionCalc,
    intro: [
      "Every funding round dilutes existing shareholders. The new investor's percentage is straightforward — amount raised divided by post-money valuation — but the option pool top-up is where founders lose more than they expect.",
      "This calculator shows your ownership before and after, the percentage points lost, and what your remaining stake is worth at the new valuation.",
    ],
    sections: [
      {
        h2: "The option pool shuffle",
        body: [
          "Investors usually require the option pool to be created or expanded before the round closes, out of the pre-money valuation. That means existing shareholders absorb the entire pool, not the new investor.",
          "A 10% pool created pre-money on a $8M pre-money valuation effectively costs founders $800,000 of value. Negotiating pool size down, or pushing part of it post-money, is often worth more than negotiating valuation up.",
        ],
      },
      {
        h2: "Dilution across multiple rounds",
        body: [
          "Typical founder ownership falls from 100% at incorporation to roughly 50–60% after seed, 30–40% after Series A, and 15–25% after Series B. Dilution compounds multiplicatively, not additively.",
          "Owning a smaller share of a much larger company is the point. Only worry about dilution when the valuation increase does not justify the ownership given up.",
        ],
      },
    ],
    faqs: [
      {
        q: "How is dilution calculated?",
        a: "New ownership = old ownership × (1 − investor percentage − new option pool percentage). Investor percentage equals amount raised divided by post-money valuation.",
      },
      {
        q: "How much dilution is normal in a seed round?",
        a: "Most seed rounds sell 15–25% of the company, with a 10% option pool on top. Anything above 30% total dilution in a single early round is worth pushing back on.",
      },
    ],
  },
  {
    slug: "employee-stock-option-value-calculator",
    short: "ESOP",
    name: "Employee Stock Option Value Calculator",
    h1: "Employee Stock Option (ESOP) Value Calculator",
    tagline:
      "Work out what a startup equity grant is actually worth at a given exit valuation, after strike price and vesting are taken into account.",
    metaTitle: "Employee Stock Option Value Calculator - Free ESOP Worth Tool",
    metaDescription:
      "Free ESOP calculator: enter options granted, strike price, exit valuation, fully diluted shares, and vesting to see your ownership and net proceeds.",
    icon: Award,
    Component: EsopValueCalc,
    intro: [
      "A stock option grant is only meaningful in relation to the total number of shares outstanding. Twenty thousand options sounds substantial until you learn there are twelve million shares — that is under 0.2% of the company.",
      "This calculator converts a grant into an ownership percentage, then into money at whatever exit valuation you want to test.",
    ],
    sections: [
      {
        h2: "The three numbers to ask for",
        body: [
          "Number of options, strike price, and fully diluted shares outstanding. Without the third, the grant cannot be valued at all. A company that refuses to share fully diluted share count is a meaningful red flag.",
          "Also ask for the latest 409A valuation and the preferred liquidation stack. Both materially change what common shareholders receive.",
        ],
      },
      {
        h2: "What this calculator ignores",
        body: [
          "Liquidation preferences come out before common shareholders receive anything. In a company that raised $50M with a 1x preference and exits at $60M, common equity splits only the remaining $10M — often a fraction of the headline number.",
          "Taxes also matter: exercising incentive stock options can trigger alternative minimum tax on the spread even though no shares have been sold. Model the after-tax figure before exercising.",
        ],
      },
    ],
    faqs: [
      {
        q: "How do I value my startup stock options?",
        a: "Divide your options by fully diluted shares outstanding to get an ownership percentage, then multiply by the exit valuation and subtract the cost to exercise.",
      },
      {
        q: "What happens to unvested options if I leave?",
        a: "Unvested options are forfeited. Vested options usually must be exercised within 90 days of departure unless the company offers an extended exercise window.",
      },
    ],
  },
  {
    slug: "invoice-factoring-cost-calculator",
    short: "Factoring",
    name: "Invoice Factoring Cost Calculator",
    h1: "Invoice Factoring Cost Calculator",
    tagline:
      "Convert a factoring fee into an effective annual rate so you can compare it honestly against a bank line of credit or a business loan.",
    metaTitle: "Invoice Factoring Cost Calculator - Free Effective APR Tool",
    metaDescription:
      "Free invoice factoring calculator: enter invoice value, advance rate, fee, and payment days to see total cost, net proceeds, and the effective APR.",
    icon: Receipt,
    Component: FactoringCostCalc,
    intro: [
      "Invoice factoring sells your receivables at a discount for immediate cash. The fee is quoted as a small percentage of invoice value, which makes it look cheap — a 2.5% fee sounds far better than a 20% loan.",
      "The catch is duration. A 2.5% fee on a 45-day invoice is roughly a 24% annualised cost. This calculator does that conversion so you can compare like with like.",
    ],
    sections: [
      {
        h2: "How the cost builds up",
        body: [
          "The factor advances a percentage of the invoice immediately, typically 80–90%, and releases the remainder minus their fee once your customer pays. Your effective cost is the fee divided by the cash you actually received, annualised over the days you had it.",
          "Many agreements charge per 30-day period, so an invoice paid on day 31 costs the same as one paid on day 60. Ask how partial periods are billed before signing.",
        ],
      },
      {
        h2: "When factoring makes sense",
        body: [
          "Factoring is expensive but fast and does not require the credit history a bank loan does. It works when the cash unlocks revenue you could not otherwise capture — funding a large order, meeting payroll during a growth spurt, or taking an early-payment discount from a supplier worth more than the fee.",
          "It rarely makes sense as ongoing working capital. If you are factoring every month, the underlying problem is payment terms or pricing, and a credit line will be substantially cheaper.",
        ],
      },
    ],
    faqs: [
      {
        q: "How much does invoice factoring cost?",
        a: "Fees typically range from 1% to 5% of invoice value per 30-day period, which translates to an effective APR of roughly 12% to 60% depending on how quickly customers pay.",
      },
      {
        q: "Is factoring cheaper than a business loan?",
        a: "Almost never on a rate basis. It is faster and easier to qualify for, which is the actual trade-off being made.",
      },
    ],
  },
  {
    slug: "working-capital-calculator",
    short: "Working Capital",
    name: "Working Capital & Cash Conversion Calculator",
    h1: "Working Capital and Cash Conversion Cycle Calculator",
    tagline:
      "Calculate net working capital, the current ratio, and the cash conversion cycle to see how much cash your operating model ties up.",
    metaTitle: "Working Capital Calculator - Free Cash Conversion Cycle Tool",
    metaDescription:
      "Free working capital calculator: get net working capital, current ratio, and the cash conversion cycle from DSO, DIO, and DPO in one view.",
    icon: Wallet,
    Component: WorkingCapitalCalc,
    intro: [
      "Working capital is current assets minus current liabilities — the cash cushion available to run day-to-day operations. Positive is generally good, but the size matters: too much means capital is sitting idle in receivables and inventory.",
      "The cash conversion cycle goes further and measures how many days cash is tied up between paying suppliers and collecting from customers.",
    ],
    sections: [
      {
        h2: "Reading the cash conversion cycle",
        body: [
          "The cycle is days sales outstanding plus days inventory outstanding minus days payables outstanding. A 40-day cycle means you fund 40 days of operations out of your own pocket before customer cash arrives.",
          "Negative is the strongest position: customers pay before suppliers are due. Subscription software with annual prepayment and large retailers with long supplier terms both routinely run negative cycles, which means growth funds itself.",
        ],
      },
      {
        h2: "Three levers to free up cash",
        body: [
          "Reduce days sales outstanding by invoicing immediately, requiring deposits, and chasing overdue accounts systematically. Every ten days cut off DSO releases roughly a third of a month's revenue in cash.",
          "Reduce inventory days by ordering more frequently in smaller quantities. Extend payables days by negotiating terms with suppliers — but not so far that you damage the relationship or lose early-payment discounts worth more than the float.",
        ],
      },
    ],
    faqs: [
      {
        q: "What is a good working capital ratio?",
        a: "A current ratio between 1.5 and 3.0 is generally healthy. Below 1.0 signals possible liquidity trouble; well above 3.0 often means cash or inventory is sitting idle.",
      },
      {
        q: "Can working capital be negative and healthy?",
        a: "Yes. Businesses that collect cash upfront and pay suppliers later — subscription software, restaurants, large retailers — routinely run negative working capital and are financing growth with supplier and customer money.",
      },
    ],
  },
];

export const getCalculator = (slug?: string) =>
  calculators.find((c) => c.slug === slug);
