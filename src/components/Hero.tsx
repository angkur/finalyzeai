import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, Database, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import FounderHealthScore from "@/components/FounderHealthScore";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero pt-20 md:pt-0">
      {/* Background Effects */}
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute top-1/4 left-1/4 w-48 md:w-96 h-48 md:h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-40 md:w-80 h-40 md:h-80 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      
      {/* Floating Elements - Hidden on small screens */}
      <div className="absolute top-20 right-10 md:right-20 animate-float opacity-10 md:opacity-20 hidden sm:block">
        <Brain className="w-12 md:w-24 h-12 md:h-24 text-primary" />
      </div>
      <div className="absolute bottom-32 left-10 md:left-20 animate-float opacity-10 md:opacity-20 hidden sm:block" style={{ animationDelay: '1s' }}>
        <Database className="w-10 md:w-20 h-10 md:h-20 text-accent" />
      </div>
      <div className="absolute top-40 left-1/4 animate-float opacity-10 md:opacity-20 hidden md:block" style={{ animationDelay: '2s' }}>
        <TrendingUp className="w-10 md:w-16 h-10 md:h-16 text-primary" />
      </div>

      <div className="container relative z-10 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-secondary/50 border border-border/50 backdrop-blur-sm mb-6 sm:mb-8 animate-fade-in">
            <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs sm:text-sm text-muted-foreground">AI & Machine Learning for Finance</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-display text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-bold mb-4 sm:mb-6 animate-slide-up leading-tight">
            <span className="text-foreground">Building </span>
            <span className="text-gradient-primary">Intelligent</span>
            <br />
            <span className="text-foreground">Financial </span>
            <span className="text-gradient-accent">Systems</span>
          </h1>

          {/* Subheadline */}
          <p className="text-sm sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-6 sm:mb-10 px-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Specializing in Large Language Models, RAG Systems, and Predictive Modeling 
            for financial applications. Transforming complex data into actionable intelligence.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <Button asChild variant="hero" size="lg" className="w-full sm:w-auto">
              <Link to="/ai-predict">
                Try AI Predict
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            </Button>
            <Button asChild variant="glass" size="lg" className="w-full sm:w-auto">
              <Link to="/blog">
                Read Finance Guides
              </Link>
            </Button>
          </div>

          <div className="mt-8 sm:mt-10 animate-fade-in" style={{ animationDelay: '0.45s' }}>
            <FounderHealthScore />
          </div>

          <div className="mt-10 sm:mt-12 grid gap-4 text-left md:grid-cols-3 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="rounded-2xl border border-border/40 bg-card/45 p-5 backdrop-blur-sm">
              <h2 className="mb-2 font-display text-lg font-semibold text-foreground">Financial document intelligence</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">Upload statements, investor decks, and reports to extract ratios, risks, anomalies, and executive-ready summaries with AI Predict.</p>
            </div>
            <div className="rounded-2xl border border-border/40 bg-card/45 p-5 backdrop-blur-sm">
              <h2 className="mb-2 font-display text-lg font-semibold text-foreground">Forecasting and scenario analysis</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">Model revenue, expenses, cash flow, fraud signals, and what-if scenarios using structured analysis built for business decisions.</p>
            </div>
            <div className="rounded-2xl border border-border/40 bg-card/45 p-5 backdrop-blur-sm">
              <h2 className="mb-2 font-display text-lg font-semibold text-foreground">Guides for analysts and founders</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">Explore practical finance articles on cash-flow reading, SaaS metrics, benchmarking, fraud detection, and AI-assisted reporting.</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 sm:gap-8 mt-12 sm:mt-16 pt-6 sm:pt-10 border-t border-border/30 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="text-center">
              <div className="font-display text-2xl sm:text-4xl font-bold text-gradient-primary">50+</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">Models Deployed</div>
            </div>
            <div className="text-center">
              <div className="font-display text-2xl sm:text-4xl font-bold text-gradient-accent">$2B+</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">Assets Analyzed</div>
            </div>
            <div className="text-center">
              <div className="font-display text-2xl sm:text-4xl font-bold text-gradient-primary">99.2%</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">Prediction Accuracy</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
