import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { SlidersHorizontal, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WhatIfModelingProps {
  analysisText: string;
}

interface FinancialInputs {
  revenueChange: number;    // -50% to +100%
  cogsChange: number;       // -30% to +30%
  opexChange: number;       // -30% to +30%
  debtChange: number;       // -50% to +100%
  interestRate: number;     // 2% to 15%
}

interface BaseFinancials {
  revenue: number;
  cogs: number;
  opex: number;
  interestExpense: number;
  totalAssets: number;
  totalLiabilities: number;
  equity: number;
  currentAssets: number;
  currentLiabilities: number;
  longTermDebt: number;
  ocf: number;
  capex: number;
}

function extractBaseFinancials(text: string): BaseFinancials {
  const extract = (patterns: RegExp[]): number => {
    for (const p of patterns) {
      const match = text.match(p);
      if (match) {
        const val = match[1].replace(/,/g, "");
        return parseFloat(val);
      }
    }
    return 0;
  };

  return {
    revenue: extract([/revenue[:\s$]*(\d[\d,]*)/i]) || 25400000,
    cogs: extract([/(?:cost\s*of\s*goods|COGS)[:\s$]*(\d[\d,]*)/i]) || 15240000,
    opex: extract([/operating\s*expense[s]?[:\s$]*(\d[\d,]*)/i]) || 6350000,
    interestExpense: extract([/interest\s*expense[:\s$]*(\d[\d,]*)/i]) || 720000,
    totalAssets: extract([/total\s*assets[:\s$]*(\d[\d,]*)/i]) || 22600000,
    totalLiabilities: extract([/total\s*liabilities[:\s$]*(\d[\d,]*)/i]) || 12600000,
    equity: extract([/(?:shareholders|shareholder'?s?)\s*equity[:\s$]*(\d[\d,]*)/i]) || 10000000,
    currentAssets: extract([/(?:total\s*)?current\s*assets[:\s$]*(\d[\d,]*)/i]) || 11100000,
    currentLiabilities: extract([/(?:total\s*)?current\s*liabilities[:\s$]*(\d[\d,]*)/i]) || 5400000,
    longTermDebt: extract([/long[\s-]*term\s*debt[:\s$]*(\d[\d,]*)/i]) || 7200000,
    ocf: extract([/operating\s*cash\s*flow[:\s$]*(\d[\d,]*)/i]) || 4200000,
    capex: extract([/capital\s*expenditure[s]?[:\s$]*(\d[\d,]*)/i]) || 1800000,
  };
}

function computeRatios(base: BaseFinancials, inputs: FinancialInputs) {
  const revenue = base.revenue * (1 + inputs.revenueChange / 100);
  const cogs = base.cogs * (1 + inputs.cogsChange / 100);
  const opex = base.opex * (1 + inputs.opexChange / 100);
  const debt = base.longTermDebt * (1 + inputs.debtChange / 100);
  const interestExpense = debt * (inputs.interestRate / 100);
  const totalLiabilities = base.currentLiabilities + debt;
  const equity = base.totalAssets - totalLiabilities;

  const grossProfit = revenue - cogs;
  const operatingIncome = grossProfit - opex;
  const netIncome = operatingIncome - interestExpense;
  const ocf = base.ocf * (1 + inputs.revenueChange / 200); // simplified correlation
  const fcf = ocf - base.capex;

  return {
    grossMargin: (grossProfit / revenue) * 100,
    netMargin: (netIncome / revenue) * 100,
    roe: equity > 0 ? (netIncome / equity) * 100 : 0,
    debtToEquity: equity > 0 ? totalLiabilities / equity : 999,
    currentRatio: base.currentLiabilities > 0 ? base.currentAssets / base.currentLiabilities : 0,
    interestCoverage: interestExpense > 0 ? operatingIncome / interestExpense : 999,
    fcfMargin: (fcf / revenue) * 100,
    revenue,
    netIncome,
    fcf,
  };
}

function MetricCard({ label, value, unit, baseValue, isInverse }: {
  label: string; value: number; unit: string; baseValue: number; isInverse?: boolean;
}) {
  const diff = value - baseValue;
  const improved = isInverse ? diff < 0 : diff > 0;
  const formatVal = unit === "$" 
    ? `$${(value / 1000000).toFixed(1)}M` 
    : unit === "x" 
    ? value.toFixed(2) + "x" 
    : value.toFixed(1) + "%";

  return (
    <div className="p-3 rounded-xl bg-secondary/40 border border-border/30">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-lg font-bold text-foreground">{formatVal}</p>
      <div className={`flex items-center gap-1 text-xs mt-1 ${improved ? "text-emerald-400" : diff === 0 ? "text-muted-foreground" : "text-red-400"}`}>
        {diff !== 0 && (improved ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />)}
        {unit === "$" 
          ? `${diff >= 0 ? "+" : ""}$${(diff / 1000000).toFixed(1)}M`
          : unit === "x" 
          ? `${diff >= 0 ? "+" : ""}${diff.toFixed(2)}`
          : `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}pp`}
      </div>
    </div>
  );
}

export default function WhatIfModeling({ analysisText }: WhatIfModelingProps) {
  const base = useMemo(() => extractBaseFinancials(analysisText), [analysisText]);
  
  const [inputs, setInputs] = useState<FinancialInputs>({
    revenueChange: 0,
    cogsChange: 0,
    opexChange: 0,
    debtChange: 0,
    interestRate: base.longTermDebt > 0 ? (base.interestExpense / base.longTermDebt) * 100 : 5,
  });

  const baseRatios = useMemo(() => computeRatios(base, { revenueChange: 0, cogsChange: 0, opexChange: 0, debtChange: 0, interestRate: base.longTermDebt > 0 ? (base.interestExpense / base.longTermDebt) * 100 : 5 }), [base]);
  const currentRatios = useMemo(() => computeRatios(base, inputs), [base, inputs]);

  const resetSliders = () => setInputs({
    revenueChange: 0, cogsChange: 0, opexChange: 0, debtChange: 0,
    interestRate: base.longTermDebt > 0 ? (base.interestExpense / base.longTermDebt) * 100 : 5,
  });

  const sliders = [
    { key: "revenueChange" as const, label: "Revenue Growth", min: -50, max: 100, step: 5, unit: "%" },
    { key: "cogsChange" as const, label: "COGS Change", min: -30, max: 30, step: 5, unit: "%" },
    { key: "opexChange" as const, label: "OpEx Change", min: -30, max: 30, step: 5, unit: "%" },
    { key: "debtChange" as const, label: "Debt Change", min: -50, max: 100, step: 10, unit: "%" },
    { key: "interestRate" as const, label: "Interest Rate", min: 2, max: 15, step: 0.5, unit: "%" },
  ];

  return (
    <div className="space-y-4 mt-4">
      <Card className="border-accent/20 bg-gradient-to-r from-accent/5 to-transparent">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-accent" />
              What-If Scenario Modeling
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={resetSliders} className="h-7 text-xs gap-1">
              <RefreshCw className="w-3 h-3" /> Reset
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Adjust variables to see real-time impact on financial ratios</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sliders.map((s) => (
              <div key={s.key} className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-medium text-foreground">{s.label}</label>
                  <Badge variant="outline" className={`text-xs font-mono ${
                    inputs[s.key] > 0 ? "text-emerald-400 border-emerald-400/30" :
                    inputs[s.key] < 0 ? "text-red-400 border-red-400/30" :
                    "text-muted-foreground"
                  }`}>
                    {inputs[s.key] > 0 ? "+" : ""}{inputs[s.key]}{s.unit}
                  </Badge>
                </div>
                <Slider
                  value={[inputs[s.key]]}
                  min={s.min}
                  max={s.max}
                  step={s.step}
                  onValueChange={([val]) => setInputs((prev) => ({ ...prev, [s.key]: val }))}
                />
              </div>
            ))}
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <MetricCard label="Gross Margin" value={currentRatios.grossMargin} unit="%" baseValue={baseRatios.grossMargin} />
            <MetricCard label="Net Margin" value={currentRatios.netMargin} unit="%" baseValue={baseRatios.netMargin} />
            <MetricCard label="ROE" value={currentRatios.roe} unit="%" baseValue={baseRatios.roe} />
            <MetricCard label="Debt/Equity" value={currentRatios.debtToEquity} unit="x" baseValue={baseRatios.debtToEquity} isInverse />
            <MetricCard label="Interest Coverage" value={currentRatios.interestCoverage} unit="x" baseValue={baseRatios.interestCoverage} />
            <MetricCard label="FCF Margin" value={currentRatios.fcfMargin} unit="%" baseValue={baseRatios.fcfMargin} />
            <MetricCard label="Revenue" value={currentRatios.revenue} unit="$" baseValue={baseRatios.revenue} />
            <MetricCard label="Net Income" value={currentRatios.netIncome} unit="$" baseValue={baseRatios.netIncome} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
