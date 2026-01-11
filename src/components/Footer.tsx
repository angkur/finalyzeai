import { Brain, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-8 sm:py-12 border-t border-border/30">
      <div className="container px-4 sm:px-6">
        <div className="flex flex-col items-center gap-4 sm:gap-6 md:flex-row md:justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-primary">
              <Brain className="w-3 h-3 sm:w-4 sm:h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-sm sm:text-base text-foreground">FinanceAI</span>
          </a>

          {/* Links */}
          <div className="flex items-center gap-4 sm:gap-6 order-3 md:order-2">
            <a href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </a>
            <a 
              href="https://www.linkedin.com/company/finalyzeai/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Follow us on LinkedIn"
            >
              <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>
          </div>

          {/* Copyright */}
          <p className="text-xs sm:text-sm text-muted-foreground order-2 md:order-3">
            © 2024 FinanceAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
