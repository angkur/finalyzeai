import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Trophy } from "lucide-react";
import ShareResult from "@/components/calculators/ShareResult";
import PdfResultCapture from "@/components/calculators/PdfResultCapture";
import { BENCHMARKS } from "@/config/benchmarks";

const get = (id: string) => BENCHMARKS.find((b) => b.id === id)!;

interface Row {
  label: string;
  yours: string;
  median: string;
  verdict: "ahead" | "at" | "behind";
  gap: string;
}

const BenchmarkComparer = () => {
  const [growth, setGrowth] = useState(30);
  const [margin, setMargin] = useState(72);
  const [nrr, setNrr] = useState(98);
  const [profit, setProfit] = useState(-15);
  const [burn, setBurn] = useState(1.4);

  const rows: Row[] = useMemo(() => {
    const judge = (yours: number, median: number, higherIsBetter: boolean): Row["verdict"] => {
      const diff = ((yours - median) / Math.abs(median)) * 100;
      if (Math.abs(diff) < 5) return "at";
      return higherIsBetter ? (diff > 0 ? "ahead" : "behind") : diff > 0 ? "behind" : "ahead";
    };

    const rule40 = growth + profit;

    return [
      {
        label: "Annual revenue growth",
        yours: `${growth}%`,
        median: get("growth").display,
        verdict: judge(growth, get("growth").value, true),
        gap: `${growth - get("growth").value > 0 ? "+" : ""}${(growth - get("growth").value).toFixed(0)} pts vs median`,
      },
      {
        label: "Gross margin",
        yours: `${margin}%`,
        median: get("gross-margin").display,
        verdict: judge(margin, get("gross-margin").value, true),
        gap: `${margin - 79 > 0 ? "+" : ""}${(margin - 79).toFixed(0)} pts vs median`,
      },
      {
        label: "Net revenue retention",
        yours: `${nrr}%`,
        median: get("nrr").display,
        verdict: judge(nrr, get("nrr").value, true),
        gap: `${nrr - 101 > 0 ? "+" : ""}${(nrr - 101).toFixed(0)} pts vs median`,
      },
      {
        label: "Rule of 40",
        yours: `${rule40.toFixed(0)}`,
        median: `${get("rule40-plg").display} (PLG) / ${get("rule40-sales").display} (sales-led)`,
        verdict: judge(rule40, get("rule40-plg").value, true),
        gap: `${rule40 - 34 > 0 ? "+" : ""}${(rule40 - 34).toFixed(0)} pts vs PLG median`,
      },
      {
        label: "Burn multiple",
        yours: `${burn.toFixed(2)}x`,
        median: get("burn-multiple").display,
        verdict: judge(burn, get("burn-multiple").value, false),
        gap: `${(burn - 0.8).toFixed(2)}x vs median`,
      },
    ];
  }, [growth, margin, nrr, profit, burn]);

  const score = useMemo(() => {
    const points = rows.reduce(
      (acc, r) => acc + (r.verdict === "ahead" ? 20 : r.verdict === "at" ? 12 : 4),
      0,
    );
    return Math.round(points);
  }, [rows]);

  const tone = (v: Row["verdict"]) =>
    v === "ahead" ? "text-primary" : v === "at" ? "text-muted-foreground" : "text-destructive";

  const badge = (v: Row["verdict"]) =>
    v === "ahead" ? "Ahead of median" : v === "at" ? "At median" : "Below median";

  return (
    <div className="rounded-2xl border border-border/50 bg-card/70 backdrop-blur-sm p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
          How do your numbers compare?
        </h2>
        <p className="text-sm text-muted-foreground">
          Enter five numbers and see where you sit against the published medians. Runs entirely in
          your browser — nothing is sent anywhere unless you request the PDF.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="grid grid-cols-2 gap-3 self-start">
          <div>
            <Label className="text-xs">Annual growth (%)</Label>
            <Input type="number" value={growth} onChange={(e) => setGrowth(+e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Gross margin (%)</Label>
            <Input type="number" value={margin} onChange={(e) => setMargin(+e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Net revenue retention (%)</Label>
            <Input type="number" value={nrr} onChange={(e) => setNrr(+e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Profit / FCF margin (%)</Label>
            <Input type="number" value={profit} onChange={(e) => setProfit(+e.target.value)} />
          </div>
          <div className="col-span-2">
            <Label className="text-xs">Burn multiple (net burn ÷ net new ARR)</Label>
            <Input
              type="number"
              step="0.05"
              value={burn}
              onChange={(e) => setBurn(+e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-accent" /> Benchmark score
            </span>
            <span className="font-display text-3xl font-bold text-gradient">{score}/100</span>
          </div>
          <Progress value={score} className="h-1.5 mb-4" />

          <div className="space-y-2.5">
            {rows.map((r) => (
              <div key={r.label} className="border-t border-border/40 pt-2.5">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm text-foreground">{r.label}</span>
                  <span className="font-mono text-sm font-semibold">{r.yours}</span>
                </div>
                <div className="flex items-baseline justify-between gap-3 text-xs">
                  <span className="text-muted-foreground">Median: {r.median}</span>
                  <span className={tone(r.verdict)}>
                    {badge(r.verdict)} · {r.gap}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2">
            <ShareResult
              type="benchmarks"
              params={{ growth, margin, nrr, profit, burn }}
              label="Share my benchmark score"
            />
            <PdfResultCapture
              source="benchmarks"
              title="Startup Benchmark Comparison"
              rows={[
                { label: "Benchmark score", value: `${score}/100` },
                ...rows.map((r) => ({
                  label: r.label,
                  value: `${r.yours} (median ${r.median} — ${badge(r.verdict)})`,
                })),
              ]}
            />
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-col sm:flex-row gap-3">
        <Button asChild variant="hero" className="w-full sm:w-auto">
          <Link to="/ai-predict">
            Benchmark your real statement with AI <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
        <Button asChild variant="glass" className="w-full sm:w-auto">
          <Link to="/calculators">All free calculators</Link>
        </Button>
      </div>
    </div>
  );
};

export default BenchmarkComparer;
