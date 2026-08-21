/**
 * Startup & SaaS benchmark data.
 * Every figure below is attributed to a named, public source.
 * Do not add a number here without a verifiable source URL.
 */

export interface BenchmarkSource {
  name: string;
  year: string;
  url: string;
}

export interface BenchmarkMetric {
  id: string;
  metric: string;
  segment: string;
  value: number;
  display: string;
  /** Higher value = healthier (true) or lower = healthier (false) */
  higherIsBetter: boolean;
  unit: "percent" | "ratio" | "months" | "dollars";
  note: string;
  source: BenchmarkSource;
}

export const SOURCES: Record<string, BenchmarkSource> = {
  benchmarkit: {
    name: "Benchmarkit — 2024 SaaS Performance Metrics (FY2023 data)",
    year: "2024",
    url: "https://www.benchmarkit.ai/2024benchmarks",
  },
  kruze: {
    name: "Kruze Consulting — Cash Balance Data from 800+ Startups",
    year: "2024",
    url: "https://www.prnewswire.com/news-releases/cash-balance-data-from-800-startups-indicate-founders-have-become-capital-efficient-302095959.html",
  },
  saasCapital: {
    name: "SaaS Capital — Retention & Growth Benchmarks",
    year: "2025",
    url: "https://www.saas-capital.com/blog-posts/what-is-a-good-retention-rate-for-a-private-saas-company/",
  },
  bessemer: {
    name: "Bessemer Venture Partners — State of the Cloud",
    year: "2024",
    url: "https://www.bvp.com/atlas/state-of-the-cloud-2024",
  },
  carta: {
    name: "Carta — Fundraising & Ownership Data",
    year: "2025",
    url: "https://carta.com/data/founder-ownership/",
  },
};

export const BENCHMARKS: BenchmarkMetric[] = [
  {
    id: "growth",
    metric: "Annual revenue growth",
    segment: "All private SaaS, actual",
    value: 27,
    display: "27%",
    higherIsBetter: true,
    unit: "percent",
    note: "Median actual growth. Companies planned 35% for the following year, with the top quartile planning 66%+.",
    source: SOURCES.benchmarkit,
  },
  {
    id: "growth-early",
    metric: "Annual revenue growth",
    segment: "$1M–$5M ARR",
    value: 32,
    display: "32%",
    higherIsBetter: true,
    unit: "percent",
    note: "Early-stage companies grew 32% and planned 50% for the next year.",
    source: SOURCES.benchmarkit,
  },
  {
    id: "growth-late",
    metric: "Annual revenue growth",
    segment: "$50M+ ARR",
    value: 12,
    display: "12%",
    higherIsBetter: true,
    unit: "percent",
    note: "The largest ARR bands posted the slowest median growth.",
    source: SOURCES.benchmarkit,
  },
  {
    id: "gross-margin",
    metric: "Subscription gross margin",
    segment: "All SaaS",
    value: 79,
    display: "79%",
    higherIsBetter: true,
    unit: "percent",
    note: "Flat year over year. Top quartile reaches 85%.",
    source: SOURCES.benchmarkit,
  },
  {
    id: "nrr",
    metric: "Net revenue retention",
    segment: "Private SaaS",
    value: 101,
    display: "101%",
    higherIsBetter: true,
    unit: "percent",
    note: "Down from ~105% in 2021. Public cloud companies fell from ~120% to ~110% over the same period.",
    source: SOURCES.benchmarkit,
  },
  {
    id: "rule40-plg",
    metric: "Rule of 40",
    segment: "Product-led growth",
    value: 34,
    display: "34",
    higherIsBetter: true,
    unit: "ratio",
    note: "Growth rate plus profit margin. PLG companies materially outperform sales-led peers.",
    source: SOURCES.benchmarkit,
  },
  {
    id: "rule40-sales",
    metric: "Rule of 40",
    segment: "Sales-led growth",
    value: 20,
    display: "20",
    higherIsBetter: true,
    unit: "ratio",
    note: "Sales-led companies sit 14 points below PLG peers on the same measure.",
    source: SOURCES.benchmarkit,
  },
  {
    id: "burn-multiple",
    metric: "Burn multiple",
    segment: "All private SaaS",
    value: 0.8,
    display: "0.80x",
    higherIsBetter: false,
    unit: "ratio",
    note: "Net burn per $1 of net new ARR. Companies at $20M–$50M ARR ran a 0.87x median.",
    source: SOURCES.benchmarkit,
  },
  {
    id: "cac-new",
    metric: "New-name CAC ratio",
    segment: "B2B SaaS",
    value: 1.76,
    display: "$1.76",
    higherIsBetter: false,
    unit: "dollars",
    note: "Sales & marketing spend per $1 of new ARR. The ratio rises as average contract value rises.",
    source: SOURCES.benchmarkit,
  },
  {
    id: "cac-blended",
    metric: "Blended CAC ratio",
    segment: "B2B SaaS",
    value: 1.61,
    display: "$1.61",
    higherIsBetter: false,
    unit: "dollars",
    note: "Up from $1.32 the prior year — acquisition got materially more expensive.",
    source: SOURCES.benchmarkit,
  },
  {
    id: "expansion-cac",
    metric: "Expansion CAC ratio",
    segment: "B2B SaaS",
    value: 1.0,
    display: "$1.00",
    higherIsBetter: false,
    unit: "dollars",
    note: "Cost to expand $1 of ARR rose from $0.69 to $1.00 — expansion is no longer cheap.",
    source: SOURCES.benchmarkit,
  },
  {
    id: "runway",
    metric: "Cash runway",
    segment: "VC-backed startups",
    value: 22,
    display: "22 months",
    higherIsBetter: true,
    unit: "months",
    note: "Average runway across 800+ startups. One in three held six months or less.",
    source: SOURCES.kruze,
  },
];

/** Metrics the visitor can benchmark themselves against. */
export const COMPARABLE_IDS = [
  "growth",
  "gross-margin",
  "nrr",
  "rule40-plg",
  "burn-multiple",
  "cac-blended",
] as const;
