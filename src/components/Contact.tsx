import { Button } from "@/components/ui/button";
import { ArrowRight, Mail, Linkedin, Github } from "lucide-react";

const Contact = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

      <div className="container relative z-10 px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-8">
            <span className="text-sm text-accent font-medium">Open to New Projects</span>
          </div>

          {/* Headline */}
          <h2 className="font-display text-4xl md:text-6xl font-bold mb-6">
            <span className="text-foreground">Let's Build </span>
            <span className="text-gradient-accent">Something</span>
            <br />
            <span className="text-gradient-primary">Extraordinary</span>
          </h2>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Ready to transform your financial operations with AI? Let's discuss how 
            intelligent systems can drive growth and efficiency for your organization.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button variant="accent" size="lg">
              Schedule Consultation
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="glass" size="lg">
              Download Portfolio
            </Button>
          </div>

          {/* Social Links */}
          <div className="flex justify-center gap-6">
            <a
              href="#"
              className="p-4 rounded-xl bg-secondary/50 border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-glow group"
            >
              <Mail className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </a>
            <a
              href="#"
              className="p-4 rounded-xl bg-secondary/50 border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-glow group"
            >
              <Linkedin className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </a>
            <a
              href="#"
              className="p-4 rounded-xl bg-secondary/50 border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-glow group"
            >
              <Github className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
