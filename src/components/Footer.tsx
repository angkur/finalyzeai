import { Brain, Linkedin, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="py-12 sm:py-16 border-t border-border/30">
      <div className="container px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 sm:gap-3 mb-4">
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-primary">
                <Brain className="w-3 h-3 sm:w-4 sm:h-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-base sm:text-lg text-foreground">FinalyzeAI</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              AI-powered financial analysis, forecasting, and fraud detection for analysts, founders, and investors.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a
                href="https://www.linkedin.com/company/finalyzeai/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Follow us on LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="mailto:hello@finalyzeai.com"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Email us"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-foreground">Product</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Home</Link></li>
              <li><Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link></li>
              <li><Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</Link></li>
              <li><Link to="/user-guide" className="text-sm text-muted-foreground hover:text-foreground transition-colors">User Guide</Link></li>
              <li><Link to="/calculators" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Free Calculators</Link></li>
              <li><Link to="/glossary" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Glossary</Link></li>
              <li><Link to="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Company / Legal */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-foreground">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link></li>
              <li><Link to="/editorial-policy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Editorial Policy</Link></li>
          </div>

          {/* Company / Legal */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-foreground">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link></li>
              <li><Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs sm:text-sm text-muted-foreground">
            © {new Date().getFullYear()} FinalyzeAI. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with ❤ for analysts, founders, and investors.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
