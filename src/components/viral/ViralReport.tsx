import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface HealthScoreData {
  score: number;
  runway: number;
  burn: number;
  margin: number;
  growth: number;
  revenue: number;
  expenses: number;
  cash: number;
  verdict: string;
}

export interface BenchmarkRow {
  label: string;
  yours: string;
  median: string;
  verdict: "ahead" | "at" | "behind";
  gap: string;
}

export interface BenchmarkData {
  score: number;
  rows: BenchmarkRow[];
}

interface ViralReportProps {
  variant: "health-score" | "benchmarks";
  source: string;
  data: HealthScoreData | BenchmarkData;
}

const emailSchema = z
  .string()
  .trim()
  .min(5, { message: "Enter a valid email address" })
  .max(255, { message: "Email must be less than 255 characters" })
  .email({ message: "Enter a valid email address" });

const fmt = (n: number, d = 1) =>
  Number.isFinite(n)
    ? n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d })
    : "—";

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const scoreColor = (score: number) => {
  if (score >= 75) return "#22d3ee"; // cyan-400
  if (score >= 50) return "#facc15"; // yellow-400
  return "#f87171"; // red-400
};

const verdictBadge = (verdict: BenchmarkRow["verdict"]) => {
  if (verdict === "ahead") return { label: "Ahead", color: "#22d3ee" };
  if (verdict === "at") return { label: "At median", color: "#94a3b8" };
  return { label: "Below", color: "#f87171" };
};

