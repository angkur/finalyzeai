import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import useAdSense from "@/hooks/useAdSense";

const FAQS: { q: string; a: string }[] = [
  { q: "What is FinalyzeAI?", a: "FinalyzeAI is an AI-powered platform that analyzes financial documents — income statements, balance sheets, cash flow statements, and bank statements — and returns CFO-grade insights: ratio analysis, forecasts, fraud red flags, and plain-English explanations. It's built for founders, analysts, accountants, and investors who need faster answers from financial data." },
  { q: "Do I need accounting knowledge to use FinalyzeAI?", a: "No. AI Predict returns findings in plain English and links every insight to the source rows in your document. Users with an accounting background get more from the ratio and forecasting depth, but non-financial founders can operate the product on day one." },
  { q: "What file formats does FinalyzeAI accept?", a: "Common formats: PDF, CSV, XLSX, and image-based statements (JPG/PNG) that go through OCR. The ad-hoc analysis path accepts files up to 5 MB; the persistent Knowledge Base accepts up to 10 MB per document." },
  { q: "Is my financial data secure?", a: "Yes. Every document is scoped to your account via row-level security in our database — no user can access another user's data. Documents used only for one-off analysis are not persisted long-term. Knowledge Base documents are encrypted at rest, and you can delete them any time from the Documents page." },
  { q: "Does FinalyzeAI store my bank credentials?", a: "No. FinalyzeAI never connects to your bank. You upload files you already have (statements, exports) and we analyze the contents. There is no read-only banking permission requested." },
  { q: "How accurate are AI-generated financial insights?", a: "AI Predict is highly accurate for standardized statements and known ratio calculations, and we cite the source rows so you can verify. For forecasting and interpretation, treat outputs as a first-pass analyst view — a human should confirm before decisions. We're explicit that FinalyzeAI is analytical software, not regulated financial advice." },
  { q: "Which AI models power the platform?", a: "We route requests across a mix of frontier models (Gemini and GPT families) via a gateway that selects the best model for each task — long-context extraction, structured chart generation, or conversational RAG. Users don't need to pick a model." },
  { q: "What is the difference between AI Predict and Fin Predict?", a: "AI Predict is the general document-Q&A analysis flow: upload, ask, get answers with charts. Fin Predict is the deeper financial modeling surface — 6-year forecasts, what-if scenarios, ratio scorecards, and fraud risk gauges — designed specifically for statement analysis." },
  { q: "Can I forecast my business's financials?", a: "Yes. Fin Predict builds 6-year revenue, expense, and cash flow projections from your historical statements, and lets you adjust growth rates, margins, and headcount in real time to see the impact." },
  { q: "How does the fraud detection work?", a: "The fraud engine scans uploaded statements for statistical red flags — Benford's law anomalies, round-number clustering, unusual journal entries, and ratio inconsistencies — then presents a Fraud Risk Gauge with the specific findings that drove the score." },
  { q: "What subscription plans are available?", a: "Free (5 analyses/day), Starter, Pro, and Enterprise tiers. Each tier increases daily/monthly analysis limits, Knowledge Base storage, and access to advanced features like real-time comparison and 3D workflow diagrams. See the Pricing page for current limits." },
  { q: "Do I get a free trial?", a: "Yes — the Free tier is a real free tier, not a time-limited trial. You get 5 AI analyses per day forever, enough to try every core feature. Paid plans start when you hit that limit consistently." },
  { q: "How do I cancel my subscription?", a: "From Settings → Subscription, click Manage Subscription to open the Stripe customer portal. You can cancel, pause, or change plans there. Cancellations take effect at the end of your current billing period." },
  { q: "Can I export analysis results?", a: "Yes. Every analysis can be exported to CSV, JSON, PNG, or SVG. Charts export at retina resolution with a dark background suitable for slide decks. Full PDF reports are available on paid tiers." },
  { q: "Does FinalyzeAI work on mobile?", a: "Yes. The full app is responsive, and you can install it as a Progressive Web App on iOS and Android for a native-feel experience. The 3D workflow diagrams fall back to 2D on low-end devices." },
  { q: "Do I need to install anything?", a: "No — FinalyzeAI runs entirely in the browser. Optionally, you can install it as a PWA from the browser menu (Add to Home Screen) for one-tap access." },
  { q: "Is my data used to train AI models?", a: "No. Your uploaded documents and questions are not used to train any underlying AI model. The AI providers we route through are contractually restricted from training on API traffic." },
  { q: "How is FinalyzeAI different from ChatGPT for finance questions?", a: "General chatbots can discuss finance conceptually but cannot analyze your actual documents at scale, cite specific numbers, run structured ratio analysis, or produce quantitative forecasts you can iterate on. FinalyzeAI is purpose-built around financial documents with domain-specific tooling on top of the AI models." },
  { q: "Can accountants and CFOs use this professionally?", a: "Yes — a growing share of our users are fractional CFOs, bookkeepers, and small-firm accountants using FinalyzeAI to accelerate first-pass review, benchmarking, and client-facing reporting. Every output is traceable to the source." },
  { q: "What browsers are supported?", a: "The latest two versions of Chrome, Edge, Firefox, and Safari on desktop and mobile. Older browsers may render but lose animations and 3D visualizations." },
  { q: "How do I report a bug or request a feature?", a: "Use the Contact page or email hello@finalyzeai.com. Feature requests directly influence our roadmap — the fraud risk gauge and the calculators page both started as user requests." },
  { q: "Do you offer refunds?", a: "Yes — if you're not satisfied, email us within 14 days of purchase and we'll refund your subscription fee. Details are in the Terms of Service." },
  { q: "Is there an API?", a: "A public API for programmatic uploads and analysis is on the roadmap. Enterprise customers can request early access via the Contact page." },
  { q: "Where is FinalyzeAI hosted?", a: "The frontend is served from a global CDN; the backend runs on Supabase (Postgres, Edge Functions, Storage) in the United States. Data locality for other regions is available on Enterprise plans." },
  { q: "How do you handle deleted documents?", a: "When you delete a document from the Documents page, it's removed from storage and its embeddings are purged from the vector database within 24 hours. Automated cleanup jobs run daily to enforce retention limits." },
  { q: "What is the Knowledge Base?", a: "Persistent document storage that FinalyzeAI can search and cite across conversations. Upload your key financials once, then ask questions across multiple periods without re-uploading. Chunks are embedded to a vector index with hybrid semantic + keyword search." },
  { q: "How do the calculators work?", a: "The six calculators (DCF, ROI, Loan, Break-even, Burn Rate, Ratios) run entirely in your browser using standard financial formulas — no server round-trip, no data sent anywhere. They're free forever." },
  { q: "Do you have a blog with financial education?", a: "Yes — the Blog covers financial analysis, forecasting, fraud detection, SaaS metrics, valuation, and AI-in-finance topics. Long-form and cited, written by our editorial team." },
  { q: "Can I white-label FinalyzeAI for my accounting firm?", a: "White-label and multi-client workspace features are available on the Enterprise plan. Contact sales for details." },
  { q: "What if my documents are in a language other than English?", a: "The underlying AI models are multilingual and handle major European and Asian languages well. Ratio names and UI copy are currently English-only; a localized UI is on the roadmap." },
];

const Faq = () => {
  useAdSense();

  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
    script.id = "faq-jsonld";
    document.head.appendChild(script);
    return () => {
      document.getElementById("faq-jsonld")?.remove();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container px-4 sm:px-6 py-12 sm:py-16 max-w-3xl mx-auto">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
            <HelpCircle className="w-3.5 h-3.5" /> Frequently Asked Questions
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold mb-4">FinalyzeAI FAQ</h1>
          <p className="text-muted-foreground">
            {FAQS.length} answers to the questions users ask most about FinalyzeAI — pricing, security, AI accuracy, formats, and workflows.
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-2">
          {FAQS.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border border-border rounded-lg px-4">
              <AccordionTrigger className="text-left font-semibold hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 p-6 rounded-lg border border-border bg-muted/30 text-center">
          <h2 className="font-semibold mb-2">Still have questions?</h2>
          <p className="text-sm text-muted-foreground mb-4">
            We reply to every message within one business day.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Contact us
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Faq;
