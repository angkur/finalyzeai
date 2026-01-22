import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Trash2, Loader2, AlertTriangle, CheckCircle, Clock, FileText, MessageSquare } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface CleanupResult {
  success: boolean;
  timestamp: string;
  usersProcessed: number;
  interactionsDeleted: number;
  documentsDeleted: number;
  chunksDeleted: number;
}

const DataCleanupPanel = () => {
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<CleanupResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTriggerCleanup = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke('cleanup-old-data');
      
      if (fnError) {
        throw new Error(fnError.message);
      }
      
      if (data?.success) {
        setLastResult(data);
        toast.success("Cleanup completed successfully", {
          description: `Deleted ${data.interactionsDeleted} interactions, ${data.documentsDeleted} documents`
        });
      } else {
        throw new Error(data?.error || "Cleanup failed");
      }
    } catch (err: any) {
      console.error("Cleanup error:", err);
      setError(err.message || "Failed to trigger cleanup");
      toast.error("Cleanup failed", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Automatic Cleanup Schedule
          </CardTitle>
          <CardDescription>
            The cleanup job runs automatically every day at midnight (UTC) to delete expired data based on each user's plan retention period.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-sm text-muted-foreground">Free Plan</div>
              <div className="text-lg font-semibold">7 days</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-sm text-muted-foreground">Mini Pro ($2)</div>
              <div className="text-lg font-semibold">14 days</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-sm text-muted-foreground">Mini ($3)</div>
              <div className="text-lg font-semibold">30 days</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-sm text-muted-foreground">Starter ($5)</div>
              <div className="text-lg font-semibold">90 days</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Pro plan ($10) users have unlimited history retention.
          </p>
        </CardContent>
      </Card>

      {/* Manual Trigger Card */}
      <Card className="border-orange-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-orange-500" />
            Manual Cleanup Trigger
          </CardTitle>
          <CardDescription>
            Manually trigger the cleanup process to immediately delete expired data. This runs the same logic as the scheduled job.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="default" className="border-orange-500/30 bg-orange-500/5">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              This will permanently delete all interactions, documents, and files that exceed each user's retention period. This action cannot be undone.
            </AlertDescription>
          </Alert>

          <Button 
            onClick={handleTriggerCleanup} 
            disabled={loading}
            variant="destructive"
            className="w-full sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running Cleanup...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Trigger Cleanup Now
              </>
            )}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Results Card */}
      {lastResult && (
        <Card className="border-green-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Last Cleanup Results
            </CardTitle>
            <CardDescription>
              Completed at {new Date(lastResult.timestamp).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MessageSquare className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{lastResult.usersProcessed}</div>
                  <div className="text-sm text-muted-foreground">Users Processed</div>
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-3">
                <div className="p-2 bg-destructive/10 rounded-lg">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{lastResult.interactionsDeleted}</div>
                  <div className="text-sm text-muted-foreground">Interactions Deleted</div>
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <FileText className="w-4 h-4 text-orange-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{lastResult.documentsDeleted}</div>
                  <div className="text-sm text-muted-foreground">Documents Deleted</div>
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <FileText className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{lastResult.chunksDeleted}</div>
                  <div className="text-sm text-muted-foreground">Chunks Deleted</div>
                </div>
              </div>
            </div>
            
            {lastResult.interactionsDeleted === 0 && lastResult.documentsDeleted === 0 && (
              <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  No expired data found - all users' data is within their retention period.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DataCleanupPanel;
