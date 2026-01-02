import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Gauge,
  Calendar,
  Zap,
  TrendingUp,
  FileText,
  HardDrive,
  Clock,
  ArrowRight,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Sparkles,
} from "lucide-react";

interface UserPlan {
  plan_name: string;
  daily_limit: number;
  monthly_limit: number;
  upload_limit_mb: number;
  history_retention_days: number;
  started_at: string;
  expires_at: string | null;
}

interface UsageStats {
  dailyUsed: number;
  monthlyUsed: number;
  totalDocuments: number;
  totalInteractions: number;
  storageUsedMb: number;
}

const UsageDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plan, setPlan] = useState<UserPlan | null>(null);
  const [usage, setUsage] = useState<UsageStats>({
    dailyUsed: 0,
    monthlyUsed: 0,
    totalDocuments: 0,
    totalInteractions: 0,
    storageUsedMb: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      // Fetch user plan
      const { data: planData } = await supabase
        .from("user_plans")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (planData) {
        setPlan(planData);
      }

      // Get today's date
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get month start
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

      // Fetch all stats in parallel
      const [dailyResult, monthlyResult, docsResult, totalInteractionsResult, storageResult] = await Promise.all([
        // Daily usage
        supabase
          .from("interactions")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gte("created_at", today.toISOString()),

        // Monthly usage
        supabase
          .from("interactions")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gte("created_at", monthStart.toISOString()),

        // Total documents
        supabase
          .from("documents")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id),

        // Total interactions
        supabase
          .from("interactions")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id),

        // Storage used (sum of document sizes)
        supabase
          .from("documents")
          .select("file_size")
          .eq("user_id", user.id),
      ]);

      const storageUsedBytes = storageResult.data?.reduce((acc, doc) => acc + (doc.file_size || 0), 0) || 0;

      setUsage({
        dailyUsed: dailyResult.count || 0,
        monthlyUsed: monthlyResult.count || 0,
        totalDocuments: docsResult.count || 0,
        totalInteractions: totalInteractionsResult.count || 0,
        storageUsedMb: Number((storageUsedBytes / (1024 * 1024)).toFixed(2)),
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-destructive";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-primary";
  };

  const getPlanBadgeColor = (planName: string) => {
    switch (planName) {
      case "free":
        return "bg-muted text-muted-foreground";
      case "mini":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "starter":
        return "bg-primary/10 text-primary border-primary/20";
      case "pro":
        return "bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-600 border-amber-500/20";
      default:
        return "bg-accent/10 text-accent border-accent/20";
    }
  };

  const formatPlanName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const formatRetention = (days: number) => {
    if (days >= 36500) return "Unlimited";
    if (days >= 365) return `${Math.floor(days / 365)} year${days >= 730 ? "s" : ""}`;
    return `${days} days`;
  };

  const getResetDate = () => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);
    return nextMonth.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <section className="pt-32 pb-20">
          <div className="container px-6 flex items-center justify-center min-h-[50vh]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  const dailyLimit = plan?.daily_limit || 5;
  const monthlyLimit = plan?.monthly_limit || 5;
  const uploadLimit = plan?.upload_limit_mb || 5;
  const retentionDays = plan?.history_retention_days || 7;

  const dailyPercentage = Math.min(100, (usage.dailyUsed / dailyLimit) * 100);
  const monthlyPercentage = Math.min(100, (usage.monthlyUsed / monthlyLimit) * 100);
  const storagePercentage = Math.min(100, (usage.storageUsedMb / uploadLimit) * 100);

  const dailyRemaining = Math.max(0, dailyLimit - usage.dailyUsed);
  const monthlyRemaining = Math.max(0, monthlyLimit - usage.monthlyUsed);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-20">
        <div className="container px-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                  Usage Dashboard
                </h1>
                <p className="text-muted-foreground">
                  Track your AI analysis usage and plan limits
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className={`text-sm px-4 py-2 ${getPlanBadgeColor(plan?.plan_name || "free")}`}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {formatPlanName(plan?.plan_name || "free")} Plan
                </Badge>
                <Link to="/pricing">
                  <Button variant="outline" size="sm">
                    Manage Plan
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Main Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Daily Usage */}
            <Card className="bg-gradient-card border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Zap className="w-4 h-4 text-primary" />
                  Daily Analyses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="font-display text-3xl font-bold text-foreground">
                    {usage.dailyUsed}
                  </span>
                  <span className="text-muted-foreground">/ {dailyLimit}</span>
                </div>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary mb-2">
                  <div
                    className={`h-full transition-all duration-500 ${getProgressColor(dailyPercentage)}`}
                    style={{ width: `${dailyPercentage}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {dailyRemaining} remaining today
                </p>
              </CardContent>
            </Card>

            {/* Monthly Usage */}
            <Card className="bg-gradient-card border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Calendar className="w-4 h-4 text-primary" />
                  Monthly Analyses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="font-display text-3xl font-bold text-foreground">
                    {usage.monthlyUsed}
                  </span>
                  <span className="text-muted-foreground">/ {monthlyLimit}</span>
                </div>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary mb-2">
                  <div
                    className={`h-full transition-all duration-500 ${getProgressColor(monthlyPercentage)}`}
                    style={{ width: `${monthlyPercentage}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Resets {getResetDate()}
                </p>
              </CardContent>
            </Card>

            {/* Storage Used */}
            <Card className="bg-gradient-card border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <HardDrive className="w-4 h-4 text-primary" />
                  Storage Used
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="font-display text-3xl font-bold text-foreground">
                    {usage.storageUsedMb}
                  </span>
                  <span className="text-muted-foreground">/ {uploadLimit} MB</span>
                </div>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary mb-2">
                  <div
                    className={`h-full transition-all duration-500 ${getProgressColor(storagePercentage)}`}
                    style={{ width: `${storagePercentage}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {(uploadLimit - usage.storageUsedMb).toFixed(1)} MB available
                </p>
              </CardContent>
            </Card>

            {/* History Retention */}
            <Card className="bg-gradient-card border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Clock className="w-4 h-4 text-primary" />
                  History Retention
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="font-display text-3xl font-bold text-foreground">
                    {formatRetention(retentionDays)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Older analyses are auto-deleted
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Stats */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Remaining Analyses Card */}
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Gauge className="w-5 h-5 text-primary" />
                  Remaining Analyses
                </CardTitle>
                <CardDescription>
                  Your available analysis quota
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Daily */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${dailyRemaining === 0 ? "bg-destructive/10" : "bg-primary/10"}`}>
                      <Zap className={`w-5 h-5 ${dailyRemaining === 0 ? "text-destructive" : "text-primary"}`} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Today</p>
                      <p className="text-sm text-muted-foreground">Resets at midnight</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-display text-2xl font-bold ${dailyRemaining === 0 ? "text-destructive" : "text-foreground"}`}>
                      {dailyRemaining}
                    </p>
                    <p className="text-sm text-muted-foreground">remaining</p>
                  </div>
                </div>

                {/* Monthly */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${monthlyRemaining === 0 ? "bg-destructive/10" : "bg-primary/10"}`}>
                      <Calendar className={`w-5 h-5 ${monthlyRemaining === 0 ? "text-destructive" : "text-primary"}`} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">This Month</p>
                      <p className="text-sm text-muted-foreground">Resets {getResetDate()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-display text-2xl font-bold ${monthlyRemaining === 0 ? "text-destructive" : "text-foreground"}`}>
                      {monthlyRemaining}
                    </p>
                    <p className="text-sm text-muted-foreground">remaining</p>
                  </div>
                </div>

                {/* Upgrade CTA */}
                {(plan?.plan_name === "free" || plan?.plan_name === "mini") && (
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <TrendingUp className="w-4 h-4" />
                      <span>Need more analyses?</span>
                    </div>
                    <Link to="/pricing">
                      <Button variant="outline" size="sm">
                        Upgrade Plan
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Stats Card */}
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Account Statistics
                </CardTitle>
                <CardDescription>
                  Your all-time usage statistics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Total Analyses */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Total Analyses</p>
                      <p className="text-sm text-muted-foreground">All-time</p>
                    </div>
                  </div>
                  <p className="font-display text-2xl font-bold text-foreground">
                    {usage.totalInteractions}
                  </p>
                </div>

                {/* Total Documents */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Documents</p>
                      <p className="text-sm text-muted-foreground">Uploaded files</p>
                    </div>
                  </div>
                  <p className="font-display text-2xl font-bold text-foreground">
                    {usage.totalDocuments}
                  </p>
                </div>

                {/* Plan Start Date */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Plan Started</p>
                      <p className="text-sm text-muted-foreground">Current subscription</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {plan?.started_at
                      ? new Date(plan.started_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "N/A"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Plan Limits Summary */}
          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Sparkles className="w-5 h-5 text-primary" />
                Your Plan Limits
              </CardTitle>
              <CardDescription>
                Current limits based on your {formatPlanName(plan?.plan_name || "free")} plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-secondary/30 text-center">
                  <Zap className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="font-display text-2xl font-bold text-foreground">{dailyLimit}</p>
                  <p className="text-sm text-muted-foreground">Daily analyses</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/30 text-center">
                  <Calendar className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="font-display text-2xl font-bold text-foreground">{monthlyLimit}</p>
                  <p className="text-sm text-muted-foreground">Monthly analyses</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/30 text-center">
                  <HardDrive className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="font-display text-2xl font-bold text-foreground">{uploadLimit} MB</p>
                  <p className="text-sm text-muted-foreground">Max upload size</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/30 text-center">
                  <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="font-display text-2xl font-bold text-foreground">{formatRetention(retentionDays)}</p>
                  <p className="text-sm text-muted-foreground">History retention</p>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Link to="/pricing">
                  <Button variant="hero">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View All Plans
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default UsageDashboard;
