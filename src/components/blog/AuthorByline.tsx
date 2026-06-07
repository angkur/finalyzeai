import { Linkedin, ShieldCheck } from "lucide-react";

interface AuthorBylineProps {
  date: string;
  readTime: string;
}

const AuthorByline = ({ date, readTime }: AuthorBylineProps) => {
  return (
    <div className="flex items-center gap-3 my-6 p-4 rounded-xl bg-card/50 border border-border/50">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-display font-bold text-lg shrink-0">
        MH
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-foreground">Mazharul Huq Ankur</span>
          <ShieldCheck className="w-4 h-4 text-primary" aria-label="Verified author" />
          <a
            href="https://www.linkedin.com/company/finalyzeai/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary"
            aria-label="LinkedIn"
          >
            <Linkedin className="w-4 h-4" />
          </a>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          Founder, FinalyzeAI · Reviewed by the FinalyzeAI editorial team
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Published {date} · {readTime}
        </p>
      </div>
    </div>
  );
};

export default AuthorByline;
