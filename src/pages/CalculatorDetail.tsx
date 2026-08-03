import { Link, useParams, Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, ChevronRight } from "lucide-react";
import { calculators, getCalculator } from "@/config/calculators";

const SITE_URL = "https://finalyzeai.com";

const CalculatorDetail = () => {
  const { slug } = useParams();
  const calc = getCalculator(slug);

  if (!calc) return <Navigate to="/calculators" replace />;

  const { Component, icon: Icon } = calc;
  const url = `${SITE_URL}/calculators/${calc.slug}`;
  const others = calculators.filter((c) => c.slug !== calc.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: calc.name,
        url,
        applicationCategory: "FinanceApplication",
        operatingSystem: "Any",
        description: calc.metaDescription,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        publisher: { "@type": "Organization", name: "FinalyzeAI", url: SITE_URL },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Calculators", item: `${SITE_URL}/calculators` },
          { "@type": "ListItem", position: 3, name: calc.name, item: url },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: calc.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="pt-32 pb-20">
        <div className="container px-4 md:px-6 max-w-4xl">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/calculators" className="hover:text-foreground">Calculators</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground">{calc.short}</span>
          </nav>

          <header className="mb-8">
            <Badge variant="secondary" className="mb-4">
              <Icon className="w-3 h-3 mr-1" /> Free Tool
            </Badge>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-3">{calc.h1}</h1>
            <p className="text-base sm:text-lg text-muted-foreground">{calc.tagline}</p>
          </header>

          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-xl font-display">{calc.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <Component />
            </CardContent>
          </Card>

          <article className="space-y-8">
            <section>
              {calc.intro.map((p, i) => (
                <p key={i} className="text-muted-foreground mb-3">{p}</p>
              ))}
            </section>

            {calc.sections.map((s) => (
              <section key={s.h2}>
                <h2 className="text-2xl font-display font-bold mb-3">{s.h2}</h2>
                {s.body.map((p, i) => (
                  <p key={i} className="text-muted-foreground mb-3">{p}</p>
                ))}
              </section>
            ))}

            <section>
              <h2 className="text-2xl font-display font-bold mb-4">Frequently asked questions</h2>
              <div className="space-y-4">
                {calc.faqs.map((f) => (
                  <div key={f.q} className="p-4 rounded-xl bg-muted/30 border border-border/50">
                    <h3 className="font-semibold mb-1.5">{f.q}</h3>
                    <p className="text-sm text-muted-foreground">{f.a}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold mb-4">Other free calculators</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {others.map((c) => {
                  const OtherIcon = c.icon;
                  return (
                    <Link
                      key={c.slug}
                      to={`/calculators/${c.slug}`}
                      className="flex items-start gap-3 p-4 rounded-xl border border-border/50 bg-muted/20 hover:border-primary/50 transition-colors"
                    >
                      <OtherIcon className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                      <div>
                        <div className="font-medium text-sm">{c.name}</div>
                        <div className="text-xs text-muted-foreground line-clamp-2">{c.tagline}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
              <p className="text-sm text-muted-foreground mt-6">
                Need more than a calculator? Upload a real statement and let{" "}
                <Link to="/ai-predict" className="text-primary hover:underline">AI Predict</Link> extract the
                numbers, compute every ratio, and flag risks automatically. See the{" "}
                <Link to="/glossary" className="text-primary hover:underline">finance glossary</Link> for
                definitions of any term used above.
              </p>
            </section>
          </article>

          <div className="mt-12 text-center">
            <Link
              to="/calculators"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Calculator className="w-4 h-4" /> Browse all free financial calculators
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CalculatorDetail;
