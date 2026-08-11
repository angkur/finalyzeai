import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ShareResult from "@/components/calculators/ShareResult";

const fmt = (n: number, d = 2) =>
  isFinite(n)
    ? n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d })
    : "—";
const fmtMoney = (n: number) => (isFinite(n) ? `$${fmt(n, 2)}` : "—");

/* ----------------------------- DCF Calculator ----------------------------- */
export const DCFCalc = () => {
  const [fcf, setFcf] = useState(1000000);
  const [growth, setGrowth] = useState(10);
  const [years, setYears] = useState(5);
  const [wacc, setWacc] = useState(10);
  const [terminalGrowth, setTerminalGrowth] = useState(2.5);

  const result = useMemo(() => {
    const flows: { year: number; fcf: number; pv: number }[] = [];
    let total = 0;
    let lastFcf = fcf;
    for (let y = 1; y <= years; y++) {
      lastFcf = fcf * Math.pow(1 + growth / 100, y);
      const pv = lastFcf / Math.pow(1 + wacc / 100, y);
      total += pv;
      flows.push({ year: y, fcf: lastFcf, pv });
    }
    const tv = (lastFcf * (1 + terminalGrowth / 100)) / (wacc / 100 - terminalGrowth / 100);
    const pvTv = tv / Math.pow(1 + wacc / 100, years);
    const enterprise = total + pvTv;
    return { flows, total, tv, pvTv, enterprise };
  }, [fcf, growth, years, wacc, terminalGrowth]);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <Label>Year 1 Free Cash Flow ($)</Label>
          <Input type="number" value={fcf} onChange={(e) => setFcf(+e.target.value)} />
        </div>
        <div>
          <Label>Annual FCF Growth Rate (%)</Label>
          <Input type="number" value={growth} onChange={(e) => setGrowth(+e.target.value)} />
        </div>
        <div>
          <Label>Projection Years</Label>
          <Input type="number" value={years} onChange={(e) => setYears(+e.target.value)} />
        </div>
        <div>
          <Label>Discount Rate / WACC (%)</Label>
          <Input type="number" value={wacc} onChange={(e) => setWacc(+e.target.value)} />
        </div>
        <div>
          <Label>Terminal Growth Rate (%)</Label>
          <Input type="number" value={terminalGrowth} onChange={(e) => setTerminalGrowth(+e.target.value)} />
        </div>
      </div>
      <div className="space-y-3 p-5 rounded-xl bg-muted/30 border border-border/50">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">PV of Forecast Period</span>
          <span className="font-mono font-semibold">{fmtMoney(result.total)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Terminal Value (raw)</span>
          <span className="font-mono">{fmtMoney(result.tv)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">PV of Terminal Value</span>
          <span className="font-mono font-semibold">{fmtMoney(result.pvTv)}</span>
        </div>
        <div className="border-t border-border/50 pt-3 flex justify-between">
          <span className="font-semibold">Enterprise Value</span>
          <span className="font-mono text-lg font-bold text-primary">{fmtMoney(result.enterprise)}</span>
        </div>
        <p className="text-xs text-muted-foreground pt-2">
          Note: Terminal value typically represents 60–80% of total enterprise value. If your
          WACC ≤ terminal growth, the formula breaks down — adjust assumptions.
        </p>
        <ShareResult
          type="dcf"
          params={{ ev: Math.round(result.enterprise), fcf, g: growth, wacc, y: years }}
        />
        <PdfResultCapture
          source="dcf"
          title="DCF Valuation"
          rows={[
            { label: "Free cash flow (year 1)", value: fmtMoney(fcf) },
            { label: "Growth rate", value: `${growth}%` },
            { label: "WACC (discount rate)", value: `${wacc}%` },
            { label: "Forecast period", value: `${years} years` },
            { label: "PV of forecast period", value: fmtMoney(result.total) },
            { label: "PV of terminal value", value: fmtMoney(result.pvTv) },
            { label: "Enterprise value", value: fmtMoney(result.enterprise) },
          ]}
          note="Terminal value typically represents 60–80% of total enterprise value. If WACC is at or below terminal growth, the formula breaks down."
        />
      </div>
    </div>
  );
};

/* ----------------------------- ROI Calculator ----------------------------- */
export const ROICalc = () => {
  const [investment, setInvestment] = useState(10000);
  const [finalValue, setFinalValue] = useState(15000);
  const [yearsHeld, setYearsHeld] = useState(3);

  const profit = finalValue - investment;
  const roi = (profit / investment) * 100;
  const annualized = (Math.pow(finalValue / investment, 1 / yearsHeld) - 1) * 100;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <Label>Initial Investment ($)</Label>
          <Input type="number" value={investment} onChange={(e) => setInvestment(+e.target.value)} />
        </div>
        <div>
          <Label>Final Value ($)</Label>
          <Input type="number" value={finalValue} onChange={(e) => setFinalValue(+e.target.value)} />
        </div>
        <div>
          <Label>Years Held</Label>
          <Input type="number" value={yearsHeld} onChange={(e) => setYearsHeld(+e.target.value)} />
        </div>
      </div>
      <div className="space-y-3 p-5 rounded-xl bg-muted/30 border border-border/50">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total Profit</span>
          <span className={`font-mono font-semibold ${profit >= 0 ? "text-primary" : "text-destructive"}`}>
            {fmtMoney(profit)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total ROI</span>
          <span className="font-mono font-semibold">{fmt(roi)}%</span>
        </div>
        <div className="border-t border-border/50 pt-3 flex justify-between">
          <span className="font-semibold">Annualized Return (CAGR)</span>
          <span className="font-mono text-lg font-bold text-primary">{fmt(annualized)}%</span>
        </div>
        <p className="text-xs text-muted-foreground pt-2">
          Use annualized (CAGR) when comparing investments held for different time periods. A
          15% one-year return beats a 30% three-year return.
        </p>
      </div>
    </div>
  );
};

/* ----------------------------- Loan / Mortgage ----------------------------- */
export const LoanCalc = () => {
  const [principal, setPrincipal] = useState(250000);
  const [rate, setRate] = useState(6.5);
  const [termYears, setTermYears] = useState(30);

  const r = rate / 100 / 12;
  const n = termYears * 12;
  const monthly = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const totalPaid = monthly * n;
  const totalInterest = totalPaid - principal;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <Label>Loan Amount ($)</Label>
          <Input type="number" value={principal} onChange={(e) => setPrincipal(+e.target.value)} />
        </div>
        <div>
          <Label>Annual Interest Rate (%)</Label>
          <Input type="number" step="0.01" value={rate} onChange={(e) => setRate(+e.target.value)} />
        </div>
        <div>
          <Label>Term (Years)</Label>
          <Input type="number" value={termYears} onChange={(e) => setTermYears(+e.target.value)} />
        </div>
      </div>
      <div className="space-y-3 p-5 rounded-xl bg-muted/30 border border-border/50">
        <div className="flex justify-between">
          <span className="font-semibold">Monthly Payment</span>
          <span className="font-mono text-lg font-bold text-primary">{fmtMoney(monthly)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total Paid Over Term</span>
          <span className="font-mono">{fmtMoney(totalPaid)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total Interest Paid</span>
          <span className="font-mono font-semibold text-destructive">{fmtMoney(totalInterest)}</span>
        </div>
        <p className="text-xs text-muted-foreground pt-2">
          Standard amortizing-loan formula. Doesn't include taxes, insurance, PMI, or
          origination fees. Use for mortgages, auto loans, and business term loans.
        </p>
      </div>
    </div>
  );
};

/* ----------------------------- Break-Even ----------------------------- */
export const BreakEvenCalc = () => {
  const [fixed, setFixed] = useState(50000);
  const [price, setPrice] = useState(100);
  const [variable, setVariable] = useState(40);

  const contribution = price - variable;
  const units = fixed / contribution;
  const revenue = units * price;
  const margin = (contribution / price) * 100;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <Label>Fixed Costs ($)</Label>
          <Input type="number" value={fixed} onChange={(e) => setFixed(+e.target.value)} />
        </div>
        <div>
          <Label>Price per Unit ($)</Label>
          <Input type="number" value={price} onChange={(e) => setPrice(+e.target.value)} />
        </div>
        <div>
          <Label>Variable Cost per Unit ($)</Label>
          <Input type="number" value={variable} onChange={(e) => setVariable(+e.target.value)} />
        </div>
      </div>
      <div className="space-y-3 p-5 rounded-xl bg-muted/30 border border-border/50">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Contribution Margin / Unit</span>
          <span className="font-mono font-semibold">{fmtMoney(contribution)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Contribution Margin %</span>
          <span className="font-mono">{fmt(margin)}%</span>
        </div>
        <div className="border-t border-border/50 pt-3 flex justify-between">
          <span className="font-semibold">Break-Even Units</span>
          <span className="font-mono text-lg font-bold text-primary">{fmt(units, 0)}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Break-Even Revenue</span>
          <span className="font-mono text-lg font-bold text-primary">{fmtMoney(revenue)}</span>
        </div>
        <p className="text-xs text-muted-foreground pt-2">
          The break-even point is where total revenue equals total costs. Anything above is
          profit. If contribution margin is negative, you can't break even — re-price or
          re-engineer cost.
        </p>
        <ShareResult type="break-even" params={{ fixed, price, var: variable }} />
        <PdfResultCapture
          source="break-even"
          title="Break-Even Analysis"
          rows={[
            { label: "Fixed costs", value: fmtMoney(fixed) },
            { label: "Price per unit", value: fmtMoney(price) },
            { label: "Variable cost per unit", value: fmtMoney(variable) },
            { label: "Break-even units", value: fmt(units, 0) },
            { label: "Break-even revenue", value: fmtMoney(revenue) },
          ]}
        />
      </div>
    </div>
  );
};

/* ----------------------------- Burn Rate / Runway ----------------------------- */
export const RunwayCalc = () => {
  const [cash, setCash] = useState(500000);
  const [monthlyRevenue, setMonthlyRevenue] = useState(20000);
  const [monthlyExpenses, setMonthlyExpenses] = useState(80000);

  const burn = monthlyExpenses - monthlyRevenue;
  const runwayMonths = burn > 0 ? cash / burn : Infinity;
  const breakEvenGrowth = monthlyRevenue > 0 ? Math.pow(monthlyExpenses / monthlyRevenue, 1 / 12) - 1 : 0;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <Label>Cash on Hand ($)</Label>
          <Input type="number" value={cash} onChange={(e) => setCash(+e.target.value)} />
        </div>
        <div>
          <Label>Monthly Revenue ($)</Label>
          <Input type="number" value={monthlyRevenue} onChange={(e) => setMonthlyRevenue(+e.target.value)} />
        </div>
        <div>
          <Label>Monthly Expenses ($)</Label>
          <Input type="number" value={monthlyExpenses} onChange={(e) => setMonthlyExpenses(+e.target.value)} />
        </div>
      </div>
      <div className="space-y-3 p-5 rounded-xl bg-muted/30 border border-border/50">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Net Monthly Burn</span>
          <span className={`font-mono font-semibold ${burn > 0 ? "text-destructive" : "text-primary"}`}>
            {fmtMoney(burn)}
          </span>
        </div>
        <div className="border-t border-border/50 pt-3 flex justify-between">
          <span className="font-semibold">Runway</span>
          <span className="font-mono text-lg font-bold text-primary">
            {isFinite(runwayMonths) ? `${fmt(runwayMonths, 1)} months` : "∞ (cash flow positive)"}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Required monthly growth to break even in 12mo</span>
          <span className="font-mono">{burn > 0 ? `${fmt(breakEvenGrowth * 100)}%` : "—"}</span>
        </div>
        <p className="text-xs text-muted-foreground pt-2">
          Most VCs want 18–24 months of runway after a round closes. Below 6 months is the
          danger zone — start fundraising 9+ months before zero.
        </p>
        <ShareResult
          type="runway"
          params={{ cash, rev: monthlyRevenue, exp: monthlyExpenses }}
        />
        <PdfResultCapture
          source="runway"
          title="Burn Rate & Runway"
          rows={[
            { label: "Cash on hand", value: fmtMoney(cash) },
            { label: "Monthly revenue", value: fmtMoney(monthlyRevenue) },
            { label: "Monthly expenses", value: fmtMoney(monthlyExpenses) },
            { label: "Net monthly burn", value: fmtMoney(burn) },
            {
              label: "Runway",
              value: isFinite(runwayMonths) ? `${fmt(runwayMonths, 1)} months` : "Cash flow positive",
            },
          ]}
          note="Most investors want 18–24 months of runway after a round closes. Below 6 months, start fundraising immediately."
        />
      </div>
    </div>
  );
};

/* ----------------------------- Financial Ratios ----------------------------- */
export const RatiosCalc = () => {
  const [revenue, setRevenue] = useState(1000000);
  const [netIncome, setNetIncome] = useState(120000);
  const [currentAssets, setCurrentAssets] = useState(400000);
  const [currentLiab, setCurrentLiab] = useState(200000);
  const [inventory, setInventory] = useState(50000);
  const [totalDebt, setTotalDebt] = useState(300000);
  const [equity, setEquity] = useState(600000);
  const [totalAssets, setTotalAssets] = useState(900000);

  const ratios = {
    netMargin: (netIncome / revenue) * 100,
    current: currentAssets / currentLiab,
    quick: (currentAssets - inventory) / currentLiab,
    debtEquity: totalDebt / equity,
    debtAssets: (totalDebt / totalAssets) * 100,
    roe: (netIncome / equity) * 100,
    roa: (netIncome / totalAssets) * 100,
    assetTurnover: revenue / totalAssets,
  };

  const Row = ({ label, value, hint, suffix = "" }: { label: string; value: number; hint: string; suffix?: string }) => (
    <div className="flex justify-between items-baseline gap-4 py-2 border-b border-border/30 last:border-0">
      <div className="min-w-0">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{hint}</div>
      </div>
      <span className="font-mono font-semibold whitespace-nowrap">
        {fmt(value)}{suffix}
      </span>
    </div>
  );

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Revenue</Label><Input type="number" value={revenue} onChange={(e) => setRevenue(+e.target.value)} /></div>
          <div><Label>Net Income</Label><Input type="number" value={netIncome} onChange={(e) => setNetIncome(+e.target.value)} /></div>
          <div><Label>Current Assets</Label><Input type="number" value={currentAssets} onChange={(e) => setCurrentAssets(+e.target.value)} /></div>
          <div><Label>Current Liabilities</Label><Input type="number" value={currentLiab} onChange={(e) => setCurrentLiab(+e.target.value)} /></div>
          <div><Label>Inventory</Label><Input type="number" value={inventory} onChange={(e) => setInventory(+e.target.value)} /></div>
          <div><Label>Total Debt</Label><Input type="number" value={totalDebt} onChange={(e) => setTotalDebt(+e.target.value)} /></div>
          <div><Label>Equity</Label><Input type="number" value={equity} onChange={(e) => setEquity(+e.target.value)} /></div>
          <div><Label>Total Assets</Label><Input type="number" value={totalAssets} onChange={(e) => setTotalAssets(+e.target.value)} /></div>
        </div>
      </div>
      <div className="p-5 rounded-xl bg-muted/30 border border-border/50">
        <Row label="Net Profit Margin" value={ratios.netMargin} suffix="%" hint="Healthy: >10% (industry-dependent)" />
        <Row label="Current Ratio" value={ratios.current} hint="Healthy: 1.5–3.0" />
        <Row label="Quick Ratio (Acid Test)" value={ratios.quick} hint="Healthy: >1.0" />
        <Row label="Debt-to-Equity" value={ratios.debtEquity} hint="Healthy: <1.5 for most industries" />
        <Row label="Debt-to-Assets" value={ratios.debtAssets} suffix="%" hint="Healthy: <50%" />
        <Row label="Return on Equity (ROE)" value={ratios.roe} suffix="%" hint="Healthy: >15%" />
        <Row label="Return on Assets (ROA)" value={ratios.roa} suffix="%" hint="Healthy: >5%" />
        <Row label="Asset Turnover" value={ratios.assetTurnover} hint="Higher = more efficient use of assets" />
      </div>
    </div>
  );
};
