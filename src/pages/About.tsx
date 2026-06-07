import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Brain, Target, Heart, Users, Award, Rocket, Globe, Shield, Linkedin, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const About = () => {
  // Inject Organization + Person JSON-LD for E-E-A-T
  useEffect(() => {
    const scriptId = "about-jsonld";
    document.getElementById(scriptId)?.remove();
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = scriptId;
    script.text = JSON.stringify([
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "FinalyzeAI",
        url: "https://finalyzeai.com",
        logo: "https://finalyzeai.com/logo.png",
        email: "hello@finalyzeai.com",
        sameAs: ["https://www.linkedin.com/company/finalyzeai/"],
        founder: {
          "@type": "Person",
          name: "Mazharul Huq Ankur",
          jobTitle: "Founder",
          url: "https://www.linkedin.com/company/finalyzeai/",
        },
      },
    ]);
    document.head.appendChild(script);
    return () => { document.getElementById(scriptId)?.remove(); };
  }, []);

  const values = [
    { icon: <Target className="w-6 h-6" />, title: "Accuracy First", desc: "Every model, every metric, every insight is engineered to be reliable and explainable." },
    { icon: <Shield className="w-6 h-6" />, title: "Privacy by Design", desc: "Your financial data is encrypted end-to-end and never used to train third-party models." },
    { icon: <Heart className="w-6 h-6" />, title: "User Obsession", desc: "We obsess over the experience of analysts, founders, and CFOs who depend on our tools daily." },
    { icon: <Globe className="w-6 h-6" />, title: "Accessible Finance", desc: "Enterprise-grade financial intelligence shouldn't be reserved for Fortune 500 companies." },
  ];

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <article className="container max-w-5xl px-4 sm:px-6 py-24 sm:py-32">
        <header className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary mb-4">
            <Brain className="w-4 h-4" />
            <span className="text-sm font-medium">About FinalyzeAI</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-display font-bold mb-6">
            Reimagining financial analysis with AI
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            FinalyzeAI is the AI-native platform that turns raw financial documents into clear,
            actionable intelligence — in seconds, not weeks.
          </p>
        </header>

        <section className="mb-16">
          <h2 className="text-3xl font-display font-bold mb-6">Our Story</h2>
          <div className="space-y-4 text-foreground/90 leading-relaxed">
            <p>
              FinalyzeAI was founded in 2024 by a team of financial analysts, data scientists, and engineers
              who shared a frustration: financial analysis was stuck in spreadsheets while every other
              industry was racing ahead with AI.
            </p>
            <p>
              We spent years buried in 10-Ks, audit reports, and investor decks — manually extracting line
              items, building models, and writing the same kind of summaries over and over. We knew large
              language models could do most of this in seconds, but no existing tool combined the rigor of
              traditional finance with the speed and intelligence of modern AI.
            </p>
            <p>
              So we built it. FinalyzeAI launched with a single mission: give every analyst, founder, lender,
              and investor the same caliber of financial intelligence that only Wall Street institutions
              could afford. Today, our platform processes thousands of documents every month, helping users
              uncover risk, model scenarios, detect fraud, and make better decisions.
            </p>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-display font-bold mb-6">Meet the Founder</h2>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-display font-bold text-4xl shrink-0">
                MH
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold">Mazharul Huq Ankur</h3>
                <p className="text-sm text-primary font-medium mb-3">Founder &amp; CEO, FinalyzeAI</p>
                <p className="text-foreground/90 leading-relaxed mb-4">
                  Mazharul founded FinalyzeAI in 2024 after years of frustration watching
                  capable analysts waste days on tasks AI could finish in seconds. With a
                  background spanning financial analysis, software engineering, and applied
                  machine learning, he built FinalyzeAI to give every analyst, founder, and
                  investor the same caliber of intelligence that only Wall Street institutions
                  could previously afford.
                </p>
                <div className="flex items-center gap-4 flex-wrap">
                  <a
                    href="https://www.linkedin.com/company/finalyzeai/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
                  >
                    <Linkedin className="w-4 h-4" /> LinkedIn
                  </a>
                  <a
                    href="mailto:hello@finalyzeai.com"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
                  >
                    <Mail className="w-4 h-4" /> hello@finalyzeai.com
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-display font-bold mb-6">What We Do</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-6">
                <Rocket className="w-8 h-8 text-primary mb-3" />
                <h3 className="text-xl font-semibold mb-2">AI Predict</h3>
                <p className="text-muted-foreground">
                  Conversational financial analysis. Upload a document, ask anything, get expert-level
                  answers with citations.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-6">
                <Award className="w-8 h-8 text-primary mb-3" />
                <h3 className="text-xl font-semibold mb-2">Fin Predict</h3>
                <p className="text-muted-foreground">
                  Automated financial statement analysis with ratios, scorecards, fraud detection,
                  benchmarks, what-if modeling, and trend forecasting.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-6">
                <Users className="w-8 h-8 text-primary mb-3" />
                <h3 className="text-xl font-semibold mb-2">For Every Role</h3>
                <p className="text-muted-foreground">
                  Built for analysts, founders, CFOs, lenders, investors, accountants, and anyone who
                  works with financial documents.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-6">
                <Shield className="w-8 h-8 text-primary mb-3" />
                <h3 className="text-xl font-semibold mb-2">Enterprise-Grade Security</h3>
                <p className="text-muted-foreground">
                  Encrypted storage, row-level access policies, and zero data sharing with model providers.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-display font-bold mb-6">Our Values</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {values.map((v) => (
              <div key={v.title} className="flex gap-4">
                <div className="p-2 rounded-lg bg-primary/10 text-primary h-fit">{v.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">{v.title}</h3>
                  <p className="text-muted-foreground">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-display font-bold mb-6">By the Numbers</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div className="text-center p-6 rounded-xl bg-card/50 border border-border/50">
              <div className="text-3xl font-display font-bold text-primary">15K+</div>
              <div className="text-sm text-muted-foreground mt-1">Documents analyzed</div>
            </div>
            <div className="text-center p-6 rounded-xl bg-card/50 border border-border/50">
              <div className="text-3xl font-display font-bold text-primary">98%</div>
              <div className="text-sm text-muted-foreground mt-1">Extraction accuracy</div>
            </div>
            <div className="text-center p-6 rounded-xl bg-card/50 border border-border/50">
              <div className="text-3xl font-display font-bold text-primary">40+</div>
              <div className="text-sm text-muted-foreground mt-1">Countries served</div>
            </div>
            <div className="text-center p-6 rounded-xl bg-card/50 border border-border/50">
              <div className="text-3xl font-display font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground mt-1">Platform availability</div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-display font-bold mb-6">Get in Touch</h2>
          <p className="text-foreground/90 leading-relaxed mb-4">
            We'd love to hear from you. Whether you're an analyst with feedback, a founder exploring our
            platform, or a journalist covering AI in finance — reach out at{" "}
            <a href="mailto:hello@finalyzeai.com" className="text-primary hover:underline">hello@finalyzeai.com</a>{" "}
            or follow us on{" "}
            <a href="https://www.linkedin.com/company/finalyzeai/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">LinkedIn</a>.
          </p>
        </section>
      </article>
      <Footer />
    </main>
  );
};

export default About;
