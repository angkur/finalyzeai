import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ArrowRight } from "lucide-react";

export interface ToolLandingFaq {
  q: string;
  a: string;
}

export interface ToolLandingProps {
  path: string;
  h1: string;
  tagline: string;
  intro: string;
  ctaLabel: string;
  features: { title: string; body: string }[];
  steps: string[];
  sampleTitle: string;
  sampleRows: { label: string; value: string; note: string }[];
  sections: { heading: string; body: string }[];
  faqs: ToolLandingFaq[];
  related: { to: string; label: string }[];
}

const SITE = "https://finalyzeai.com";

const ToolLanding = (props: ToolLandingProps) => {
  const {
    path,
    h1,
    tagline,
    intro,
    ctaLabel,
    features,
    steps,
    sampleTitle,
    sampleRows,
    sections,
    faqs,
    related,
  } = props;

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const appLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: h1,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    url: `${SITE}${path}`,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appLd) }} />

      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-medium tracking-wide uppercase text-primary mb-4">{tagline}</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">{h1}</h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">{intro}</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button variant="hero" size="lg" asChild>
              <Link to="/auth">{ctaLabel}</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/pricing">See pricing</Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">Free plan available. No credit card required.</p>
        </div>
      </section>

      <section className="pb-16 px-6">
        <div className="max-w-5xl mx-auto grid gap-6 md:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} className="bg-card/60">
              <CardHeader>
                <CardTitle className="text-lg">{f.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed">{f.body}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">How it works</h2>
          <ol className="space-y-4">
            {steps.map((s, i) => (
              <li key={s} className="flex gap-4">
                <span className="shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                  {i + 1}
                </span>
                <span className="text-muted-foreground leading-relaxed pt-1">{s}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">{sampleTitle}</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Example output from a sample company. Sign in to run this on your own numbers.
          </p>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Metric</th>
                  <th className="text-left px-4 py-3 font-semibold">Value</th>
                  <th className="text-left px-4 py-3 font-semibold">What it means</th>
                </tr>
              </thead>
              <tbody>
                {sampleRows.map((r) => (
                  <tr key={r.label} className="border-t border-border">
                    <td className="px-4 py-3 font-medium text-foreground">{r.label}</td>
                    <td className="px-4 py-3 text-primary font-semibold">{r.value}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="pb-16 px-6">
        <div className="max-w-3xl mx-auto space-y-8">
          {sections.map((s) => (
            <article key={s.heading}>
              <h2 className="font-display text-2xl font-bold text-foreground mb-3">{s.heading}</h2>
              <p className="text-muted-foreground leading-relaxed">{s.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">Frequently asked questions</h2>
          <div className="space-y-6">
            {faqs.map((f) => (
              <div key={f.q}>
                <h3 className="font-semibold text-foreground mb-2 flex gap-2">
                  <Check className="w-4 h-4 text-primary mt-1 shrink-0" />
                  {f.q}
                </h3>
                <p className="text-muted-foreground leading-relaxed pl-6">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-24 px-6">
        <div className="max-w-3xl mx-auto text-center rounded-2xl border border-border p-10 bg-card/60">
          <h2 className="font-display text-2xl font-bold text-foreground mb-3">Ready to try it?</h2>
          <p className="text-muted-foreground mb-6">Create a free account and run your first analysis in under a minute.</p>
          <Button variant="hero" size="lg" asChild>
            <Link to="/auth">
              {ctaLabel} <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
            {related.map((r) => (
              <Link key={r.to} to={r.to} className="text-primary hover:underline">
                {r.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default ToolLanding;
