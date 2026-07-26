import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ShieldCheck } from "lucide-react";
import useAdSense from "@/hooks/useAdSense";

const EditorialPolicy = () => {
  useAdSense();
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container px-4 sm:px-6 py-12 sm:py-16 max-w-3xl mx-auto">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
            <ShieldCheck className="w-3.5 h-3.5" /> Editorial Standards
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Editorial Policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: July 26, 2026</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-foreground">Our mission</h2>
            <p>
              FinalyzeAI publishes practical, accurate financial education so founders, analysts, accountants, and investors can make better decisions. Every article, calculator, and glossary entry is produced under the standards below.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Who writes our content</h2>
            <p>
              Content is written and reviewed by our in-house editorial team, which combines backgrounds in corporate finance, accounting, SaaS operations, and applied AI. Guest contributors, where used, are named on the byline with a linked bio and are subject to the same editing process as staff.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Sourcing and accuracy</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Financial formulas are cross-checked against standard corporate finance textbooks and referenced literature.</li>
              <li>Statistics and benchmarks are sourced from named public reports (SEC filings, industry associations, published research); the source is linked inline.</li>
              <li>Numeric examples in tutorials are computed transparently — readers can reproduce the arithmetic step by step.</li>
              <li>AI-assisted drafting is used to accelerate research, but every published paragraph is reviewed, edited, and approved by a human editor before publication.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Corrections</h2>
            <p>
              If we publish something inaccurate, we correct it and add a visible "Updated" note explaining what changed and when. To report an error, email <a href="mailto:hello@finalyzeai.com" className="text-primary hover:underline">hello@finalyzeai.com</a>. We respond within one business day.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Independence from advertisers</h2>
            <p>
              Editorial content is independent from advertising. Advertisers cannot preview, influence, or veto articles, and we do not accept payment in exchange for coverage. Display ads served on our content pages (via Google AdSense) are clearly labeled as "Advertisement" and are separated from editorial copy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Affiliate disclosure</h2>
            <p>
              Some outbound links (for example, in our AI Tools directory) may be affiliate links. When they are, we disclose that on the specific page. Affiliate revenue never affects whether a product is included or how it is reviewed.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Not financial advice</h2>
            <p>
              Our articles, calculators, and AI-generated outputs are educational and analytical tools, not regulated financial, tax, legal, or investment advice. Consult a qualified professional before acting on anything you read here.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Reader feedback</h2>
            <p>
              We take reader questions and corrections seriously — many articles on this site were expanded because a reader asked for more depth. Reach us via the <a href="/contact" className="text-primary hover:underline">Contact page</a> or by email.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EditorialPolicy;
