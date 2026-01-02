import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Eye, 
  Activity, 
  TrendingUp, 
  RefreshCw,
  Globe,
  Clock,
  BarChart3,
  Loader2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface AnalyticsStats {
  concurrent_users: number;
  page_views_last_hour: number;
  api_calls_last_hour: number;
  page_views_today: number;
  api_calls_today: number;
  unique_sessions_today: number;
  active_sessions: Array<{ page_path: string; last_seen_at: string }>;
  page_breakdown: Record<string, number>;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#10b981', '#f59e0b', '#ef4444'];

const Analytics = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [realtimeData, setRealtimeData] = useState<Array<{ time: string; users: number; views: number }>>([]);

  // Check admin access
  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (data?.role === 'admin') {
        setHasAccess(true);
      } else {
        navigate('/');
      }
    };

    checkAccess();
  }, [user, navigate]);

  const fetchStats = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('track-analytics', {
        body: { action: 'get_stats' }
      });

      if (error) throw error;
      setStats(data);

      // Add to realtime chart data
      setRealtimeData(prev => {
        const newEntry = {
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          users: data.concurrent_users,
          views: data.page_views_last_hour
        };
        const updated = [...prev, newEntry].slice(-20); // Keep last 20 data points
        return updated;
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial fetch and realtime updates
  useEffect(() => {
    if (!hasAccess) return;

    fetchStats();
    
    // Refresh every 10 seconds
    const interval = setInterval(fetchStats, 10000);

    // Subscribe to realtime changes
    const channel = supabase
      .channel('analytics-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'active_sessions' },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [hasAccess, fetchStats]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  const pageBreakdownData = stats?.page_breakdown 
    ? Object.entries(stats.page_breakdown).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Real-Time Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Live monitoring of concurrent users, page views, and API usage
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-2 px-3 py-1">
              <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              Live
            </Badge>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Concurrent Users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-primary">
                  {stats?.concurrent_users || 0}
                </span>
                <span className="text-sm text-muted-foreground">online now</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Page Views (1h)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{stats?.page_views_last_hour || 0}</span>
                <Badge variant="secondary" className="text-xs">
                  {stats?.page_views_today || 0} today
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                API Calls (1h)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{stats?.api_calls_last_hour || 0}</span>
                <Badge variant="secondary" className="text-xs">
                  {stats?.api_calls_today || 0} today
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Unique Sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{stats?.unique_sessions_today || 0}</span>
                <span className="text-sm text-muted-foreground">today</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Realtime Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Real-Time Activity
              </CardTitle>
              <CardDescription>Concurrent users and page views over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={realtimeData}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="time" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="users"
                      name="Concurrent Users"
                      stroke="hsl(var(--primary))"
                      fillOpacity={1}
                      fill="url(#colorUsers)"
                    />
                    <Area
                      type="monotone"
                      dataKey="views"
                      name="Page Views/hr"
                      stroke="hsl(var(--secondary))"
                      fillOpacity={1}
                      fill="url(#colorViews)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Page Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Page Views Breakdown
              </CardTitle>
              <CardDescription>Most visited pages today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {pageBreakdownData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pageBreakdownData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pageBreakdownData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No page view data yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Active Sessions
            </CardTitle>
            <CardDescription>Currently active users on your site</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.active_sessions && stats.active_sessions.length > 0 ? (
              <div className="space-y-3">
                {stats.active_sessions.map((session, index) => {
                  const lastSeen = new Date(session.last_seen_at);
                  const secondsAgo = Math.floor((Date.now() - lastSeen.getTime()) / 1000);
                  
                  return (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="font-medium">{session.page_path || '/'}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {secondsAgo < 60 ? `${secondsAgo}s ago` : `${Math.floor(secondsAgo / 60)}m ago`}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No active sessions right now
              </div>
            )}
          </CardContent>
        </Card>

        {/* Capacity Indicator */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Server Capacity</CardTitle>
            <CardDescription>Current load based on concurrent connections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Database Connections</span>
                  <span className="text-muted-foreground">
                    {stats?.concurrent_users || 0} / 60 (Free tier limit)
                  </span>
                </div>
                <Progress 
                  value={((stats?.concurrent_users || 0) / 60) * 100} 
                  className="h-2"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Free tier supports up to 60 concurrent database connections. 
                Upgrade to Pro for 200+ connections.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Analytics;
