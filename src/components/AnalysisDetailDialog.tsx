import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Brain, BarChart3, Database, Calendar, Star } from "lucide-react";
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
      case "financial-analysis":
        return "Financial Analysis";
      default:
        return type.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {getAnalysisIcon(analysis.analysis_type)}
            <div>
              <DialogTitle className="text-lg">Analysis Details</DialogTitle>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
                  {getAnalysisLabel(analysis.analysis_type)}
                </span>
                {analysis.rating && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
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
              <h4 className="text-sm font-semibold text-foreground mb-2">Your Query</h4>
              <div className="p-3 rounded-lg bg-secondary/50 border border-border/30">
                <p className="text-sm text-foreground whitespace-pre-wrap">{analysis.query}</p>
              </div>
            </div>

            {/* Response Section */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">AI Response</h4>
              <div className="p-3 rounded-lg bg-gradient-card border border-border/30">
                <div className="text-sm text-foreground whitespace-pre-wrap prose prose-sm max-w-none dark:prose-invert">
                  {analysis.response}
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default AnalysisDetailDialog;
