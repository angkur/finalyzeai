import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Brain, BarChart3, Database, Calendar, Star, ExternalLink } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AnalysisDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analysis: {
    id: string;
    query: string;
    response: string;
    analysis_type: string;
    rating: number | null;
    created_at: string;
  } | null;
}

// Simple markdown-like renderer for common formatting
const renderResponse = (text: string) => {
  if (!text) return <p className="text-muted-foreground italic">No response available</p>;

  // Split by double newlines for paragraphs
  const sections = text.split(/\n\n+/);

  return sections.map((section, idx) => {
    // Check for headers
    if (section.startsWith("## ")) {
      return (
        <h3 key={idx} className="text-base font-semibold text-foreground mt-4 mb-2 break-words">
          {section.replace("## ", "")}
        </h3>
      );
    }
    if (section.startsWith("### ")) {
      return (
        <h4 key={idx} className="text-sm font-semibold text-foreground mt-3 mb-1 break-words">
          {section.replace("### ", "")}
        </h4>
      );
    }
    if (section.startsWith("# ")) {
      return (
        <h2 key={idx} className="text-lg font-bold text-foreground mt-4 mb-2 break-words">
          {section.replace("# ", "")}
        </h2>
      );
    }

    // Check for bullet points
    if (section.includes("\n*   ") || section.includes("\n- ")) {
      const lines = section.split("\n");
      return (
        <ul key={idx} className="list-disc list-inside space-y-1 my-2">
          {lines.map((line, lineIdx) => {
            const cleanLine = line.replace(/^[\*\-]\s+/, "").trim();
            if (!cleanLine) return null;
            // Handle bold text
            const formattedLine = cleanLine.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
            return (
              <li key={lineIdx} className="text-sm text-foreground break-words">
                <span dangerouslySetInnerHTML={{ __html: formattedLine }} />
              </li>
            );
          })}
        </ul>
      );
    }

    // Regular paragraph with bold support
    const formattedText = section.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    return (
      <p
        key={idx}
        className="text-sm text-foreground mb-2 break-words"
        dangerouslySetInnerHTML={{ __html: formattedText }}
      />
    );
  });
};

const AnalysisDetailDialog = ({ open, onOpenChange, analysis }: AnalysisDetailDialogProps) => {
  if (!analysis) return null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getAnalysisIcon = (type: string) => {
    switch (type) {
      case "data-visualization":
        return <BarChart3 className="w-5 h-5 text-primary" />;
      case "rag-query":
        return <Database className="w-5 h-5 text-accent" />;
      default:
        return <Brain className="w-5 h-5 text-primary" />;
    }
  };

  const getAnalysisLabel = (type: string) => {
    switch (type) {
      case "data-visualization":
        return "Data Visualization";
      case "rag-query":
        return "Knowledge Base Query";
      case "data-analysis":
        return "Data Analysis";
      case "report-generation":
        return "Report Generation";
      case "predictive-modeling":
        return "Predictive Modeling";
      case "credit-scoring":
        return "Credit Scoring";
      default:
        return type.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {getAnalysisIcon(analysis.analysis_type)}
            <div>
              <DialogTitle className="text-lg">Analysis Details</DialogTitle>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
                  {getAnalysisLabel(analysis.analysis_type)}
                </span>
                {analysis.rating && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Star className="w-3 h-3 text-accent fill-current" />
                    {analysis.rating}/5
                  </span>
                )}
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(analysis.created_at)}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {/* Query Section */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
                Your Query
              </h4>
              <div className="p-3 rounded-lg bg-secondary/50 border border-border/30 max-h-40 overflow-y-auto overflow-x-hidden">
                <p className="text-sm text-foreground whitespace-pre-wrap break-all">{analysis.query}</p>
              </div>
            </div>

            {/* Response Section */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                AI Response
              </h4>
              <div className="p-4 rounded-lg bg-gradient-card border border-border/30">
                {renderResponse(analysis.response)}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default AnalysisDetailDialog;
