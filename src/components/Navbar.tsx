import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 py-6">
      <div className="container px-6">
        <div className="flex items-center justify-between px-6 py-4 rounded-2xl bg-card/80 backdrop-blur-lg border border-border/50">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-primary">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg text-foreground">FinanceAI</span>
          </a>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#services" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Services
            </a>
            <a href="#process" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Process
            </a>
            <a href="#tech" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Technology
            </a>
            <a href="#contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </a>
          </div>

          {/* CTA */}
          <Button variant="hero" size="sm">
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
