import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, Database, TrendingUp } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Background Effects */}
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      
      {/* Floating Elements */}
      <div className="absolute top-20 right-20 animate-float opacity-20">
        <Brain className="w-24 h-24 text-primary" />
      </div>
      <div className="absolute bottom-32 left-20 animate-float opacity-20" style={{ animationDelay: '1s' }}>
        <Database className="w-20 h-20 text-accent" />
      </div>
      <div className="absolute top-40 left-1/4 animate-float opacity-20" style={{ animationDelay: '2s' }}>
        <TrendingUp className="w-16 h-16 text-primary" />
      </div>

      <div className="container relative z-10 px-6">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50 backdrop-blur-sm mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm text-muted-foreground">AI & Machine Learning for Finance</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold mb-6 animate-slide-up">
            <span className="text-foreground">Building </span>
            <span className="text-gradient-primary">Intelligent</span>
            <br />
            <span className="text-foreground">Financial </span>
            <span className="text-gradient-accent">Systems</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Specializing in Large Language Models, RAG Systems, and Predictive Modeling 
            for financial applications. Transforming complex data into actionable intelligence.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <Button variant="hero" size="lg">
              Explore Services
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="glass" size="lg">
              View Case Studies
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-20 pt-10 border-t border-border/30 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="text-center">
              <div className="font-display text-4xl font-bold text-gradient-primary">50+</div>
              <div className="text-sm text-muted-foreground mt-1">Models Deployed</div>
            </div>
            <div className="text-center">
              <div className="font-display text-4xl font-bold text-gradient-accent">$2B+</div>
              <div className="text-sm text-muted-foreground mt-1">Assets Analyzed</div>
            </div>
            <div className="text-center">
              <div className="font-display text-4xl font-bold text-gradient-primary">99.2%</div>
              <div className="text-sm text-muted-foreground mt-1">Prediction Accuracy</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
