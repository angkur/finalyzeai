import { Linkedin, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const AuthorBioCard = () => {
  return (
    <Card className="mt-12 bg-card/50 border-border/50">
      <CardContent className="p-6 flex flex-col sm:flex-row gap-5 items-start">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-display font-bold text-2xl shrink-0">
          MH
        </div>
        <div className="flex-1">
          <h3 className="font-display font-semibold text-lg">About the Author</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-3">
            <strong className="text-foreground">Mazharul Huq Ankur</strong> is the founder of
            FinalyzeAI, a platform that turns financial documents into AI-powered insights.
            With a background spanning financial analysis, software engineering, and AI
            systems, he writes about practical applications of machine learning in finance,
            forecasting, and risk detection. All articles are reviewed by the FinalyzeAI
            editorial team for accuracy and clarity.
          </p>
          <div className="flex items-center gap-3">
            <a
              href="https://www.linkedin.com/company/finalyzeai/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary"
            >
              <Linkedin className="w-3.5 h-3.5" /> LinkedIn
            </a>
            <a
              href="mailto:hello@finalyzeai.com"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary"
            >
              <Mail className="w-3.5 h-3.5" /> hello@finalyzeai.com
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthorBioCard;
