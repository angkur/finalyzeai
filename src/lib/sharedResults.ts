export interface SharedMetric {
  label: string;
  value: string;
  note?: string;
  emphasis?: boolean;
}

export interface SharedResultView {
  title: string;
  h1: string;
  metaDescription: string;
  summary: string;
  inputs: SharedMetric[];
  metrics: SharedMetric[];
  ctaTo: string;
  ctaLabel: string;
}

const num = (params: URLSearchParams, key: string, fallback = 0) => {
  const v = Number(params.get(key));
  return Number.isFinite(v) ? v : fallback;
};

const fmt = (n: number, d = 2) =>
  Number.isFinite(n)
    ? n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d })
    : "—";
const money = (n: number) => (Number.isFinite(n) ? `$${fmt(n, 0)}` : "—");

export const sharedResultTypes = [
  "health-score",
  "runway",
  "dcf",
  "break-even",
] as const;

export type SharedResultType = (typeof sharedResultTypes)[number];

export const buildSharedResult = (
  type: string,
  params: URLSearchParams,
): SharedResultView | null => {
  if (type === "health-score") {
    const revenue = num(params, "rev");
    const expenses = num(params, "exp");
    const cash = num(params, "cash");
    const growth = num(params, "growth");

    const burn = expenses - revenue;
    const runway = burn > 0 ? cash / burn : Infinity;
    const margin = revenue > 0 ? ((revenue - expenses) / revenue) * 100 : -100;

    let score = 0;
    score += Math.min(40, Number.isFinite(runway) ? (runway / 24) * 40 : 40);
    score += Math.max(0, Math.min(30, ((margin + 50) / 80) * 30));
    score += Math.max(0, Math.min(30, (growth / 10) * 30));
    score = Math.round(Math.max(0, Math.min(100, score)));

    const verdict =
      score >= 75
        ? "Strong. Cash position and growth both support scaling spend."
        : score >= 50
          ? "Stable but watch the burn — you have room, not slack."
          : score >= 30
            ? "Fragile. Runway or margin needs attention in the next quarter."
            : "Critical. Cash timing is the binding constraint right now.";

    return {
      title: `Founder Health Score: ${score}/100 - FinalyzeAI`,
      h1: `Founder Health Score: ${score}/100`,
      metaDescription: `A business with ${money(revenue)} monthly revenue, ${money(expenses)} monthly expenses and ${money(cash)} cash scores ${score}/100. See the runway, margin and growth breakdown.`,
      summary: verdict,
      inputs: [
        { label: "Monthly revenue", value: money(revenue) },
        { label: "Monthly expenses", value: money(expenses) },
        { label: "Cash on hand", value: money(cash) },
        { label: "Monthly growth", value: `${fmt(growth, 1)}%` },
      ],
      metrics: [
        {
          label: "Net monthly burn",
          value: burn > 0 ? money(burn) : `${money(Math.abs(burn))} surplus`,
          note: burn > 0 ? "Cash leaving the business each month" : "Cash-flow positive",
        },
        {
          label: "Runway",
          value: Number.isFinite(runway) ? `${fmt(runway, 1)} months` : "Unlimited",
          note: "Investors typically want 18–24 months after a round",
          emphasis: true,
        },
        {
          label: "Operating margin",
          value: `${fmt(margin, 1)}%`,
          note: "Revenue minus expenses, as a share of revenue",
        },
        {
          label: "Health score",
          value: `${score}/100`,
          note: "Runway 40 pts, margin 30 pts, growth 30 pts",
          emphasis: true,
        },
      ],
      ctaTo: "/",
      ctaLabel: "Score your own business",
    };
  }

  if (type === "runway") {
    const cash = num(params, "cash");
    const revenue = num(params, "rev");
    const expenses = num(params, "exp");
    const burn = expenses - revenue;
    const runway = burn > 0 ? cash / burn : Infinity;

    return {
      title: `Runway: ${Number.isFinite(runway) ? `${fmt(runway, 1)} months` : "cash-flow positive"} - FinalyzeAI`,
      h1: "Burn rate and runway result",
      metaDescription: `With ${money(cash)} in the bank, ${money(revenue)} monthly revenue and ${money(expenses)} monthly expenses, this business has ${Number.isFinite(runway) ? `${fmt(runway, 1)} months` : "unlimited"} of runway.`,
      summary:
        burn > 0
          ? "Runway is cash on hand divided by net monthly burn. Start fundraising roughly nine months before you would hit zero."
          : "Revenue covers expenses, so runway is effectively unlimited at current spend.",
      inputs: [
        { label: "Cash on hand", value: money(cash) },
        { label: "Monthly revenue", value: money(revenue) },
        { label: "Monthly expenses", value: money(expenses) },
      ],
      metrics: [
        { label: "Net monthly burn", value: money(burn) },
        {
          label: "Runway",
          value: Number.isFinite(runway) ? `${fmt(runway, 1)} months` : "Unlimited",
          emphasis: true,
        },
      ],
      ctaTo: "/calculators/burn-rate-runway-calculator",
      ctaLabel: "Run your own numbers",
    };
  }

  if (type === "dcf") {
    const ev = num(params, "ev");
    const fcf = num(params, "fcf");
    const growth = num(params, "g");
    const wacc = num(params, "wacc");
    const years = num(params, "y");

    return {
      title: `DCF valuation: ${money(ev)} enterprise value - FinalyzeAI`,
      h1: "DCF valuation result",
      metaDescription: `A ${years}-year DCF with ${money(fcf)} year-one free cash flow, ${fmt(growth, 1)}% growth and a ${fmt(wacc, 1)}% discount rate produces an enterprise value of ${money(ev)}.`,
      summary:
        "Enterprise value is the present value of forecast free cash flow plus a discounted Gordon Growth terminal value. Subtract net debt to get equity value.",
      inputs: [
        { label: "Year 1 free cash flow", value: money(fcf) },
        { label: "Growth rate", value: `${fmt(growth, 1)}%` },
        { label: "Discount rate (WACC)", value: `${fmt(wacc, 1)}%` },
        { label: "Forecast years", value: String(years) },
      ],
      metrics: [{ label: "Enterprise value", value: money(ev), emphasis: true }],
      ctaTo: "/calculators/dcf-calculator",
      ctaLabel: "Value your own business",
    };
  }

  if (type === "break-even") {
    const fixed = num(params, "fixed");
    const price = num(params, "price");
    const variable = num(params, "var");
    const contribution = price - variable;
    const units = contribution > 0 ? fixed / contribution : Infinity;

    return {
      title: `Break-even: ${Number.isFinite(units) ? `${fmt(units, 0)} units` : "not reachable"} - FinalyzeAI`,
      h1: "Break-even analysis result",
      metaDescription: `With ${money(fixed)} in fixed costs, a ${money(price)} price and ${money(variable)} variable cost per unit, break-even is ${Number.isFinite(units) ? `${fmt(units, 0)} units` : "unreachable"}.`,
      summary:
        contribution > 0
          ? "Break-even units equal fixed costs divided by contribution margin per unit. Every unit past that point is profit."
          : "Contribution margin is zero or negative, so no volume reaches break-even. Raise price or cut variable cost.",
      inputs: [
        { label: "Fixed costs", value: money(fixed) },
        { label: "Price per unit", value: money(price) },
        { label: "Variable cost per unit", value: money(variable) },
      ],
      metrics: [
        { label: "Contribution margin / unit", value: money(contribution) },
        {
          label: "Break-even units",
          value: Number.isFinite(units) ? fmt(units, 0) : "—",
          emphasis: true,
        },
        {
          label: "Break-even revenue",
          value: Number.isFinite(units) ? money(units * price) : "—",
          emphasis: true,
        },
      ],
      ctaTo: "/calculators/break-even-calculator",
      ctaLabel: "Run your own break-even",
    };
  }

  return null;
};
