import { useEffect } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Share2 } from "lucide-react";
import { buildSharedResult } from "@/lib/sharedResults";
import PdfResultCapture from "@/components/calculators/PdfResultCapture";

const SharedResult = () => {
  const { type } = useParams();
  const [params] = useSearchParams();
  const view = type ? buildSharedResult(type, params) : null;

  useEffect(() => {
    if (!view) return;
    document.title = view.title;
    const desc = document.head.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (desc) desc.setAttribute("content", view.metaDescription);
  }, [view]);

  if (!view) return <Navigate to="/calculators" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="container px-4 md:px-6 max-w-3xl">
          <Badge variant="secondary" className="mb-4">
            <Share2 className="w-3 h-3 mr-1" /> Shared result
          </Badge>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-3">{view.h1}</h1>
          <p className="text-muted-foreground mb-8">{view.summary}</p>

          <section className="mb-8">
            <h2 className="text-lg font-display font-semibold mb-3">Results</h2>
            <div className="rounded-xl border border-border/50 bg-muted/20 divide-y divide-border/40">
              {view.metrics.map((m) => (
                <div key={m.label} className="flex items-baseline justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <div className={m.emphasis ? "font-semibold" : "text-sm"}>{m.label}</div>
                    {m.note && <div className="text-xs text-muted-foreground">{m.note}</div>}
                  </div>
                  <span
                    className={`font-mono whitespace-nowrap ${
                      m.emphasis ? "text-lg font-bold text-primary" : "font-semibold"
                    }`}
                  >
                    {m.value}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-lg font-display font-semibold mb-3">Inputs used</h2>
            <div className="grid sm:grid-cols-2 gap-2">
              {view.inputs.map((i) => (
                <div
                  key={i.label}
                  className="flex justify-between gap-3 rounded-lg border border-border/40 px-3 py-2 text-sm"
                >
                  <span className="text-muted-foreground">{i.label}</span>
                  <span className="font-mono">{i.value}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-10">
            <PdfResultCapture
              source={`shared-${type}`}
              title={view.h1}
              rows={[
                ...view.metrics.map((m) => ({ label: m.label, value: m.value })),
                ...view.inputs.map((i) => ({ label: `Input — ${i.label}`, value: i.value })),
              ]}
              note={view.summary}
            />
          </section>

          <div className="rounded-2xl border border-border p-8 text-center bg-card/60">
            <h2 className="font-display text-xl font-bold mb-2">Run this on your own numbers</h2>
            <p className="text-muted-foreground text-sm mb-5">
              Free, instant, and nothing is stored — all the math runs in your browser.
            </p>
            <Button variant="hero" size="lg" asChild>
              <Link to={view.ctaTo}>
                {view.ctaLabel} <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
              <Link to="/calculators" className="text-primary hover:underline">
                All free calculators
              </Link>
              <Link to="/ai-predict" className="text-primary hover:underline">
                Analyze a real statement
              </Link>
              <Link to="/glossary" className="text-primary hover:underline">
                Finance glossary
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SharedResult;
