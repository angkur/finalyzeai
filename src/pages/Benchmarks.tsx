import { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, ExternalLink, ArrowRight, TrendingUp, Flame, Percent } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import BenchmarkComparer from "@/components/benchmarks/BenchmarkComparer";
import { BENCHMARKS, SOURCES } from "@/config/benchmarks";

const growthByBand = [
  { band: "$1M–$5M ARR", value: 32 },
  { band: "All companies", value: 27 },
  { band: "$50M+ ARR", value: 12 },
];

const efficiency = [
  { metric: "New-name CAC", value: 1.76 },
  { metric: "Blended CAC", value: 1.61 },
  { metric: "Expansion CAC", value: 1.0 },
  { metric: "Burn multiple", value: 0.8 },
];

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: "2026 Startup & SaaS Benchmarks Report",
  description:
    "Median growth, gross margin, net revenue retention, Rule of 40, burn multiple, CAC ratios, and runway benchmarks for private SaaS and venture-backed startups, with sources.",
  url: "https://finalyzeai.com/benchmarks",
  license: "https://finalyzeai.com/terms",
  creator: { "@type": "Organization", name: "FinalyzeAI", url: "https://finalyzeai.com" },
  isBasedOn: Object.values(SOURCES).map((s) => s.url),
};

const Benchmarks = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(JSON_LD);
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="container px-4 md:px-6 max-w-5xl">
          <header className="text-center mb-10">
            <Badge variant="secondary" className="mb-4">
              <BarChart3 className="w-3 h-3 mr-1" /> Free data report
            </Badge>
            <h1 className="text-3xl md:text-5xl font-display font-bold mb-4">
              2026 Startup <span className="text-gradient">Benchmarks Report</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              The medians founders actually get asked about in a board meeting — growth, gross
              margin, retention, Rule of 40, burn multiple, CAC and runway. Every figure is linked
              to its published source. No email required.
            </p>
          </header>

          {/* Headline numbers */}
          <section className="mb-14" aria-labelledby="headline-numbers">
            <h2 id="headline-numbers" className="text-2xl font-display font-bold mb-5">
              The nine numbers that matter
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {BENCHMARKS.map((b) => (
                <Card key={b.id} className="bg-card/70">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {b.metric}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-display text-3xl font-bold text-gradient mb-1">
                      {b.display}
                    </p>
                    <p className="text-xs font-medium text-foreground mb-2">{b.segment}</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">{b.note}</p>
                    <a
                      href={b.source.url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="mt-2 inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                    >
                      {b.source.name} <ExternalLink className="w-3 h-3" />
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Comparison tool */}
          <section className="mb-14" aria-labelledby="compare">
            <h2 id="compare" className="sr-only">
              Compare your numbers
            </h2>
            <BenchmarkComparer />
          </section>

          {/* Charts */}
          <section className="mb-14 grid gap-5 lg:grid-cols-2" aria-labelledby="charts">
            <h2 id="charts" className="sr-only">
              Benchmark charts
            </h2>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" /> Growth slows hard with scale
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={growthByBand} layout="vertical" margin={{ left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        type="number"
                        unit="%"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis
                        type="category"
                        dataKey="band"
                        width={110}
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                      />
                      <Tooltip
                        formatter={(v: number) => [`${v}%`, "Median growth"]}
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                      />
                      <Bar dataKey="value" radius={[0, 6, 6, 0]} fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Median annual revenue growth by ARR band. Source: Benchmarkit 2024.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  <Flame className="w-4 h-4 text-accent" /> What a dollar of ARR costs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={efficiency}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="metric"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={10}
                        interval={0}
                      />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        formatter={(v: number) => [`$${v.toFixed(2)}`, "Median"]}
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                      />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {efficiency.map((e) => (
                          <Cell
                            key={e.metric}
                            fill={e.value > 1 ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Spend required per $1 of ARR. Anything above $1.00 means the dollar costs more
                  than it returns in year one. Source: Benchmarkit 2024.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Reading the data */}
          <section className="mb-14 prose-invert max-w-none" aria-labelledby="reading">
            <h2 id="reading" className="text-2xl font-display font-bold mb-4">
              What the 2026 picture actually says
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-foreground">Acquisition got expensive, expansion more
                so.</strong>{" "}
                Blended CAC ratio rose from $1.32 to $1.61 per dollar of new ARR, and the cost to
                expand an existing account climbed from $0.69 to $1.00. The old assumption that
                upsell is nearly free no longer holds — expansion now costs roughly what net-new
                cost two years ago.
              </p>
              <p>
                <strong className="text-foreground">Retention stopped carrying the plan.</strong>{" "}
                Median private-SaaS net revenue retention is 101%, down from about 105% in 2021.
                At 101% NRR, essentially all growth has to come from new logos — so a weak
                acquisition engine shows up in the top line immediately.
              </p>
              <p>
                <strong className="text-foreground">Efficiency beat growth.</strong> Median burn
                multiple fell to 0.80x, meaning the typical company now burns 80 cents to add a
                dollar of ARR. Growth fell to a 27% median while efficiency improved — the market
                repriced capital, and founders responded by spending less, not growing faster.
              </p>
              <p>
                <strong className="text-foreground">Go-to-market motion is worth 14 Rule of 40
                points.</strong>{" "}
                Product-led companies post a Rule of 40 of 34 against 20 for sales-led peers. That
                gap is the single largest structural difference in the dataset.
              </p>
              <p>
                <strong className="text-foreground">A third of startups are close to the
                edge.</strong>{" "}
                Average runway across 800+ venture-backed startups is about 22 months, but one in
                three holds six months or less. Runway is the metric with the widest spread and the
                least margin for error.
              </p>
            </div>
          </section>

          {/* Methodology */}
          <section className="mb-14" aria-labelledby="methodology">
            <h2 id="methodology" className="text-2xl font-display font-bold mb-4">
              Methodology and sources
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              FinalyzeAI does not run its own benchmark survey. Every figure on this page is taken
              from a published third-party dataset and linked to its original report so you can
              check it. Where a source publishes only a directional finding rather than a hard
              number, we leave the metric off this page rather than estimate it. Figures reflect the
              most recent full-year data available at the time of writing.
            </p>
            <ul className="space-y-2">
              {Object.values(SOURCES).map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    {s.name} <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground mt-4">
              Metrics we could not verify to a specific published median — LTV:CAC, per-round
              founder dilution, seed-to-Series-A graduation rate, and median months between rounds —
              are deliberately excluded. This page is informational and is not investment advice.
            </p>
          </section>

          {/* Next steps */}
          <section aria-labelledby="next" className="rounded-2xl border border-border/50 bg-card/60 p-6">
            <h2 id="next" className="text-2xl font-display font-bold mb-3">
              Put your own numbers against these
            </h2>
            <p className="text-muted-foreground mb-5">
              Use the free calculators to produce the inputs, then upload a real statement for a
              full AI-generated analysis.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
              {[
                { to: "/calculators/rule-of-40-calculator", label: "Rule of 40 calculator" },
                { to: "/calculators/burn-rate-runway-calculator", label: "Runway calculator" },
                { to: "/calculators/ltv-cac-ratio-calculator", label: "LTV:CAC calculator" },
                { to: "/calculators/cac-payback-period-calculator", label: "CAC payback calculator" },
              ].map((l) => (
                <Button key={l.to} asChild variant="glass" className="justify-start h-auto py-3">
                  <Link to={l.to}>
                    <Percent className="w-4 h-4" /> {l.label}
                  </Link>
                </Button>
              ))}
            </div>
            <Button asChild variant="hero">
              <Link to="/ai-predict">
                Analyze your statement with AI Predict <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Benchmarks;
