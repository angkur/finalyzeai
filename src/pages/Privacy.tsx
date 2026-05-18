import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Shield } from "lucide-react";

const Privacy = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <article className="container max-w-4xl px-4 sm:px-6 py-24 sm:py-32">
        <header className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary mb-4">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">Legal</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: April 1, 2026</p>
        </header>

        <div className="prose prose-invert max-w-none space-y-6 text-foreground/90">
          <section>
            <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
            <p>
              FinalyzeAI ("we", "us", "our") operates finalyzeai.com (the "Service"). This Privacy Policy
              explains how we collect, use, disclose, and safeguard your information when you visit our
              website and use our AI-powered financial analysis services. By using the Service, you
              consent to the practices described in this policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">2. Information We Collect</h2>
            <p><strong>Account Information:</strong> When you register, we collect your email address, name, and an encrypted password.</p>
            <p><strong>Financial Documents:</strong> Files you upload (PDFs, spreadsheets, statements) for AI analysis. These are stored securely and processed only to deliver the requested analysis.</p>
            <p><strong>Usage Data:</strong> Pages visited, features used, timestamps, device type, browser, and IP address (anonymized for analytics).</p>
            <p><strong>Cookies:</strong> Session cookies for authentication, preference cookies for theme, and analytics cookies (Google Analytics) for traffic measurement.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide, maintain, and improve our AI financial analysis service</li>
              <li>To process your documents and generate insights, forecasts, and reports</li>
              <li>To authenticate your account and prevent fraudulent activity</li>
              <li>To send transactional emails (password resets, subscription receipts, security alerts)</li>
              <li>To analyze platform usage and improve features</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">4. AI Processing</h2>
            <p>
              Documents you upload are processed by large language models (Google Gemini, OpenAI GPT) via the
              Lovable AI Gateway. We do not use your data to train third-party models. Your documents remain
              your property and are accessible only to your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">5. Third-Party Services</h2>
            <p>We use the following third-party services that may process limited data:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Supabase:</strong> Database, authentication, file storage</li>
              <li><strong>Stripe:</strong> Payment processing (we never see full card numbers)</li>
              <li><strong>Google AdSense:</strong> Advertising on public content pages — uses cookies for ad personalization</li>
              <li><strong>Google Analytics:</strong> Anonymized traffic analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">6. Data Security</h2>
            <p>
              All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We employ row-level security
              policies in our database so users can only access their own data. Passwords are hashed using
              bcrypt. We perform regular security audits.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">7. Your Rights (GDPR / CCPA)</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access a copy of your data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your account and all associated data</li>
              <li>Export your data in a portable format</li>
              <li>Opt-out of analytics and personalized ads</li>
              <li>Lodge a complaint with a supervisory authority</li>
            </ul>
            <p>To exercise these rights, email us at <a href="mailto:privacy@finalyzeai.com" className="text-primary hover:underline">privacy@finalyzeai.com</a>.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">8. Data Retention</h2>
            <p>
              Account data is retained as long as your account is active. Uploaded documents are retained
              until you delete them. After account deletion, data is permanently removed within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">9. Children's Privacy</h2>
            <p>The Service is not directed to children under 16. We do not knowingly collect data from minors.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">10. Cookies & Advertising</h2>
            <p>
              We use Google AdSense on public content pages. AdSense uses cookies to serve ads based on
              your prior visits. You can opt out via{" "}
              <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Google Ads Settings
              </a>{" "}
              or{" "}
              <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                aboutads.info
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy periodically. Material changes will be announced via email
              or a prominent notice on the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">12. Contact Us</h2>
            <p>
              For privacy questions, contact us at{" "}
              <a href="mailto:privacy@finalyzeai.com" className="text-primary hover:underline">privacy@finalyzeai.com</a>.
            </p>
          </section>
        </div>
      </article>
      <Footer />
    </main>
  );
};

export default Privacy;
