import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Contact from "@/components/Contact";
import { Mail, Linkedin, MapPin, Clock, Phone } from "lucide-react";

const ContactPage = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-28 pb-4">
        <div className="container px-4 sm:px-6 max-w-5xl">
          <header className="text-center mb-10">
            <h1 className="text-3xl sm:text-5xl font-display font-bold mb-4">
              Contact FinalyzeAI
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Questions about AI Predict, billing, partnerships, or press? Reach the team
              directly — we usually reply within one business day.
            </p>
          </header>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="p-5 rounded-xl bg-card border border-border/50">
              <Mail className="w-5 h-5 text-primary mb-3" />
              <div className="text-xs text-muted-foreground mb-1">Email</div>
              <a href="mailto:hello@finalyzeai.com" className="text-sm font-medium hover:text-primary break-all">
                hello@finalyzeai.com
              </a>
            </div>
            <div className="p-5 rounded-xl bg-card border border-border/50">
              <Phone className="w-5 h-5 text-primary mb-3" />
              <div className="text-xs text-muted-foreground mb-1">Phone</div>
              <a href="tel:+8801405236457" className="text-sm font-medium hover:text-primary">
                +880 1405 236457
              </a>
            </div>
            <div className="p-5 rounded-xl bg-card border border-border/50">
              <Linkedin className="w-5 h-5 text-primary mb-3" />
              <div className="text-xs text-muted-foreground mb-1">LinkedIn</div>
              <a
                href="https://www.linkedin.com/company/finalyzeai/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium hover:text-primary"
              >
                @finalyzeai
              </a>
            </div>
            <div className="p-5 rounded-xl bg-card border border-border/50">
              <Clock className="w-5 h-5 text-primary mb-3" />
              <div className="text-xs text-muted-foreground mb-1">Response Time</div>
              <div className="text-sm font-medium">Within 24 hours</div>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-card border border-border/50 mb-2">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <h2 className="text-sm font-semibold mb-1">Business Address</h2>
                <p className="text-sm text-muted-foreground">
                  FinalyzeAI — Remote-first team. Headquartered in Dhaka, Bangladesh.
                  Serving customers in 40+ countries.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Contact />
      <Footer />
    </main>
  );
};

export default ContactPage;
