import { Link } from "react-router-dom";
import { ArrowUpRight, BarChart3, BookOpen, Calculator, FileSearch } from "lucide-react";

const resourceLinks = [
  {
    to: "/benchmarks",
    icon: BarChart3,
    title: "2026 Startup Benchmarks",
    description: "Compare growth, gross margin, NRR, Rule of 40, burn multiple, and runway against sourced startup medians.",
  },
  {
    to: "/calculators",
    icon: Calculator,
    title: "Free Financial Calculators",
    description: "Model DCF valuation, ROI, loan payments, break-even, working capital, CAC payback, LTV:CAC, and startup runway.",
  },
  {
    to: "/blog",
    icon: BookOpen,
    title: "Finance Guides",
    description: "Read practical guides to financial statements, cash-flow forecasting, SaaS metrics, valuation, fundraising, and due diligence.",
  },
  {
    to: "/user-guide",
    icon: FileSearch,
    title: "Analysis User Guide",
    description: "Learn how to prepare financial documents, ask focused questions, interpret results, and verify AI-generated analysis.",
  },
];

const HomepageResources = () => (
  <section className="border-y border-border/60 bg-secondary/20 py-16 sm:py-24" aria-labelledby="financial-analysis-resources">
    <div className="container px-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)] lg:gap-16">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase text-primary">Financial intelligence, explained</p>
            <h2 id="financial-analysis-resources" className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              AI financial analysis tools and practical finance resources
            </h2>
            <div className="mt-6 space-y-5 text-base leading-7 text-muted-foreground">
              <p>
                FinalyzeAI helps founders, finance teams, analysts, and investors turn financial data into decisions they can explain. Use
                {" "}<Link to="/ai-predict" className="font-medium text-primary hover:underline">AI Predict</Link> to review income statements,
                balance sheets, cash-flow statements, spreadsheets, and financial reports in plain English. The analysis can surface revenue
                and expense trends, profitability ratios, liquidity signals, working-capital changes, and potential financial risk indicators.
              </p>
              <p>
                For forward-looking work, <Link to="/fin-predict" className="font-medium text-primary hover:underline">Fin Predict</Link> supports
                financial forecasting, trend analysis, scenario modeling, and what-if comparisons. Test how changes in revenue growth, costs,
                margins, or cash burn may affect future performance, then turn the findings into charts and reports for planning discussions.
                AI output is designed to support research and review—not replace professional accounting, investment, tax, or legal advice.
              </p>
              <p>
                You can also use FinalyzeAI without uploading a document. Explore free business and startup calculators, compare SaaS performance
                with the sourced 2026 startup benchmarks report, or study detailed finance guides covering DCF valuation, EBITDA, free cash flow,
                WACC, CAC, LTV, Rule of 40, fundraising metrics, fraud red flags, and financial statement analysis.
              </p>
              <p>
                New to a metric? Visit the <Link to="/glossary" className="font-medium text-primary hover:underline">finance glossary</Link> for
                plain-English definitions, review common questions in the <Link to="/faq" className="font-medium text-primary hover:underline">FAQ</Link>,
                or browse the <Link to="/editorial-policy" className="font-medium text-primary hover:underline">editorial policy</Link> to understand
                how educational content is researched, sourced, reviewed, and corrected.
              </p>
            </div>
          </div>

          <nav aria-label="Financial reports and guides" className="grid content-start gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {resourceLinks.map((resource) => (
              <Link
                key={resource.to}
                to={resource.to}
                className="group flex min-h-32 gap-4 rounded-lg border border-border/70 bg-card p-5 transition-colors hover:border-primary/60 hover:bg-secondary/40"
              >
                <resource.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <span className="min-w-0">
                  <span className="flex items-start justify-between gap-3 font-display font-semibold text-foreground">
                    {resource.title}
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" aria-hidden="true" />
                  </span>
                  <span className="mt-2 block text-sm leading-6 text-muted-foreground">{resource.description}</span>
                </span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  </section>
);

export default HomepageResources;