const buildHealthScoreReport = (data: HealthScoreData) => {
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const color = scoreColor(data.score);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FinalyzeAI — Founder Health Score</title>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: #0b0f1a;
      color: #f8fafc;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 14mm;
      margin: 0 auto;
      background: radial-gradient(circle at 30% 20%, rgba(34, 211, 238, 0.08) 0%, transparent 40%),
                  radial-gradient(circle at 80% 80%, rgba(250, 204, 21, 0.06) 0%, transparent 40%),
                  linear-gradient(180deg, #0b0f1a 0%, #0f172a 100%);
      position: relative;
      overflow: hidden;
    }
    .grid {
      position: absolute;
      inset: 0;
      background-image: linear-gradient(rgba(148, 163, 184, 0.04) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(148, 163, 184, 0.04) 1px, transparent 1px);
      background-size: 24px 24px;
      pointer-events: none;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 18mm;
    }
    .logo {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: linear-gradient(135deg, #22d3ee 0%, #0ea5e9 100%);
      display: grid;
      place-items: center;
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 700;
      font-size: 18px;
      color: #0b0f1a;
    }
    .brand-name {
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 700;
      font-size: 22px;
      letter-spacing: -0.02em;
    }
    .badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 999px;
      background: rgba(34, 211, 238, 0.12);
      border: 1px solid rgba(34, 211, 238, 0.25);
      color: #22d3ee;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 14px;
    }
    h1 {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 38px;
      font-weight: 700;
      line-height: 1.1;
      margin: 0 0 8px;
      letter-spacing: -0.03em;
    }
    .subtitle {
      color: #94a3b8;
      font-size: 14px;
      max-width: 380px;
      line-height: 1.5;
      margin-bottom: 28px;
    }
    .score-ring {
      width: 180px;
      height: 180px;
      border-radius: 50%;
      background: conic-gradient(${color} ${data.score * 3.6}deg, rgba(148, 163, 184, 0.12) 0deg);
      display: grid;
      place-items: center;
      margin-bottom: 32px;
      position: relative;
    }
    .score-ring::before {
      content: '';
      position: absolute;
      width: 150px;
      height: 150px;
      border-radius: 50%;
      background: #0f172a;
    }
    .score-inner {
      position: relative;
      text-align: center;
    }
    .score-number {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 48px;
      font-weight: 700;
      color: ${color};
      line-height: 1;
    }
    .score-label {
      font-size: 11px;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-top: 4px;
    }
    .metrics {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
      margin-bottom: 28px;
    }
    .metric-card {
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid rgba(148, 163, 184, 0.12);
      border-radius: 14px;
      padding: 16px;
    }
    .metric-label {
      font-size: 11px;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 6px;
    }
    .metric-value {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 22px;
      font-weight: 600;
      color: #f8fafc;
    }
    .verdict-box {
      background: rgba(34, 211, 238, 0.06);
      border-left: 3px solid ${color};
      border-radius: 0 14px 14px 0;
      padding: 18px 20px;
      margin-bottom: 32px;
    }
    .verdict-title {
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 600;
      font-size: 15px;
      margin-bottom: 6px;
      color: #f8fafc;
    }
    .verdict-text {
      font-size: 13px;
      color: #cbd5e1;
      line-height: 1.6;
    }
    .cta {
      background: linear-gradient(135deg, rgba(34, 211, 238, 0.12) 0%, rgba(14, 165, 233, 0.08) 100%);
      border: 1px solid rgba(34, 211, 238, 0.2);
      border-radius: 16px;
      padding: 22px;
      text-align: center;
    }
    .cta-title {
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 600;
      font-size: 18px;
      margin-bottom: 6px;
    }
    .cta-url {
      font-size: 15px;
      color: #22d3ee;
      font-weight: 600;
      word-break: break-all;
    }
    .footer {
      position: absolute;
      bottom: 14mm;
      left: 14mm;
      right: 14mm;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      color: #64748b;
      border-top: 1px solid rgba(148, 163, 184, 0.1);
      padding-top: 12px;
    }
    @media print {
      body { background: #0b0f1a; }
      .page { margin: 0; width: 100%; min-height: 100vh; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="grid"></div>
    <div class="brand">
      <div class="logo">F</div>
      <div class="brand-name">FinalyzeAI</div>
    </div>
    <span class="badge">Founder Health Score</span>
    <h1>How healthy is your startup?</h1>
    <p class="subtitle">Generated from four numbers — no signup required. Run your own at finalyzeai.com.</p>

    <div class="score-ring">
      <div class="score-inner">
        <div class="score-number">${data.score}</div>
        <div class="score-label">out of 100</div>
      </div>
    </div>

    <div class="metrics">
      <div class="metric-card">
        <div class="metric-label">Cash runway</div>
        <div class="metric-value">${Number.isFinite(data.runway) ? `${fmt(data.runway)} months` : "Unlimited"}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Net monthly burn</div>
        <div class="metric-value">$${fmt(Math.abs(data.burn), 0)}${data.burn <= 0 ? " surplus" : ""}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Operating margin</div>
        <div class="metric-value">${fmt(data.margin)}%</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Monthly growth</div>
        <div class="metric-value">${fmt(data.growth)}%</div>
      </div>
    </div>

    <div class="verdict-box">
      <div class="verdict-title">Verdict</div>
      <div class="verdict-text">${escapeHtml(data.verdict)}</div>
    </div>

    <div class="cta">
      <div class="cta-title">Run this on your own numbers</div>
      <div class="cta-url">finalyzeai.com</div>
    </div>

    <div class="footer">
      <span>Generated ${date}</span>
      <span>For informational purposes only — not financial advice.</span>
    </div>
  </div>
  <script>window.onload = function() { setTimeout(function() { window.print(); }, 400); };</script>
</body>
</html>`;
};

const buildBenchmarkReport = (data: BenchmarkData) => {
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const color = scoreColor(data.score);

  const rowsHtml = data.rows
    .map((r) => {
      const badge = verdictBadge(r.verdict);
      return `
        <tr>
          <td style="padding:14px 0;border-bottom:1px solid rgba(148,163,184,0.12);">
            <div style="font-size:13px;font-weight:600;color:#f8fafc;">${escapeHtml(r.label)}</div>
            <div style="font-size:11px;color:#94a3b8;">Median: ${escapeHtml(r.median)}</div>
          </td>
          <td style="padding:14px 0;border-bottom:1px solid rgba(148,163,184,0.12);text-align:right;font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:600;color:#f8fafc;">${escapeHtml(r.yours)}</td>
          <td style="padding:14px 0;border-bottom:1px solid rgba(148,163,184,0.12);text-align:right;">
            <span style="display:inline-block;padding:4px 10px;border-radius:999px;background:${badge.color}15;color:${badge.color};font-size:11px;font-weight:600;">${badge.label}</span>
          </td>
        </tr>
      `;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FinalyzeAI — 2026 Startup Benchmark Score</title>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: #0b0f1a;
      color: #f8fafc;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 14mm;
      margin: 0 auto;
      background: radial-gradient(circle at 30% 20%, rgba(34, 211, 238, 0.08) 0%, transparent 40%),
                  radial-gradient(circle at 80% 80%, rgba(250, 204, 21, 0.06) 0%, transparent 40%),
                  linear-gradient(180deg, #0b0f1a 0%, #0f172a 100%);
      position: relative;
      overflow: hidden;
    }
    .grid {
      position: absolute;
      inset: 0;
      background-image: linear-gradient(rgba(148, 163, 184, 0.04) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(148, 163, 184, 0.04) 1px, transparent 1px);
      background-size: 24px 24px;
      pointer-events: none;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 14mm;
    }
    .logo {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: linear-gradient(135deg, #22d3ee 0%, #0ea5e9 100%);
      display: grid;
      place-items: center;
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 700;
      font-size: 18px;
      color: #0b0f1a;
    }
    .brand-name {
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 700;
      font-size: 22px;
      letter-spacing: -0.02em;
    }
    .badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 999px;
      background: rgba(250, 204, 21, 0.12);
      border: 1px solid rgba(250, 204, 21, 0.25);
      color: #facc15;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 14px;
    }
    h1 {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 34px;
      font-weight: 700;
      line-height: 1.1;
      margin: 0 0 8px;
      letter-spacing: -0.03em;
    }
    .subtitle {
      color: #94a3b8;
      font-size: 14px;
      max-width: 420px;
      line-height: 1.5;
      margin-bottom: 24px;
    }
    .score-ring {
      width: 160px;
      height: 160px;
      border-radius: 50%;
      background: conic-gradient(${color} ${data.score * 3.6}deg, rgba(148, 163, 184, 0.12) 0deg);
      display: grid;
      place-items: center;
      margin-bottom: 28px;
      position: relative;
    }
    .score-ring::before {
      content: '';
      position: absolute;
      width: 132px;
      height: 132px;
      border-radius: 50%;
      background: #0f172a;
    }
    .score-inner {
      position: relative;
      text-align: center;
    }
    .score-number {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 42px;
      font-weight: 700;
      color: ${color};
      line-height: 1;
    }
    .score-label {
      font-size: 11px;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-top: 4px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 28px;
    }
    .cta {
      background: linear-gradient(135deg, rgba(250, 204, 21, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%);
      border: 1px solid rgba(250, 204, 21, 0.2);
      border-radius: 16px;
      padding: 22px;
      text-align: center;
    }
    .cta-title {
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 600;
      font-size: 18px;
      margin-bottom: 6px;
    }
    .cta-url {
      font-size: 15px;
      color: #facc15;
      font-weight: 600;
      word-break: break-all;
    }
    .footer {
      position: absolute;
      bottom: 14mm;
      left: 14mm;
      right: 14mm;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      color: #64748b;
      border-top: 1px solid rgba(148, 163, 184, 0.1);
      padding-top: 12px;
    }
    @media print {
      body { background: #0b0f1a; }
      .page { margin: 0; width: 100%; min-height: 100vh; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="grid"></div>
    <div class="brand">
      <div class="logo">F</div>
      <div class="brand-name">FinalyzeAI</div>
    </div>
    <span class="badge">2026 Startup Benchmarks</span>
    <h1>How does your startup compare?</h1>
    <p class="subtitle">Scored against published 2026 SaaS medians. Sources linked at finalyzeai.com/benchmarks.</p>

    <div class="score-ring">
      <div class="score-inner">
        <div class="score-number">${data.score}</div>
        <div class="score-label">benchmark score</div>
      </div>
    </div>

    <table>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    <div class="cta">
      <div class="cta-title">Compare your own numbers</div>
      <div class="cta-url">finalyzeai.com/benchmarks</div>
    </div>

    <div class="footer">
      <span>Generated ${date}</span>
      <span>For informational purposes only — not financial advice.</span>
    </div>
  </div>
  <script>window.onload = function() { setTimeout(function() { window.print(); }, 400); };</script>
</body>
</html>`;
};

const ViralReport = ({ variant, source, data }: ViralReportProps) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      const summary =
        variant === "health-score"
          ? { score: (data as HealthScoreData).score, verdict: (data as HealthScoreData).verdict }
          : { score: (data as BenchmarkData).score };

      const { error } = await supabase.from("email_leads").insert({
        email: parsed.data.toLowerCase(),
        source: `viral-${source}`,
        result_summary: summary as unknown as never,
        page_path: window.location.pathname,
      } as never);
      if (error) throw error;

      const html =
        variant === "health-score"
          ? buildHealthScoreReport(data as HealthScoreData)
          : buildBenchmarkReport(data as BenchmarkData);

      const win = window.open("", "_blank");
      if (win) {
        win.document.write(html);
        win.document.close();
        toast.success("Branded report opened — save it as PDF and share it.");
      } else {
        const blob = new Blob([html], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `finalyzeai-${source}-report.html`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Report downloaded — open it and print to PDF.");
      }
      setDone(true);
    } catch (err) {
      console.error("Viral report failed:", err);
      toast.error("Could not generate the report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2.5 text-sm">
        <CheckCircle className="w-4 h-4 text-primary shrink-0" />
        <span className="text-foreground">
          Report generated. Share the PDF on LinkedIn — tag us at finalyzeai.com.
        </span>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-2 rounded-xl border border-border/50 bg-gradient-card p-4"
    >
      <div className="flex items-center gap-2 mb-1">
        <Download className="w-4 h-4 text-primary" />
        <p className="text-sm font-semibold text-foreground">Get the shareable report</p>
      </div>
      <p className="text-xs text-muted-foreground">
        A branded one-page PDF with your numbers — built for LinkedIn/Twitter screenshots.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          type="email"
          inputMode="email"
          autoComplete="email"
          maxLength={255}
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-10 text-sm"
          required
        />
        <Button type="submit" size="sm" className="h-10 gap-1.5 shrink-0" disabled={loading}>
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
          Download PDF
        </Button>
      </div>
      <p className="text-[11px] leading-snug text-muted-foreground">
        We&apos;ll email you occasional founder finance tips. Unsubscribe anytime.
      </p>
    </form>
  );;
};

export default ViralReport;
