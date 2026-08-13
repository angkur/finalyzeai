import { useState } from "react";
import { z } from "zod";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Loader2, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface UnlockInsight {
  title: string;
  detail: string;
}

interface UnlockGateProps {
  /** Machine name of the tool, e.g. "health-score" */
  source: string;
  /** Headline for the locked section */
  heading?: string;
  insights: UnlockInsight[];
  /** Structured context saved with the lead */
  context?: Record<string, unknown>;
}

const emailSchema = z
  .string()
  .trim()
  .min(5, { message: "Enter a valid email address" })
  .max(255, { message: "Enter a valid email address" })
  .email({ message: "Enter a valid email address" });

const STORAGE_KEY = "finalyzeai_unlocked";

const UnlockGate = ({ source, heading = "Your full action plan", insights, context }: UnlockGateProps) => {
  const [unlocked, setUnlocked] = useState(
    () => typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY) === "1",
  );
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("email_leads").insert({
        email: parsed.data.toLowerCase(),
        source: `${source}-unlock`,
        result_summary: (context ?? {}) as unknown as never,
        page_path: window.location.pathname,
      } as never);
      if (error) throw error;

      localStorage.setItem(STORAGE_KEY, "1");
      setUnlocked(true);
      toast.success("Unlocked — here's your full breakdown.");
    } catch (err) {
      console.error("Unlock failed:", err);
      toast.error("Could not unlock right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-5 rounded-xl border border-border/50 bg-muted/20 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">{heading}</h3>
      </div>

      <div className="relative">
        <ul className={`space-y-3 ${unlocked ? "" : "blur-sm select-none pointer-events-none"}`}>
          {insights.map((i) => (
            <li key={i.title} className="rounded-lg border border-border/40 bg-card/60 p-3">
              <p className="text-sm font-medium text-foreground">{i.title}</p>
              <p className="text-xs leading-relaxed text-muted-foreground mt-1">{i.detail}</p>
            </li>
          ))}
        </ul>

        {!unlocked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <form
              onSubmit={handleSubmit}
              className="w-full max-w-sm space-y-2 rounded-xl border border-border/60 bg-background/95 backdrop-blur-sm p-4 shadow-lg"
            >
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                <p className="text-sm font-semibold text-foreground">
                  Unlock your full breakdown
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter your email to see every recommendation for your numbers. Free, no card.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  maxLength={255}
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 text-sm"
                  required
                />
                <Button type="submit" size="sm" className="h-9 shrink-0 gap-1.5" disabled={loading}>
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  Unlock
                </Button>
              </div>
              <p className="text-[11px] leading-snug text-muted-foreground">
                We only use your email for this report and occasional founder finance tips.
              </p>
            </form>
          </div>
        )}
      </div>

      {unlocked && (
        <Button asChild variant="hero" size="sm" className="mt-4 w-full sm:w-auto">
          <Link to="/ai-predict">
            Get the full AI analysis on your real statement <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      )}
    </div>
  );
};

export default UnlockGate;
