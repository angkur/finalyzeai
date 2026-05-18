import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FileText } from "lucide-react";

const Terms = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <article className="container max-w-4xl px-4 sm:px-6 py-24 sm:py-32">
        <header className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary mb-4">
            <FileText className="w-4 h-4" />
            <span className="text-sm font-medium">Legal</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: April 1, 2026</p>
        </header>

        <div className="prose prose-invert max-w-none space-y-6 text-foreground/90">
          <section>
            <h2 className="text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using FinanceAI ("the Service") at finalyzeai.com, you agree to be bound by
              these Terms of Service. If you do not agree, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">2. Description of Service</h2>
            <p>
              FinanceAI provides AI-powered financial analysis tools, including document intelligence,
              forecasting, fraud detection, benchmark comparison, and interactive visualizations. Features
              vary by subscription plan.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">3. Eligibility</h2>
            <p>You must be at least 16 years old and able to form a binding contract to use the Service.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">4. Account Registration</h2>
            <p>
              You agree to provide accurate registration information and to keep your password confidential.
              You are responsible for all activity under your account. Notify us immediately of any
              unauthorized access.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">5. Acceptable Use</h2>
            <p>You agree NOT to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Upload illegal, infringing, or malicious content</li>
              <li>Attempt to reverse-engineer the Service or AI models</li>
              <li>Use the Service to provide regulated financial advice without proper licensing</li>
              <li>Scrape, crawl, or use automated tools without written permission</li>
              <li>Resell access to the Service</li>
              <li>Interfere with security features or other users</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">6. Subscription & Billing</h2>
            <p>
              Paid plans are billed in advance on a monthly or annual basis via Stripe. Subscriptions
              renew automatically unless cancelled before the renewal date. Refunds are handled per our
              refund policy on a case-by-case basis. Prices may change with 30 days' notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">7. Intellectual Property</h2>
            <p>
              The Service, including its design, code, and AI models, is owned by FinanceAI and protected by
              copyright, trademark, and other laws. You retain ownership of documents and data you upload.
              By uploading content, you grant us a limited license to process it solely to deliver the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">8. AI-Generated Content Disclaimer</h2>
            <p>
              <strong>FinanceAI provides analytical tools, not financial advice.</strong> AI-generated insights,
              forecasts, ratios, and recommendations are for informational purposes only and may contain
              errors or inaccuracies. You are solely responsible for verifying outputs and consulting
              qualified financial professionals before making decisions. We make no warranty of accuracy,
              completeness, or fitness for any particular purpose.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">9. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, FinanceAI shall not be liable for any indirect,
              incidental, consequential, or punitive damages arising from your use of the Service. Our
              total liability is limited to the amount you paid us in the 12 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">10. Termination</h2>
            <p>
              We may suspend or terminate your account at any time for violation of these Terms. You may
              cancel your account at any time via account settings. Upon termination, your right to use
              the Service ends immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">11. Changes to the Service</h2>
            <p>
              We may modify, suspend, or discontinue features at any time. We will provide reasonable
              notice for material changes affecting paid subscribers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">12. Governing Law</h2>
            <p>
              These Terms are governed by applicable international law. Any disputes shall be resolved
              through binding arbitration, except where prohibited by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">13. Contact</h2>
            <p>
              Questions about these Terms? Email{" "}
              <a href="mailto:legal@finalyzeai.com" className="text-primary hover:underline">legal@finalyzeai.com</a>.
            </p>
          </section>
        </div>
      </article>
      <Footer />
    </main>
  );
};

export default Terms;
