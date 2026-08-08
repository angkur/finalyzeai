import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const fmt = (n: number, d = 2) =>
  Number.isFinite(n)
    ? n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d })
    : "—";
const money = (n: number) => (Number.isFinite(n) ? `$${fmt(n, 0)}` : "—");

const Field = ({
  label,
  value,
  onChange,
  step,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  step?: string;
}) => (
  <div>
    <Label className="text-xs">{label}</Label>
    <Input type="number" step={step} value={value} onChange={(e) => onChange(+e.target.value)} />
  </div>
);

const Panel = ({ children, note }: { children: React.ReactNode; note: string }) => (
  <div className="space-y-3 p-5 rounded-xl bg-muted/30 border border-border/50">
    {children}
    <p className="text-xs text-muted-foreground pt-2 border-t border-border/40">{note}</p>
  </div>
);

const Row = ({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) => (
  <div className="flex justify-between items-baseline gap-3">
    <span className={emphasis ? "font-semibold" : "text-sm text-muted-foreground"}>{label}</span>
    <span
      className={`font-mono whitespace-nowrap ${
        emphasis ? "text-lg font-bold text-primary" : "font-semibold text-sm"
      }`}
    >
      {value}
    </span>
  </div>
);

const Shell = ({ inputs, output }: { inputs: React.ReactNode; output: React.ReactNode }) => (
  <div className="grid md:grid-cols-2 gap-6">
    <div className="grid grid-cols-2 gap-3 content-start">{inputs}</div>
    {output}
  </div>
);

/* --------------------------- SaaS Magic Number --------------------------- */
export const MagicNumberCalc = () => {
  const [prevArr, setPrevArr] = useState(1200000);
  const [currArr, setCurrArr] = useState(1500000);
  const [sm, setSm] = useState(250000);

  const netNew = currArr - prevArr;
  const magic = sm > 0 ? netNew / sm : NaN;
  const verdict =
    magic >= 1
      ? "Above 1.0 — sales and marketing spend is paying back efficiently. Consider spending more."
      : magic >= 0.75
        ? "0.75–1.0 — healthy. Keep spending at this level and optimise conversion."
        : magic >= 0.5
          ? "0.5–0.75 — acceptable but inefficient. Fix conversion before adding budget."
          : "Below 0.5 — each dollar of go-to-market spend buys too little ARR. Do not scale spend yet.";

  return (
    <Shell
      inputs={
        <>
          <Field label="Previous quarter ARR ($)" value={prevArr} onChange={setPrevArr} />
          <Field label="Current quarter ARR ($)" value={currArr} onChange={setCurrArr} />
          <Field label="Prior quarter S&M spend ($)" value={sm} onChange={setSm} />
        </>
      }
      output={
        <Panel note={verdict}>
          <Row label="Net new ARR" value={money(netNew)} />
          <Row label="Annualised net new ARR" value={money(netNew * 4)} />
          <Row label="Magic number" value={fmt(magic)} emphasis />
        </Panel>
      }
    />
  );
};

/* ------------------------------ CAC Payback ------------------------------ */
export const CacPaybackCalc = () => {
  const [cac, setCac] = useState(6000);
  const [arpa, setArpa] = useState(500);
  const [gm, setGm] = useState(80);

  const grossProfitPerMonth = arpa * (gm / 100);
  const months = grossProfitPerMonth > 0 ? cac / grossProfitPerMonth : NaN;
  const verdict =
    months <= 12
      ? "Under 12 months — strong. This is the benchmark for efficient SaaS growth."
      : months <= 18
        ? "12–18 months — acceptable for enterprise deals, slow for self-serve."
        : "Over 18 months — you are funding growth from the balance sheet. Raise price or cut acquisition cost.";

  return (
    <Shell
      inputs={
        <>
          <Field label="Customer acquisition cost ($)" value={cac} onChange={setCac} />
          <Field label="Monthly revenue per account ($)" value={arpa} onChange={setArpa} />
          <Field label="Gross margin (%)" value={gm} onChange={setGm} />
        </>
      }
      output={
        <Panel note={verdict}>
          <Row label="Gross profit per month" value={money(grossProfitPerMonth)} />
          <Row label="CAC payback" value={`${fmt(months, 1)} months`} emphasis />
          <Row label="Payback in years" value={fmt(months / 12, 2)} />
        </Panel>
      }
    />
  );
};

/* ------------------------------- LTV : CAC ------------------------------- */
export const LtvCacCalc = () => {
  const [arpa, setArpa] = useState(500);
  const [gm, setGm] = useState(80);
  const [churn, setChurn] = useState(2);
  const [cac, setCac] = useState(6000);

  const lifetimeMonths = churn > 0 ? 100 / churn : Infinity;
  const ltv = arpa * (gm / 100) * lifetimeMonths;
  const ratio = cac > 0 ? ltv / cac : NaN;
  const verdict =
    ratio >= 3
      ? "3:1 or better is the accepted healthy benchmark. Above 5:1 often means you are under-investing in growth."
      : "Below 3:1 means each customer barely repays what you spent to win them. Reduce churn, raise price, or cut CAC.";

  return (
    <Shell
      inputs={
        <>
          <Field label="Monthly revenue per account ($)" value={arpa} onChange={setArpa} />
          <Field label="Gross margin (%)" value={gm} onChange={setGm} />
          <Field label="Monthly churn (%)" value={churn} onChange={setChurn} step="0.1" />
          <Field label="Customer acquisition cost ($)" value={cac} onChange={setCac} />
        </>
      }
      output={
        <Panel note={verdict}>
          <Row
            label="Average customer lifetime"
            value={Number.isFinite(lifetimeMonths) ? `${fmt(lifetimeMonths, 1)} months` : "∞"}
          />
          <Row label="Lifetime value (gross profit)" value={money(ltv)} />
          <Row label="LTV : CAC ratio" value={`${fmt(ratio)} : 1`} emphasis />
        </Panel>
      }
    />
  );
};

/* ------------------------------ Rule of 40 ------------------------------- */
export const RuleOf40Calc = () => {
  const [growth, setGrowth] = useState(35);
  const [margin, setMargin] = useState(-5);

  const score = growth + margin;
  const verdict =
    score >= 40
      ? "At or above 40 — the trade-off between growth and profitability is balanced. Investors treat this as best-in-class."
      : score >= 20
        ? "20–40 — respectable, but below the benchmark. Either accelerate growth or improve margin."
        : "Below 20 — the business is neither growing fast enough nor profitable enough to justify the burn.";

  return (
    <Shell
      inputs={
        <>
          <Field label="YoY revenue growth (%)" value={growth} onChange={setGrowth} />
          <Field label="Profit margin, EBITDA or FCF (%)" value={margin} onChange={setMargin} />
        </>
      }
      output={
        <Panel note={verdict}>
          <Row label="Growth contribution" value={`${fmt(growth, 1)}%`} />
          <Row label="Margin contribution" value={`${fmt(margin, 1)}%`} />
          <Row label="Rule of 40 score" value={fmt(score, 1)} emphasis />
        </Panel>
      }
    />
  );
};

/* ---------------------------- Equity Dilution ---------------------------- */
export const DilutionCalc = () => {
  const [preMoney, setPreMoney] = useState(8000000);
  const [raise, setRaise] = useState(2000000);
  const [ownership, setOwnership] = useState(60);
  const [poolIncrease, setPoolIncrease] = useState(10);

  const postMoney = preMoney + raise;
  const investorPct = postMoney > 0 ? (raise / postMoney) * 100 : NaN;
  const remaining = 100 - investorPct - poolIncrease;
  const newOwnership = (ownership / 100) * remaining;
  const dilution = ownership - newOwnership;
  const stakeValue = (newOwnership / 100) * postMoney;

  return (
    <Shell
      inputs={
        <>
          <Field label="Pre-money valuation ($)" value={preMoney} onChange={setPreMoney} />
          <Field label="Amount raised ($)" value={raise} onChange={setRaise} />
          <Field label="Your ownership before (%)" value={ownership} onChange={setOwnership} />
          <Field label="New option pool (%)" value={poolIncrease} onChange={setPoolIncrease} />
        </>
      }
      output={
        <Panel note="The option pool is usually created pre-money, so founders absorb it on top of investor dilution. Negotiating pool size matters as much as valuation.">
          <Row label="Post-money valuation" value={money(postMoney)} />
          <Row label="Investor ownership" value={`${fmt(investorPct, 1)}%`} />
          <Row label="Your ownership after" value={`${fmt(newOwnership, 2)}%`} emphasis />
          <Row label="Percentage points lost" value={`${fmt(dilution, 2)} pts`} />
          <Row label="Value of your stake" value={money(stakeValue)} />
        </Panel>
      }
    />
  );
};

/* ------------------------------ ESOP Value ------------------------------- */
export const EsopValueCalc = () => {
  const [options, setOptions] = useState(20000);
  const [strike, setStrike] = useState(1.5);
  const [exitValuation, setExitValuation] = useState(120000000);
  const [shares, setShares] = useState(12000000);
  const [vested, setVested] = useState(50);

  const pricePerShare = shares > 0 ? exitValuation / shares : NaN;
  const vestedOptions = options * (vested / 100);
  const gross = vestedOptions * pricePerShare;
  const cost = vestedOptions * strike;
  const net = gross - cost;
  const ownership = shares > 0 ? (options / shares) * 100 : NaN;

  return (
    <Shell
      inputs={
        <>
          <Field label="Options granted" value={options} onChange={setOptions} />
          <Field label="Strike price ($)" value={strike} onChange={setStrike} step="0.01" />
          <Field label="Exit valuation ($)" value={exitValuation} onChange={setExitValuation} />
          <Field label="Fully diluted shares" value={shares} onChange={setShares} />
          <Field label="Vested (%)" value={vested} onChange={setVested} />
        </>
      }
      output={
        <Panel note="This ignores liquidation preferences, which can wipe out common shareholders in a down exit, and ignores taxes on exercise and sale. Ask for the preference stack before valuing a grant.">
          <Row label="Your ownership (fully diluted)" value={`${fmt(ownership, 3)}%`} />
          <Row label="Exit price per share" value={`$${fmt(pricePerShare, 2)}`} />
          <Row label="Gross value of vested options" value={money(gross)} />
          <Row label="Cost to exercise" value={money(cost)} />
          <Row label="Net proceeds (pre-tax)" value={money(net)} emphasis />
        </Panel>
      }
    />
  );
};

/* --------------------------- Invoice Factoring --------------------------- */
export const FactoringCostCalc = () => {
  const [invoice, setInvoice] = useState(100000);
  const [advance, setAdvance] = useState(85);
  const [feeRate, setFeeRate] = useState(2.5);
  const [days, setDays] = useState(45);

  const advanced = invoice * (advance / 100);
  const fee = invoice * (feeRate / 100);
  const netReceived = invoice - fee;
  const apr = advanced > 0 && days > 0 ? (fee / advanced) * (365 / days) * 100 : NaN;

  return (
    <Shell
      inputs={
        <>
          <Field label="Invoice value ($)" value={invoice} onChange={setInvoice} />
          <Field label="Advance rate (%)" value={advance} onChange={setAdvance} />
          <Field label="Factoring fee (%)" value={feeRate} onChange={setFeeRate} step="0.1" />
          <Field label="Days until customer pays" value={days} onChange={setDays} />
        </>
      }
      output={
        <Panel note="Factoring fees look small as a percentage but are charged over weeks, not years. Always convert to an effective APR before comparing against a line of credit.">
          <Row label="Cash advanced upfront" value={money(advanced)} />
          <Row label="Total factoring fee" value={money(fee)} />
          <Row label="Net you receive" value={money(netReceived)} />
          <Row label="Effective APR" value={`${fmt(apr, 1)}%`} emphasis />
        </Panel>
      }
    />
  );
};

/* ---------------------------- Working Capital ---------------------------- */
export const WorkingCapitalCalc = () => {
  const [currentAssets, setCurrentAssets] = useState(450000);
  const [currentLiabilities, setCurrentLiabilities] = useState(280000);
  const [dso, setDso] = useState(45);
  const [dio, setDio] = useState(30);
  const [dpo, setDpo] = useState(35);

  const wc = currentAssets - currentLiabilities;
  const ratio = currentLiabilities > 0 ? currentAssets / currentLiabilities : NaN;
  const ccc = dso + dio - dpo;

  return (
    <Shell
      inputs={
        <>
          <Field label="Current assets ($)" value={currentAssets} onChange={setCurrentAssets} />
          <Field
            label="Current liabilities ($)"
            value={currentLiabilities}
            onChange={setCurrentLiabilities}
          />
          <Field label="Days sales outstanding" value={dso} onChange={setDso} />
          <Field label="Days inventory outstanding" value={dio} onChange={setDio} />
          <Field label="Days payables outstanding" value={dpo} onChange={setDpo} />
        </>
      }
      output={
        <Panel note="A current ratio of 1.5–3.0 is generally healthy. A negative cash conversion cycle means customers pay you before you pay suppliers — the strongest possible working capital position.">
          <Row label="Working capital" value={money(wc)} emphasis />
          <Row label="Current ratio" value={fmt(ratio)} />
          <Row label="Cash conversion cycle" value={`${fmt(ccc, 0)} days`} emphasis />
        </Panel>
      }
    />
  );
};
