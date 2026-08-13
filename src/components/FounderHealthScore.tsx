import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import ShareResult from "@/components/calculators/ShareResult";
import PdfResultCapture from "@/components/calculators/PdfResultCapture";
import UnlockGate from "@/components/calculators/UnlockGate";

const fmt = (n: number, d = 1) =>
  Number.isFinite(n)
    ? n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d })
    : "—";

const FounderHealthScore = () => {
  const [revenue, setRevenue] = useState(20000);
  const [expenses, setExpenses] = useState(35000);
  const [cash, setCash] = useState(300000);
  const [growth, setGrowth] = useState(6);

  const result = useMemo(() => {
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
        ? "Strong — cash and growth both support scaling spend."
        : score >= 50
          ? "Stable, but watch the burn. You have room, not slack."
          : score >= 30
            ? "Fragile — runway or margin needs attention this quarter."
            : "Critical — cash timing is your binding constraint.";

    return { burn, runway, margin, score, verdict };
  }, [revenue, expenses, cash, growth]);

  const tone =
    result.score >= 75 ? "text-primary" : result.score >= 40 ? "text-accent" : "text-destructive";

  return (
    <div className="rounded-2xl border border-border/50 bg-card/70 backdrop-blur-sm p-5 sm:p-6 text-left">
      <div className="mb-5">
        <h2 className="font-display text-xl font-bold text-foreground">
          Free Founder Health Score
        </h2>
        <p className="text-sm text-muted-foreground">
          Four numbers, no signup. The math runs entirely in your browser — we only store your
          email if you ask for the PDF report.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Monthly revenue ($)</Label>
            <Input type="number" value={revenue} onChange={(e) => setRevenue(+e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Monthly expenses ($)</Label>
            <Input type="number" value={expenses} onChange={(e) => setExpenses(+e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Cash on hand ($)</Label>
            <Input type="number" value={cash} onChange={(e) => setCash(+e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Monthly growth (%)</Label>
            <Input type="number" value={growth} onChange={(e) => setGrowth(+e.target.value)} />
          </div>
        </div>

        <div className="rounded-xl border border-border/50 bg-muted/30 p-4 space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Health score</span>
            <span className={`font-display text-3xl font-bold ${tone}`}>{result.score}/100</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Runway</span>
            <span className="font-mono font-semibold">
              {Number.isFinite(result.runway) ? `${fmt(result.runway)} months` : "Unlimited"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Net monthly burn</span>
            <span className="font-mono font-semibold">
              ${fmt(Math.abs(result.burn), 0)}
              {result.burn <= 0 ? " surplus" : ""}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Operating margin</span>
            <span className="font-mono font-semibold">{fmt(result.margin)}%</span>
          </div>
          <p className="text-xs text-muted-foreground border-t border-border/50 pt-3">
            {result.verdict}
          </p>
          <ShareResult
            type="health-score"
            params={{ rev: revenue, exp: expenses, cash, growth }}
            label="Share my score"
          />
          <PdfResultCapture
            source="health-score"
            title="Founder Health Score"
            rows={[
              { label: "Health score", value: `${result.score}/100` },
              { label: "Monthly revenue", value: `$${fmt(revenue, 0)}` },
              { label: "Monthly expenses", value: `$${fmt(expenses, 0)}` },
              { label: "Cash on hand", value: `$${fmt(cash, 0)}` },
              { label: "Monthly growth", value: `${fmt(growth)}%` },
              {
                label: "Runway",
                value: Number.isFinite(result.runway) ? `${fmt(result.runway)} months` : "Unlimited",
              },
              {
                label: "Net monthly burn",
                value: `$${fmt(Math.abs(result.burn), 0)}${result.burn <= 0 ? " surplus" : ""}`,
              },
              { label: "Operating margin", value: `${fmt(result.margin)}%` },
              { label: "Verdict", value: result.verdict },
            ]}
          />
        </div>
      </div>

      <UnlockGate
        source="health-score"
        heading="Your full action plan"
        context={{ revenue, expenses, cash, growth, score: result.score }}
        insights={[
          {
            title: `Cash runway: ${Number.isFinite(result.runway) ? `${fmt(result.runway)} months` : "unlimited"}`,
            detail: Number.isFinite(result.runway)
              ? result.runway < 6
                ? `Under 6 months is a raise-or-cut zone. To reach 12 months at today's burn you need about $${fmt(Math.max(0, result.burn * 12 - cash), 0)} more cash, or you must cut monthly spend to roughly $${fmt(revenue + cash / 12, 0)}.`
                : `You have room to invest. Holding 9 months as a floor, you can deploy about $${fmt(Math.max(0, cash - result.burn * 9), 0)} into growth without touching your safety buffer.`
              : "You are cash-flow positive. Shift the conversation from survival to reinvestment rate: how much of the surplus goes back into acquisition each month.",
          },
          {
            title: `Operating margin: ${fmt(result.margin)}%`,
            detail:
              result.margin < 0
                ? `You lose $${fmt(Math.abs(revenue - expenses), 0)} a month. Breakeven arrives at $${fmt(expenses, 0)} monthly revenue — at ${fmt(growth)}% growth that is roughly ${growth > 0 ? Math.ceil(Math.log(expenses / Math.max(revenue, 1)) / Math.log(1 + growth / 100)) : "∞"} months away if costs stay flat.`
                : `You are profitable at the operating line. Protect it: cap fixed-cost growth below ${fmt(growth)}% per month so margin expands as revenue compounds.`,
          },
          {
            title: `Growth rate: ${fmt(growth)}% monthly`,
            detail: `That compounds to ${fmt((Math.pow(1 + growth / 100, 12) - 1) * 100, 0)}% a year — revenue near $${fmt(revenue * Math.pow(1 + growth / 100, 12), 0)}/mo in 12 months. ${growth < 5 ? "Below 5% monthly, growth is not outrunning burn; fix acquisition before hiring." : "This is healthy; make sure gross margin holds as volume rises."}`,
          },
          {
            title: "Your next 30 days",
            detail:
              result.score >= 75
                ? "Lock in a 12-month plan, formalise monthly reporting, and start tracking CAC payback so spend scales with confidence."
                : result.score >= 50
                  ? "Trim the three largest non-revenue expenses, set a runway floor of 9 months, and review pricing — a 10% price increase adds roughly $" +
                    fmt(revenue * 0.1, 0) +
                    "/mo at zero cost."
                  : "Cut discretionary spend now, extend payment terms with vendors, and prioritise cash-collecting revenue over new product work.",
          },
        ]}
      />


      <div className="mt-5 flex flex-col sm:flex-row gap-3">
        <Button asChild variant="hero" className="w-full sm:w-auto">
          <Link to="/ai-predict">
            Go deeper with a real statement <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
        <Button asChild variant="glass" className="w-full sm:w-auto">
          <Link to="/calculators">All free calculators</Link>
        </Button>
      </div>
    </div>
  );
};

export default FounderHealthScore;
