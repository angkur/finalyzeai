import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gauge, TrendingUp, Calendar, Zap, AlertTriangle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface UsageLimits {
  daily_limit: number;
  monthly_limit: number;
  is_blocked: boolean;
}

interface UsageStats {
  dailyUsed: number;
  monthlyUsed: number;
  limits: UsageLimits | null;
}

// Default limits for users without custom limits (Free tier)
const DEFAULT_LIMITS: UsageLimits = {
  daily_limit: 5,
  monthly_limit: 5,
  is_blocked: false,
};

const UsageTracker = () => {
  const { user } = useAuth();
  const [usage, setUsage] = useState<UsageStats>({
    dailyUsed: 0,
    monthlyUsed: 0,
    limits: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUsageData();
    }
  }, [user]);

  const fetchUsageData = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      // Get user's limits (if any)
      const { data: limitsData } = await supabase
        .from("ai_usage_limits")
        .select("daily_limit, monthly_limit, is_blocked")
        .eq("user_id", user.id)
        .maybeSingle();

      // Calculate today's usage
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { count: dailyCount } = await supabase
        .from("interactions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", today.toISOString());

      // Calculate this month's usage
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      
      const { count: monthlyCount } = await supabase
        .from("interactions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", monthStart.toISOString());

      setUsage({
        dailyUsed: dailyCount || 0,
        monthlyUsed: monthlyCount || 0,
        limits: limitsData || DEFAULT_LIMITS,
      });
    } catch (error) {
      console.error("Error fetching usage data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const limits = usage.limits || DEFAULT_LIMITS;
  const monthlyRemaining = Math.max(0, limits.monthly_limit - usage.monthlyUsed);
  const dailyRemaining = Math.max(0, limits.daily_limit - usage.dailyUsed);
  const monthlyPercentage = Math.min(100, (usage.monthlyUsed / limits.monthly_limit) * 100);
  const dailyPercentage = Math.min(100, (usage.dailyUsed / limits.daily_limit) * 100);

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-destructive";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-primary";
  };

  const getPlanName = () => {
    const monthlyLimit = limits.monthly_limit;
    if (monthlyLimit <= 5) return "Free";
    if (monthlyLimit <= 25) return "Mini";
    if (monthlyLimit <= 100) return "Starter";
    if (monthlyLimit <= 500) return "Pro";
    return "Enterprise";
  };

  const getPlanBadgeColor = () => {
    const plan = getPlanName();
    switch (plan) {
      case "Free": return "bg-muted text-muted-foreground";
      case "Mini": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "Starter": return "bg-primary/10 text-primary border-primary/20";
      case "Pro": return "bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-600 border-amber-500/20";
      default: return "bg-accent/10 text-accent border-accent/20";
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-card border-border/50">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (limits.is_blocked) {
    return (
      <Card className="bg-gradient-card border-destructive/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Account Restricted
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your account has been temporarily restricted from using AI analyses. 
            Please contact support for assistance.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg text-foreground">
            <Gauge className="w-5 h-5 text-primary" />
            Usage This Month
          </CardTitle>
          <Badge variant="outline" className={getPlanBadgeColor()}>
            {getPlanName()} Plan
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Monthly Usage */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Monthly Analyses</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {usage.monthlyUsed} / {limits.monthly_limit}
            </span>
          </div>
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
            <div 
              className={`h-full transition-all duration-500 ${getProgressColor(monthlyPercentage)}`}
              style={{ width: `${monthlyPercentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className={`font-medium ${monthlyRemaining <= 5 ? "text-destructive" : "text-primary"}`}>
              {monthlyRemaining} analyses remaining
            </span>
            <span className="text-muted-foreground">
              Resets {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </div>
        </div>

        {/* Daily Usage */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Daily Analyses</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {usage.dailyUsed} / {limits.daily_limit}
            </span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div 
              className={`h-full transition-all duration-500 ${getProgressColor(dailyPercentage)}`}
              style={{ width: `${dailyPercentage}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {dailyRemaining} analyses remaining today
          </p>
        </div>

        {/* Upgrade CTA for Free/Mini users */}
        {limits.monthly_limit <= 25 && (
          <div className="pt-2 border-t border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                <span>Need more analyses?</span>
              </div>
              <Link to="/pricing">
                <Button variant="outline" size="sm" className="h-8">
                  Upgrade Plan
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UsageTracker;
