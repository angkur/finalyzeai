import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, TrendingUp, DollarSign, Percent, BarChart3, Flame, PieChart, ArrowRight } from "lucide-react";
import {
  DCFCalc,
  ROICalc,
  LoanCalc,
  BreakEvenCalc,
  RunwayCalc,
  RatiosCalc,
} from "@/components/calculators/CalcWidgets";
import { calculators } from "@/config/calculators";


/* --------------------------------- Page --------------------------------- */
const Calculators = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="container px-4 md:px-6 max-w-6xl">
          <header className="text-center mb-10">
            <Badge variant="secondary" className="mb-4">
              <Calculator className="w-3 h-3 mr-1" /> Free Tools
            </Badge>
            <h1 className="text-3xl md:text-5xl font-display font-bold mb-4">
              Free Financial <span className="text-gradient">Calculators</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Six professional-grade financial calculators — DCF valuation, ROI, loan
              amortization, break-even, runway, and ratio analysis. Free, no signup,
              instant results.
            </p>
          </header>

          <Tabs defaultValue="dcf" className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 h-auto gap-1 p-1 mb-6">
              <TabsTrigger value="dcf" className="gap-1.5 py-2"><TrendingUp className="w-3.5 h-3.5" /> DCF</TabsTrigger>
              <TabsTrigger value="roi" className="gap-1.5 py-2"><Percent className="w-3.5 h-3.5" /> ROI</TabsTrigger>
              <TabsTrigger value="loan" className="gap-1.5 py-2"><DollarSign className="w-3.5 h-3.5" /> Loan</TabsTrigger>
              <TabsTrigger value="breakeven" className="gap-1.5 py-2"><BarChart3 className="w-3.5 h-3.5" /> Break-Even</TabsTrigger>
              <TabsTrigger value="runway" className="gap-1.5 py-2"><Flame className="w-3.5 h-3.5" /> Runway</TabsTrigger>
              <TabsTrigger value="ratios" className="gap-1.5 py-2"><PieChart className="w-3.5 h-3.5" /> Ratios</TabsTrigger>
            </TabsList>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-display">
                  <TabsContent value="dcf" className="m-0">DCF Valuation Calculator</TabsContent>
                  <TabsContent value="roi" className="m-0">ROI & CAGR Calculator</TabsContent>
                  <TabsContent value="loan" className="m-0">Loan & Mortgage Calculator</TabsContent>
                  <TabsContent value="breakeven" className="m-0">Break-Even Analysis</TabsContent>
                  <TabsContent value="runway" className="m-0">Burn Rate & Runway</TabsContent>
                  <TabsContent value="ratios" className="m-0">Financial Ratios Analyzer</TabsContent>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TabsContent value="dcf"><DCFCalc /></TabsContent>
                <TabsContent value="roi"><ROICalc /></TabsContent>
                <TabsContent value="loan"><LoanCalc /></TabsContent>
                <TabsContent value="breakeven"><BreakEvenCalc /></TabsContent>
                <TabsContent value="runway"><RunwayCalc /></TabsContent>
                <TabsContent value="ratios"><RatiosCalc /></TabsContent>
              </CardContent>
            </Card>
          </Tabs>

          <section className="mt-12">
            <h2 className="text-2xl font-display font-bold mb-4">Open a calculator on its own page</h2>
            <p className="text-muted-foreground mb-5">
              Each calculator has a dedicated page with worked explanations, formulas, benchmark
              ranges, and FAQs.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {calculators.map((c) => {
                const Icon = c.icon;
                return (
                  <Link
                    key={c.slug}
                    to={`/calculators/${c.slug}`}
                    className="group flex items-start gap-3 p-4 rounded-xl border border-border/50 bg-muted/20 hover:border-primary/50 transition-colors"
                  >
                    <Icon className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                    <div className="min-w-0">
                      <div className="font-medium text-sm flex items-center gap-1">
                        {c.name}
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-2">{c.tagline}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>


          <section className="mt-12 prose prose-invert max-w-none">
            <h2 className="text-2xl font-display font-bold mb-4">How to use these calculators</h2>
            <p className="text-muted-foreground mb-3">
              These calculators implement the same formulas used by professional analysts,
              investment bankers, and CFOs. All math runs locally in your browser — your
              inputs are never sent to a server, never logged, and never stored.
            </p>
            <p className="text-muted-foreground mb-3">
              The <strong>DCF calculator</strong> projects free cash flow over a chosen horizon,
              discounts each year back to present value using WACC, and adds a Gordon Growth
              terminal value. The <strong>ROI calculator</strong> computes both simple and
              annualized (CAGR) returns so you can fairly compare investments held for
              different durations. The <strong>loan calculator</strong> uses the standard
              amortization formula and gives you the monthly payment plus total interest paid
              over the life of the loan.
            </p>
            <p className="text-muted-foreground mb-3">
              <strong>Break-even analysis</strong> tells you the unit volume and revenue at
              which fixed costs are recovered. <strong>Burn rate and runway</strong> are
              critical for founders — most early-stage failures come from running out of cash,
              not lack of demand. The <strong>ratios analyzer</strong> computes the eight most
              commonly-used liquidity, leverage, and profitability ratios with healthy ranges
              for benchmarking.
            </p>
            <h2 className="text-2xl font-display font-bold mt-8 mb-4">When to use which calculator</h2>
            <ul className="text-muted-foreground space-y-2 list-disc pl-6">
              <li><strong>DCF</strong>: valuing a mature business or acquisition target with predictable cash flow</li>
              <li><strong>ROI / CAGR</strong>: comparing investment opportunities or evaluating past performance</li>
              <li><strong>Loan</strong>: budgeting for a mortgage, auto loan, or business term loan</li>
              <li><strong>Break-Even</strong>: pricing a new product or evaluating a manufacturing investment</li>
              <li><strong>Runway</strong>: every startup founder, every month, without exception</li>
              <li><strong>Ratios</strong>: due diligence on a target, monitoring your own business health, lender requirements</li>
            </ul>
            <h2 className="text-2xl font-display font-bold mt-8 mb-4">The limits of calculators</h2>
            <p className="text-muted-foreground">
              A calculator is only as good as the inputs you give it. A DCF with optimistic
              growth assumptions will value almost anything at billions. A burn-rate
              calculation that ignores upcoming hires or one-time expenses will overstate your
              runway. Use these tools as a starting point — then pressure-test assumptions
              before making real decisions. For complex analyses involving real financial
              statements, AI-driven document extraction, or sensitivity testing across dozens
              of scenarios, our <a href="/ai-predict" className="text-primary hover:underline">AI Predict</a>{" "}
              and <a href="/fin-predict" className="text-primary hover:underline">Fin Predict</a> tools
              go well beyond what a calculator can do.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Calculators;
