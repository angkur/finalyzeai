import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertTriangle, XCircle, AlertCircle, TrendingUp, Shield, DollarSign } from "lucide-react";

interface RatioEntry {
  name: string;
  value: string;
  benchmark: string;
  rating: "Strong" | "Adequate" | "Weak" | "Critical";
}

interface ScorecardData {
  overallScore: number;
  recommendation: string;
  profitability: RatioEntry[];
  solvency: RatioEntry[];
  cashFlow: RatioEntry[];
  categoryScores: { profitability: number; solvency: number; cashFlow: number };
}

const ratingConfig = {
  Strong: { color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: CheckCircle, barColor: "bg-emerald-500" },
  Adequate: { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: AlertCircle, barColor: "bg-yellow-500" },
  Weak: { color: "bg-orange-500/20 text-orange-400 border-orange-500/30", icon: AlertTriangle, barColor: "bg-orange-500" },
  Critical: { color: "bg-red-500/20 text-red-400 border-red-500/30", icon: XCircle, barColor: "bg-red-500" },
};

function parseScorecard(text: string): ScorecardData | null {
  try {
    const scoreMatch = text.match(/overall.*?(\d{1,3})/i);
    const overallScore = scoreMatch ? parseInt(scoreMatch[1]) : 50;

    const recMatch = text.match(/(APPROVED|CONDITIONAL|DENIED)/i);
    const recommendation = recMatch ? recMatch[1] : "CONDITIONAL";

    const parseTable = (section: string): RatioEntry[] => {
      const entries: RatioEntry[] = [];
      const tableRegex = /\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*(Strong|Adequate|Weak|Critical)\s*\|/gi;
      let match;
      while ((match = tableRegex.exec(section)) !== null) {
        const name = match[1].trim();
        if (name === "Ratio" || name.includes("---")) continue;
        entries.push({
          name,
          value: match[2].trim(),
          benchmark: match[3].trim(),
          rating: match[4].trim() as RatioEntry["rating"],
        });
      }
      return entries;
    };

    const profSection = text.match(/PROFITABILITY RATIOS([\s\S]*?)(?=##|SOLVENCY)/i)?.[1] || "";
    const solvSection = text.match(/SOLVENCY RATIOS([\s\S]*?)(?=##|CASH FLOW)/i)?.[1] || "";
    const cashSection = text.match(/CASH FLOW RATIOS([\s\S]*?)(?=##|CATEGORY)/i)?.[1] || "";

    const catMatch = text.match(/Profitability:\s*(\d+).*?Solvency:\s*(\d+).*?Cash Flow:\s*(\d+)/is);
    const categoryScores = {
      profitability: catMatch ? parseInt(catMatch[1]) : 50,
      solvency: catMatch ? parseInt(catMatch[2]) : 50,
      cashFlow: catMatch ? parseInt(catMatch[3]) : 50,
    };

    const profitability = parseTable(profSection);
    const solvency = parseTable(solvSection);
    const cashFlow = parseTable(cashSection);

    if (profitability.length === 0 && solvency.length === 0 && cashFlow.length === 0) return null;

    return { overallScore, recommendation, profitability, solvency, cashFlow, categoryScores };
  } catch {
    return null;
  }
}

function ScoreGauge({ score, label }: { score: number; label: string }) {
  const color = score >= 75 ? "text-emerald-400" : score >= 50 ? "text-yellow-400" : score >= 25 ? "text-orange-400" : "text-red-400";
  return (
    <div className="flex flex-col items-center gap-1">
      <span className={`text-2xl font-bold ${color}`}>{score}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

function RatioTable({ title, icon: Icon, ratios }: { title: string; icon: React.ElementType; ratios: RatioEntry[] }) {
  if (ratios.length === 0) return null;
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {ratios.map((ratio, i) => {
          const config = ratingConfig[ratio.rating];
          const RatingIcon = config.icon;
          return (
            <div key={i} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{ratio.name}</p>
                <p className="text-xs text-muted-foreground">Benchmark: {ratio.benchmark}</p>
              </div>
              <div className="flex items-center gap-2 ml-2">
                <span className="text-sm font-mono font-semibold">{ratio.value}</span>
                <Badge className={`text-xs ${config.color}`}>
                  <RatingIcon className="w-3 h-3 mr-1" />
                  {ratio.rating}
                </Badge>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

interface FinancialScorecardProps {
  analysisText: string;
}

export default function FinancialScorecard({ analysisText }: FinancialScorecardProps) {
  const data = parseScorecard(analysisText);
  if (!data) return null;

  const recColor = data.recommendation === "APPROVED"
    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    : data.recommendation === "DENIED"
    ? "bg-red-500/20 text-red-400 border-red-500/30"
    : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";

  return (
    <div className="space-y-4 mt-4">
      {/* Overall Score */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/30" />
                  <circle
                    cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="6"
                    strokeDasharray={`${(data.overallScore / 100) * 213.6} 213.6`}
                    strokeLinecap="round"
                    className={data.overallScore >= 70 ? "text-emerald-500" : data.overallScore >= 40 ? "text-yellow-500" : "text-red-500"}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">
                  {data.overallScore}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Eligibility Score</h3>
                <Badge className={recColor}>{data.recommendation}</Badge>
              </div>
            </div>
            <div className="flex gap-6">
              <ScoreGauge score={data.categoryScores.profitability} label="Profitability" />
              <ScoreGauge score={data.categoryScores.solvency} label="Solvency" />
              <ScoreGauge score={data.categoryScores.cashFlow} label="Cash Flow" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ratio Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <RatioTable title="Profitability" icon={TrendingUp} ratios={data.profitability} />
        <RatioTable title="Solvency" icon={Shield} ratios={data.solvency} />
        <RatioTable title="Cash Flow" icon={DollarSign} ratios={data.cashFlow} />
      </div>
    </div>
  );
}

export { parseScorecard };
